import { redirect } from "next/navigation";
import { Calendar, ChefHat, Mail } from "lucide-react";

import { ProfileForm } from "./profile-form";
import { RecipeGrid } from "@/components/recipes/recipe-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMonthYear, initialsOf, pluralize } from "@/lib/format";
import { getCurrentUserWithProfile, getRecipes } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your profile",
  description: "Manage your Savory profile and see everything you have shared.",
};

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user) redirect("/login?next=%2Fprofile");

  const result = await getRecipes({
    userId: user.id,
    sort: "newest",
    perPage: 50,
  });

  const fullName = profile?.full_name ?? "Cook";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Card className="overflow-hidden">
        <div className="h-24 bg-warm-wash" aria-hidden="true" />
        <CardContent className="-mt-12 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar className="size-24 border-4 border-card shadow-sm">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="text-2xl">
                {initialsOf(fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 pb-1">
              <h1 className="font-heading text-2xl font-bold">{fullName}</h1>
              {profile?.bio ? (
                <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              ) : null}

              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <li className="inline-flex items-center gap-1.5">
                  <Mail className="size-4" aria-hidden="true" />
                  {user.email}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" aria-hidden="true" />
                  Joined {formatMonthYear(profile?.created_at)}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <ChefHat className="size-4" aria-hidden="true" />
                  {pluralize(result.total, "recipe")} posted
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          <ProfileForm
            userId={user.id}
            fullName={fullName}
            bio={profile?.bio ?? ""}
            avatarUrl={profile?.avatar_url ?? null}
            avatarPath={profile?.avatar_path ?? null}
          />
        </CardContent>
      </Card>

      <section className="mt-12" aria-labelledby="your-recipes-heading">
        <h2
          id="your-recipes-heading"
          className="mb-5 font-heading text-2xl font-bold tracking-tight"
        >
          Your recipes
        </h2>

        {result.recipes.length > 0 ? (
          <RecipeGrid recipes={result.recipes} />
        ) : (
          <EmptyState
            icon={<ChefHat className="size-6" aria-hidden="true" />}
            title="Nothing shared yet"
            description="When you publish a recipe it will show up here and on the homepage."
            action={{ label: "Share a Recipe", href: "/upload" }}
          />
        )}
      </section>
    </div>
  );
}
