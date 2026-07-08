"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminInviteForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);
    const form = event.currentTarget;

    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") || "").trim(),
      username: String(formData.get("username") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      role: String(formData.get("role") || "EMPLOYEE"),
      hourlyRate: String(formData.get("hourlyRate") || "").trim() || null
    };

    try {
      const response = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to send the invitation.");
        return;
      }

      form.reset();
      setSuccess("Invitation sent successfully.");
      router.refresh();
    } catch {
      setError("Unable to send the invitation.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-semibold text-sand">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-semibold text-sand">
            Username
          </label>
          <input
            id="username"
            name="username"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-sand">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-semibold text-sand">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue="EMPLOYEE"
            className="w-full rounded-2xl border border-white/15 bg-[#08101c] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label htmlFor="hourlyRate" className="block text-sm font-semibold text-sand">
            Hourly rate
          </label>
          <input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            min="0"
            step="0.01"
            placeholder="25.00"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-2xl bg-ember px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Sending..." : "Send invitation"}
      </button>
    </form>
  );
}
