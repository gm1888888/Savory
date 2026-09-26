"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/**
 * Fixed bottom-right light/dark toggle.
 *
 * The mount-detection effect below looks like the generic "setState in an
 * effect" anti-pattern the linter flags, but it is not one: there is no
 * external store to subscribe to (useSyncExternalStore does not fit) --
 * this is a one-time "has the client finished its first paint" signal.
 * Reading `resolvedTheme` directly instead (without this guard) causes a
 * real hydration mismatch: the server always renders the light-mode icon
 * (it has no idea about the visitor's OS preference or stored choice), but
 * the client can resolve the real theme before React finishes hydrating,
 * so the very first client render already disagrees with the server's HTML.
 * Rendering a fixed placeholder until `mounted` is true keeps the first
 * client render identical to the server's, exactly as intended here.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
  useEffect(() => setMounted(true), []);

  function toggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      disabled={!mounted}
      aria-label={
        mounted
          ? resolvedTheme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      className="fixed bottom-4 right-4 z-50 size-10 rounded-full border-border bg-background/90 shadow-md backdrop-blur-sm sm:bottom-6 sm:right-6"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
