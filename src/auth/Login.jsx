import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Soup, Loader2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/form-field";
import { useAuth } from "./auth-context";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("admin@orderhub.app");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Already signed in → bounce to the app.
  if (user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-app-grid p-4">
      <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-transparent to-transparent" />
      <Card className="relative w-full max-w-sm">
        <CardContent className="flex flex-col gap-6 py-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
              <Soup className="size-6" />
            </span>
            <div>
              <h1 className="font-heading text-xl font-semibold tracking-tight">Welcome to OrderHub</h1>
              <p className="text-sm text-muted-foreground">Sign in to your dashboard</p>
            </div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="rounded-lg bg-muted/50"
                autoComplete="email"
                autoFocus
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-lg bg-muted/50"
                autoComplete="current-password"
              />
            </Field>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full rounded-full" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
            Demo admin — <span className="font-medium text-foreground">admin@orderhub.app</span> / password123
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
