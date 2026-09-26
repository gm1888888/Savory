import type { NextConfig } from "next";

/**
 * Recipe and profile photos are served from Supabase Storage, so the Supabase
 * hostname has to be allow-listed before next/image will optimise them.
 * Without this, every uploaded image throws at runtime.
 */
function supabaseHostname(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const host = supabaseHostname();

/**
 * Security headers applied to every response.
 *
 * Next.js Server Actions already verify the Origin header on POST, which
 * covers classic CSRF -- but that does nothing against clickjacking, where
 * the real page is loaded inside an attacker's iframe and the victim's own
 * clicks are hijacked onto Like/Bookmark/Delete controls. `frame-ancestors`
 * (and X-Frame-Options as a legacy fallback) closes that gap.
 */
function securityHeaders() {
  const supabaseConnect = host ? "https://" + host : "https://*.supabase.co";
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    // unsafe-inline is required for Next.js's inline hydration/style tags;
    // there is no inline <script> executing untrusted content in this app.
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.supabase.co https://*.supabase.in",
    "font-src 'self' data:",
    "connect-src 'self' " + supabaseConnect + " https://*.supabase.co",
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Covers every Supabase-hosted project.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.supabase.in", pathname: "/storage/v1/object/public/**" },
      // Covers a self-hosted or custom-domain Supabase instance.
      ...(host && !host.endsWith(".supabase.co")
        ? [{ protocol: "https" as const, hostname: host, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders() }];
  },
};

export default nextConfig;
