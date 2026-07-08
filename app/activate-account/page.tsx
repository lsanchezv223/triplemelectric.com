import type { Metadata } from "next";
import Link from "next/link";
import { AcceptInvitationForm } from "@/components/accept-invitation-form";

export const metadata: Metadata = {
  title: "Activate Account | Triple M Electric",
  description: "Create your password to access the employee panel."
};

export default async function ActivateAccountPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token || "";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(159,210,255,0.16)_0%,_transparent_34%),linear-gradient(180deg,#07111f_0%,#020617_100%)] px-5 py-10">
      <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-black/20 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Triple M Electric</p>
        <h1 className="mt-4 font-[var(--font-display)] text-4xl font-bold text-white">Set your password</h1>
        <p className="mt-4 text-base leading-relaxed text-sand/75">
          Finish your account setup to access the employee area.
        </p>

        {!token ? (
          <div className="mt-8 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-200">
            This invitation link is incomplete or invalid.
          </div>
        ) : (
          <div className="mt-8">
            <AcceptInvitationForm token={token} />
          </div>
        )}

        <Link href="/login" className="mt-6 inline-flex text-sm text-sand/60 transition hover:text-white">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
