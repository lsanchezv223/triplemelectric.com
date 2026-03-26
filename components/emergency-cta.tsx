import { AlertTriangle, MessageCircle, PhoneCall } from "lucide-react";
import { contactInfo } from "@/lib/site-data";

export function EmergencyCta() {
  const phoneHref = `tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`;
  const whatsappHref = `https://wa.me/${contactInfo.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    "Hi, I need emergency electrical service."
  )}`;

  return (
    <section className="rounded-3xl border border-rose-300/35 bg-[linear-gradient(135deg,rgba(180,25,45,0.32),rgba(24,10,30,0.58))] p-6 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-200">
            <AlertTriangle size={14} />
            Emergencies 24/7
          </p>
          <h3 className="mt-3 font-[var(--font-display)] text-2xl font-bold text-white md:text-3xl">
            Need an emergency electrician?
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-rose-100/90 md:text-base">
            If you have a critical fault, power outage, or electrical hazard, contact us immediately.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-5 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            <PhoneCall size={16} />
            Call now
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold uppercase tracking-[0.04em] text-[#052312] transition hover:brightness-110"
          >
            <MessageCircle size={16} />
            WhatsApp now
          </a>
        </div>
      </div>
    </section>
  );
}
