import { Suspense } from "react";
import { SearchX, Sparkles } from "lucide-react";

import { Pagination } from "@/components/recipes/pagination";
import { RecipeFilters } from "@/components/recipes/recipe-filters";
import { RecipeGrid } from "@/components/recipes/recipe-grid";
import { SearchBar } from "@/components/recipes/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { getRecipes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search",
  description: "Search recipes by title, ingredient, tag or category.",
};

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;

  const term = firstValue(params.q)?.trim() ?? "";
  const category = firstValue(params.category);
  const difficulty = firstValue(params.difficulty);
  const sort = firstValue(params.sort) ?? "newest";
  const page = Number(firstValue(params.page) ?? "1") || 1;

  const hasQuery = term.length > 0 || Boolean(category) || Boolean(difficulty);

  const result = hasQuery
    ? await getRecipes({ search: term, category, difficulty, sort, page })
    : null;

  const baseParams = new URLSearchParams();
  if (term) baseParams.set("q", term);
  if (category) baseParams.set("category", category);
  if (difficulty) baseParams.set("difficulty", difficulty);
  if (sort && sort !== "newest") baseParams.set("sort", sort);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Search recipes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Looks through titles, descriptions, ingredients, tags and categories.
        </p>
      </header>

      <div className="mb-8 space-y-4">
        <SearchBar defaultValue={term} action="/search" />
        <Suspense fallback={null}>
          <RecipeFilters />
        </Suspense>
      </div>

      {!result ? (
        <EmptyState
          icon={<Sparkles className="size-6" aria-hidden="true" />}
          title="What are you in the mood for?"
          description="Try an ingredient you have in the fridge, a dish name, or a tag like Filipino or Vegetarian."
        />
      ) : result.error ? (
        <ErrorState />
      ) : result.recipes.length > 0 ? (
        <>
          <p className="mb-5 text-sm text-muted-foreground">
            {result.total === 1
              ? "1 recipe found"
              : result.total + " recipes found"}
            {term ? <> for &ldquo;{term}&rdquo;</> : null}
          </p>
          <RecipeGrid recipes={result.recipes} priorityCount={3} />
          <div className="mt-10">
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              baseQuery={baseParams.toString()}
              pathname="/search"
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden="true" />}
          title="No recipes found"
          description={
            term
              ? "We could not find any recipes matching that search. Try another search term, or clear your filters."
              : "No recipes match those filters. Try widening them."
          }
          action={{ label: "Browse all recipes", href: "/recipes" }}
        />
      )}
    </div>
  );
}
