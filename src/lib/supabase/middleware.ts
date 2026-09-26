import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { timeoutFetch } from "@/lib/supabase/fetch";

/** Routes that require an authenticated user. */
const PROTECTED_PREFIXES = ["/upload", "/my-recipes", "/bookmarks", "/profile"];

/** Routes an already-authenticated user should not see. */
const AUTH_ONLY_PREFIXES = ["/login", "/register"];

/**
 * Refreshes the Supabase session on every request and guards protected routes.
 *
 * The response object returned here MUST be the same one whose cookies were
 * written by `setAll`, otherwise refreshed tokens are dropped and users appear
 * randomly logged out.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { fetch: timeoutFetch },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Responses that set auth cookies must never be cached by a CDN,
        // or one user's session could be served to another.
        for (const [key, headerValue] of Object.entries(headers ?? {})) {
          response.headers.set(key, headerValue);
        }
      },
    },
  });

  // Must run before any redirect so a token refresh is written to `response`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(redirectUrl);
    // Carry over any refreshed auth cookies onto the redirect response.
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  }

  if (user && AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    const redirect = NextResponse.redirect(redirectUrl);
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  }

  return response;
}
