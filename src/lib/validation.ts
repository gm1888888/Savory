import { z } from "zod";

import {
  ACCEPTED_IMAGE_TYPES,
  CATEGORIES,
  MAX_IMAGE_BYTES,
} from "@/lib/constants";
import { supabaseUrl } from "@/lib/supabase/env";

/*
 * Every one of these schemas runs on the server, inside the Server Action,
 * before anything touches the database. Client-side checks exist only to give
 * fast feedback -- they are never the thing that protects the data.
 */

export const emailSchema = z
  .email("Enter a valid email address.")
  .trim()
  .min(1, "Email is required.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .max(80, "Name must be 80 characters or fewer."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

/**
 * Every recipe/comment id a Server Action receives comes straight from a
 * client-supplied argument. It is never string-concatenated into a query
 * (Supabase parameterises `.eq()`), so a malformed value cannot inject SQL --
 * but validating it here means a bad id is rejected with a clean error
 * instead of surfacing a raw Postgres "invalid input syntax for type uuid"
 * message to the caller.
 */
export const uuidSchema = z.uuid("That id is not valid.");

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name must be 80 characters or fewer."),
  bio: z
    .string()
    .trim()
    .max(300, "Bio must be 300 characters or fewer.")
    .optional(),
  avatarUrl: z
    .string()
    .nullable()
    .optional()
    .refine((url) => !url || isAllowedAvatarUrl(url), {
      message: "Avatar must be uploaded through this site.",
    }),
  avatarPath: z.string().nullable().optional(),
});

const minutesSchema = z.coerce
  .number({ error: "Enter a number of minutes." })
  .int("Use whole minutes.")
  .min(0, "Time cannot be negative.")
  .max(10080, "That is more than a week -- please check the value.");

export const recipeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(1, "Add a short description.")
    .max(500, "Description must be 500 characters or fewer."),
  category: z.enum(CATEGORIES, { error: "Choose a category." }),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    error: "Choose a difficulty.",
  }),
  preparationTime: minutesSchema,
  cookingTime: minutesSchema,
  servings: z.coerce
    .number({ error: "Enter a number of servings." })
    .int("Use a whole number.")
    .min(1, "At least 1 serving.")
    .max(100, "At most 100 servings."),
  ingredients: z
    .array(z.string().trim().min(1).max(200))
    .min(1, "Add at least one ingredient.")
    .max(100, "That is a lot of ingredients -- 100 maximum."),
  instructions: z
    .array(z.string().trim().min(1).max(1000))
    .min(1, "Add at least one step.")
    .max(100, "That is a lot of steps -- 100 maximum."),
  tags: z.array(z.string().trim().min(1).max(24)).max(10, "Up to 10 tags."),
  imageUrl: z
    .string()
    .nullable()
    .optional()
    .refine((url) => !url || isSupabaseStorageUrl(url), {
      message: "Recipe photo must be uploaded through this site.",
    }),
  imagePath: z.string().nullable().optional(),
});

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(1000, "Comments are limited to 1000 characters."),
});

export type RecipeInput = z.infer<typeof recipeSchema>;

/**
 * Validates a file chosen in the browser before it is uploaded.
 * The storage bucket enforces the same limits server-side -- this exists to
 * give the user an immediate, friendly answer.
 */
export function validateImageFile(file: File): string | null {
  const accepted: readonly string[] = ACCEPTED_IMAGE_TYPES;
  if (!accepted.includes(file.type)) {
    return "Please choose a JPG, PNG or WEBP image.";
  }
  if (file.size === 0) {
    return "That file appears to be empty.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(0);
    return `That image is too large. Maximum size is ${mb} MB.`;
  }
  return null;
}

/**
 * True only for a URL hosted on THIS project's Supabase Storage.
 *
 * The avatar component (Radix's AvatarImage) renders a plain <img>, which
 * bypasses next/image's remotePatterns host allow-list entirely -- that
 * allow-list only constrains next/image, not raw <img> tags. Without this
 * check, a user could set their avatar to any external URL (an off-site
 * tracking pixel, for instance) and every viewer's browser would fetch it
 * directly, leaking their IP and referrer. Checking against the project's
 * OWN host (not just any *.supabase.co) also closes the narrower gap where
 * a value could reference public storage on a different Supabase project.
 */
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const projectHost = new URL(supabaseUrl).hostname;
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === projectHost &&
      parsed.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

/**
 * Hosts allowed for a PROFILE avatar beyond this project's own storage.
 *
 * Google Sign-In populates a new user's avatar_url straight from Google's
 * profile-photo CDN (via the handle_new_user() trigger, not through this
 * validation layer). If that same value is later resubmitted unchanged by
 * the profile-edit form, isSupabaseStorageUrl alone would reject it --
 * locking a Google user out of editing their own profile. Recipe photos
 * (isSupabaseStorageUrl, used by recipeSchema) intentionally stay stricter:
 * there is no legitimate external source for those.
 */
const TRUSTED_EXTERNAL_AVATAR_HOSTS = ["lh3.googleusercontent.com"];

export function isAllowedAvatarUrl(url: string): boolean {
  if (isSupabaseStorageUrl(url)) return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      TRUSTED_EXTERNAL_AVATAR_HOSTS.includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

/**
 * True when a storage object path lives inside the given user's own folder.
 *
 * Storage RLS already enforces this for writes/deletes (see
 * supabase/schema.sql), so this cannot be used to touch another user's
 * blob -- but without this check a user could still make their own recipe
 * ROW reference someone else's already-public photo (content spoofing).
 * Paths are always written by uploadImage() as `${userId}/${uuid}.${ext}`.
 */
export function isOwnedStoragePath(
  path: string | null | undefined,
  userId: string,
): boolean {
  if (!path) return true; // no image is always allowed
  return path.startsWith(userId + "/");
}

/** Flattens a ZodError into the `{ field: message }` shape the forms render. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) {
      result[key] = issue.message;
    }
  }
  return result;
}
