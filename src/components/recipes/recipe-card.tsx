import Image from "next/image";
import Link from "next/link";
import { Clock, Heart, UtensilsCrossed } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { RecipeWithAuthor } from "@/lib/database.types";
import { formatMinutesShort, initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";

type RecipeCardProps = {
  recipe: RecipeWithAuthor;
  className?: string;
  /** Set on the first few cards above the fold to improve LCP. */
  priority?: boolean;
};

/**
 * Card used everywhere recipes are listed. Every value shown is read from the
 * row -- nothing is invented, and a recipe with no photo gets an honest
 * placeholder rather than a stock image.
 */
export function RecipeCard({ recipe, className, priority }: RecipeCardProps) {
  const author = recipe.profiles;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            priority={priority}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-warm-wash">
            <UtensilsCrossed
              className="size-9 text-muted-foreground/40"
              aria-hidden="true"
            />
            <span className="sr-only">No photo provided</span>
          </div>
        )}

        <Badge
          variant="secondary"
          className="absolute left-3 top-3 bg-background/90 backdrop-blur-sm"
        >
          {recipe.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="font-heading text-base leading-snug font-semibold">
          <Link
            href={"/recipes/" + recipe.id}
            className="after:absolute after:inset-0 after:content-[''] hover:text-primary"
          >
            {recipe.title}
          </Link>
        </h3>

        {recipe.description ? (
          <p className="line-clamp-2-safe text-sm leading-relaxed text-muted-foreground">
            {recipe.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="size-6 shrink-0">
              {author?.avatar_url ? (
                <AvatarImage src={author.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="text-[10px]">
                {initialsOf(author?.full_name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs text-muted-foreground">
              {author?.full_name ?? "Unknown cook"}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {formatMinutesShort(recipe.total_time)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" aria-hidden="true" />
              {recipe.likes_count}
              <span className="sr-only">likes</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
