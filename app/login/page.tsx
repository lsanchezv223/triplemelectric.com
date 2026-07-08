import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Private Access | Triple M Electric",
  description: "Private and administrative access for authorized users."
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/panel");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(159,210,255,0.16)_0%,_transparent_34%),linear-gradient(180deg,#07111f_0%,#020617_100%)] px-5 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm font-medium text-sand/80 transition hover:border-white/30 hover:text-white"
          >
            <ChevronLeft size={16} />
            Main website
          </Link>
        </div>

        <div className="grid min-h-[calc(100vh-9rem)] gap-6 rounded-[2rem] border border-white/10 bg-black/20 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr] lg:items-center md:p-8">
        <section className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Triple M Electric</p>
            <h1 className="mt-4 max-w-lg font-[var(--font-display)] text-4xl font-bold leading-tight text-white md:text-5xl">
              Secure access for the internal team.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-sand/75">
              Access the employee workspace, administrative tools, and internal records from one private portal.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-ember text-white">
                <ShieldCheck size={20} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">Authorized access only</h2>
              <p className="mt-2 text-sm leading-relaxed text-sand/70">
                This area is reserved for approved employees and administrators.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <LockKeyhole size={20} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">One shared portal</h2>
              <p className="mt-2 text-sm leading-relaxed text-sand/75">
                Use your username or email to continue to the internal panel.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[1.5rem] border border-white/10 bg-[#08101c] p-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-[var(--font-display)] text-2xl font-bold text-white">Sign in</h2>
                <p className="mt-2 text-sm text-sand/65">Enter with your username or email address.</p>
              </div>
              <Link href="/" className="text-sm text-sand/60 transition hover:text-white">
                View website
              </Link>
            </div>
            <div className="mt-8">
              <LoginForm />
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 text-sm text-sand/55">
              If you received an invitation by email, use that same email address or your assigned username to sign in.
            </div>
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}
