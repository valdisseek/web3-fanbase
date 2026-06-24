"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      await apiPost(path, mode === "login" ? { email, password } : { email, displayName, password });
      router.push("/lobby");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6">
      <h1 className="text-3xl font-extrabold mb-1">
        Fan<span className="text-brand-purple">base</span>
      </h1>
      <p className="text-text-muted mb-8 text-sm">
        FPL player-points props, H2H & rake pools.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full rounded-xl bg-card-bg border border-border-base px-4 py-3 outline-none focus:border-brand-purple"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode === "register" && (
          <input
            className="w-full rounded-xl bg-card-bg border border-border-base px-4 py-3 outline-none focus:border-brand-purple"
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        )}
        <input
          className="w-full rounded-xl bg-card-bg border border-border-base px-4 py-3 outline-none focus:border-brand-purple"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-brand-pink text-sm">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 py-3 font-semibold disabled:opacity-50"
        >
          {busy ? "..." : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
      <p className="text-text-muted text-sm mt-6 text-center">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/register" className="text-brand-purple">
              Register
            </Link>
          </>
        ) : (
          <>
            Have an account?{" "}
            <Link href="/login" className="text-brand-purple">
              Log in
            </Link>
          </>
        )}
      </p>
      {mode === "login" && (
        <p className="text-xs text-text-muted mt-4 text-center">
          Demo: alice@example.com / password123
        </p>
      )}
    </div>
  );
}
