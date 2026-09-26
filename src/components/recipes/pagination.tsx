import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** Current query string without `page`, e.g. "category=Breakfast". */
  baseQuery: string;
  pathname: string;
};

function hrefFor(pathname: string, baseQuery: string, page: number) {
  const params = new URLSearchParams(baseQuery);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? pathname + "?" + query : pathname;
}

/** Server-rendered pagination -- each page is a real, linkable URL. */
export function Pagination({
  page,
  totalPages,
  baseQuery,
  pathname,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Show a compact window around the current page.
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let index = Math.max(1, end - 4); index <= end; index += 1) {
    pages.push(index);
  }

  return (
    <nav
      aria-label="Recipe pages"
      className="flex items-center justify-center gap-1.5"
    >
      <Link
        href={hrefFor(pathname, baseQuery, page - 1)}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          page <= 1 && "pointer-events-none opacity-50",
        )}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        <span className="sr-only">Previous page</span>
      </Link>

      {pages[0] > 1 ? (
        <span className="px-1.5 text-sm text-muted-foreground">...</span>
      ) : null}

      {pages.map((item) => (
        <Link
          key={item}
          href={hrefFor(pathname, baseQuery, item)}
          aria-current={item === page ? "page" : undefined}
          className={cn(
            buttonVariants({
              variant: item === page ? "default" : "outline",
              size: "icon",
            }),
            "tabular-nums",
          )}
        >
          {item}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages ? (
        <span className="px-1.5 text-sm text-muted-foreground">...</span>
      ) : null}

      <Link
        href={hrefFor(pathname, baseQuery, page + 1)}
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          page >= totalPages && "pointer-events-none opacity-50",
        )}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
        <span className="sr-only">Next page</span>
      </Link>
    </nav>
  );
}
