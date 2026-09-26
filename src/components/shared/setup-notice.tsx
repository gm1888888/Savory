import { AlertTriangle } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Rendered only when the Supabase environment variables are missing. Without
 * this the site just looks permanently empty, which is a confusing first
 * experience for anyone cloning the repo.
 */
export function SetupNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10">
      <div className="mx-auto flex w-full max-w-6xl items-start gap-2.5 px-4 py-2.5 text-sm sm:px-6">
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <p className="text-amber-900 dark:text-amber-200">
          <strong className="font-semibold">Supabase is not connected.</strong>{" "}
          Add <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="font-mono text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          to <code className="font-mono text-xs">.env.local</code>, then
          restart the dev server. See the README, sections 4 to 6.
        </p>
      </div>
    </div>
  );
}
