"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { loginSchema, registerSchema, fieldErrors } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  errors?: Record<string, string>;
  message?: string | null;
};

/** Resolves the site origin for email confirmation links. */
async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/[/]+$/, "");
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  return host ? proto + "://" + host : "http://localhost:3000";
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Read by the handle_new_user() trigger to populate profiles.full_name.
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: origin + "/auth/callback",
    },
  });

  if (error) {
    return { message: error.message };
  }

  // With email confirmation enabled Supabase returns a user but no session.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  redirect("/verify-email?email=" + encodeURIComponent(parsed.data.email));
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Supabase deliberately returns the same message for a wrong password and
    // an unknown email, so the form cannot be used to enumerate accounts.
    const message =
      error.message === "Email not confirmed"
        ? "Please confirm your email address first. Check your inbox for the link."
        : "That email and password combination is not correct.";
    return { message };
  }

  const nextParam = formData.get("next");
  const next =
    typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/";

  revalidatePath("/", "layout");
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
