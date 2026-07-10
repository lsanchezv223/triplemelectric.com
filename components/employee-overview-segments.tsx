"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Paperclip } from "lucide-react";
import { EntryAttachmentsModal, type EntryAttachmentItem } from "@/components/entry-attachments-modal";
import { EntryDetailsModal } from "@/components/entry-details-modal";

type Segment = {
  id: string;
  workDate: string;
  location: string;
  startTime: string | null;
  endTime: string | null;
  breakMinutes: number;
  totalHours: number;
  company: string | null;
  notes: string | null;
  status: "IN_PROGRESS" | "APPROVED" | "INVOICED";
  hourlyRate: number | null;
  attachmentsCount: number;
};

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function toTimeLabel(value: string | null) {
  return value ? value.slice(11, 16) : "--:--";
}

function getStatusLabel(status: Segment["status"]) {
  if (status === "INVOICED") {
    return "Invoiced";
  }

  if (status === "APPROVED") {
    return "Approved";
  }

  return "In progress";
}

function getPaidAmount(entry: Segment) {
  if (entry.status === "IN_PROGRESS" || !entry.hourlyRate) {
    return null;
  }

  return entry.totalHours * entry.hourlyRate;
}

function getNotePreview(notes: string | null) {
  if (!notes) {
    return "";
  }

  const trimmed = notes.trim();
  return trimmed.length > 140 ? `${trimmed.slice(0, 140)}…` : trimmed;
}

export function EmployeeOverviewSegments({ entries, openHoursHref }: { entries: Segment[]; openHoursHref?: string }) {
  const [detailsViewer, setDetailsViewer] = useState<Segment | null>(null);
  const [attachmentsViewer, setAttachmentsViewer] = useState<{
    title: string;
    subtitle: string;
    attachments: EntryAttachmentItem[];
  } | null>(null);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState("");

  async function openAttachments(entry: Segment) {
    setAttachmentsError("");
    setAttachmentsLoading(true);

    try {
      const response = await fetch(`/api/work-entries/${entry.id}/attachments`);
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        attachments?: EntryAttachmentItem[];
      };

      if (!response.ok || !result.ok) {
        setAttachmentsError(result.error || "Unable to load attachments.");
        return;
      }

      setAttachmentsViewer({
        title: entry.location,
        subtitle: formatFullDate(new Date(`${entry.workDate.slice(0, 10)}T00:00:00Z`)),
        attachments: result.attachments || []
      });
    } catch {
      setAttachmentsError("Unable to load attachments.");
    } finally {
      setAttachmentsLoading(false);
    }
  }

  return (
    <>
      <article className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Recent activity</p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">This week&apos;s segments</h3>
          </div>
          {openHoursHref ? (
            <Link
              href={openHoursHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-sand/80 transition hover:border-white/25 hover:text-white"
            >
              Open hours
              <ArrowRight size={16} />
            </Link>
          ) : null}
        </div>

        {attachmentsError ? <p className="mt-3 text-sm text-rose-300">{attachmentsError}</p> : null}

        <div className="mt-6 space-y-3">
          {entries.length ? (
            entries.map((entry) => {
              const paidAmount = getPaidAmount(entry);

              return (
                <article key={entry.id} className="rounded-[1.25rem] border border-white/10 bg-[#08101c] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-bold text-white">{entry.location}</p>
                      <p className="mt-1 text-sm text-sand/60">{formatFullDate(new Date(`${entry.workDate.slice(0, 10)}T00:00:00Z`))}</p>
                      <p className="mt-3 text-sm leading-relaxed text-sand/72">
                        {getNotePreview(entry.notes) || "No notes added for this segment."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 md:max-w-[14rem] md:justify-end">
                      {paidAmount ? (
                        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
                          ${paidAmount.toFixed(2)}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white">
                        {entry.totalHours.toFixed(2)} h
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1.5 text-sm ${
                          entry.status === "INVOICED"
                            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                            : "border-amber-300/20 bg-amber-300/10 text-amber-200"
                        }`}
                      >
                        {entry.status === "INVOICED" ? "Invoiced" : "In progress"}
                      </span>
                      {entry.hourlyRate ? (
                        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
                          ${entry.hourlyRate.toFixed(2)}/h
                        </span>
                      ) : null}
                      {entry.attachmentsCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => openAttachments(entry)}
                          disabled={attachmentsLoading}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm text-sand/70 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Paperclip size={14} />
                          {entry.attachmentsCount}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setDetailsViewer(entry)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm text-sand/70 transition hover:border-white/25 hover:text-white"
                      >
                        <Eye size={14} />
                        View more
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-sand/65">
              Start adding work segments in the Hours tab and this week summary will fill in automatically.
            </div>
          )}
        </div>
      </article>

      {detailsViewer ? (
        <EntryDetailsModal
          title={detailsViewer.location}
          subtitle={formatFullDate(new Date(`${detailsViewer.workDate.slice(0, 10)}T00:00:00Z`))}
          statusLabel={getStatusLabel(detailsViewer.status)}
          statusTone={detailsViewer.status === "INVOICED" ? "emerald" : "amber"}
          attachmentsCount={detailsViewer.attachmentsCount}
          details={[
            { label: "Company", value: detailsViewer.company || "Triple M Electric" },
            { label: "Date", value: formatFullDate(new Date(`${detailsViewer.workDate.slice(0, 10)}T00:00:00Z`)) },
            { label: "Time", value: `${toTimeLabel(detailsViewer.startTime)} - ${toTimeLabel(detailsViewer.endTime)}` },
            { label: "Break", value: `${detailsViewer.breakMinutes} min` },
            { label: "Total hours", value: `${detailsViewer.totalHours.toFixed(2)} h` },
            {
              label: "Rate",
              value:
                detailsViewer.status === "INVOICED" && detailsViewer.hourlyRate
                  ? `$${detailsViewer.hourlyRate.toFixed(2)}/h`
                  : "Not invoiced"
            }
          ]}
          notes={detailsViewer.notes}
          onViewAttachments={
            detailsViewer.attachmentsCount > 0
              ? () => {
                  const currentEntry = detailsViewer;
                  setDetailsViewer(null);
                  void openAttachments(currentEntry);
                }
              : undefined
          }
          onClose={() => setDetailsViewer(null)}
        />
      ) : null}

      {attachmentsViewer ? (
        <EntryAttachmentsModal
          title={attachmentsViewer.title}
          subtitle={attachmentsViewer.subtitle}
          attachments={attachmentsViewer.attachments}
          onClose={() => setAttachmentsViewer(null)}
        />
      ) : null}
    </>
  );
}
