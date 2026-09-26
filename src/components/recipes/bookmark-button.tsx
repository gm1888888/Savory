"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

import { toggleBookmarkAction } from "@/app/actions/interactions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
  recipeId: string;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
  /** `icon` is the compact variant used on cards. */
  variant?: "default" | "icon";
};

export function BookmarkButton({
  recipeId,
  initialBookmarked,
  isAuthenticated,
  variant = "default",
}: BookmarkButtonProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      toast.error("Please log in to save this recipe.", {
        action: { label: "Log in", onClick: () => router.push("/login") },
      });
      return;
    }

    const previous = bookmarked;
    setBookmarked(!previous);

    startTransition(async () => {
      const result = await toggleBookmarkAction(recipeId);
      if (!result.ok) {
        setBookmarked(previous);
        toast.error(result.message ?? "Could not update your saved recipes.");
        return;
      }
      setBookmarked(result.active);
      toast.success(result.active ? "Saved to your bookmarks." : "Removed from bookmarks.");
    });
  }

  return (
    <Button
      type="button"
      variant={bookmarked ? "default" : "outline"}
      size={variant === "icon" ? "icon" : "default"}
      onClick={handleClick}
      disabled={pending}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Save this recipe"}
      className={variant === "icon" ? undefined : "gap-2"}
    >
      <Bookmark
        className={cn("size-4", bookmarked && "fill-current")}
        aria-hidden="true"
      />
      {variant === "default" ? (
        <span className="hidden sm:inline">{bookmarked ? "Saved" : "Save"}</span>
      ) : null}
    </Button>
  );
}
