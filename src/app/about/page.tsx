import Link from "next/link";
import { BookOpen, HeartHandshake, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About",
  description: "What Savory is, and how it works.",
};

const POINTS = [
  {
    icon: Users,
    title: "Written by the people who cook",
    body: "Every recipe on this site was submitted by a registered member through the upload page. Nothing is imported, scraped or auto-generated.",
  },
  {
    icon: BookOpen,
    title: "Enough detail to actually follow",
    body: "Each recipe records its ingredients, numbered steps, prep and cook time, servings and difficulty, so you know what you are getting into before you start.",
  },
  {
    icon: HeartHandshake,
    title: "Built around feedback",
    body: "Likes, bookmarks and comments are how good recipes surface. Save what you want to try, and tell the cook how it went.",
  },
  {
    icon: ShieldCheck,
    title: "You own what you post",
    body: "Only you can edit or delete your own recipes, profile and comments. That rule is enforced by the database itself, not just the interface.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header>
        <h1 className="text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          About Savory
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Savory is a community recipe blog. It exists so a group of people can
          keep their cooking in one place instead of scattered across notes
          apps, screenshots and group chats.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {POINTS.map((point) => (
          <Card key={point.title}>
            <CardContent className="space-y-2.5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <point.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-base font-semibold">
                {point.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {point.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-12 space-y-4">
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          About this project
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This site was built as a student group project. It is a working
          application rather than a mock-up: accounts, recipes, photos, likes,
          bookmarks and comments are all stored in a real database, and the
          site started completely empty. Everything you see was added by a
          member after launch.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          It is built with Next.js and TypeScript on the front end, with
          Supabase handling authentication, the PostgreSQL database and image
          storage, and is deployed on Vercel.
        </p>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/register">Create an account</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/recipes">Browse recipes</Link>
        </Button>
      </div>
    </div>
  );
}
