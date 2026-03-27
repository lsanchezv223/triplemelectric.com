"use client";

import { FormEvent, useState } from "react";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  website: string;
  company: string;
  submittedAt: number;
};

const initialState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
  website: "",
  company: "",
  submittedAt: Date.now()
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setResult("idle");
    setErrorMsg("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setResult("error");
        setErrorMsg(data.error || "Could not send your message.");
        return;
      }

      setResult("success");
      setForm({ ...initialState, submittedAt: Date.now() });
    } catch {
      setResult("error");
      setErrorMsg("Could not send your message.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-white/20 bg-white/[0.08] p-6 shadow-glow backdrop-blur md:p-8">
      <h3 className="font-[var(--font-display)] text-2xl font-bold text-sand">Get In Touch</h3>
      <div className="mt-6 space-y-4">
        <input
          value={form.fullName}
          onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
          className="w-full rounded-2xl border border-white/20 bg-[#ffffff12] px-4 py-3 text-sm text-sand placeholder:text-sand/50 outline-none transition focus:border-slateBlue"
          placeholder="Full Name"
          required
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className="w-full rounded-2xl border border-white/20 bg-[#ffffff12] px-4 py-3 text-sm text-sand placeholder:text-sand/50 outline-none transition focus:border-slateBlue"
          placeholder="Email Address"
          required
        />
        <input
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          className="w-full rounded-2xl border border-white/20 bg-[#ffffff12] px-4 py-3 text-sm text-sand placeholder:text-sand/50 outline-none transition focus:border-slateBlue"
          placeholder="Phone Number"
        />
        <textarea
          rows={5}
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          className="w-full rounded-2xl border border-white/20 bg-[#ffffff12] px-4 py-3 text-sm text-sand placeholder:text-sand/50 outline-none transition focus:border-slateBlue"
          placeholder="Your Message"
          required
        />

        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
          className="hidden"
          aria-hidden="true"
        />
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
          className="hidden"
          aria-hidden="true"
        />

        <button
          type="submit"
          disabled={isSending}
          className="w-full rounded-2xl bg-[#ff2a5f] px-4 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSending ? "Sending..." : "Send Message"}
        </button>

        {result === "success" ? <p className="text-sm text-emerald-300">Message sent. We will get back to you shortly.</p> : null}
        {result === "error" ? <p className="text-sm text-rose-300">{errorMsg}</p> : null}
      </div>
    </form>
  );
}
