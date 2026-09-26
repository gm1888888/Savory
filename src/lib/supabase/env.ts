/**
 * Supabase public environment values.
 *
 * These are the *anon* credentials and are safe to expose to the browser --
 * every table is protected by Row Level Security. The service-role key is
 * never referenced anywhere in this codebase.
 *
 * A freshly copied `.env.example` leaves these defined but empty, so the
 * check below treats blank exactly like missing. Without that, the Supabase
 * client is constructed with an empty URL and throws somewhere far away from
 * the actual cause.
 */
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

function readEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export const supabaseUrl = readEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  PLACEHOLDER_URL,
);

export const supabaseAnonKey = readEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  PLACEHOLDER_KEY,
);

/**
 * True once real credentials are configured. The app still renders without
 * them -- queries fail gracefully into the error state -- but this makes the
 * cause explicit rather than mysterious.
 */
export const isSupabaseConfigured =
  supabaseUrl !== PLACEHOLDER_URL && supabaseAnonKey !== PLACEHOLDER_KEY;
