"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChefHat, Eye, Pencil, UtensilsCrossed } from "lucide-react";

import { DeleteRecipeButton } from "@/components/recipes/delete-recipe-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RecipeWithAuthor } from "@/lib/database.types";
import { formatDate } from "@/lib/format";

/**
 * Owns the recipe list in local state so deleting one card removes just that
 * card -- no full-page refresh (which would re-fetch and re-render every
 * other recipe, its image, and the header count just to remove one row).
 */
export function MyRecipesList({
  initialRecipes,
}: {
  initialRecipes: RecipeWithAuthor[];
}) {
  const [recipes, setRecipes] = useState(initialRecipes);

  function handleDeleted(recipeId: string) {
    setRecipes((current) => current.filter((recipe) => recipe.id !== recipeId));
  }

  return (
    <>
      <p className="mt-2 text-muted-foreground">
        {recipes.length === 0
          ? "Everything you publish will be listed here."
          : recipes.length === 1
            ? "You have published 1 recipe."
            : "You have published " + recipes.length + " recipes."}
      </p>

      {recipes.length === 0 ? (
        <EmptyState
          icon={<ChefHat className="size-6" aria-hidden="true" />}
          title="You have not shared a recipe yet"
          description="Your published recipes will appear here, where you can edit or delete them any time."
          action={{ label: "Share your first recipe", href: "/upload" }}
          className="mt-8"
        />
      ) : (
        <ul className="mt-8 space-y-3.5">
          {recipes.map((recipe) => (
            <li
              key={recipe.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-3.5 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:aspect-square sm:size-24">
                {recipe.image_url ? (
                  <Image
                    src={recipe.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-warm-wash">
                    <UtensilsCrossed
                      className="size-6 text-muted-foreground/40"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{recipe.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(recipe.created_at)}
                  </span>
                </div>
                <h2 className="mt-1.5 truncate font-heading text-lg font-semibold">
                  {recipe.title}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {recipe.likes_count}{" "}
                  {recipe.likes_count === 1 ? "like" : "likes"} ·{" "}
                  {recipe.comments_count}{" "}
                  {recipe.comments_count === 1 ? "comment" : "comments"}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href={"/recipes/" + recipe.id}>
                    <Eye className="size-4" aria-hidden="true" />
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href={"/recipes/" + recipe.id + "/edit"}>
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit
                  </Link>
                </Button>
                <DeleteRecipeButton
                  recipeId={recipe.id}
                  recipeTitle={recipe.title}
                  onDeleted={() => handleDeleted(recipe.id)}
                  compact
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
