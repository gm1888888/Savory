import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChefHat,
  Clock,
  Flame,
  Pencil,
  Timer,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";

import { BookmarkButton } from "@/components/recipes/bookmark-button";
import { CommentSection } from "@/components/recipes/comment-section";
import { DeleteRecipeButton } from "@/components/recipes/delete-recipe-button";
import { LikeButton } from "@/components/recipes/like-button";
import { PublishedToast } from "@/components/recipes/published-toast";
import { ShareButton } from "@/components/recipes/share-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatMinutes, initialsOf } from "@/lib/format";
import {
  getComments,
  getCurrentUser,
  getRecipeById,
  getViewerRecipeState,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/recipes/[id]">) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) return { title: "Recipe not found" };
  return {
    title: recipe.title,
    description: recipe.description || "A recipe shared on Savory.",
    openGraph: {
      title: recipe.title,
      description: recipe.description || undefined,
      images: recipe.image_url ? [{ url: recipe.image_url }] : undefined,
    },
  };
}

function MetaTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-3 py-3.5 text-center">
      <span className="text-primary" aria-hidden="true">
        {icon}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export default async function RecipeDetailPage({
  params,
  searchParams,
}: PageProps<"/recipes/[id]">) {
  const { id } = await params;
  const query = await searchParams;

  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  const [user, comments, viewerState] = await Promise.all([
    getCurrentUser(),
    getComments(id),
    getViewerRecipeState(id),
  ]);

  const isOwner = user?.id === recipe.user_id;
  const author = recipe.profiles;

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <PublishedToast
        published={query.published === "1"}
        updated={query.updated === "1"}
      />

      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
        <Link href="/recipes" className="hover:text-foreground">
          Recipes
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{recipe.category}</span>
      </nav>

      <header className="space-y-4">
        <Badge variant="secondary">{recipe.category}</Badge>

        <h1 className="text-balance font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {recipe.title}
        </h1>

        {recipe.description ? (
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {recipe.description}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              {author?.avatar_url ? (
                <AvatarImage src={author.avatar_url} alt="" />
              ) : null}
              <AvatarFallback>{initialsOf(author?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="text-sm leading-tight">
              <p className="font-semibold">
                {author?.full_name ?? "Unknown cook"}
              </p>
              <p className="text-muted-foreground">
                Posted {formatDate(recipe.created_at)}
              </p>
            </div>
          </div>

          {isOwner ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="gap-2">
                <Link href={"/recipes/" + recipe.id + "/edit"}>
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit
                </Link>
              </Button>
              <DeleteRecipeButton
                recipeId={recipe.id}
                recipeTitle={recipe.title}
                redirectTo="/my-recipes"
              />
            </div>
          ) : null}
        </div>
      </header>

      <div className="relative mt-7 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-warm-wash text-muted-foreground">
            <UtensilsCrossed className="size-10 opacity-40" aria-hidden="true" />
            <span className="text-sm">No photo was added to this recipe</span>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaTile
          icon={<Timer className="size-5" />}
          label="Prep"
          value={formatMinutes(recipe.preparation_time)}
        />
        <MetaTile
          icon={<Flame className="size-5" />}
          label="Cook"
          value={formatMinutes(recipe.cooking_time)}
        />
        <MetaTile
          icon={<Clock className="size-5" />}
          label="Total"
          value={formatMinutes(recipe.total_time)}
        />
        <MetaTile
          icon={<UsersRound className="size-5" />}
          label="Serves"
          value={String(recipe.servings)}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <LikeButton
          recipeId={recipe.id}
          initialLiked={viewerState.liked}
          initialCount={recipe.likes_count}
          isAuthenticated={Boolean(user)}
        />
        <BookmarkButton
          recipeId={recipe.id}
          initialBookmarked={viewerState.bookmarked}
          isAuthenticated={Boolean(user)}
        />
        <ShareButton title={recipe.title} />
        <Badge variant="outline" className="ml-auto gap-1.5">
          <ChefHat className="size-3.5" aria-hidden="true" />
          {recipe.difficulty}
        </Badge>
      </div>

      <Separator className="my-9" />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_1.6fr]">
        <section aria-labelledby="ingredients-heading">
          <h2 id="ingredients-heading" className="font-heading text-xl font-bold">
            Ingredients
          </h2>
          <ul className="mt-4 space-y-2.5">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
              >
                <span
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {ingredient.item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="instructions-heading">
          <h2 id="instructions-heading" className="font-heading text-xl font-bold">
            Instructions
          </h2>
          <ol className="mt-4 space-y-5">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-3.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="whitespace-pre-wrap pt-0.5 text-sm leading-relaxed">
                  {instruction.step}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {recipe.tags.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-sm font-semibold">Tags</h2>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <li key={tag}>
                <Link href={"/search?q=" + encodeURIComponent(tag)}>
                  <Badge variant="secondary" className="hover:bg-accent">
                    {tag}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Separator className="my-9" />

      <CommentSection
        recipeId={recipe.id}
        comments={comments}
        currentUserId={user?.id ?? null}
      />
    </article>
  );
}
