"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("error") === "config") {
      setError("Server not configured: set ADMIN_JWT_SECRET (32+ chars) and ADMIN_PASSWORD in .env");
    }
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-8 shadow-[var(--shadow-md)]">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] border border-accent/30 bg-accent/10 text-accent">
            <Lock className="h-7 w-7" />
          </div>
        </div>
        <h1 className="text-center font-display text-xl font-bold text-foreground">ParakeetAI Admin</h1>
        <p className="mt-1 text-center text-sm text-muted">Operations dashboard</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="pw" className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-tertiary">
              Password
            </label>
            <input
              id="pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full rounded-[var(--radius-md)] border border-border-subtle bg-elevated px-3 py-2.5 text-sm text-foreground outline-none ring-0 transition focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]"
              placeholder="••••••••"
            />
          </div>
          {error ? (
            <p className="rounded-[var(--radius-md)] border border-[var(--error)]/30 bg-[var(--error-dim)] px-3 py-2 text-xs text-[var(--error)]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <p className="mt-6 max-w-md text-center text-xs text-tertiary">
        Restrict this host by firewall/IP allowlist in production. Do not expose the admin port publicly without
        protection.
      </p>
    </div>
  );
}
