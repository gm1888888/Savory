import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Supabase client for use in Client Components.
 * Session is persisted in cookies so the server can read it during SSR.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
