import Link from "next/link";
import { notFound } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";

import { Pagination } from "@/components/recipes/pagination";
import { RecipeGrid } from "@/components/recipes/recipe-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { slugToCategory } from "@/lib/constants";
import { getRecipes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = slugToCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category,
    description: "Recipes in the " + category + " category.",
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;

  const category = slugToCategory(slug);
  if (!category) notFound();

  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = Number(pageValue ?? "1") || 1;

  const result = await getRecipes({ category, sort: "newest", page });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
        <Link href="/categories" className="hover:text-foreground">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {category}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {result.total === 0
            ? "Nothing here yet."
            : result.total === 1
              ? "1 recipe in this category."
              : result.total + " recipes in this category."}
        </p>
      </header>

      {result.error ? (
        <ErrorState />
      ) : result.recipes.length > 0 ? (
        <>
          <RecipeGrid recipes={result.recipes} priorityCount={3} />
          <div className="mt-10">
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              baseQuery=""
              pathname={"/categories/" + slug}
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={<UtensilsCrossed className="size-6" aria-hidden="true" />}
          title={"No recipes in " + category + " yet"}
          description="Nobody has shared anything here so far. If you have a recipe that fits, this is a good place to start."
          action={{ label: "Share a Recipe", href: "/upload" }}
          secondaryAction={{ label: "Browse all recipes", href: "/recipes" }}
        />
      )}
    </div>
  );
}
