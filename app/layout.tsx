import type { Metadata } from "next";
import "./globals.css";
import { LogoIntro } from "@/components/logo-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyContactCta } from "@/components/sticky-contact-cta";
import { SmoothScroll } from "@/components/smooth-scroll";

export const metadata: Metadata = {
  metadataBase: new URL("https://triplemelectric.ca"),
  title: "Triple M Electric | Licensed Electricians in Toronto & GTA",
  description:
    "Residential, commercial, and industrial electrical services across Toronto and the GTA by certified, licensed electricians.",
  icons: {
    icon: "/1-846635ab.ico",
    shortcut: "/1-846635ab.ico",
    apple: "/1-846635ab.ico"
  },
  openGraph: {
    title: "Triple M Electric",
    description: "Modern electrical services across Toronto and the GTA.",
    url: "https://triplemelectric.ca",
    siteName: "Triple M Electric",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-midnight text-sand antialiased" suppressHydrationWarning>
        <SmoothScroll />
        <LogoIntro />
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(159,210,255,0.18)_0%,_transparent_38%),radial-gradient(circle_at_80%_20%,_rgba(255,122,24,0.22)_0%,_transparent_30%)]">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <StickyContactCta />
        </div>
      </body>
    </html>
  );
}
