"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, MailWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isSafeNextPath } from "@/lib/safe-redirect";

export type EmailOtpType =
  | "signup"
  | "email_change"
  | "recovery"
  | "invite"
  | "email";

/**
 * The actual account confirmation happens ONLY on a genuine button click,
 * never automatically on page load.
 *
 * Email confirmation links are single-use. Many mail providers (Gmail's link
 * scanning, Apple Mail's Privacy Protection, corporate security gateways)
 * automatically visit every link in an email before the recipient ever sees
 * it, to scan for malware -- if the link itself completed verification on
 * a plain page load, that automatic scan burns the one-time link before the
 * real user gets to it, and they see an "expired" error even though nothing
 * is actually wrong. A scanner loads a page; it does not press buttons.
 * Requiring the click is what defeats that.
 */
export function ConfirmButton({
  tokenHash,
  type,
  next,
}: {
  tokenHash: string;
  type: EmailOtpType;
  next: string;
}) {
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleConfirm() {
    setState("pending");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }

    setState("done");
    const safeNext = isSafeNextPath(next) ? next : "/";
    window.location.href = safeNext + (safeNext.includes("?") ? "&" : "?") + "welcome=1";
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="size-8 text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Confirmed. Taking you in...
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <MailWarning className="size-8 text-destructive" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          {message ??
            "That confirmation link has already been used or has expired."}
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button asChild>
            <Link href="/register">Sign up again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Back to log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      className="gap-2"
      onClick={handleConfirm}
      disabled={state === "pending"}
    >
      {state === "pending" ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Confirming...
        </>
      ) : (
        "Confirm my account"
      )}
    </Button>
  );
}
