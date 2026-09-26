import { z } from "zod";

import {
  ACCEPTED_IMAGE_TYPES,
  CATEGORIES,
  MAX_IMAGE_BYTES,
} from "@/lib/constants";

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
  avatarUrl: z.string().nullable().optional(),
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
  imageUrl: z.string().nullable().optional(),
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
