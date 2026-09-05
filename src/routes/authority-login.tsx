import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, IdCard, LogIn, Loader2, ShieldCheck, UserPlus } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [govtId, setGovtId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await login(email, password)
          : await register({ name, email, department, designation, govtId, password });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      navigate({ to: "/authority" });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
              <>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Full name
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm disabled:opacity-60"
                    required
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Department
                    </span>
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={loading}
                      placeholder="Disaster Management"
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm disabled:opacity-60"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Designation
                    </span>
                    <input
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      disabled={loading}
                      placeholder="District Officer"
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm disabled:opacity-60"
                      required
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Government ID card number
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3">
                    <IdCard className="size-4 text-muted-foreground" />
                    <input
                      value={govtId}
                      onChange={(e) => setGovtId(e.target.value)}
                      disabled={loading}
                      placeholder="e.g. UP-DM-2024-00187"
                      className="w-full bg-transparent py-2 text-sm outline-none disabled:opacity-60"
                      required
                    />
                  </div>
                </label>
              </>
            )}
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm disabled:opacity-60"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm disabled:opacity-60"
                minLength={6}
                required
              />
            </label>

            {error && <p className="text-sm font-medium text-emergency">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emergency px-4 py-2.5 text-sm font-semibold text-emergency-foreground shadow-card transition-opacity disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {mode === "login" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
                  {mode === "login" ? "Sign in" : "Create account"}
                </>
              )}
            </button>

            {mode === "register" && (
              <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <BadgeCheck className="mt-0.5 size-3.5 shrink-0" />
                Government ID is used only to verify authority access in this prototype and is not validated
                against a real government database.
              </p>
            )}
          </form>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setError(null);
              setMode(mode === "login" ? "register" : "login");
            }}
            className="mt-4 w-full text-center text-sm font-semibold text-emergency disabled:opacity-60"
          >
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
