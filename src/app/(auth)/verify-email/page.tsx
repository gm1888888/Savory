import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Confirm your email" };

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : null;

  return (
    <Card className="border-border/80 text-center shadow-sm">
      <CardHeader className="space-y-3">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="font-heading text-2xl">
            Check your inbox
          </CardTitle>
          <CardDescription>
            {email ? (
              <>
                We sent a confirmation link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </>
            ) : (
              "We sent you a confirmation link."
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Click the link in that email to activate your account, then come back
          and log in. If it has not arrived after a minute or two, check your
          spam folder.
        </p>

        <div className="flex flex-col gap-2.5">
          <Button asChild>
            <Link href="/login">Go to log in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/recipes">Browse recipes meanwhile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
