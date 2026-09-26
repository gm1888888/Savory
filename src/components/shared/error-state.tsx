import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  description?: string;
};

/**
 * Shown when a Supabase query fails -- usually a missing or wrong
 * NEXT_PUBLIC_SUPABASE_URL, or the SQL script not having been run yet.
 */
export function ErrorState({
  title = "We could not load this right now",
  description = "There was a problem reaching the database. Please refresh the page, or try again in a moment.",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-background text-destructive ring-1 ring-destructive/20">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
