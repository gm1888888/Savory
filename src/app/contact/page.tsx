import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the people who run this site.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <header>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Contact
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          Questions, a broken page, or a recipe that needs taking down? Fill
          this in and pass it on to a group member.
        </p>
        <p className="mt-3 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
          Heads up: this form is not connected to an email service yet, so
          submitting it does not send anything.
        </p>
      </header>

      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
