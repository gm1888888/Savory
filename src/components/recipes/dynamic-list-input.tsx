"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DynamicListInputProps = {
  /** Form field name; every row is submitted under this same name. */
  name: string;
  label: string;
  initialItems?: string[];
  placeholder: string;
  addLabel: string;
  /** Numbered steps get a step badge and a multiline field. */
  numbered?: boolean;
  error?: string;
  maxItems?: number;
};

/**
 * Backs both the ingredient list and the instruction steps. Rows are plain
 * inputs sharing one field name, so the Server Action reads them with
 * `formData.getAll(name)` -- no JSON juggling in the browser.
 */
export function DynamicListInput({
  name,
  label,
  initialItems,
  placeholder,
  addLabel,
  numbered = false,
  error,
  maxItems = 100,
}: DynamicListInputProps) {
  const [items, setItems] = useState<string[]>(
    initialItems && initialItems.length > 0 ? initialItems : [""],
  );

  function updateItem(index: number, value: string) {
    setItems((current) =>
      current.map((item, position) => (position === index ? value : item)),
    );
  }

  function addItem() {
    setItems((current) =>
      current.length >= maxItems ? current : [...current, ""],
    );
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1 ? [""] : current.filter((_, p) => p !== index),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>

      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span
              className="mt-2 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground"
              aria-hidden="true"
            >
              {numbered ? index + 1 : <GripVertical className="size-3.5" />}
            </span>

            <div className="flex-1">
              <label className="sr-only" htmlFor={name + "-" + index}>
                {numbered ? "Step " + (index + 1) : label + " " + (index + 1)}
              </label>
              {numbered ? (
                <Textarea
                  id={name + "-" + index}
                  name={name}
                  value={item}
                  rows={2}
                  onChange={(event) => updateItem(index, event.target.value)}
                  placeholder={placeholder}
                  className="resize-y"
                />
              ) : (
                <Input
                  id={name + "-" + index}
                  name={name}
                  value={item}
                  onChange={(event) => updateItem(index, event.target.value)}
                  placeholder={placeholder}
                />
              )}
            </div>

            <div className="flex shrink-0 items-center gap-0.5 pt-1">
              {numbered ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Move step up</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Move step down</span>
                  </Button>
                </>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(index)}
              >
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Remove this row</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        disabled={items.length >= maxItems}
        className="gap-1.5"
      >
        <Plus className="size-4" aria-hidden="true" />
        {addLabel}
      </Button>
    </fieldset>
  );
}
