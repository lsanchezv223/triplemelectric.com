import { contactInfo } from "@/lib/site-data";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-sand/70 md:flex-row md:items-center md:justify-between md:px-8">
        <p>© {new Date().getFullYear()} Triple M Electric. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/locations" className="hover:text-sand">Areas We Serve</Link>
          <p>{contactInfo.license}</p>
        </div>
      </div>
    </footer>
  );
}
