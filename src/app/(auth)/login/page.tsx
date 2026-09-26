import { LoginForm } from "./login-form";
import { Logo } from "@/components/shared/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Log in",
  description: "Log in to publish recipes, save favourites and join the conversation.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const rawNext = params.next;
  const next =
    typeof rawNext === "string" && rawNext.startsWith("/") ? rawNext : "/";

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-3 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Log in to share recipes and save the ones you love.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <LoginForm next={next} />
      </CardContent>
    </Card>
  );
}
