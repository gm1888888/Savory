import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  className?: string;
  /** `panel` adds the dashed card treatment used inside page sections. */
  variant?: "panel" | "bare";
};

/**
 * The site starts with no recipes at all, so empty states carry real weight
 * here -- they are the first thing most visitors will see.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = "panel",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center sm:py-20",
        variant === "panel" &&
          "rounded-2xl border border-dashed border-border bg-warm-wash",
        className,
      )}
    >
      {icon ? (
        <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-background text-primary shadow-sm ring-1 ring-border/60">
          {icon}
        </div>
      ) : null}

      <h3 className="text-balance text-lg font-semibold sm:text-xl">{title}</h3>

      {description ? (
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action || secondaryAction ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {action ? (
            <Button asChild size="lg">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button asChild size="lg" variant="outline">
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
