import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Runs before every matched request. Refreshing the Supabase session here is
 * what keeps server-rendered pages from seeing a stale or expired token.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files.
     * `[.]` is used instead of an escaped dot purely for readability.
     */
    "/((?!_next/static|_next/image|favicon[.]ico|.*[.](?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
