import type { Difficulty } from "@/lib/database.types";

/**
 * Recipe categories.
 *
 * This is taxonomy, not content -- the list defines the filter vocabulary and
 * is intentionally fixed. No recipes are seeded anywhere in this project.
 */
export const CATEGORIES = [
  "Filipino Food",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Desserts",
  "Snacks",
  "Drinks",
  "Seafood",
  "Vegetarian",
  "Healthy Food",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "most-liked", label: "Most liked" },
  { value: "quickest", label: "Quickest to make" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const RECIPES_PER_PAGE = 12;

/** Storage buckets. Must match the names created in `supabase/schema.sql`. */
export const RECIPE_IMAGE_BUCKET = "recipe-images";
export const PROFILE_IMAGE_BUCKET = "profile-images";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;
export const ACCEPTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/** Turns a category name into the slug used in `/categories/[slug]`. */
export function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

/** Resolves a slug back to its canonical category name, if it is a real one. */
export function slugToCategory(slug: string): Category | null {
  return (
    CATEGORIES.find((category) => categoryToSlug(category) === slug) ?? null
  );
}
