import "server-only";

import { RECIPES_PER_PAGE } from "@/lib/constants";
import type {
  Difficulty,
  CommentWithAuthor,
  ProfileRow,
  RecipeWithAuthor,
} from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

/*
 * Every query here runs on the server and pushes filtering, sorting and
 * pagination into Postgres. The browser never receives rows it will not show.
 */

const RECIPE_CARD_COLUMNS = [
  "id, user_id, title, description, category, difficulty",
  "preparation_time, cooking_time, total_time, servings",
  "image_url, image_path, ingredients, instructions, tags",
  "likes_count, comments_count, created_at, updated_at",
  "profiles ( id, full_name, avatar_url )",
].join(", ");

export type RecipeFilters = {
  search?: string;
  category?: string;
  difficulty?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  userId?: string;
};

export type RecipeListResult = {
  recipes: RecipeWithAuthor[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  /** Set when the database could not be reached, so the UI can say so. */
  error: string | null;
};

function emptyList(
  page: number,
  perPage: number,
  error: string | null,
): RecipeListResult {
  return { recipes: [], total: 0, page, perPage, totalPages: 0, error };
}

const DOUBLE_QUOTE = String.fromCharCode(34);
const SINGLE_QUOTE = String.fromCharCode(39);
const BACKSLASH = String.fromCharCode(92);

/**
 * Characters that carry meaning inside a PostgREST or(...) filter.
 * Stripping them means a search term can never reshape the query.
 */
const UNSAFE_FILTER_CHARS = [
  ",",
  "(",
  ")",
  "%",
  "{",
  "}",
  "*",
  ":",
  DOUBLE_QUOTE,
  SINGLE_QUOTE,
  BACKSLASH,
];

function sanitizeSearchTerm(term: string): string {
  let out = term;
  for (const char of UNSAFE_FILTER_CHARS) {
    out = out.split(char).join(" ");
  }
  return out.replace(/\s+/g, " ").trim().slice(0, 80);
}

/**
 * The single entry point for listing recipes: home sections, /recipes,
 * /search, /categories/[slug] and /my-recipes all come through here.
 */
export async function getRecipes(
  filters: RecipeFilters = {},
): Promise<RecipeListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = filters.perPage ?? RECIPES_PER_PAGE;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    const supabase = await createClient();

    let query = supabase
      .from("recipes")
      .select(RECIPE_CARD_COLUMNS, { count: "exact" });

    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.difficulty) query = query.eq("difficulty", filters.difficulty as Difficulty);

    const term = filters.search ? sanitizeSearchTerm(filters.search) : "";
    if (term) {
      // `search_text` is a generated column covering title, description,
      // category, tags and every ingredient, backed by a trigram index.
      // One indexed predicate instead of four.
      query = query.ilike("search_text", "%" + term + "%");
    }

    switch (filters.sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "most-liked":
        query = query
          .order("likes_count", { ascending: false })
          .order("created_at", { ascending: false });
        break;
      case "quickest":
        query = query
          .order("total_time", { ascending: true })
          .order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      // PostgREST returns 416 when the requested offset is beyond the last
      // row (e.g. an out-of-range `?page=` param, or a home-page section
      // that opportunistically asks for "the next few" before knowing how
      // many exist). That is not a failure -- it just means this page is
      // empty -- so it must not surface as a database error.
      const isRangeNotSatisfiable = /range not satisfiable/i.test(
        error.message,
      );
      if (isRangeNotSatisfiable) {
        return { recipes: [], total: 0, page, perPage, totalPages: 1, error: null };
      }
      console.error("[queries] getRecipes:", error.message);
      return emptyList(page, perPage, error.message);
    }

    const total = count ?? 0;
    return {
      recipes: (data ?? []) as unknown as RecipeWithAuthor[],
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      error: null,
    };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unknown error";
    console.error("[queries] getRecipes threw:", message);
    return emptyList(page, perPage, message);
  }
}

/** A single recipe with its author, or null when it does not exist. */
export async function getRecipeById(
  id: string,
): Promise<RecipeWithAuthor | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("recipes")
      .select(RECIPE_CARD_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("[queries] getRecipeById:", error.message);
      return null;
    }
    return (data as unknown as RecipeWithAuthor) ?? null;
  } catch {
    return null;
  }
}

/** Comments for a recipe, oldest first, each with its author profile. */
export async function getComments(
  recipeId: string,
): Promise<CommentWithAuthor[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles ( id, full_name, avatar_url )")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[queries] getComments:", error.message);
      return [];
    }
    return (data ?? []) as unknown as CommentWithAuthor[];
  } catch {
    return [];
  }
}

/** Whether the signed-in user has liked / bookmarked a given recipe. */
export async function getViewerRecipeState(recipeId: string): Promise<{
  liked: boolean;
  bookmarked: boolean;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { liked: false, bookmarked: false };

    const [likeResult, bookmarkResult] = await Promise.all([
      supabase
        .from("likes")
        .select("id")
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("bookmarks")
        .select("id")
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    return {
      liked: Boolean(likeResult.data),
      bookmarked: Boolean(bookmarkResult.data),
    };
  } catch {
    return { liked: false, bookmarked: false };
  }
}

/**
 * Recipes the signed-in user has bookmarked, newest bookmark first.
 *
 * Deliberately two queries rather than one nested embed: the bookmark rows
 * decide the order, then the recipes are fetched by id and re-sorted to
 * match. Two indexed lookups, and no dependence on how deeply PostgREST will
 * resolve a nested relationship.
 */
export async function getBookmarkedRecipes(
  userId: string,
): Promise<RecipeWithAuthor[]> {
  try {
    const supabase = await createClient();

    const { data: bookmarks, error: bookmarkError } = await supabase
      .from("bookmarks")
      .select("recipe_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (bookmarkError) {
      console.error("[queries] getBookmarkedRecipes:", bookmarkError.message);
      return [];
    }

    const ids = (bookmarks ?? []).map((row) => row.recipe_id);
    if (ids.length === 0) return [];

    const { data: recipes, error: recipeError } = await supabase
      .from("recipes")
      .select(RECIPE_CARD_COLUMNS)
      .in("id", ids);

    if (recipeError) {
      console.error("[queries] getBookmarkedRecipes:", recipeError.message);
      return [];
    }

    // Restore the bookmark ordering, which the `in` query does not preserve.
    const byId = new Map(
      (recipes ?? []).map((row) => [
        (row as unknown as RecipeWithAuthor).id,
        row as unknown as RecipeWithAuthor,
      ]),
    );

    return ids
      .map((id) => byId.get(id))
      .filter((recipe): recipe is RecipeWithAuthor => Boolean(recipe));
  } catch {
    return [];
  }
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("[queries] getProfile:", error.message);
      return null;
    }
    return data ?? null;
  } catch {
    return null;
  }
}

/** How many recipes a user has published. Count-only, no rows transferred. */
export async function getRecipeCountForUser(userId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Number of recipes per category, for the Categories page. */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("recipes").select("category");
    if (error || !data) return {};
    const counts: Record<string, number> = {};
    for (const row of data) {
      counts[row.category] = (counts[row.category] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

/** The signed-in user, or null. Safe to call from any Server Component. */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/** The signed-in user together with their profile row. */
export async function getCurrentUserWithProfile() {
  const user = await getCurrentUser();
  if (!user) return { user: null, profile: null };
  const profile = await getProfile(user.id);
  return { user, profile };
}
