"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { commentSchema } from "@/lib/validation";

export type ToggleResult = {
  ok: boolean;
  active: boolean;
  count?: number;
  message?: string;
};

export type CommentResult = { ok: boolean; message?: string };

/*
 * Likes and bookmarks are real rows, not counters. The unique constraints in
 * the schema make a duplicate impossible even if two requests race.
 */

export async function toggleLikeAction(
  recipeId: string,
): Promise<ToggleResult> {
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
    if (error) return { ok: false, active: true, message: error.message };
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ recipe_id: recipeId, user_id: user.id });
    // A duplicate means another tab already liked it -- treat as success.
    if (error && error.code !== "23505") {
      return { ok: false, active: false, message: error.message };
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
    if (error) return { ok: false, active: true, message: error.message };
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .insert({ recipe_id: recipeId, user_id: user.id });
    if (error && error.code !== "23505") {
      return { ok: false, active: false, message: error.message };
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

  const { error } = await supabase.from("comments").insert({
    recipe_id: recipeId,
    user_id: user.id,
    content: parsed.data.content,
  });

  if (error) {
    console.error("[comments] insert failed:", error.message);
    return { ok: false, message: error.message };
  }

  revalidatePath("/recipes/" + recipeId);
  return { ok: true };
}

export async function deleteCommentAction(
  commentId: string,
  recipeId: string,
): Promise<CommentResult> {
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
    return { ok: false, message: error.message };
  }

  revalidatePath("/recipes/" + recipeId);
  return { ok: true };
}
