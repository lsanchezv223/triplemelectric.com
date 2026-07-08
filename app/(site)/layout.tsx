import { LogoIntro } from "@/components/logo-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { StickyContactCta } from "@/components/sticky-contact-cta";
import { contactInfo } from "@/lib/site-data";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Electrician",
    name: "Triple M Electric",
    url: "https://triplemelectric.ca",
    telephone: contactInfo.phone,
    email: contactInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "5 Old Sheppard Ave, Unit 809",
      addressLocality: "North York",
      addressRegion: "ON",
      postalCode: "M2J 4K3",
      addressCountry: "CA"
    },
    areaServed: ["Toronto", "Greater Toronto Area"],
    openingHours: "Mo-Su 00:00-23:59"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <SmoothScroll />
      <LogoIntro />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(159,210,255,0.18)_0%,_transparent_38%),radial-gradient(circle_at_80%_20%,_rgba(255,122,24,0.22)_0%,_transparent_30%)]">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <StickyContactCta />
      </div>
    </>
  );
}
