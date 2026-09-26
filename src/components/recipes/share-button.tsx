"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Uses the native share sheet where the browser offers one (mobile), and
 * falls back to copying the link to the clipboard everywhere else.
 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // The user dismissing the sheet throws AbortError -- not a failure.
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link. You can copy it from the address bar.");
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleShare} className="gap-2">
      {copied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Share2 className="size-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
    </Button>
  );
}
