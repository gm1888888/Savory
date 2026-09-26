import { RecipeGridSkeleton } from "@/components/shared/loading-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="mb-8 space-y-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-80 max-w-full" />
      </div>
      <RecipeGridSkeleton count={6} />
    </div>
  );
}
