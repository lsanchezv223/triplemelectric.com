import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, MapPin, PhoneCall } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { contactInfo, serviceAreas, services } from "@/lib/site-data";

type LocationPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return serviceAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = serviceAreas.find((item) => item.slug === slug);

  if (!area) {
    return {
      title: "Service Area Not Found | Triple M Electric",
      robots: { index: false, follow: false }
    };
  }

  const url = `https://triplemelectric.ca/locations/${area.slug}`;
  return {
    title: area.title,
    description: area.description,
    alternates: { canonical: `/locations/${area.slug}` },
    openGraph: {
      title: area.title,
      description: area.description,
      url,
      siteName: "Triple M Electric",
      type: "website"
    }
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const area = serviceAreas.find((item) => item.slug === slug);

  if (!area) notFound();

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Electrical Services in ${area.name}`,
    serviceType: "Residential, commercial, and industrial electrical services",
    provider: {
      "@type": "Electrician",
      name: "Triple M Electric",
      url: "https://triplemelectric.ca",
      telephone: contactInfo.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "5 Old Sheppard Ave, Unit 809",
        addressLocality: "North York",
        addressRegion: "ON",
        postalCode: "M2J 4K3",
        addressCountry: "CA"
      }
    },
    areaServed: { "@type": "Place", name: area.name },
    url: `https://triplemelectric.ca/locations/${area.slug}`
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-14 md:px-8 md:pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <nav aria-label="Breadcrumb" className="mb-7 text-sm text-sand/65">
        <Link href="/locations" className="hover:text-sand">Areas We Serve</Link>
        <span className="mx-2">/</span>
        <span aria-current="page">{area.name}</span>
      </nav>

      <Reveal>
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
          <MapPin size={15} /> {area.region}
        </p>
        <h1 className="mt-4 max-w-4xl font-[var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">
          Electrician in {area.name}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-sand/80">{area.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/#contact" className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-bold text-white hover:brightness-110">
            Request a Free Quote <ArrowRight size={16} />
          </Link>
          <a
            href={`tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:border-white/55"
          >
            <PhoneCall size={16} /> {contactInfo.phone}
          </a>
        </div>
      </Reveal>

      <section className="mt-12 grid gap-5 md:grid-cols-3" aria-label={`Electrical services in ${area.name}`}>
        <Reveal>
          <article className="h-full rounded-2xl border border-white/15 bg-white/[0.04] p-5">
            <BadgeCheck className="text-amber-300" size={22} />
            <h2 className="mt-4 text-lg font-bold">Licensed electrical contractor</h2>
            <p className="mt-2 text-sm leading-relaxed text-sand/75">{contactInfo.license}.</p>
          </article>
        </Reveal>
        <Reveal delay={0.06}>
          <article className="h-full rounded-2xl border border-white/15 bg-white/[0.04] p-5">
            <MapPin className="text-amber-300" size={22} />
            <h2 className="mt-4 text-lg font-bold">Local service coverage</h2>
            <p className="mt-2 text-sm leading-relaxed text-sand/75">
              Contact Triple M Electric about residential, commercial, and industrial electrical work in {area.name}.
            </p>
          </article>
        </Reveal>
        <Reveal delay={0.12}>
          <article className="h-full rounded-2xl border border-white/15 bg-white/[0.04] p-5">
            <PhoneCall className="text-amber-300" size={22} />
            <h2 className="mt-4 text-lg font-bold">Plan your project</h2>
            <p className="mt-2 text-sm leading-relaxed text-sand/75">
              Share your address and electrical needs so our team can discuss the next step.
            </p>
          </article>
        </Reveal>
      </section>

      <section className="mt-16" aria-labelledby="communities-heading">
        <Reveal>
          <h2 id="communities-heading" className="font-[var(--font-display)] text-2xl font-bold md:text-3xl">
            Serving {area.name} and nearby neighbourhoods
          </h2>
          <p className="mt-3 max-w-3xl text-sand/75">
            Our coverage includes {area.communities.join(", ")}. If your property is elsewhere in {area.name}, contact us
            about your project.
          </p>
        </Reveal>
        <div className="mt-6 flex flex-wrap gap-2">
          {area.communities.map((community) => (
            <span key={community} className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-sand/80">
              {community}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="services-heading">
        <Reveal>
          <h2 id="services-heading" className="font-[var(--font-display)] text-2xl font-bold md:text-3xl">
            Electrical Services in {area.name}
          </h2>
          <p className="mt-3 max-w-3xl text-sand/75">
            Explore our services for homes, businesses, and industrial properties in {area.name}.
          </p>
        </Reveal>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={(index % 3) * 0.05}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.04] p-5 transition hover:border-amber-300/50 hover:bg-white/[0.07]"
              >
                <span>
                  <span className="block font-bold">{service.title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-sand/70">{service.short}</span>
                </span>
                <ArrowRight size={17} className="mt-1 shrink-0 text-amber-300 transition group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="other-areas-heading">
        <Reveal>
          <h2 id="other-areas-heading" className="font-[var(--font-display)] text-2xl font-bold">
            Other areas we serve
          </h2>
        </Reveal>
        <div className="mt-5 flex flex-wrap gap-3">
          {serviceAreas.filter((item) => item.slug !== area.slug).map((item) => (
            <Link key={item.slug} href={`/locations/${item.slug}`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-sand/80 transition hover:border-amber-300/50 hover:text-sand">
              Electrician in {item.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-9">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-2xl font-bold">Need an electrician in {area.name}?</h2>
          <p className="mt-3 max-w-2xl text-sand/75">
            Share a few details about your project and location. Triple M Electric will follow up to discuss your request.
          </p>
          <Link href="/#contact" className="mt-6 inline-flex rounded-full bg-ember px-6 py-3 text-sm font-bold text-white hover:brightness-110">
            Get a Free Quote
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
