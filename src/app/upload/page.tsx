import { redirect } from "next/navigation";

import { createRecipeAction } from "@/app/actions/recipes";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { getCurrentUser } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Share a recipe",
  description: "Publish your own recipe to the Savory community.",
};

export default async function UploadPage() {
  const user = await getCurrentUser();

  // Middleware already guards this route; this is the second line of defence
  // for the case where the session expires between navigation and render.
  if (!user) redirect("/login?next=%2Fupload");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Share a recipe
        </h1>
        <p className="mt-2 text-muted-foreground">
          Write it the way you would explain it to a friend. You can edit
          anything later.
        </p>
      </header>

      <RecipeForm
        userId={user.id}
        action={createRecipeAction}
        submitLabel="Publish Recipe"
      />
    </div>
  );
}
