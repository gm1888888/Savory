import Link from "next/link";
import { CookingPot } from "lucide-react";

import { cn } from "@/lib/utils";

/** Wordmark used in the navbar and footer. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 font-heading text-lg font-bold tracking-tight",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:-rotate-6">
        <CookingPot className="size-[18px]" aria-hidden="true" />
      </span>
      <span>
        Savory
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
}
