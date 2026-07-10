"use client";

import { useEffect } from "react";
import { Paperclip, X } from "lucide-react";

export type EntryDetailItem = {
  label: string;
  value: string;
};

type StatusTone = "amber" | "sky" | "emerald";

const statusToneClasses: Record<StatusTone, string> = {
  amber: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  sky: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  emerald: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
};

export function EntryDetailsModal({
  title,
  subtitle,
  statusLabel,
  statusTone,
  details,
  notes,
  attachmentsCount,
  onViewAttachments,
  onClose
}: {
  title: string;
  subtitle?: string;
  statusLabel: string;
  statusTone: StatusTone;
  details: EntryDetailItem[];
  notes?: string | null;
  attachmentsCount?: number;
  onViewAttachments?: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6">
      <div className="my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Entry details</p>
            <h3 className="mt-2 truncate font-[var(--font-display)] text-2xl font-bold text-white">{title}</h3>
            {subtitle ? <p className="mt-2 text-sm text-sand/65">{subtitle}</p> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-sand/70 transition hover:border-white/25 hover:text-white"
            aria-label="Close entry details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[78dvh] overflow-y-auto px-6 py-6 md:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${statusToneClasses[statusTone]}`}>
              {statusLabel}
            </span>
            {attachmentsCount ? (
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-sand/75">
                {attachmentsCount} attachment{attachmentsCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {details.map((item) => (
              <article key={item.label} className="rounded-[1.1rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-sand/45">{item.label}</p>
                <p className="mt-2 break-words text-sm font-semibold text-white">{item.value}</p>
              </article>
            ))}
          </div>

          {notes ? (
            <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">Notes</p>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-sand/80">{notes}</p>
            </div>
          ) : null}

          {attachmentsCount && onViewAttachments ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onViewAttachments}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30"
              >
                <Paperclip size={16} />
                View attachments
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
