"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, DIFFICULTIES, SORT_OPTIONS } from "@/lib/constants";

const ANY = "any";

/**
 * Category / difficulty / sort controls. Each change rewrites the URL, so the
 * server re-queries Supabase with the new filter -- no client-side filtering.
 */
export function RecipeFilters({ showCategory = true }: { showCategory?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? ANY;
  const difficulty = searchParams.get("difficulty") ?? ANY;
  const sort = searchParams.get("sort") ?? "newest";
  const hasFilters =
    category !== ANY || difficulty !== ANY || sort !== "newest";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ANY || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Any filter change puts the user back on page 1.
    params.delete("page");
    const query = params.toString();
    router.push(query ? pathname + "?" + query : pathname);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["category", "difficulty", "sort", "page"]) {
      params.delete(key);
    }
    const query = params.toString();
    router.push(query ? pathname + "?" + query : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {showCategory ? (
        <Select value={category} onValueChange={(v) => update("category", v)}>
          <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All categories</SelectItem>
            {CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Select value={difficulty} onValueChange={(v) => update("difficulty", v)}>
        <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by difficulty">
          <SelectValue placeholder="Any difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any difficulty</SelectItem>
          {DIFFICULTIES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => update("sort", v)}>
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort recipes">
          <SelectValue placeholder="Newest first" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="gap-1.5 text-muted-foreground"
        >
          <X className="size-3.5" aria-hidden="true" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
