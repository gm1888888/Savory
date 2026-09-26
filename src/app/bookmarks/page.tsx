import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";

import { RecipeGrid } from "@/components/recipes/recipe-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { getBookmarkedRecipes, getCurrentUser } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved recipes",
  description: "The recipes you have bookmarked.",
};

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fbookmarks");

  const recipes = await getBookmarkedRecipes(user.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Saved recipes
        </h1>
        <p className="mt-2 text-muted-foreground">
          {recipes.length === 0
            ? "Recipes you bookmark are kept here, private to you."
            : recipes.length === 1
              ? "1 recipe saved."
              : recipes.length + " recipes saved."}
        </p>
      </header>

      {recipes.length > 0 ? (
        <RecipeGrid recipes={recipes} priorityCount={3} />
      ) : (
        <EmptyState
          icon={<Bookmark className="size-6" aria-hidden="true" />}
          title="You have not bookmarked any recipes yet"
          description="Tap Save on any recipe and it will be waiting for you here next time you cook."
          action={{ label: "Explore Recipes", href: "/recipes" }}
        />
      )}
    </div>
  );
}
