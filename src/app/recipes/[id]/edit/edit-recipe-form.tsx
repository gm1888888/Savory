"use client";

import { updateRecipeAction, type RecipeFormState } from "@/app/actions/recipes";
import { RecipeForm } from "@/components/recipes/recipe-form";
import type { RecipeWithAuthor } from "@/lib/database.types";

/**
 * Binds the recipe id to the update action so RecipeForm keeps the same
 * `(state, formData)` signature it uses for creating.
 */
export function EditRecipeForm({
  userId,
  recipe,
}: {
  userId: string;
  recipe: RecipeWithAuthor;
}) {
  async function action(state: RecipeFormState, formData: FormData) {
    return updateRecipeAction(recipe.id, state, formData);
  }

  return (
    <RecipeForm
      userId={userId}
      action={action}
      recipe={recipe}
      submitLabel="Save changes"
    />
  );
}
