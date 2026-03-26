import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Factory, Home, Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { PortfolioTabs } from "@/components/portfolio-tabs";
import { Reveal } from "@/components/reveal";
import { ContactForm } from "@/components/contact-form";
import { EmergencyCta } from "@/components/emergency-cta";
import { contactInfo } from "@/lib/site-data";

const serviceColumns = [
  {
    title: "Residential Electrical Services",
    icon: Home,
    items: [
      { label: "Electrical Installations", href: "/services/electrical-installations", featured: true },
      { label: "Electrical Repairs", href: "/services/electrical-repairs", featured: true },
      { label: "Panel Upgrades", href: "/services/panel-upgrades", featured: true },
      { label: "Lighting Solutions", href: "/services/lighting-solutions", featured: true },
      { label: "Home Automation" },
      { label: "Safety Inspections" },
      { label: "Surge Protection" },
      { label: "Electrical Vehicle (EV) Charger Installation" },
      { label: "Emergency Service Calls 24/7" }
    ]
  },
  {
    title: "Commercial Electrical Services",
    icon: Building2,
    items: [
      { label: "Commercial Lighting", href: "/services/commercial-lighting", featured: true },
      { label: "Energy Management" },
      { label: "Data and Communication Lines" },
      { label: "Electrical Maintenance", href: "/services/electrical-maintenance", featured: true },
      { label: "Emergency Lighting" },
      { label: "Electrical Upgrades" },
      { label: "Generator Installation" },
      { label: "Electrical Vehicle (EV) Charger Installation" },
      { label: "Emergency Service Calls 24/7" }
    ]
  },
  {
    title: "Industrial Electrical Services",
    icon: Factory,
    items: [
      { label: "Industrial Equipment Installation" },
      { label: "Control System Integration" },
      { label: "Motor Control Centers" },
      { label: "Preventive Maintenance" },
      { label: "Power Distribution" },
      { label: "Plant Relocation and Upgrades" },
      { label: "Emergency Service Calls 24/7" }
    ]
  }
];

const chooseReasons = [
  {
    title: "Expertise",
    text: "Our electricians are not just licensed but also regularly updated with the latest electrical standards and technologies."
  },
  {
    title: "Reliability",
    text: "We understand the importance of timely service and are committed to providing prompt and efficient solutions."
  },
  {
    title: "Quality Service",
    text: "From minor repairs to major installations, we ensure the highest quality of work in every project we undertake."
  },
  {
    title: "Customer Satisfaction",
    text: "We pride ourselves on building long-term relationships with our clients, offering personalized solutions tailored to your specific needs."
  }
];

export default function HomePage() {
  return (
    <div>
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <Image src="/TME-banner.jpg" alt="Electrical lighting banner" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,8,18,0.76)_0%,rgba(2,8,18,0.6)_40%,rgba(2,8,18,0.45)_64%,rgba(2,8,18,0.64)_100%)]" />

        <div className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl items-center px-5 py-20 md:px-8 md:py-24">
          <Reveal className="max-w-2xl">
            <p className="mb-4 inline-flex border-b-2 border-amber-300 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-sand/90 md:text-sm">
              Licensed Electricians Toronto & GTA
            </p>
            <h1 className="max-w-xl font-[var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">Triple M Electric</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-sand/90 md:text-2xl md:leading-snug">
              Modern electrical services that are safe, fast, and done right.
            </p>
            <p className="mt-6 max-w-xl text-base text-sand/80 md:text-lg">
              Triple M Electric handles residential, commercial, and industrial projects with licensed professionals and clear communication from start to finish.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-bold text-white transition hover:brightness-110">
                Contact Us <ArrowRight size={16} />
              </a>
              <a
                href={`tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-sand/40 bg-black/20 px-6 py-3 text-sm font-semibold transition hover:border-sand/70"
              >
                <PhoneCall size={16} />
                {contactInfo.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pt-10 md:px-8 md:pt-12">
        <Reveal>
          <EmergencyCta />
        </Reveal>
      </section>

      <section id="services" className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-2xl font-bold md:text-4xl">Services</h2>
          <p className="mt-3 max-w-2xl text-sand/75">
            Comprehensive electrical solutions for residential, commercial, and industrial projects.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {serviceColumns.map((column, idx) => {
            const Icon = column.icon;
            return (
              <Reveal key={column.title} delay={idx * 0.08}>
                <article className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-glow">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ember text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold leading-tight">{column.title}</h3>
                  <ul className="mt-5 space-y-3 text-base text-sand/80">
                    {column.items.map((item) => (
                      <li key={item.label} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slateBlue" />
                        {item.href ? (
                          <Link href={item.href} className={`transition hover:underline ${item.featured ? "text-amber-300" : ""}`}>
                            {item.label}
                          </Link>
                        ) : (
                          <span className={item.featured ? "text-amber-300" : ""}>{item.label}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="portfolio" className="border-y border-white/10 bg-black/15">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <PortfolioTabs />
          </Reveal>
        </div>
      </section>

      <section id="about" className="border-y border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.06))]">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1fr_1fr] md:px-8 md:py-24">
          <Reveal>
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <article className="group relative col-span-2 overflow-hidden rounded-3xl border border-white/15 bg-black/20">
                <div className="relative h-[260px] md:h-[360px]">
                  <Image
                    src="/2023/11/IMG-20231030-WA0110-1.jpg"
                    alt="Installed electrical panel by Triple M Electric"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-white/15 bg-black/20">
                <div className="relative h-[170px] md:h-[230px]">
                  <Image
                    src="/2023/11/IMG-20231030-WA0121.jpg"
                    alt="Electrical control panel work"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-white/15 bg-black/20">
                <div className="relative h-[170px] md:h-[230px]">
                  <Image
                    src="/2023/11/IMG-20231030-WA0114.jpg"
                    alt="Triple M Electric technician at work"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </article>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="inline-flex rounded-full border border-slateBlue/40 bg-slateBlue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slateBlue">
              About Triple M Electric
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-2xl font-bold leading-tight md:text-4xl">
              Powering Toronto and the GTA with trusted electrical excellence.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-sand/80 md:text-lg">
              Built on integrity, professionalism, and unwavering quality, Triple M Electric has become a trusted electrical
              contractor across Toronto and the GTA.
            </p>
            <p className="mt-4 text-base leading-relaxed text-sand/75 md:text-lg">
              Our certified electricians combine deep field experience with continuous training in modern electrical
              technologies and strict safety standards.
            </p>
            <p className="mt-4 text-base leading-relaxed text-sand/75 md:text-lg">
              We are committed to delivering electrical solutions that do more than meet expectations, they are built to
              exceed them.
            </p>
            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              Contact Us <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      <section className="w-full border-y border-white/10 bg-[linear-gradient(115deg,rgba(255,255,255,0.03),rgba(255,255,255,0.06))]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-12 md:px-8 md:py-24">
          <Reveal>
            <h2 className="max-w-2xl font-[var(--font-display)] text-2xl font-bold leading-tight text-sand md:text-4xl">
              Mher Keoshgerian on The Construction Life Podcast
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-sand/80 md:text-lg md:leading-relaxed">
              Meet Triple M Electric President Mher Keoshgerian who was a guest on an episode of The Construction Life
              podcast. In this podcast episode, he shares his opinions on ESA inspections, the duties of an electrician and
              homeowners carrying out their own electrical work.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-sand/75 md:text-lg md:leading-relaxed">
              He also talked about his plans to educate the next generation of tradespeople through apprenticeships.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-white/15 bg-black shadow-glow">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/ZbaUfgDnB0Y?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=ZbaUfgDnB0Y"
                  title="Mher Keoshgerian on The Construction Life Podcast"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="w-full bg-gradient-to-r from-[#0E2C6E] to-[#0B2350]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8 md:py-16">
          <Reveal>
            <h2 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-white md:text-4xl">
              Need a Licensed Electrician?
              <br />
              Speak With Us Today!
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff2a5f] px-8 py-4 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:brightness-110"
            >
              Contact Us Today <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-12">
          <Reveal>
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-sand md:text-4xl">Why Choose Triple M Electric</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-sand/80 md:text-lg">
              Choosing Triple M Electric means partnering with a team that values your safety and satisfaction above all.
              Here&apos;s why you should choose us:
            </p>

            <div className="mt-6 space-y-4">
              {chooseReasons.map((reason) => (
                <article key={reason.title} className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 md:p-5">
                  <h3 className="text-lg font-bold text-slateBlue">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-sand/75 md:text-base">{reason.text}</p>
                </article>
              ))}
            </div>

          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <article className="group relative col-span-2 overflow-hidden rounded-3xl border border-white/15 bg-black/25">
                <div className="relative h-[250px] md:h-[320px]">
                  <Image
                    src="/2023/11/IMG-20231030-WA0126.jpg"
                    alt="Electrical service project by Triple M Electric"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-white/15 bg-black/25">
                <div className="relative h-[180px] md:h-[230px]">
                  <Image
                    src="/2023/11/IMG-20231030-WA0108-1.jpg"
                    alt="Electrical installation details"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-white/15 bg-black/25">
                <div className="relative h-[180px] md:h-[230px]">
                  <Image
                    src="/2023/11/electrical-panel-innisfil.jpg"
                    alt="Electrical panel upgrade"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </article>
            </div>

            <p className="mt-6 text-base leading-relaxed text-sand/80 md:text-lg">
              Let Triple M Electric light up your world with our exceptional electrical services. Contact us today for all
              your electrical needs in Toronto and the GTA!
            </p>

            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 self-end rounded-full bg-ember px-6 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us Today <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      <section
        id="contact"
        className="border-t border-white/10 bg-[radial-gradient(circle_at_15%_15%,rgba(255,122,24,0.12),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(159,210,255,0.22),transparent_34%),linear-gradient(145deg,#071427,#0d2345)]"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-[0.95fr_1.05fr] md:px-8 md:py-24">
          <Reveal className="md:col-span-2 md:text-center">
            <p className="inline-flex rounded-full border border-slateBlue/40 bg-slateBlue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slateBlue">
              Contact Us
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-2xl font-bold md:text-4xl">Let&apos;s power your next project</h2>
            <p className="mt-4 max-w-3xl text-sand/75 md:mx-auto">
              Please contact us using this form. We will get back to you within 24 hours. All the work provided by Triple M
              Electric is performed by licensed electricians.
            </p>
          </Reveal>

          <Reveal>
            <div className="mt-8 space-y-4">
              <article className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff2a5f]/20 text-[#ff6f8f]">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slateBlue">Location</p>
                  <p className="mt-1 text-sm text-sand/80">{contactInfo.address}</p>
                </div>
              </article>

              <article className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ember/20 text-ember">
                  <PhoneCall size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slateBlue">Phone Number</p>
                  <a
                    href={`tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`}
                    className="mt-1 inline-block text-sm text-amber-300 transition hover:text-amber-200"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </article>

              <article className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slateBlue/20 text-slateBlue">
                  <Mail size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slateBlue">Email Address</p>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="mt-1 inline-block text-sm text-sand/80 transition hover:text-sand"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </article>

              <article className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2fd882]/20 text-[#2fd882]">
                  <MessageCircle size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slateBlue">WhatsApp</p>
                  <a
                    href={`https://wa.me/${contactInfo.phone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-sand/80 transition hover:text-sand"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </article>

              <article className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <BadgeCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slateBlue">Electrical Contractors License</p>
                  <p className="mt-1 text-sm text-sand/80">7015049</p>
                </div>
              </article>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
