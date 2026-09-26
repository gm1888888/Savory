import type { ReactNode } from "react";

/** Shared shell for the login, register and verify-email screens. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-warm-wash px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
