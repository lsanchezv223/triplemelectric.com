import type { Metadata } from "next";
import Image from "next/image";
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

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return {
      title: "Service Not Found | Triple M Electric",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const title = `${service.title} in Toronto & GTA | Triple M Electric`;
  const description = service.description;
  const url = `https://triplemelectric.ca/services/${service.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/services/${service.slug}`
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Triple M Electric",
      type: "website"
    }
  };
}

function ElectricalInstallationsDetail() {
  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/15">
        <div className="absolute inset-0">
          <Image
            src="/2023/12/IMG-20231030-WA0125.jpg"
            alt="Electrical installation services"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative px-6 py-12 md:px-10 md:py-16">
          <h1 className="max-w-3xl font-[var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">
            Electrical Installation Services Toronto
          </h1>
          <p className="mt-4 max-w-2xl text-sand/85">
            At Triple M Electric, we pride ourselves on delivering top-tier electrical installation services across Toronto
            and the GTA. Our team of certified electricians is dedicated to providing safe, efficient, and reliable
            electrical services for your home.
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex rounded-full bg-ember px-6 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-2xl font-bold md:text-4xl">Electrical Installation Experts in Toronto & GTA</h2>
          <p className="mt-4 max-w-4xl text-sand/80">
            Our group of licensed electricians is committed to making sure that your home is powered efficiently and safely.
            Our skilled residential electricians in Toronto can handle all of your electrical needs, from simple installs to
            intricate electrical systems, whether you&apos;re building a new home or remodeling an existing one.
          </p>
        </Reveal>
      </section>

      <section className="mt-10 space-y-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image src="/2023/12/IMG-20231030-WA0074.jpg" alt="Electrical outlets installation" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Outlets</h3>
            <p className="mt-3 text-sand/80">
              In today&apos;s fast-paced world, adequate and strategically placed electrical outlets are essential. At Triple M
              Electric, we don&apos;t just install outlets; we strategize their placements for maximum convenience and safety.
            </p>
            <p className="mt-3 text-sand/75">
              Our electrical contractors specialize in a variety of outlets including GFCI outlets, USB outlets, and
              weather-resistant outdoor outlets. We ensure that each outlet is expertly installed to meet the specific
              demands of each room in your home, providing a blend of functionality and safety.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal className="md:order-2">
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image
                src="/2023/11/lighting-upgrade-innisfil-home.jpg"
                alt="Lighting installation"
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.08} className="md:order-1">
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Lighting Installation</h3>
            <p className="mt-3 text-sand/80">
              Let Triple M Electric transform your home with exceptional lighting solutions. Our expertise extends beyond
              basic installations to include custom lighting designs tailored to your lifestyle.
            </p>
            <p className="mt-3 text-sand/75">
              From sophisticated chandeliers in your dining area to motion-sensor lights for security, our licensed
              electricians work meticulously to enhance the ambiance and functionality of your space. We also specialize in
              energy-efficient options, helping you reduce your carbon footprint while illuminating your home beautifully.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-gradient-to-r from-[#0E2C6E] to-[#0B2350] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h3 className="font-[var(--font-display)] text-2xl font-bold text-white md:text-3xl">
            Need a Licensed Electrician?
            <br />
            Speak With Us Today!
          </h3>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-[#ff2a5f] px-7 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12 space-y-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/12/IMG-20231030-WA0131.jpg" alt="Electrical panel services" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Panels</h3>
            <p className="mt-3 text-sand/80">
              The electrical panel is crucial in managing your home&apos;s electrical system. At Triple M Electric, we offer
              comprehensive services to ensure your electrical panel meets all your power needs efficiently.
            </p>
            <p className="mt-3 text-sand/75">
              This includes panel upgrades for older homes, repair of faulty panels, and installation of new,
              state-of-the-art panels in newly constructed homes. Our team provides thorough inspections and maintenance,
              reducing the risk of power outages and electrical hazards.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Surge Protection</h3>
            <p className="mt-3 text-sand/80">
              Electrical surges can happen anytime, posing a threat to your electronic devices and the overall electrical
              safety of your home. Triple M Electric provides robust surge protection solutions customized to your needs.
            </p>
            <p className="mt-3 text-sand/75">
              Our certified electricians install high-quality surge protectors that shield your entire home from external
              and internal surges, helping protect your appliances and your peace of mind.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/12/surge-protection.jpg" alt="Surge protection systems" fill className="object-cover" />
            </div>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/12/fire-alarm-systems.jpg" alt="Fire alarm installation systems" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Fire Alarms</h3>
            <p className="mt-3 text-sand/80">
              At Triple M Electric, we believe that a well-installed fire alarm system is crucial for the safety of your
              home. Our expert team provides installation, maintenance, and regular testing.
            </p>
            <p className="mt-3 text-sand/75">
              We use the latest technology in fire detection and alarm systems and support both hardwired and wireless
              configurations to ensure your property is fully protected against fire hazards.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ElectricalRepairsDetail() {
  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/15">
        <div className="absolute inset-0">
          <Image src="/2023/11/IMG-20231030-WA0110.jpg" alt="Electrical repair services" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative px-6 py-12 md:px-10 md:py-16">
          <h1 className="max-w-3xl font-[var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">Electrical Repair Services</h1>
          <p className="mt-4 max-w-2xl text-sand/85">
            At Triple M Electric, we are experts at offering the best electrical repair services available in Toronto and
            the GTA. Our team of certified electricians is dedicated to providing safe, efficient, and reliable electrical
            services for your home.
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex rounded-full bg-ember px-6 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-2xl font-bold md:text-4xl">The Best Electrical Repairs Toronto & GTA</h2>
          <p className="mt-4 max-w-4xl text-sand/80">
            From little fixes to extensive overhauls, our staff of licensed electricians is capable of handling a broad
            variety of electrical repairs. We guarantee effective and safe solutions, regardless of the problems you&apos;re
            having with your outlets, wiring, or lighting fixtures.
          </p>
          <p className="mt-3 max-w-4xl text-sand/75">
            We provide household electrician services in Toronto that are customized to fit the particular requirements of
            each home, guaranteeing the smooth operation of your electrical equipment.
          </p>
        </Reveal>
      </section>

      <section className="mt-10 space-y-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image
                src="/2023/11/electrical-repair-innisfil-e1700514355870.jpg"
                alt="Electrical repair contractor"
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Fast and Reliable Electrical Contractors in Toronto</h3>
            <p className="mt-3 text-sand/80">
              In need of urgent electrical repairs? Triple M Electric prides itself on offering fast and reliable services.
              As skilled electrical contractors, we are aware of how critical it is to act quickly to avoid further damage
              and guarantee your safety.
            </p>
            <p className="mt-3 text-sand/75">
              Our certified electricians are on call 24 hours a day to handle any electrical issues and guarantee quick
              repair of your home&apos;s electrical systems to fully operational order.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-gradient-to-r from-[#0E2C6E] to-[#0B2350] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h3 className="font-[var(--font-display)] text-2xl font-bold text-white md:text-3xl">
            Need a Licensed Electrician?
            <br />
            Speak With Us Today!
          </h3>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-[#ff2a5f] px-7 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12 space-y-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Inspections</h3>
            <p className="mt-3 text-sand/80">
              Regular electrical inspections are crucial for maintaining the safety and efficiency of your home&apos;s
              electrical system. At Triple M Electric, our residential electricians conduct thorough inspections to identify
              potential hazards and inefficiencies.
            </p>
            <p className="mt-3 text-sand/75">
              We meticulously evaluate your electrical panels, wiring, outlets, and appliances to ensure they comply with
              safety standards. With our comprehensive electrical inspection services, you can have peace of mind knowing
              your home is electrically sound.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/12/IMG-20231030-WA0088-1.jpg" alt="Electrical inspections" fill className="object-cover" />
            </div>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/12/IMG-20231030-WA0146.jpg" alt="Electrical troubleshooting" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Troubleshooting</h3>
            <p className="mt-3 text-sand/80">
              Encountering unexplained electrical issues? Our team of expert electricians excels in electrical
              troubleshooting. We employ advanced diagnostic techniques to pinpoint the root cause of your electrical
              problems.
            </p>
            <p className="mt-3 text-sand/75">
              From flickering lights to circuit breaker issues, we have the expertise to resolve a wide array of electrical
              challenges. Our goal is to provide effective and long-lasting solutions, keeping your home safe and your
              electrical systems running smoothly.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ElectricalPanelUpgradesDetail() {
  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/15">
        <div className="absolute inset-0">
          <Image src="/2023/12/IMG-20231030-WA0125.jpg" alt="Electrical panel upgrade services" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative px-6 py-12 md:px-10 md:py-16">
          <h1 className="max-w-3xl font-[var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">Electrical Panel Upgrade Services</h1>
          <p className="mt-4 max-w-2xl text-sand/85">
            At Triple M Electric, we pride ourselves in providing high-quality electrical panel upgrade services across
            Toronto and the GTA. Our team of certified electricians is dedicated to providing safe, efficient, and reliable
            electrical services for your home.
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex rounded-full bg-ember px-6 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-2xl font-bold md:text-4xl">The Best Electrician for Panel Upgrades in Toronto & GTA</h2>
          <p className="mt-4 max-w-4xl text-sand/80">
            We specialize in electrical panel upgrades to ensure your home or business operates safely and efficiently. Our
            team of licensed electricians are experts in evaluating your current electrical system and recommending the
            necessary upgrades.
          </p>
          <p className="mt-3 max-w-4xl text-sand/75">
            Whether you need to accommodate new appliances or improve your property&apos;s safety, our panel upgrade experts
            provide a seamless service experience. Upgrading your electrical panel helps prevent hazards and ensures your
            system meets current electrical codes and standards.
          </p>
        </Reveal>
      </section>

      <section className="mt-10 space-y-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image src="/2023/11/electrical-panel-innisfil.jpg" alt="Electrical panel installation" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Panel Installation</h3>
            <p className="mt-3 text-sand/80">
              Need a new electrical panel installed? Look no further than Triple M Electric. Our electrical contractor team
              excels in the installation of new electrical panels, ensuring your Toronto home or business has the power it
              needs to function smoothly.
            </p>
            <p className="mt-3 text-sand/75">
              Whether it&apos;s a new construction project or an upgrade to support additional electrical load, our licensed
              electricians provide professional installation services that comply with all local codes and standards.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Panel Repair</h3>
            <p className="mt-3 text-sand/80">
              When electrical panels malfunction, it&apos;s crucial to address issues quickly to avoid safety risks. Triple M
              Electric offers expert electrician repair services for all types of electrical panel problems.
            </p>
            <p className="mt-3 text-sand/75">
              From minor repairs to major fixes, we ensure your electrical repairs are handled with care and
              professionalism. Rely on Triple M Electric for quick and effective repair services that keep your electrical
              system running smoothly.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image src="/2023/12/IMG-20231030-WA0125.jpg" alt="Electrical panel repair" fill className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-gradient-to-r from-[#0E2C6E] to-[#0B2350] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h3 className="font-[var(--font-display)] text-2xl font-bold text-white md:text-3xl">
            Need a Licensed Electrician?
            <br />
            Speak With Us Today!
          </h3>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-[#ff2a5f] px-7 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12 space-y-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/12/IMG-20231030-WA0131.jpg" alt="Electrical panel replacement" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Panel Replacement</h3>
            <p className="mt-3 text-sand/80">
              There are times when an electrical panel cannot be repaired and must be replaced. Triple M Electric
              specializes in electrical panel replacement, providing top-notch services to residents and businesses in
              Toronto and the GTA.
            </p>
            <p className="mt-3 text-sand/75">
              A new electrical panel can enhance your property&apos;s safety, increase its value, and support modern
              electrical demands. Your replacement is completed efficiently, safely, and in compliance with all electrical
              standards.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Panel Maintenance</h3>
            <p className="mt-3 text-sand/80">
              Regular maintenance of your electrical panel is essential to ensure longevity and prevent potential issues.
              Triple M Electric offers comprehensive panel maintenance services in Toronto by licensed electricians.
            </p>
            <p className="mt-3 text-sand/75">
              Our checks include signs of wear, tight and secure connections, and operation within safety guidelines.
              Preventative maintenance helps avoid costly repairs and keeps your electrical system in top condition.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/11/IMG-20231030-WA0118.jpg" alt="Electrical panel maintenance" fill className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ElectricalLightingDetail() {
  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/15">
        <div className="absolute inset-0">
          <Image src="/2023/12/IMG-20231030-WA0125.jpg" alt="Electrical lighting solutions" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative px-6 py-12 md:px-10 md:py-16">
          <h1 className="max-w-3xl font-[var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">Electrical Lighting Solutions</h1>
          <p className="mt-4 max-w-2xl text-sand/85">
            At Triple M Electric, we pride ourselves in providing top-notch electrical lighting solutions across Toronto and
            the GTA. Our team of certified electricians is dedicated to providing safe, efficient, and reliable electrical
            services for your home.
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex rounded-full bg-ember px-6 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-2xl font-bold md:text-4xl">
            The Best Electrician for Lighting Installations in Toronto & GTA
          </h2>
          <p className="mt-4 max-w-4xl text-sand/80">
            At Triple M Electric, we pride ourselves on housing the best certified electricians in the Toronto & GTA area.
            Our team is skilled in various light installation services, including pot lights, sophisticated interior
            lighting, and durable outdoor solutions.
          </p>
          <p className="mt-3 max-w-4xl text-sand/75">
            We understand the importance of having a reliable electrical contractor, which is why our licensed electricians
            are thoroughly trained to handle any electrical repairs and installations with precision and care.
          </p>
        </Reveal>
      </section>

      <section className="mt-10 space-y-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image src="/2023/11/IMG-20231030-WA0070.jpg" alt="Interior lighting installation" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Interior Lighting</h3>
            <p className="mt-3 text-sand/80">
              Elevate your indoor spaces with Triple M Electric&apos;s interior lighting services. Our expert team specializes in
              designing and installing a wide range of lighting fixtures that transform your living or workspace into a
              welcoming and well-lit environment.
            </p>
            <p className="mt-3 text-sand/75">
              From selecting the perfect fixtures to final installation, our certified electricians work closely with you to
              create a customized lighting solution that reflects your style and meets your functional needs.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Pot Light Installation</h3>
            <p className="mt-3 text-sand/80">
              Illuminate your home or office with sleek and modern pot lights, expertly installed by Triple M Electric.
              Pot light installation is a popular choice for those looking to enhance their space with clean recessed
              lighting that blends seamlessly into the ceiling.
            </p>
            <p className="mt-3 text-sand/75">
              Our licensed electricians are adept at installing pot lights in a variety of settings, ensuring a smooth,
              hassle-free process from start to finish.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image src="/2023/11/IMG-20231030-WA0132.jpg" alt="Pot light installation" fill className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-gradient-to-r from-[#0E2C6E] to-[#0B2350] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h3 className="font-[var(--font-display)] text-2xl font-bold text-white md:text-3xl">
            Need a Licensed Electrician?
            <br />
            Speak With Us Today!
          </h3>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-[#ff2a5f] px-7 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12 space-y-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/11/lighting-upgrade-innisfil-home.jpg" alt="LED light installation" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">LED Light Installation</h3>
            <p className="mt-3 text-sand/80">
              Embrace energy efficiency and modern aesthetics with LED light installation services from Triple M Electric.
              LED lighting is known for long lifespan, low energy consumption, and superior brightness for both residential
              and commercial settings.
            </p>
            <p className="mt-3 text-sand/75">
              Our team of certified electricians is equipped to install a variety of LED options that help reduce your
              energy bills and carbon footprint.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Outdoor Lighting</h3>
            <p className="mt-3 text-sand/80">
              Transform your outdoor areas into inviting and secure spaces with Triple M Electric&apos;s outdoor lighting
              services. From garden ambiance to security lighting, we design systems that improve beauty and safety.
            </p>
            <p className="mt-3 text-sand/75">
              Every installation is performed with care, following safety standards and optimizing for energy efficiency,
              so your property looks better and performs better.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/11/IMG-20231030-WA0127.jpg" alt="Outdoor lighting solutions" fill className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function CommercialLightingDetail() {
  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/15">
        <div className="absolute inset-0">
          <Image src="/2023/11/IMG-20231030-WA0108-2.jpg" alt="Commercial lighting services" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative px-6 py-12 md:px-10 md:py-16">
          <h1 className="max-w-3xl font-[var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">
            Commercial Lighting Services
          </h1>
          <p className="mt-4 max-w-2xl text-sand/85">
            At Triple M Electric, we pride ourselves in providing reliable commercial lighting solutions across Toronto and
            the GTA. Our team of commercial electricians is dedicated to providing safe and efficient electrical services
            for your business.
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex rounded-full bg-ember px-6 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-2xl font-bold md:text-4xl">The Leading Electricians for Commercial Lighting</h2>
          <p className="mt-4 max-w-4xl text-sand/80">
            Triple M Electric specializes in top-tier commercial lighting solutions across Toronto and the GTA. Our
            services help businesses improve visibility, aesthetics, and safety with professional installations and upgrades.
          </p>
          <p className="mt-3 max-w-4xl text-sand/75">
            Whether you need new installations, scheduled maintenance, or custom lighting design, our team delivers
            dependable results tailored to your property and operational needs.
          </p>
        </Reveal>
      </section>

      <section className="mt-10 space-y-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image src="/2023/11/IMG-20231030-WA0108-2.jpg" alt="Commercial lighting retrofits" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Commercial Lighting Retrofits</h3>
            <p className="mt-3 text-sand/80">
              Embrace energy efficiency and modern aesthetics with commercial lighting retrofits from Triple M Electric. We
              upgrade aging systems to reduce energy use while improving light quality and consistency.
            </p>
            <p className="mt-3 text-sand/75">
              From offices to retail spaces and mixed-use properties, our licensed electricians plan and execute each
              retrofit carefully with minimal disruption to your daily operations.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Signage Lighting</h3>
            <p className="mt-3 text-sand/80">
              Make your brand stand out with specialized signage lighting. Effective illumination draws attention, improves
              visibility, and helps create a lasting first impression for your business.
            </p>
            <p className="mt-3 text-sand/75">
              We provide complete signage lighting support from design and fixture selection to installation and upgrades,
              ensuring your signs stay vibrant day and night.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image src="/2023/11/IMG-20231030-WA0134.jpg" alt="Commercial signage lighting" fill className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-gradient-to-r from-[#0E2C6E] to-[#0B2350] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h3 className="font-[var(--font-display)] text-2xl font-bold text-white md:text-3xl">
            Need a Licensed Electrician?
            <br />
            Speak With Us Today!
          </h3>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-[#ff2a5f] px-7 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/11/IMG-20231030-WA0098.jpg" alt="Commercial ballast replacement" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Ballast Replacement</h3>
            <p className="mt-3 text-sand/80">
              Triple M Electric offers professional ballast replacement to keep your commercial fixtures running efficiently
              and safely. Faulty ballasts can cause poor lighting performance and unnecessary energy costs.
            </p>
            <p className="mt-3 text-sand/75">
              Our electricians diagnose issues quickly and replace defective components with minimal downtime, helping your
              business maintain a safe, reliable, and productive environment.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ElectricalMaintenanceDetail() {
  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/15">
        <div className="absolute inset-0">
          <Image src="/2023/11/IMG-20231030-WA0108-2.jpg" alt="Commercial electrical maintenance" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative px-6 py-12 md:px-10 md:py-16">
          <h1 className="max-w-3xl font-[var(--font-display)] text-3xl font-bold leading-tight md:text-5xl">
            Commercial Electrical Maintenance
          </h1>
          <p className="mt-4 max-w-2xl text-sand/85">
            At Triple M Electric, we pride ourselves in providing fast and reliable commercial electrical maintenance
            services across Toronto and the GTA. Our team of certified electricians is dedicated to delivering safe and
            efficient service for your business.
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex rounded-full bg-ember px-6 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <Reveal>
          <h2 className="font-[var(--font-display)] text-2xl font-bold md:text-4xl">Electrical Maintenance Services by Triple M Electric</h2>
          <p className="mt-4 max-w-4xl text-sand/80">
            Triple M Electric is a trusted choice for commercial electrical maintenance in Toronto and the GTA. From
            inspections and repairs to upgrades and preventive care, we tailor each maintenance plan to your facility.
          </p>
          <p className="mt-3 max-w-4xl text-sand/75">
            Our licensed electricians focus on minimizing risk, reducing unplanned downtime, and keeping your electrical
            systems operating reliably and efficiently.
          </p>
        </Reveal>
      </section>

      <section className="mt-10 space-y-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image src="/2023/11/IMG-20231030-WA0110-1.jpg" alt="Electrical inspections" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Inspections</h3>
            <p className="mt-3 text-sand/80">
              Regular inspections are essential for safety and long-term performance. Our team performs detailed evaluations
              to identify wear, code concerns, and hidden risks before they become costly failures.
            </p>
            <p className="mt-3 text-sand/75">
              These inspections help ensure your systems remain compliant, efficient, and ready to support day-to-day
              operations without interruption.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Retrofits</h3>
            <p className="mt-3 text-sand/80">
              Modern retrofits can significantly improve efficiency and reduce operating costs. We upgrade outdated
              lighting, controls, and electrical components with solutions designed for today&apos;s commercial demands.
            </p>
            <p className="mt-3 text-sand/75">
              Our electricians manage each retrofit with minimal disruption, helping your business transition smoothly to
              safer and more efficient systems.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[360px]">
              <Image src="/2023/11/IMG-20231030-WA0132.jpg" alt="Electrical retrofits" fill className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-gradient-to-r from-[#0E2C6E] to-[#0B2350] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h3 className="font-[var(--font-display)] text-2xl font-bold text-white md:text-3xl">
            Need a Licensed Electrician?
            <br />
            Speak With Us Today!
          </h3>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-full bg-[#ff2a5f] px-7 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="mt-12 space-y-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/11/IMG-20231030-WA0137.jpg" alt="Electrical troubleshooting" fill className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Electrical Troubleshooting</h3>
            <p className="mt-3 text-sand/80">
              When issues arise, fast troubleshooting protects uptime. Our electricians quickly isolate faults and resolve
              them safely, from circuit irregularities to equipment-related electrical problems.
            </p>
            <p className="mt-3 text-sand/75">
              We focus on clear diagnosis and durable fixes so your systems return to normal operation with confidence.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Reveal delay={0.08}>
            <h3 className="font-[var(--font-display)] text-2xl font-bold">Whole Building Surge Protection</h3>
            <p className="mt-3 text-sand/80">
              Whole-building surge protection helps shield your infrastructure from external and internal voltage spikes
              that can damage sensitive equipment and disrupt business continuity.
            </p>
            <p className="mt-3 text-sand/75">
              We install commercial-grade protection devices that improve reliability, reduce repair costs, and safeguard
              the electrical backbone of your property.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex rounded-full bg-ember px-5 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
            >
              Contact Us
            </Link>
          </Reveal>
          <Reveal>
            <div className="relative h-[280px] overflow-hidden rounded-3xl border border-white/15 md:h-[340px]">
              <Image src="/2023/12/surge-protection.jpg" alt="Whole building surge protection" fill className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
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
        {slug === "electrical-installations" ||
        slug === "electrical-repairs" ||
        slug === "panel-upgrades" ||
        slug === "lighting-solutions" ||
        slug === "electrical-lighting" ||
        slug === "commercial-lighting" ||
        slug === "electrical-maintenance" ? null : (
          <>
            <h1 className="mt-4 max-w-3xl font-[var(--font-display)] text-4xl font-bold leading-tight md:text-6xl">{service.title}</h1>
            <p className="mt-5 max-w-3xl text-sand/80 md:text-lg">{service.description}</p>
          </>
        )}
      </Reveal>

      {slug === "electrical-installations" ? (
        <ElectricalInstallationsDetail />
      ) : slug === "electrical-repairs" ? (
        <ElectricalRepairsDetail />
      ) : slug === "panel-upgrades" ? (
        <ElectricalPanelUpgradesDetail />
      ) : slug === "lighting-solutions" || slug === "electrical-lighting" ? (
        <ElectricalLightingDetail />
      ) : slug === "commercial-lighting" ? (
        <CommercialLightingDetail />
      ) : slug === "electrical-maintenance" ? (
        <ElectricalMaintenanceDetail />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
