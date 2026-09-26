"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { toggleLikeAction } from "@/app/actions/interactions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  recipeId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
};

/**
 * The count shown is optimistic only until the server responds; the value
 * that sticks is the trigger-maintained `recipes.likes_count` returned by the
 * action. Nothing is ever incremented purely in the browser.
 */
export function LikeButton({
  recipeId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      toast.error("Please log in to like this recipe.", {
        action: { label: "Log in", onClick: () => router.push("/login") },
      });
      return;
    }

    const previousLiked = liked;
    const previousCount = count;
    setLiked(!previousLiked);
    setCount(previousCount + (previousLiked ? -1 : 1));

    startTransition(async () => {
      const result = await toggleLikeAction(recipeId);
      if (!result.ok) {
        setLiked(previousLiked);
        setCount(previousCount);
        toast.error(result.message ?? "Could not update your like.");
        return;
      }
      setLiked(result.active);
      if (typeof result.count === "number") setCount(result.count);
    });
  }

  return (
    <Button
      type="button"
      variant={liked ? "default" : "outline"}
      onClick={handleClick}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this recipe" : "Like this recipe"}
      className="gap-2"
    >
      <Heart
        className={cn("size-4 transition-transform", liked && "fill-current scale-110")}
        aria-hidden="true"
      />
      <span className="tabular-nums">{count}</span>
      <span className="hidden sm:inline">{count === 1 ? "like" : "likes"}</span>
    </Button>
  );
}
