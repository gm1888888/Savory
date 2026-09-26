"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  defaultValue?: string;
  /** Where the query is submitted. Defaults to the dedicated search page. */
  action?: string;
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
};

/**
 * A plain GET form. Submitting navigates with `?q=`, which keeps the search
 * shareable, bookmarkable and server-rendered.
 */
export function SearchBar({
  defaultValue = "",
  action = "/search",
  placeholder = "Search recipes, ingredients or tags...",
  className,
  size = "default",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? action + "?q=" + encodeURIComponent(trimmed) : action);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("flex w-full items-center gap-2", className)}
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="recipe-search" className="sr-only">
          Search recipes
        </label>
        <Input
          id="recipe-search"
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className={cn("pl-10", size === "lg" && "h-12 text-base")}
        />
      </div>
      <Button type="submit" size={size === "lg" ? "lg" : "default"}>
        Search
      </Button>
    </form>
  );
}
