import Link from "next/link";
import { redirect } from "next/navigation";

import { MyRecipesList } from "@/components/recipes/my-recipes-list";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getRecipes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My recipes",
  description: "Manage the recipes you have published.",
};

export default async function MyRecipesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fmy-recipes");

  const result = await getRecipes({
    userId: user.id,
    sort: "newest",
    perPage: 100,
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          My recipes
        </h1>
        <Button asChild>
          <Link href="/upload">Share a recipe</Link>
        </Button>
      </header>

      {result.error ? <ErrorState /> : <MyRecipesList initialRecipes={result.recipes} />}
    </div>
  );
}
