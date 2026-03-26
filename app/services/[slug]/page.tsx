import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { contactInfo, services } from "@/lib/site-data";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14 md:px-8 md:py-20">
      <Reveal>
        <div className="flex flex-col items-start gap-4">
          <Link href="/#services" className="inline-flex items-center gap-2 text-sm text-sand/80 transition hover:text-sand">
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <p className="inline-flex rounded-full border border-slateBlue/40 bg-slateBlue/10 px-4 py-1 text-xs uppercase tracking-[0.18em] text-slateBlue">
            {service.audience} Service
          </p>
        </div>
        <h1 className="mt-4 max-w-3xl font-[var(--font-display)] text-4xl font-bold leading-tight md:text-6xl">{service.title}</h1>
        <p className="mt-5 max-w-3xl text-sand/80 md:text-lg">{service.description}</p>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {service.bullets.map((bullet, idx) => (
          <Reveal key={bullet} delay={idx * 0.08}>
            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-5">
              <CheckCircle2 size={18} className="mt-0.5 text-ember" />
              <p className="text-sm text-sand/85">{bullet}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-12 rounded-3xl border border-white/15 bg-black/20 p-6 md:p-8">
        <h2 className="font-[var(--font-display)] text-2xl font-bold md:text-3xl">Need this service now?</h2>
        <p className="mt-3 text-sand/75">Call us directly for fast scheduling and emergency support.</p>
        <a
          href={`tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`}
          className="mt-6 inline-flex rounded-full bg-ember px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          {contactInfo.phone}
        </a>
      </Reveal>
    </div>
  );
}
