"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { RECIPE_IMAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { removeImage } from "@/lib/storage";
import { fieldErrors, recipeSchema } from "@/lib/validation";

export type RecipeFormState = {
  errors?: Record<string, string>;
  message?: string | null;
};

/** Pulls the repeated ingredient/instruction/tag fields out of the form. */
function listFrom(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);
}

function parseRecipeForm(formData: FormData) {
  return recipeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    difficulty: formData.get("difficulty"),
    preparationTime: formData.get("preparationTime"),
    cookingTime: formData.get("cookingTime"),
    servings: formData.get("servings"),
    ingredients: listFrom(formData, "ingredients"),
    instructions: listFrom(formData, "instructions"),
    tags: listFrom(formData, "tags"),
    imageUrl: formData.get("imageUrl") || null,
    imagePath: formData.get("imagePath") || null,
  });
}

export async function createRecipeAction(
  _prev: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const parsed = parseRecipeForm(formData);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You need to be signed in to publish a recipe." };
  }

  const input = parsed.data;
  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description,
      category: input.category,
      difficulty: input.difficulty,
      preparation_time: input.preparationTime,
      cooking_time: input.cookingTime,
      servings: input.servings,
      image_url: input.imageUrl || null,
      image_path: input.imagePath || null,
      ingredients: input.ingredients.map((item) => ({ item })),
      instructions: input.instructions.map((step) => ({ step })),
      tags: input.tags,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[recipes] create failed:", error?.message);
    return { message: error?.message ?? "Could not publish the recipe." };
  }

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath("/my-recipes");
  redirect("/recipes/" + data.id + "?published=1");
}

export async function updateRecipeAction(
  recipeId: string,
  _prev: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const parsed = parseRecipeForm(formData);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You need to be signed in to edit a recipe." };
  }

  // Read the existing row so the previous image can be cleaned up. RLS allows
  // anyone to read, so ownership is re-checked below and again on UPDATE.
  const { data: existing } = await supabase
    .from("recipes")
    .select("user_id, image_path")
    .eq("id", recipeId)
    .maybeSingle();

  if (!existing) {
    return { message: "That recipe no longer exists." };
  }
  if (existing.user_id !== user.id) {
    return { message: "You can only edit your own recipes." };
  }

  const input = parsed.data;
  const newPath = input.imagePath || null;
  const oldPath = existing.image_path;

  const { error } = await supabase
    .from("recipes")
    .update({
      title: input.title,
      description: input.description,
      category: input.category,
      difficulty: input.difficulty,
      preparation_time: input.preparationTime,
      cooking_time: input.cookingTime,
      servings: input.servings,
      image_url: input.imageUrl || null,
      image_path: newPath,
      ingredients: input.ingredients.map((item) => ({ item })),
      instructions: input.instructions.map((step) => ({ step })),
      tags: input.tags,
    })
    .eq("id", recipeId)
    // Belt and braces: the RLS policy enforces this too.
    .eq("user_id", user.id);

  if (error) {
    console.error("[recipes] update failed:", error.message);
    return { message: error.message };
  }

  // Only remove the old blob once the row has been updated successfully.
  if (oldPath && oldPath !== newPath) {
    await removeImage(supabase, RECIPE_IMAGE_BUCKET, oldPath);
  }

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath("/recipes/" + recipeId);
  revalidatePath("/my-recipes");
  redirect("/recipes/" + recipeId + "?updated=1");
}

export async function deleteRecipeAction(recipeId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You need to be signed in to delete a recipe.");
  }

  const { data: existing } = await supabase
    .from("recipes")
    .select("user_id, image_path")
    .eq("id", recipeId)
    .maybeSingle();

  if (!existing) return;
  if (existing.user_id !== user.id) {
    throw new Error("You can only delete your own recipes.");
  }

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[recipes] delete failed:", error.message);
    throw new Error(error.message);
  }

  // Row is gone; the blob is best-effort. An orphaned file is preferable to
  // an undeletable recipe.
  await removeImage(supabase, RECIPE_IMAGE_BUCKET, existing.image_path);

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath("/my-recipes");
}
