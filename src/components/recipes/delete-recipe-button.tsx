"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteRecipeAction } from "@/app/actions/recipes";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";

type DeleteRecipeButtonProps = {
  recipeId: string;
  recipeTitle: string;
  /** Where to send the user afterwards. Detail pages cannot stay put. */
  redirectTo?: string;
  /**
   * Called after a successful delete when the caller owns a local list (e.g.
   * "My recipes") and can just remove this one card -- avoids a full-page
   * refresh that would re-fetch and re-render every other recipe too.
   */
  onDeleted?: () => void;
  compact?: boolean;
};

export function DeleteRecipeButton({
  recipeId,
  recipeTitle,
  redirectTo,
  onDeleted,
  compact = false,
}: DeleteRecipeButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    try {
      await deleteRecipeAction(recipeId);
      toast.success("Recipe deleted.");
      if (redirectTo) {
        router.push(redirectTo);
      } else if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the recipe.",
      );
    }
  }

  return (
    <ConfirmationDialog
      trigger={
        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {compact ? null : "Delete"}
          {compact ? <span className="sr-only">Delete recipe</span> : null}
        </Button>
      }
      title="Delete this recipe?"
      description={
        "Are you sure you want to delete " +
        recipeTitle +
        "? This cannot be undone, and its photo will be removed too."
      }
      confirmLabel="Delete recipe"
      onConfirm={handleDelete}
    />
  );
}
