import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";

/**
 * Where Supabase sends people after they click the link in their
 * confirmation email, or after a Google sign-in. Exchanges the one-time code
 * for a real session and drops them on the homepage (or wherever they were
 * headed), signed in.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(origin + "/auth/auth-error?reason=missing-code");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchange failed:", error.message);
    return NextResponse.redirect(origin + "/auth/auth-error?reason=expired");
  }

  // `x-forwarded-host` is what Vercel sets behind its proxy.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = isLocal || !forwardedHost ? origin : "https://" + forwardedHost;

  return NextResponse.redirect(base + next + "?welcome=1");
}
