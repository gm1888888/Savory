"use client";

import Link from "next/link";
import { Bookmark, ChefHat, LogOut, PlusCircle, User } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initialsOf } from "@/lib/format";

type UserMenuProps = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
};

const LINKS = [
  { href: "/upload", label: "Share a recipe", icon: PlusCircle },
  { href: "/my-recipes", label: "My recipes", icon: ChefHat },
  { href: "/bookmarks", label: "Saved recipes", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
];

export function UserMenu({ fullName, email, avatarUrl }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Open your account menu"
        >
          <Avatar className="size-8">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-xs">
              {initialsOf(fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-semibold">{fullName}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {LINKS.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href} className="cursor-pointer">
              <link.icon className="size-4" aria-hidden="true" />
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild variant="destructive">
          <form action={logoutAction}>
            <button type="submit" className="flex w-full cursor-pointer items-center gap-2">
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
