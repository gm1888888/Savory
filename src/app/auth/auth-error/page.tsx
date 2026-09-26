import Link from "next/link";
import { MailWarning } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Confirmation link problem" };

export default async function AuthErrorPage({
  searchParams,
}: PageProps<"/auth/auth-error">) {
  const params = await searchParams;
  const reason = typeof params.reason === "string" ? params.reason : null;

  const description =
    reason === "expired"
      ? "That confirmation link has already been used or has expired. Links are only valid for a short time."
      : "We could not read that confirmation link. It may have been cut off by your email app.";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <MailWarning className="size-6" aria-hidden="true" />
      </div>
      <h1 className="font-heading text-2xl font-bold">
        That link did not work
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/register">Sign up again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Back to log in</Link>
        </Button>
      </div>
    </div>
  );
}
