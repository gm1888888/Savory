"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isSafeNextPath } from "@/lib/safe-redirect";

/** Google's four-colour "G" mark, inline so no extra asset/network request. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-4">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-2.1 14.2-5.6l-6.6-5.6C29.6 34.6 26.9 35.5 24 35.5c-5.2 0-9.6-3.3-11.2-8l-6.5 5c3.3 6.4 9.7 10.5 17.7 10.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.9 35.9 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

/**
 * "Continue with Google" -- signs the visitor in directly, no separate
 * register step. The browser client redirects to Google, then back to
 * /auth/callback, which already exchanges the returned code for a session
 * (the exact same route the email-confirmation link uses).
 */
export function GoogleSignInButton({ next = "/" }: { next?: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const supabase = createClient();
    const safeNext = isSafeNextPath(next) ? next : "/";
    const redirectTo =
      window.location.origin +
      "/auth/callback?next=" +
      encodeURIComponent(safeNext);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      toast.error("Could not start Google sign-in. Please try again.");
      setPending(false);
    }
    // On success the browser is already navigating away to Google --
    // nothing left to render here.
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <GoogleIcon />
      )}
      Continue with Google
    </Button>
  );
}
