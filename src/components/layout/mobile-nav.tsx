"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  isAuthenticated: boolean;
  publicLinks: { href: string; label: string }[];
  memberLinks: { href: string; label: string }[];
};

export function MobileNav({
  isAuthenticated,
  publicLinks,
  memberLinks,
}: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Closing on click rather than on a pathname effect: the effect version
  // fires a second render on every navigation for no benefit.
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[min(20rem,85vw)]">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                pathname === link.href && "bg-accent text-accent-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          <Separator className="my-3" />

          {isAuthenticated ? (
            <>
              {memberLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === link.href && "bg-accent text-accent-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <form action={logoutAction} className="mt-2">
                <Button type="submit" variant="outline" className="w-full">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <div className="mt-1 flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
