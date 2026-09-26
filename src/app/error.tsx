"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <h1 className="font-heading text-2xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        That is on us, not you. Try again -- if it keeps happening, the
        database connection may be misconfigured.
      </p>
      <Button onClick={reset} className="mt-7">
        Try again
      </Button>
    </div>
  );
}
