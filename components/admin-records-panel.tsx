"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Eye, Paperclip, Pencil, ReceiptText, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { EntryDetailsModal } from "@/components/entry-details-modal";
import { EntryAttachmentsModal, type EntryAttachmentItem } from "@/components/entry-attachments-modal";
import { readApiResponse } from "@/lib/api-response";

type TeamUser = {
  id: string;
  fullName: string;
  role: "ADMIN" | "EMPLOYEE";
  hourlyRate: number | null;
};

type AdminWorkEntry = {
  id: string;
  sharedGroupId: string | null;
  workDate: string;
  clientName: string | null;
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
  user: {
    id: string;
    fullName: string;
    username: string;
    hourlyRate: number | null;
  };
};

type Props = {
  entries: AdminWorkEntry[];
  users: TeamUser[];
  currentAdminId: string;
  currentAdminName: string;
  filters: {
    start: string;
    end: string;
    employee: string;
    status: string;
    q: string;
  };
  currentWeekHref: string;
  periodLabel: string;
  focusEntryId?: string | null;
};

type EntryFormState = {
  id: string;
  workDate: string;
  clientName: string;
  location: string;
  userId: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
  company: string;
  notes: string;
  status: "IN_PROGRESS" | "APPROVED" | "INVOICED";
  hourlyRate: string;
  sharedWithUserIds: string[];
};

function toTimeInput(value: string | null) {
  return value ? value.slice(11, 16) : "";
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function getEntryPaidAmount(entry: { status: "IN_PROGRESS" | "APPROVED" | "INVOICED"; hourlyRate: number | null; totalHours: number }) {
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
  return trimmed.length > 160 ? `${trimmed.slice(0, 160)}…` : trimmed;
}

function buildForm(entry: AdminWorkEntry): EntryFormState {
  return {
    id: entry.id,
    workDate: entry.workDate.slice(0, 10),
    clientName: entry.clientName || "",
    location: entry.location,
    userId: entry.user.id,
    startTime: toTimeInput(entry.startTime),
    endTime: toTimeInput(entry.endTime),
    breakMinutes: String(entry.breakMinutes),
    company: entry.company || "Triple M Electric",
    notes: entry.notes || "",
    status: entry.status,
    hourlyRate: entry.hourlyRate ? String(entry.hourlyRate) : "",
    sharedWithUserIds: []
  };
}

export function AdminRecordsPanel({
  entries,
  users,
  currentAdminId,
  currentAdminName,
  filters,
  currentWeekHref,
  periodLabel,
  focusEntryId
}: Props) {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<{ kind: "edit" | "approve"; entryId: string } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(Boolean(filters.start || filters.end || filters.employee || filters.status || filters.q));
  const [attachmentsError, setAttachmentsError] = useState("");
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsViewer, setAttachmentsViewer] = useState<{
    title: string;
    subtitle: string;
    attachments: EntryAttachmentItem[];
  } | null>(null);
  const [detailsViewer, setDetailsViewer] = useState<AdminWorkEntry | null>(null);
  const [focusHandled, setFocusHandled] = useState(false);
  const createDefaultWorkDate = new Date().toISOString().slice(0, 10);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedAction?.entryId) ?? null,
    [entries, selectedAction]
  );
  const activeFilterCount = [filters.start, filters.end, filters.employee, filters.status, filters.q].filter(Boolean).length;
  const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const totalEarned = entries.reduce((sum, entry) => sum + (getEntryPaidAmount(entry) || 0), 0);
  const invoicedCount = entries.filter((entry) => entry.status === "INVOICED").length;
  const uniqueEmployees = new Set(entries.map((entry) => entry.user.id)).size;

  useEffect(() => {
    setFiltersOpen(Boolean(filters.start || filters.end || filters.employee || filters.status || filters.q));
  }, [filters.start, filters.end, filters.employee, filters.status, filters.q]);

  useEffect(() => {
    if (!focusEntryId || focusHandled || selectedAction) {
      return;
    }

    const targetEntry = entries.find((entry) => entry.id === focusEntryId);

    if (targetEntry) {
      setSelectedAction({ kind: "edit", entryId: targetEntry.id });
      setFocusHandled(true);
    }
  }, [entries, focusEntryId, focusHandled, selectedAction]);

  async function openAttachments(entry: AdminWorkEntry) {
    setAttachmentsError("");
    setAttachmentsLoading(true);

    try {
      const response = await fetch(`/api/work-entries/${entry.id}/attachments`);
      const { data: result, errorMessage } = await readApiResponse<{
        ok?: boolean;
        error?: string;
        details?: string;
        attachments?: EntryAttachmentItem[];
      }>(response);

      if (!response.ok || !result?.ok) {
        setAttachmentsError(errorMessage || "Unable to load attachments.");
        return;
      }

      setAttachmentsViewer({
        title: entry.location,
        subtitle: `${entry.user.fullName} · ${formatLongDate(entry.workDate)}`,
        attachments: result.attachments || []
      });
    } catch {
      setAttachmentsError("Unable to load attachments.");
    } finally {
      setAttachmentsLoading(false);
    }
  }

  function openDetails(entry: AdminWorkEntry) {
    setDetailsViewer(entry);
  }

  function closeDetails() {
    setDetailsViewer(null);
  }

  function openCreateRecord() {
    setAttachmentsError("");
    setSuccess("");
    setIsCreateOpen(true);
  }

  return (
    <>
      <section className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Admin records</p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-white">Review and approve employee hours</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand/70">
              Filter by employee, date range, or status, then update the record, approve it for payroll, or correct job details.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-sand/45">Filtered period</p>
            <p className="mt-2 text-lg font-semibold text-sand/75">{periodLabel}</p>
            <p className="mt-1 text-3xl font-bold text-white">{totalHours.toFixed(2)} h</p>
            <p className="mt-1 text-sm text-sand/60">{entries.length} records</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Filters</p>
              <p className="mt-1 text-sm text-sand/60">
                {activeFilterCount > 0 ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}` : "Hidden by default"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openCreateRecord}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/40 hover:text-white"
              >
                Add record
              </button>

              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-sand/85 transition hover:border-white/30 hover:text-white"
              >
                {filtersOpen ? "Hide filters" : "Show filters"}
                {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <a
                href={currentWeekHref}
                className="rounded-full border border-white/15 px-5 py-2.5 text-center text-sm font-semibold text-sand/80 transition hover:border-white/25 hover:text-white"
              >
                Current week
              </a>
            </div>
          </div>

          {filtersOpen ? (
            <div className="mt-4 space-y-4">
              <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,180px)_auto]">
                <input type="hidden" name="view" value="records" />

                <div className="space-y-2 md:col-span-2 xl:col-span-6">
                  <label htmlFor="records-search" className="block text-sm font-semibold text-sand">
                    Search
                  </label>
                  <input
                    id="records-search"
                    name="q"
                    type="search"
                    defaultValue={filters.q}
                    placeholder="Search client, notes, location, company, or employee..."
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="records-start" className="block text-sm font-semibold text-sand">
                    Start date
                  </label>
                  <input
                    id="records-start"
                    name="start"
                    type="date"
                    defaultValue={filters.start}
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="records-end" className="block text-sm font-semibold text-sand">
                    End date
                  </label>
                  <input
                    id="records-end"
                    name="end"
                    type="date"
                    defaultValue={filters.end}
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="records-employee" className="block text-sm font-semibold text-sand">
                    Employee
                  </label>
                  <select
                    id="records-employee"
                    name="employee"
                    defaultValue={filters.employee}
                    className="w-full rounded-2xl border border-white/15 bg-[#08101c] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  >
                    <option value="">All employees</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="records-status" className="block text-sm font-semibold text-sand">
                    Status
                  </label>
                  <select
                    id="records-status"
                    name="status"
                    defaultValue={filters.status}
                    className="w-full rounded-2xl border border-white/15 bg-[#08101c] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  >
                      <option value="">All statuses</option>
                      <option value="IN_PROGRESS">In process</option>
                      <option value="APPROVED">Approved</option>
                      <option value="INVOICED">Invoiced</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 md:col-span-2 md:flex-row xl:col-span-1 xl:self-end">
                  <button
                    type="submit"
                    className="rounded-full bg-ember px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
                  >
                    Apply filters
                  </button>
                </div>
              </form>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-sand/60">Total records</p>
                  <p className="mt-2 text-2xl font-bold text-white">{entries.length}</p>
                </article>
                <article className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-sand/60">Employees</p>
                  <p className="mt-2 text-2xl font-bold text-white">{uniqueEmployees}</p>
                </article>
                <article className="rounded-[1.3rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-sm text-emerald-100/70">Approved amount</p>
                  <p className="mt-2 text-2xl font-bold text-white">${totalEarned.toFixed(2)}</p>
                </article>
                <article className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-sand/60">Invoiced</p>
                  <p className="mt-2 text-2xl font-bold text-white">{invoicedCount}</p>
                </article>
              </div>
            </div>
          ) : null}
        </div>

        {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}
        {attachmentsError ? <p className="mt-2 text-sm text-rose-300">{attachmentsError}</p> : null}

        <div className="mt-6 space-y-4">
          {entries.length ? (
            entries.map((entry) => {
              const paidAmount = getEntryPaidAmount(entry);

              return (
                <article
                  key={entry.id}
                  className={`rounded-[1.4rem] border p-5 ${
                    entry.status === "INVOICED"
                      ? "border-emerald-400/30 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(5,18,13,0.92))]"
                      : "border-white/10 bg-[#08101c]"
                  }`}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-lg font-bold text-white">{entry.location}</p>
                        {entry.sharedGroupId ? (
                          <span className="mt-2 inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-sky-100">
                            Shared task
                          </span>
                        ) : null}
                        {entry.clientName ? <p className="mt-1 text-sm text-sand/75">Client: {entry.clientName}</p> : null}
                        <p className="mt-1 text-sm text-sand/65">
                          {entry.user.fullName} · @{entry.user.username}
                        </p>
                        <p className="mt-1 text-sm text-sand/55">{formatLongDate(entry.workDate)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-sand/70">
                        <span className="rounded-full border border-white/10 px-3 py-1.5">
                          {toTimeInput(entry.startTime)} - {toTimeInput(entry.endTime)}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1.5">Break: {entry.breakMinutes} min</span>
                        <span className="rounded-full border border-white/10 px-3 py-1.5">Total: {entry.totalHours.toFixed(2)} h</span>
                        {entry.hourlyRate ? (
                          <span className="rounded-full border border-emerald-300/25 px-3 py-1.5 text-emerald-100">
                            Rate: ${entry.hourlyRate.toFixed(2)}/h
                          </span>
                        ) : null}
                        {entry.attachmentsCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => openAttachments(entry)}
                            disabled={attachmentsLoading}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sand/70 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Paperclip size={14} />
                            {entry.attachmentsCount}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => openDetails(entry)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sand/70 transition hover:border-white/25 hover:text-white"
                        >
                          <Eye size={14} />
                          View more
                        </button>
                      </div>

                      {entry.notes ? <p className="text-sm leading-relaxed text-sand/75">{getNotePreview(entry.notes)}</p> : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:max-w-[20rem] xl:justify-end">
                      {paidAmount ? (
                        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
                          ${paidAmount.toFixed(2)}
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                          entry.status === "INVOICED"
                            ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
                            : entry.status === "APPROVED"
                              ? "border-sky-300/25 bg-sky-300/10 text-sky-100"
                              : "border-amber-300/20 bg-amber-300/10 text-amber-200"
                        }`}
                      >
                        {entry.status === "INVOICED" ? "Invoiced" : entry.status === "APPROVED" ? "Approved" : "In process"}
                      </span>
                      {entry.status === "IN_PROGRESS" ? (
                        <button
                          type="button"
                          onClick={() => setSelectedAction({ kind: "approve", entryId: entry.id })}
                          className="rounded-full border border-sky-300/20 p-2.5 text-sky-100 transition hover:border-sky-300/40 hover:text-white"
                          aria-label="Approve record"
                        >
                          <ReceiptText size={16} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setSelectedAction({ kind: "edit", entryId: entry.id })}
                        className="rounded-full border border-white/15 p-2.5 text-sand/75 transition hover:border-white/30 hover:text-white"
                        aria-label="Edit record"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-sand/65">
              No records match the current filters.
            </div>
          )}
        </div>
      </section>

      {selectedEntry ? (
        selectedAction?.kind === "approve" ? (
          <ApproveRecordModal
            entry={selectedEntry}
            onClose={() => setSelectedAction(null)}
            onRefresh={(message) => {
              setSuccess(message);
              router.refresh();
            }}
          />
        ) : (
          <EditRecordModal
            entry={selectedEntry}
            onClose={() => setSelectedAction(null)}
            onRefresh={(message) => {
              setSuccess(message);
              router.refresh();
            }}
          />
        )
      ) : null}

      {isCreateOpen ? (
          <CreateRecordModal
            users={users}
            currentAdminId={currentAdminId}
            currentAdminName={currentAdminName}
            defaultWorkDate={createDefaultWorkDate}
            onClose={() => setIsCreateOpen(false)}
            onRefresh={(message) => {
            setSuccess(message);
            router.refresh();
          }}
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

      {detailsViewer ? (
        <EntryDetailsModal
          title={detailsViewer.location}
          subtitle={`${detailsViewer.user.fullName} · ${formatLongDate(detailsViewer.workDate)}`}
          statusLabel={
            detailsViewer.status === "INVOICED"
              ? "Invoiced"
              : detailsViewer.status === "APPROVED"
                ? "Approved"
                : "In progress"
          }
          statusTone={
            detailsViewer.status === "INVOICED" ? "emerald" : detailsViewer.status === "APPROVED" ? "sky" : "amber"
          }
          attachmentsCount={detailsViewer.attachmentsCount}
          details={[
            { label: "Employee", value: `${detailsViewer.user.fullName} (@${detailsViewer.user.username})` },
            { label: "Client", value: detailsViewer.clientName || "Not set" },
            { label: "Company", value: detailsViewer.company || "Triple M Electric" },
            { label: "Date", value: formatLongDate(detailsViewer.workDate) },
            { label: "Time", value: `${toTimeInput(detailsViewer.startTime)} - ${toTimeInput(detailsViewer.endTime)}` },
            { label: "Break", value: `${detailsViewer.breakMinutes} min` },
            { label: "Total hours", value: `${detailsViewer.totalHours.toFixed(2)} h` },
            { label: "Rate", value: detailsViewer.hourlyRate ? `$${detailsViewer.hourlyRate.toFixed(2)}/h` : "Not set" }
          ]}
          notes={detailsViewer.notes}
          onViewAttachments={
            detailsViewer.attachmentsCount > 0
              ? () => {
                  const currentEntry = detailsViewer;
                  closeDetails();
                  void openAttachments(currentEntry);
                }
              : undefined
          }
          onClose={closeDetails}
        />
      ) : null}
    </>
  );
}

function buildBillForm(entry: AdminWorkEntry) {
  return {
    hourlyRate: entry.user.hourlyRate ? String(entry.user.hourlyRate) : entry.hourlyRate ? String(entry.hourlyRate) : "",
    notes: entry.notes || ""
  };
}

function ApproveRecordModal({
  entry,
  onClose,
  onRefresh
}: {
  entry: AdminWorkEntry;
  onClose: () => void;
  onRefresh: (message: string) => void;
}) {
  const [form, setForm] = useState(() => buildBillForm(entry));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const parsedHourlyRate = Number(form.hourlyRate);
  const calculatedTotal =
    form.hourlyRate && !Number.isNaN(parsedHourlyRate) && parsedHourlyRate > 0 ? entry.totalHours * parsedHourlyRate : null;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleBill(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/work-entries/${entry.id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          workDate: entry.workDate.slice(0, 10),
          clientName: entry.clientName || "",
          location: entry.location,
          startTime: entry.startTime?.slice(11, 16) || "",
          endTime: entry.endTime?.slice(11, 16) || "",
          breakMinutes: entry.breakMinutes,
          company: entry.company || "",
          notes: form.notes,
          status: "APPROVED",
          hourlyRate: form.hourlyRate
        })
      });

      const { data: result, errorMessage } = await readApiResponse<{ ok?: boolean; error?: string; details?: string }>(
        response
      );

      if (!response.ok || !result?.ok) {
        setError(errorMessage || "Unable to approve the record.");
        return;
      }

      onClose();
      onRefresh("Record approved successfully.");
    } catch {
      setError("Unable to approve the record.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/65 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6">
      <div className="my-auto flex max-h-[calc(100dvh-1rem)] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Approve record</p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">{entry.user.fullName}</h3>
            <p className="mt-2 text-sm text-sand/65">
              {formatLongDate(entry.workDate)} · {entry.location}
            </p>
            <p className="mt-2 text-sm text-sand/55">
              Hourly rate defaults from the employee profile and can be adjusted before approval.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-sand/70 transition hover:border-white/25 hover:text-white"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleBill} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-6 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-sand">Total hours</label>
              <input
                value={entry.totalHours.toFixed(2)}
                readOnly
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bill-hourly-rate" className="block text-sm font-semibold text-sand">
                Hourly rate
              </label>
              <input
                id="bill-hourly-rate"
                type="number"
                min="0"
                step="0.01"
                value={form.hourlyRate}
                onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-sand">Total amount</label>
              <div className="flex h-[3.75rem] items-center rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-4 text-lg font-bold text-emerald-100">
                {calculatedTotal === null ? "--" : `$${calculatedTotal.toFixed(2)}`}
              </div>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sand/50">Validation</p>
            <p className="mt-2 text-sm text-sand/75">
              This entry will be marked as approved using the hourly rate above.
            </p>
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-sand/80 transition hover:border-white/30 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Approving..." : "Mark as approved"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRecordModal({
  entry,
  onClose,
  onRefresh
}: {
  entry: AdminWorkEntry;
  onClose: () => void;
  onRefresh: (message: string) => void;
}) {
  const [form, setForm] = useState<EntryFormState>(() => buildForm(entry));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/work-entries/${entry.id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json"
        },
          body: JSON.stringify({
            workDate: form.workDate,
            clientName: form.clientName,
            location: form.location,
            startTime: form.startTime,
            endTime: form.endTime,
            breakMinutes: Number(form.breakMinutes || 0),
            company: form.company,
            notes: form.notes,
            status: form.status,
            hourlyRate: form.status === "IN_PROGRESS" ? null : form.hourlyRate
          })
        });

      const { data: result, errorMessage } = await readApiResponse<{ ok?: boolean; error?: string; details?: string }>(
        response
      );

      if (!response.ok || !result?.ok) {
        setError(errorMessage || "Unable to update the record.");
        return;
      }

      onClose();
      onRefresh("Record updated successfully.");
    } catch {
      setError("Unable to update the record.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/work-entries/${entry.id}`, {
        method: "DELETE"
      });

      const { data: result, errorMessage } = await readApiResponse<{ ok?: boolean; error?: string; details?: string }>(
        response
      );

      if (!response.ok || !result?.ok) {
        setError(errorMessage || "Unable to delete the record.");
        return;
      }

      onClose();
      onRefresh("Record removed successfully.");
    } catch {
      setError("Unable to delete the record.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/65 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6">
      <div className="my-auto flex max-h-[calc(100dvh-1rem)] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Record settings</p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">{entry.user.fullName}</h3>
            <p className="mt-2 text-sm text-sand/65">{formatLongDate(entry.workDate)} · {entry.location}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-sand/70 transition hover:border-white/25 hover:text-white"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-6 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="admin-work-date" className="block text-sm font-semibold text-sand">
                Date
              </label>
              <input
                id="admin-work-date"
                type="date"
                value={form.workDate}
                onChange={(event) => setForm((current) => ({ ...current, workDate: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-status" className="block text-sm font-semibold text-sand">
                Status
              </label>
                <select
                  id="admin-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as "IN_PROGRESS" | "APPROVED" | "INVOICED",
                      hourlyRate: event.target.value === "IN_PROGRESS" ? "" : current.hourlyRate
                    }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-[#08101c] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                >
                  <option value="IN_PROGRESS">In process</option>
                  <option value="APPROVED">Approved</option>
                  <option value="INVOICED">Invoiced</option>
                </select>
              </div>
            </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <label htmlFor="admin-client-name" className="block text-sm font-semibold text-sand">
                Client name
              </label>
              <input
                id="admin-client-name"
                value={form.clientName}
                onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                placeholder="Client name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-location" className="block text-sm font-semibold text-sand">
                Location
              </label>
              <input
                id="admin-location"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="admin-company" className="block text-sm font-semibold text-sand">
                Company
              </label>
              <input
                id="admin-company"
                value={form.company}
                onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </div>
          </div>

          {form.status !== "IN_PROGRESS" ? (
            <div className="space-y-2">
              <label htmlFor="admin-hourly-rate" className="block text-sm font-semibold text-sand">
                Hourly rate
              </label>
              <input
                id="admin-hourly-rate"
                type="number"
                min="0"
                step="0.01"
                value={form.hourlyRate}
                onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
              <p className="text-xs text-sand/55">Required when the entry is marked as approved or invoiced.</p>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="admin-start-time" className="block text-sm font-semibold text-sand">
                Start time
              </label>
              <input
                id="admin-start-time"
                type="time"
                value={form.startTime}
                onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-end-time" className="block text-sm font-semibold text-sand">
                End time
              </label>
              <input
                id="admin-end-time"
                type="time"
                value={form.endTime}
                onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-break-minutes" className="block text-sm font-semibold text-sand">
                Break (min)
              </label>
              <input
                id="admin-break-minutes"
                type="number"
                min="0"
                max="600"
                value={form.breakMinutes}
                onChange={(event) => setForm((current) => ({ ...current, breakMinutes: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-notes" className="block text-sm font-semibold text-sand">
              Notes
            </label>
            <textarea
              id="admin-notes"
              rows={4}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            />
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full border border-rose-400/20 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:border-rose-400/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? "Deleting..." : "Delete record"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-sand/80 transition hover:border-white/30 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function buildCreateForm(users: TeamUser[], defaultWorkDate: string, currentAdminId: string): EntryFormState {
  return {
    id: "",
    workDate: defaultWorkDate,
    clientName: "",
    location: "",
    userId: currentAdminId || users[0]?.id || "",
    startTime: "",
    endTime: "",
    breakMinutes: "0",
    company: "Triple M Electric",
    notes: "",
    status: "IN_PROGRESS",
    hourlyRate: "",
    sharedWithUserIds: []
  };
}

function CreateRecordModal({
  users,
  currentAdminId,
  currentAdminName,
  defaultWorkDate,
  onClose,
  onRefresh
}: {
  users: TeamUser[];
  currentAdminId: string;
  currentAdminName: string;
  defaultWorkDate: string;
  onClose: () => void;
  onRefresh: (message: string) => void;
}) {
  const [form, setForm] = useState<EntryFormState>(() => buildCreateForm(users, defaultWorkDate, currentAdminId));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [showSharedWith, setShowSharedWith] = useState(false);
  const sharedCoworkers = users.filter((user) => user.id !== form.userId);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const body = new FormData();
      body.append(
        "payload",
        JSON.stringify({
          userId: form.userId,
          sharedWithUserIds: form.sharedWithUserIds,
          workDate: form.workDate,
          clientName: form.clientName,
          location: form.location,
          startTime: form.startTime,
          endTime: form.endTime,
          breakMinutes: Number(form.breakMinutes || 0),
          company: form.company,
          notes: form.notes,
          status: form.status,
          hourlyRate: form.status === "IN_PROGRESS" ? null : form.hourlyRate
        })
      );
      attachmentFiles.forEach((file) => body.append("attachments", file));

      const response = await fetch("/api/work-entries", {
        method: "POST",
        body
      });

      const { data: result, errorMessage } = await readApiResponse<{ ok?: boolean; error?: string; details?: string }>(
        response
      );

      if (!response.ok || !result?.ok) {
        setError(errorMessage || "Unable to save the record.");
        return;
      }

      onClose();
      onRefresh("Record created successfully.");
    } catch {
      setError("Unable to save the record.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleSharedCoworker(coworkerId: string) {
    setForm((current) => ({
      ...current,
      sharedWithUserIds: current.sharedWithUserIds.includes(coworkerId)
        ? current.sharedWithUserIds.filter((id) => id !== coworkerId)
        : [...current.sharedWithUserIds, coworkerId]
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/65 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6">
      <div className="my-auto flex max-h-[calc(100dvh-1rem)] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">New record</p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">Create a work entry</h3>
            <p className="mt-2 text-sm text-sand/65">Add a record for any active employee.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-sand/70 transition hover:border-white/25 hover:text-white"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-6 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-8">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <label htmlFor="create-user" className="block text-sm font-semibold text-sand">
                Employee
              </label>
              <select
                id="create-user"
                value={form.userId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    userId: event.target.value,
                    sharedWithUserIds: current.sharedWithUserIds.filter((id) => id !== event.target.value)
                  }))
                }
                className="w-full rounded-2xl border border-white/15 bg-[#08101c] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              >
                <option value="">Select employee</option>
                <option value={currentAdminId}>{currentAdminName} (Admin)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="create-work-date" className="block text-sm font-semibold text-sand">
                Date
              </label>
              <input
                id="create-work-date"
                type="date"
                value={form.workDate}
                onChange={(event) => setForm((current) => ({ ...current, workDate: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setShowSharedWith((current) => !current)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-white">Shared with coworkers</p>
                <p className="mt-1 text-xs text-sand/55">
                  Create copies of this record for everyone who worked on the same task.
                </p>
              </div>
              <ChevronDown
                size={18}
                className={`text-sand/65 transition-transform ${showSharedWith ? "rotate-180" : ""}`}
              />
            </button>

            {showSharedWith ? (
              <div className="space-y-3 border-t border-white/10 px-4 pb-4 pt-4">
                {sharedCoworkers.length ? (
                  sharedCoworkers.map((coworker) => {
                    const isSelected = form.sharedWithUserIds.includes(coworker.id);

                    return (
                      <label
                        key={coworker.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <span className="min-w-0 text-sm font-medium text-white">{coworker.fullName}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSharedCoworker(coworker.id)}
                          className="h-4 w-4 rounded border-white/20 bg-white/10 text-ember focus:ring-amber-300"
                        />
                      </label>
                    );
                  })
                ) : (
                  <p className="text-sm text-sand/60">No other active coworkers available.</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <label htmlFor="create-client-name" className="block text-sm font-semibold text-sand">
                Client name
              </label>
              <input
                id="create-client-name"
                value={form.clientName}
                onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                placeholder="Client name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="create-location" className="block text-sm font-semibold text-sand">
                Location
              </label>
              <input
                id="create-location"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                placeholder="Job site or address"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <label htmlFor="create-company" className="block text-sm font-semibold text-sand">
                Company
              </label>
              <input
                id="create-company"
                value={form.company}
                onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="create-status" className="block text-sm font-semibold text-sand">
                Status
              </label>
              <select
                id="create-status"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as "IN_PROGRESS" | "APPROVED" | "INVOICED",
                    hourlyRate: event.target.value === "IN_PROGRESS" ? "" : current.hourlyRate
                  }))
                }
                className="w-full rounded-2xl border border-white/15 bg-[#08101c] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              >
                <option value="IN_PROGRESS">In process</option>
                <option value="APPROVED">Approved</option>
                <option value="INVOICED">Invoiced</option>
              </select>
            </div>
          </div>

          {form.status !== "IN_PROGRESS" ? (
            <div className="space-y-2">
              <label htmlFor="create-hourly-rate" className="block text-sm font-semibold text-sand">
                Hourly rate
              </label>
              <input
                id="create-hourly-rate"
                type="number"
                min="0"
                step="0.01"
                value={form.hourlyRate}
                onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="create-start-time" className="block text-sm font-semibold text-sand">
                Start time
              </label>
              <input
                id="create-start-time"
                type="time"
                value={form.startTime}
                onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="create-end-time" className="block text-sm font-semibold text-sand">
                End time
              </label>
              <input
                id="create-end-time"
                type="time"
                value={form.endTime}
                onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="create-break-minutes" className="block text-sm font-semibold text-sand">
                Break (min)
              </label>
              <input
                id="create-break-minutes"
                type="number"
                min="0"
                max="600"
                value={form.breakMinutes}
                onChange={(event) => setForm((current) => ({ ...current, breakMinutes: event.target.value }))}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="create-notes" className="block text-sm font-semibold text-sand">
              Notes
            </label>
            <textarea
              id="create-notes"
              rows={4}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="create-attachments" className="block text-sm font-semibold text-sand">
              Attachments
            </label>
            <input
              id="create-attachments"
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={(event) => setAttachmentFiles(Array.from(event.target.files || []))}
              className="block w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-sand/70 file:mr-4 file:rounded-full file:border-0 file:bg-ember file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="text-xs text-sand/55">You can attach images, PDFs, spreadsheets, or documents.</p>
            {attachmentFiles.length ? (
              <div className="space-y-2 rounded-[1rem] border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sand/55">Selected files</p>
                <ul className="space-y-1 text-sm text-white">
                  {attachmentFiles.map((file) => (
                    <li key={`${file.name}-${file.size}`} className="truncate">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-sand/80 transition hover:border-white/30 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Create record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
