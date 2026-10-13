import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, PhoneCall } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { contactInfo, serviceAreas } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Electrical Services Across Toronto & GTA | Triple M Electric",
  description:
    "Find licensed electricians throughout Toronto city-wide, North York, Scarborough, Etobicoke, Vaughan, Richmond Hill, Markham, and Mississauga.",
  alternates: { canonical: "/locations" },
  openGraph: {
    title: "Areas We Serve | Triple M Electric",
    description:
      "Triple M Electric provides residential, commercial, and industrial electrical services across Toronto and the GTA.",
    url: "https://triplemelectric.ca/locations",
    siteName: "Triple M Electric",
    type: "website"
  }
};

export default function LocationsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-14 md:px-8 md:pt-20">
      <Reveal>
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
          <MapPin size={15} /> Toronto & Greater Toronto Area
        </p>
        <h1 className="mt-4 max-w-4xl font-[var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">
          Electrical Services Across Toronto and the GTA
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-sand/80">
          Triple M Electric provides residential, commercial, and industrial electrical services throughout Toronto and
          the GTA. Our coverage is city-wide across Toronto, including North York, Scarborough, Etobicoke, and
          neighbourhoods across the city. We also serve nearby communities such as Vaughan, Richmond Hill, Markham, and
          Mississauga.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={`tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-3 rounded-full bg-ember px-6 py-4 text-white shadow-lg shadow-ember/25 transition hover:brightness-110"
          >
            <PhoneCall size={21} />
            <span className="text-left">
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Call Triple M Electric</span>
              <span className="block text-lg font-bold">{contactInfo.phone}</span>
            </span>
          </a>
          <a href="/#contact" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-sand transition hover:border-white/55">
            Request a Quote
          </a>
        </div>
      </Reveal>

      <section className="mt-12" aria-labelledby="areas-heading">
        <Reveal>
          <h2 id="areas-heading" className="font-[var(--font-display)] text-2xl font-bold md:text-3xl">
            Areas We Serve
          </h2>
          <p className="mt-3 max-w-2xl text-sand/75">
            Our coverage spans Toronto and surrounding GTA communities. If you are anywhere in Toronto or one of the
            areas listed here, contact us about your electrical project.
          </p>
        </Reveal>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serviceAreas.map((area, index) => (
            <Reveal key={area.slug} delay={(index % 4) * 0.05}>
              <article className="h-full rounded-2xl border border-white/15 bg-white/[0.04] p-5 transition hover:border-amber-300/50 hover:bg-white/[0.07]">
                <h3 className="text-lg font-bold">{area.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sand/70">
                  Residential, commercial, and industrial electrical service.
                </p>
                <Link
                  href={`/locations/${area.slug}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:underline"
                >
                  View area details
                  <ArrowRight size={15} />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-9">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-[var(--font-display)] text-2xl font-bold">Planning an electrical project?</h2>
              <p className="mt-3 max-w-2xl text-sand/75">
                Tell us the service you need and your Toronto or GTA location. We’ll help you plan the next step.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a href="/#contact" className="rounded-full bg-ember px-5 py-3 text-sm font-bold text-white hover:brightness-110">
                Request a Quote
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
