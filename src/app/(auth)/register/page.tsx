import { RegisterForm } from "./register-form";
import { Logo } from "@/components/shared/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Create an account",
  description: "Create a free account to publish your own recipes on Savory.",
};

export default function RegisterPage() {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-3 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="font-heading text-2xl">
            Join the kitchen
          </CardTitle>
          <CardDescription>
            Create an account to publish recipes, save favourites and comment.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
