"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Deliberately not wired to an email service -- there is no mail provider
 * configured for this project, and pretending to send would be worse than
 * being clear about it. The form validates and confirms locally so the page
 * is honest about what it does.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border bg-warm-wash px-6 py-12 text-center">
        <CheckCircle2 className="mb-4 size-10 text-primary" aria-hidden="true" />
        <h2 className="font-heading text-lg font-semibold">
          Your message is ready to send
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          This form is not connected to an email service yet, so nothing has
          actually been sent. Until the team wires one up, please reach out to
          a group member directly.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSent(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" required maxLength={80} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Your email</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required maxLength={120} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} required maxLength={2000} />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
