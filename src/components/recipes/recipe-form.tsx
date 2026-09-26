"use client";

import { useActionState, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import type { RecipeFormState } from "@/app/actions/recipes";
import { DynamicListInput } from "@/components/recipes/dynamic-list-input";
import { ImageUpload } from "@/components/recipes/image-upload";
import { TagInput } from "@/components/recipes/tag-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, DIFFICULTIES } from "@/lib/constants";
import type { RecipeWithAuthor } from "@/lib/database.types";
import { formatMinutes } from "@/lib/format";

type RecipeFormProps = {
  userId: string;
  action: (state: RecipeFormState, formData: FormData) => Promise<RecipeFormState>;
  recipe?: RecipeWithAuthor | null;
  submitLabel: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function RecipeForm({
  userId,
  action,
  recipe,
  submitLabel,
}: RecipeFormProps) {
  const [state, formAction, pending] = useActionState<RecipeFormState, FormData>(
    action,
    {},
  );
  const errors = state.errors ?? {};

  const [prep, setPrep] = useState(String(recipe?.preparation_time ?? ""));
  const [cook, setCook] = useState(String(recipe?.cooking_time ?? ""));

  // Total time is derived here exactly as it is in the database.
  const total = useMemo(() => {
    const sum = (Number(prep) || 0) + (Number(cook) || 0);
    return sum > 0 ? formatMinutes(sum) : "--";
  }, [prep, cook]);

  const initialIngredients = recipe?.ingredients?.map((i) => i.item) ?? [];
  const initialInstructions = recipe?.instructions?.map((i) => i.step) ?? [];

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={recipe?.title ?? ""}
              placeholder="What are you cooking?"
              maxLength={120}
              required
              aria-invalid={Boolean(errors.title)}
            />
            <FieldError message={errors.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={recipe?.description ?? ""}
              placeholder="A sentence or two about this dish."
              rows={3}
              maxLength={500}
              required
              aria-invalid={Boolean(errors.description)}
            />
            <FieldError message={errors.description} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={recipe?.category ?? undefined}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.category} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select name="difficulty" defaultValue={recipe?.difficulty ?? "Easy"}>
                <SelectTrigger id="difficulty" className="w-full">
                  <SelectValue placeholder="Choose a difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.difficulty} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time and servings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Prep time (minutes)</Label>
              <Input
                id="preparationTime"
                name="preparationTime"
                type="number"
                inputMode="numeric"
                min={0}
                max={10080}
                value={prep}
                onChange={(event) => setPrep(event.target.value)}
                placeholder="15"
                required
              />
              <FieldError message={errors.preparationTime} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cookingTime">Cook time (minutes)</Label>
              <Input
                id="cookingTime"
                name="cookingTime"
                type="number"
                inputMode="numeric"
                min={0}
                max={10080}
                value={cook}
                onChange={(event) => setCook(event.target.value)}
                placeholder="30"
                required
              />
              <FieldError message={errors.cookingTime} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                name="servings"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                defaultValue={recipe?.servings ?? 2}
                required
              />
              <FieldError message={errors.servings} />
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Total time:{" "}
            <span className="font-medium text-foreground">{total}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            userId={userId}
            initialUrl={recipe?.image_url ?? null}
            initialPath={recipe?.image_path ?? null}
            label="A good photo makes all the difference (optional)"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicListInput
            name="ingredients"
            label="List everything needed, one per row"
            initialItems={initialIngredients}
            placeholder="e.g. 1 kg chicken, cut into pieces"
            addLabel="Add ingredient"
            error={errors.ingredients}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicListInput
            name="instructions"
            label="Walk through it step by step"
            initialItems={initialInstructions}
            placeholder="Describe this step..."
            addLabel="Add step"
            numbered
            error={errors.instructions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput initialTags={recipe?.tags ?? []} error={errors.tags} />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="submit" size="lg" disabled={pending} className="gap-2">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
