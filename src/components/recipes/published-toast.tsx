"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Shows the success notification after a redirect from publish or edit.
 * A ref guard stops it firing twice under React strict mode.
 */
export function PublishedToast({
  published,
  updated,
}: {
  published: boolean;
  updated: boolean;
}) {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    if (published) {
      shown.current = true;
      toast.success("Recipe published. It is live on the site now.");
    } else if (updated) {
      shown.current = true;
      toast.success("Your changes have been saved.");
    }
  }, [published, updated]);

  return null;
}
