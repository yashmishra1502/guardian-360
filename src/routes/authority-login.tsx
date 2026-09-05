import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";

import { Brand } from "@/components/suraksha/ui";
import { useSurakshaAuth } from "@/lib/suraksha/auth";

export const Route = createFileRoute("/authority-login")({
  head: () => ({
    meta: [{ title: "Authority Login — SURAKSHA360" }],
  }),
  component: AuthorityLogin,
});

function AuthorityLogin() {
  const { login, register } = useSurakshaAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = mode === "login" ? login(email, password) : register(name, email, password);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    navigate({ to: "/authority" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-10 text-navy-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>
        <div className="rounded-2xl bg-card p-6 text-card-foreground shadow-raised">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emergency" />
            <h1 className="font-display text-lg font-bold">
              {mode === "login" ? "Authority sign in" : "Create authority account"}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            District control room access — verify reports, dispatch teams and release resources.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "register" && (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Full name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </label>
            )}
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                minLength={6}
                required
              />
            </label>

            {error && <p className="text-sm font-medium text-emergency">{error}</p>}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emergency px-4 py-2.5 text-sm font-semibold text-emergency-foreground shadow-card"
            >
              {mode === "login" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "login" ? "register" : "login");
            }}
            className="mt-4 w-full text-center text-sm font-semibold text-emergency"
          >
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
