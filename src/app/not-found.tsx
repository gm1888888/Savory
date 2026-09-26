import Link from "next/link";
import { CookingPot } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-accent text-primary">
        <CookingPot className="size-6" aria-hidden="true" />
      </div>
      <h1 className="font-heading text-3xl font-bold">Nothing on this plate</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The page you are looking for does not exist, or the recipe that was
        here has since been deleted by its author.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/recipes">Browse recipes</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
