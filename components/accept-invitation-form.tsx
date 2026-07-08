"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptInvitationForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsPending(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/invitations/accept", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ token, password })
      });

      const result = (await response.json()) as { ok?: boolean; error?: string; redirectTo?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to activate the account.");
        return;
      }

      router.push(result.redirectTo || "/panel");
      router.refresh();
    } catch {
      setError("Unable to activate the account.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-sand">
          Create password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-sand">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
          required
        />
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-ember px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Saving..." : "Create password"}
      </button>
    </form>
  );
}
