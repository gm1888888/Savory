"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  initialTags?: string[];
  maxTags?: number;
  error?: string;
};

/**
 * Tags are submitted as repeated hidden inputs named `tags`, matching how the
 * Server Action reads every other repeated field.
 */
export function TagInput({
  initialTags = [],
  maxTags = 10,
  error,
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [draft, setDraft] = useState("");

  function addTag() {
    const value = draft.trim().replace(/^#/, "").slice(0, 24);
    if (!value) return;
    if (tags.length >= maxTags) return;
    // Case-insensitive de-duplication.
    if (tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    setTags((current) => [...current, value]);
    setDraft("");
  }

  function removeTag(target: string) {
    setTags((current) => current.filter((tag) => tag !== target));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="space-y-2.5">
      <label htmlFor="tag-draft" className="text-sm font-medium">
        Tags{" "}
        <span className="font-normal text-muted-foreground">
          (optional, up to {maxTags})
        </span>
      </label>

      {tags.map((tag) => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}

      <div className="flex gap-2">
        <Input
          id="tag-draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Filipino, Chicken, Dinner"
          maxLength={24}
          disabled={tags.length >= maxTags}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addTag}
          disabled={!draft.trim() || tags.length >= maxTags}
          className="shrink-0 gap-1.5"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <X className="size-3" aria-hidden="true" />
                  <span className="sr-only">Remove tag {tag}</span>
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Press Enter to add a tag. Tags help people find your recipe in search.
        </p>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
