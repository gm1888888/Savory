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
};

export default nextConfig;
