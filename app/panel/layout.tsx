import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { logoutAction } from "@/app/panel/actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#06101b_0%,#020617_100%)]">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-end gap-4">
            <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">Triple M Electric</p>
            <h1 className="mt-1 font-[var(--font-display)] text-lg font-bold text-white">Employee Panel</h1>
            </div>
            <p className="pb-0.5 text-sm font-medium text-sand/70">{user.fullName}</p>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              <Link href="/panel" className="rounded-full px-4 py-2 text-sm text-sand/80 transition hover:bg-white/5 hover:text-white">
                Panel
              </Link>
            </nav>

            <form action={logoutAction}>
              <button type="submit" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
