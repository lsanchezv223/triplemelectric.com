import { MessageCircle, PhoneCall } from "lucide-react";
import { contactInfo } from "@/lib/site-data";

export function StickyContactCta() {
  const phoneHref = `tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`;
  const whatsappHref = `https://wa.me/${contactInfo.phone.replace(/[^\d]/g, "")}`;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[70] border-t border-white/15 bg-[#09162e]/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3">
          <a
            href={phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ember px-4 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:brightness-110"
          >
            <PhoneCall size={16} />
            Call now
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold uppercase tracking-[0.04em] text-[#052312] transition hover:brightness-110"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[70] hidden flex-col gap-3 md:flex">
        <a
          href={phoneHref}
          className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-lg shadow-black/25 transition hover:brightness-110"
        >
          <PhoneCall size={16} />
          Call now
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold uppercase tracking-[0.04em] text-[#052312] shadow-lg shadow-black/25 transition hover:brightness-110"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </div>
    </>
  );
}
