import { notFound, redirect } from "next/navigation";

import { EditRecipeForm } from "./edit-recipe-form";
import { getCurrentUser, getRecipeById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit recipe" };

export default async function EditRecipePage({
  params,
}: PageProps<"/recipes/[id]/edit">) {
  const { id } = await params;

  const [user, recipe] = await Promise.all([
    getCurrentUser(),
    getRecipeById(id),
  ]);

  if (!user) {
    redirect("/login?next=" + encodeURIComponent("/recipes/" + id + "/edit"));
  }
  if (!recipe) notFound();

  // Ownership is enforced by RLS on UPDATE as well; this just avoids showing
  // someone a form they could never submit.
  if (recipe.user_id !== user.id) {
    redirect("/recipes/" + id);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Edit recipe
        </h1>
        <p className="mt-2 text-muted-foreground">
          Update anything that changed. Replacing the photo removes the old one.
        </p>
      </header>

      <EditRecipeForm userId={user.id} recipe={recipe} />
    </div>
  );
}
