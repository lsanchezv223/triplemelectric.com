import Link from "next/link";
import { ArrowRight, Building2, Factory, Home, PhoneCall } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { contactInfo, portfolio, services } from "@/lib/site-data";

const audienceIcons = {
  Residential: Home,
  Commercial: Building2,
  Industrial: Factory
};

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid bg-[size:42px_42px] opacity-10" />
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:pb-24 md:pt-24">
          <Reveal>
            <p className="mb-4 inline-flex rounded-full border border-slateBlue/40 bg-slateBlue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slateBlue">
              Licensed Electricians in Toronto & GTA
            </p>
            <h1 className="max-w-xl font-[var(--font-display)] text-4xl font-bold leading-tight md:text-6xl">
              Modern electrical services that are safe, fast, and done right.
            </h1>
            <p className="mt-6 max-w-xl text-base text-sand/80 md:text-lg">
              Triple M Electric handles residential, commercial, and industrial projects with licensed professionals and clear communication from start to finish.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                Get a Free Quote <ArrowRight size={16} />
              </a>
              <a
                href={`tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-sand/30 px-6 py-3 text-sm font-semibold transition hover:border-sand/60"
              >
                <PhoneCall size={16} />
                Call {contactInfo.phone}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-glow">
              <p className="text-sm uppercase tracking-[0.2em] text-sand/60">Why Triple M</p>
              <ul className="mt-6 space-y-4 text-sm text-sand/85">
                <li className="rounded-2xl border border-white/10 bg-black/20 p-4">Licensed and insured electrical contractor</li>
                <li className="rounded-2xl border border-white/10 bg-black/20 p-4">24/7 emergency service availability</li>
                <li className="rounded-2xl border border-white/10 bg-black/20 p-4">Clean installations and code-compliant delivery</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="services" className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-3xl font-bold md:text-5xl">Services</h2>
          <p className="mt-3 max-w-2xl text-sand/75">
            We kept your original service structure and made it easier to browse with focused service pages.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {services.map((service, index) => {
            const Icon = audienceIcons[service.audience];
            return (
              <Reveal key={service.slug} delay={index * 0.06}>
                <article className="group rounded-3xl border border-white/15 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-slateBlue/50 hover:bg-white/[0.06]">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-sand/75">
                    <Icon size={14} />
                    {service.audience}
                  </div>
                  <h3 className="text-xl font-bold">{service.title}</h3>
                  <p className="mt-3 text-sm text-sand/75">{service.short}</p>
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slateBlue transition group-hover:translate-x-1"
                  >
                    Explore service <ArrowRight size={16} />
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="portfolio" className="border-y border-white/10 bg-black/15">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <h2 className="font-[var(--font-display)] text-3xl font-bold md:text-5xl">Our Portfolio</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {portfolio.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 0.08}>
                <article className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-glow">
                  <p className="text-xs uppercase tracking-[0.18em] text-ember">{item.type}</p>
                  <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm text-sand/75">{item.summary}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-3xl font-bold md:text-5xl">About Triple M Electric</h2>
          <p className="mt-5 max-w-3xl text-sand/80">
            We are a team of licensed electricians serving residential, commercial, and industrial clients across Toronto and the GTA. Our work is focused on safety, precision, and long-term reliability.
          </p>
          <p className="mt-4 max-w-3xl text-sand/70">
            Whether you need a same-day repair, a complete lighting retrofit, or a full electrical upgrade, we bring the same level of professionalism and craftsmanship to every project.
          </p>
        </Reveal>
      </section>

      <section id="contact" className="border-t border-white/10 bg-black/20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <Reveal>
            <h2 className="font-[var(--font-display)] text-3xl font-bold md:text-5xl">Get In Touch</h2>
            <p className="mt-4 text-sand/75">Tell us about your project and we will get back to you quickly.</p>
            <div className="mt-8 space-y-3 text-sm text-sand/80">
              <p>{contactInfo.address}</p>
              <p>{contactInfo.phone}</p>
              <p>{contactInfo.email}</p>
              <p>{contactInfo.license}</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <form className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-glow">
              <div className="space-y-4">
                <input
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-slateBlue"
                  placeholder="Full name"
                />
                <input
                  type="email"
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-slateBlue"
                  placeholder="Email"
                />
                <input
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-slateBlue"
                  placeholder="Phone number"
                />
                <textarea
                  rows={5}
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-slateBlue"
                  placeholder="How can we help?"
                />
                <button
                  type="button"
                  className="w-full rounded-2xl bg-ember px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
                >
                  Send message
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
