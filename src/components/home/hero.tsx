import Link from "next/link";
import { ArrowRight, Soup } from "lucide-react";

import { SearchBar } from "@/components/recipes/search-bar";
import { Button } from "@/components/ui/button";
import { CATEGORIES, categoryToSlug } from "@/lib/constants";

export function Hero({ recipeCount }: { recipeCount: number }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-warm-wash">
      <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <Soup className="size-3.5 text-primary" aria-hidden="true" />
          {recipeCount > 0
            ? recipeCount === 1
              ? "1 recipe shared so far"
              : recipeCount + " recipes shared so far"
            : "A brand new community kitchen"}
        </span>

        <h1 className="mt-6 text-balance font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          Real recipes from
          <span className="text-primary"> real home cooks</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          No scraped content and no filler. Everything on Savory was written by
          someone who actually made the dish, and you can add yours in minutes.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <SearchBar size="lg" />
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/upload">
              Share your recipe
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/recipes">Browse everything</Link>
          </Button>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.slice(0, 6).map((category) => (
            <li key={category}>
              <Link
                href={"/categories/" + categoryToSlug(category)}
                className="inline-block rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
