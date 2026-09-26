import type { RecipeWithAuthor } from "@/lib/database.types";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { cn } from "@/lib/utils";

type RecipeGridProps = {
  recipes: RecipeWithAuthor[];
  className?: string;
  /** Number of cards given image priority, for above-the-fold LCP. */
  priorityCount?: number;
};

export function RecipeGrid({
  recipes,
  className,
  priorityCount = 0,
}: RecipeGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
