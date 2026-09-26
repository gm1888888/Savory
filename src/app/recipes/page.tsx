import { Suspense } from "react";
import { UtensilsCrossed } from "lucide-react";

import { Pagination } from "@/components/recipes/pagination";
import { RecipeFilters } from "@/components/recipes/recipe-filters";
import { RecipeGrid } from "@/components/recipes/recipe-grid";
import { SearchBar } from "@/components/recipes/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { getRecipes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All recipes",
  description: "Browse every recipe shared by the Savory community.",
};

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function RecipesPage({
  searchParams,
}: PageProps<"/recipes">) {
  const params = await searchParams;

  const search = firstValue(params.q);
  const category = firstValue(params.category);
  const difficulty = firstValue(params.difficulty);
  const sort = firstValue(params.sort) ?? "newest";
  const page = Number(firstValue(params.page) ?? "1") || 1;

  const result = await getRecipes({ search, category, difficulty, sort, page });

  // Rebuild the query string without `page` so pagination links stay correct.
  const baseParams = new URLSearchParams();
  if (search) baseParams.set("q", search);
  if (category) baseParams.set("category", category);
  if (difficulty) baseParams.set("difficulty", difficulty);
  if (sort && sort !== "newest") baseParams.set("sort", sort);

  const isFiltered = Boolean(search || category || difficulty);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          All recipes
        </h1>
        <p className="mt-2 text-muted-foreground">
          {result.total > 0
            ? result.total === 1
              ? "1 recipe shared so far."
              : result.total + " recipes shared so far."
            : "Everything the community has shared will show up here."}
        </p>
      </header>

      <div className="mb-8 space-y-4">
        <SearchBar defaultValue={search ?? ""} action="/recipes" />
        <Suspense fallback={null}>
          <RecipeFilters />
        </Suspense>
      </div>

      {result.error ? (
        <ErrorState />
      ) : result.recipes.length > 0 ? (
        <>
          <RecipeGrid recipes={result.recipes} priorityCount={3} />
          <div className="mt-10">
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              baseQuery={baseParams.toString()}
              pathname="/recipes"
            />
          </div>
        </>
      ) : isFiltered ? (
        <EmptyState
          icon={<UtensilsCrossed className="size-6" aria-hidden="true" />}
          title="No recipes match those filters"
          description="Try a different category or difficulty, or clear the filters to see everything."
          action={{ label: "Clear filters", href: "/recipes" }}
        />
      ) : (
        <EmptyState
          icon={<UtensilsCrossed className="size-6" aria-hidden="true" />}
          title="No recipes have been posted yet"
          description="Nobody has shared a recipe so far. Yours could be the very first one."
          action={{ label: "Share a Recipe", href: "/upload" }}
        />
      )}
    </div>
  );
}
