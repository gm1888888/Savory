import Link from "next/link";
import { MailCheck } from "lucide-react";

import { ConfirmButton, type EmailOtpType } from "./confirm-button";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Confirm your account" };

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const VALID_OTP_TYPES: EmailOtpType[] = [
  "signup",
  "email_change",
  "recovery",
  "invite",
  "email",
];

function toEmailOtpType(value: string | undefined): EmailOtpType | null {
  return VALID_OTP_TYPES.includes(value as EmailOtpType)
    ? (value as EmailOtpType)
    : null;
}

/**
 * Where the "Confirm signup" email link points (see README for the exact
 * Supabase email-template change this requires). Deliberately does NOT act
 * on the token automatically -- see confirm-button.tsx for why.
 */
export default async function ConfirmPage({
  searchParams,
}: PageProps<"/auth/confirm">) {
  const params = await searchParams;
  const tokenHash = firstValue(params.token_hash);
  const type = toEmailOtpType(firstValue(params.type));
  const next = firstValue(params.next) ?? "/";

  if (!tokenHash || !type) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-bold">
          That link is incomplete
        </h1>
        <p className="text-sm text-muted-foreground">
          This page needs a confirmation link from your email -- it looks
          like part of the link did not come through.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/register">Sign up again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-20 text-center sm:px-6">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MailCheck className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-bold">
          One last step
        </h1>
        <p className="text-sm text-muted-foreground">
          Click below to confirm it was really you who signed up.
        </p>
      </div>
      <ConfirmButton tokenHash={tokenHash} type={type} next={next} />
    </div>
  );
}
