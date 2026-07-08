"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const result = (await response.json()) as { ok?: boolean; error?: string; redirectTo?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to sign in.");
        return;
      }

      router.push(result.redirectTo || "/panel");
      router.refresh();
    } catch {
      setError("Unable to sign in.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-semibold text-sand">
          Username or email
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-sand/35 focus:border-amber-300"
          placeholder="admin or name@company.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-sand">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-sand/35 focus:border-amber-300"
          placeholder="••••••••"
          required
        />
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-ember px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Entering..." : "Enter"}
      </button>
    </form>
  );
}
