import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "#services", label: "Services" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/15 bg-midnight/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-2.5 md:px-8 md:py-3">
        <Link href="/" className="inline-flex items-center" aria-label="Triple M Electric home">
          <Image
            src="/TME-Logo.svg"
            alt="Triple M Electric"
            width={120}
            height={40}
            priority
            className="h-9 w-auto md:h-10"
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-sand/80 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-sand">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
