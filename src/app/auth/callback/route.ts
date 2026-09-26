import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends people after they click the link in their
 * confirmation email. Exchanges the one-time code for a real session and
 * drops them on the homepage, signed in.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirectParam = searchParams.get("next");
  const next =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

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
