import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { CATEGORIES, categoryToSlug } from "@/lib/constants";

const BROWSE = [
  { href: "/recipes", label: "All recipes" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" },
];

const ABOUT = [
  { href: "/about", label: "About this project" },
  { href: "/contact", label: "Contact" },
  { href: "/upload", label: "Share a recipe" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A community recipe book. Every recipe here was written and shared
              by someone who actually cooked it.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Browse</h2>
            <ul className="mt-3 space-y-2">
              {BROWSE.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Popular categories</h2>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link
                    href={"/categories/" + categoryToSlug(category)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">This project</h2>
            <ul className="mt-3 space-y-2">
              {ABOUT.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
