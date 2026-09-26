import Link from "next/link";

import { CATEGORIES, categoryToSlug } from "@/lib/constants";
import { getCategoryCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories",
  description: "Browse recipes by category.",
};

export default async function CategoriesPage() {
  const counts = await getCategoryCounts();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-9">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Categories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick a category to see what people have shared.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const count = counts[category] ?? 0;
          return (
            <li key={category}>
              <Link
                href={"/categories/" + categoryToSlug(category)}
                className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
              >
                <span className="font-heading text-lg font-semibold">
                  {category}
                </span>
                <span className="text-sm text-muted-foreground">
                  {count === 0
                    ? "No recipes yet"
                    : count === 1
                      ? "1 recipe"
                      : count + " recipes"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
