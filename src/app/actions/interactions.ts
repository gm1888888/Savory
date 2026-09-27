"use server";

import { revalidatePath } from "next/cache";

import type { CommentWithAuthor } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { commentSchema, uuidSchema } from "@/lib/validation";

export type ToggleResult = {
  ok: boolean;
  active: boolean;
  count?: number;
  message?: string;
};

export type CommentResult = {
  ok: boolean;
  message?: string;
  comment?: CommentWithAuthor;
};

/*
 * Likes and bookmarks are real rows, not counters. The unique constraints in
 * the schema make a duplicate impossible even if two requests race.
 */

/** Minimum time a user must wait between posting comments. DB-only cooldown. */
const COMMENT_COOLDOWN_SECONDS = 5;

async function isPastCommentCooldown(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("comments")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return true;
  const elapsedMs = Date.now() - new Date(data.created_at).getTime();
  return elapsedMs >= COMMENT_COOLDOWN_SECONDS * 1000;
}

export async function toggleLikeAction(
  recipeId: string,
): Promise<ToggleResult> {
  if (!uuidSchema.safeParse(recipeId).success) {
    return { ok: false, active: false, message: "That recipe does not exist." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, active: false, message: "Please log in to like recipes." };
  }

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("recipe_id", recipeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("likes").delete().eq("id", existing.id);
    if (error) {
      console.error("[likes] delete failed:", error.message);
      return { ok: false, active: true, message: "Could not update your like." };
    }
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ recipe_id: recipeId, user_id: user.id });
    // A duplicate means another tab already liked it -- treat as success.
    if (error && error.code !== "23505") {
      console.error("[likes] insert failed:", error.message);
      return { ok: false, active: false, message: "Could not update your like." };
    }
  }

  // Read the trigger-maintained counter back so the UI shows the true value.
  const { data: recipe } = await supabase
    .from("recipes")
    .select("likes_count")
    .eq("id", recipeId)
    .maybeSingle();

  revalidatePath("/recipes/" + recipeId);
  revalidatePath("/recipes");
  revalidatePath("/");

  return {
    ok: true,
    active: !existing,
    count: recipe?.likes_count ?? 0,
  };
}

export async function toggleBookmarkAction(
  recipeId: string,
): Promise<ToggleResult> {
  if (!uuidSchema.safeParse(recipeId).success) {
    return { ok: false, active: false, message: "That recipe does not exist." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      active: false,
      message: "Please log in to save recipes.",
    };
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("recipe_id", recipeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.id);
    if (error) {
      console.error("[bookmarks] delete failed:", error.message);
      return { ok: false, active: true, message: "Could not update your bookmark." };
    }
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .insert({ recipe_id: recipeId, user_id: user.id });
    if (error && error.code !== "23505") {
      console.error("[bookmarks] insert failed:", error.message);
      return { ok: false, active: false, message: "Could not update your bookmark." };
    }
  }

  revalidatePath("/bookmarks");
  revalidatePath("/recipes/" + recipeId);

  return { ok: true, active: !existing };
}

export async function addCommentAction(
  recipeId: string,
  formData: FormData,
): Promise<CommentResult> {
  if (!uuidSchema.safeParse(recipeId).success) {
    return { ok: false, message: "That recipe does not exist." };
  }

  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Please log in to comment." };
  }

  if (!(await isPastCommentCooldown(supabase, user.id))) {
    return {
      ok: false,
      message: "You are commenting too quickly. Please wait a moment.",
    };
  }

  // Select the row straight back (joined with the author's profile) so the
  // client can append it to the comment list locally -- no full-page refresh
  // needed just to show the one comment that was added.
  const { data, error } = await supabase
    .from("comments")
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      content: parsed.data.content,
    })
    .select("*, profiles ( id, full_name, avatar_url )")
    .single();

  if (error || !data) {
    console.error("[comments] insert failed:", error?.message);
    return { ok: false, message: "Could not post your comment. Please try again." };
  }

  revalidatePath("/recipes/" + recipeId);
  return { ok: true, comment: data as unknown as CommentWithAuthor };
}

export async function deleteCommentAction(
  commentId: string,
  recipeId: string,
): Promise<CommentResult> {
  if (
    !uuidSchema.safeParse(commentId).success ||
    !uuidSchema.safeParse(recipeId).success
  ) {
    return { ok: false, message: "That comment does not exist." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Please log in first." };
  }

  // The RLS policy is the real guard; the user_id filter makes the intent
  // explicit and turns a forbidden delete into a no-op rather than an error.
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[comments] delete failed:", error.message);
    return { ok: false, message: "Could not delete the comment. Please try again." };
  }

  revalidatePath("/recipes/" + recipeId);
  return { ok: true };
}
