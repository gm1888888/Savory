import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { timeoutFetch } from "@/lib/supabase/fetch";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * A new client must be created per request -- never share one across requests.
 * Server Components cannot set cookies, so `setAll` is wrapped in try/catch;
 * the middleware client is what actually persists refreshed sessions.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { fetch: timeoutFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, which cannot mutate cookies.
          // Safe to ignore: middleware refreshes the session on every request.
        }
      },
    },
  });
}
