"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Entry = {
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
};

type Props = {
  entries: Entry[];
  currentUserRole: "ADMIN" | "EMPLOYEE";
};

type EntryFormState = {
  id: string | null;
  workDate: string;
  location: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
  company: string;
  notes: string;
  status: "IN_PROGRESS" | "APPROVED" | "INVOICED";
  hourlyRate: string;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric" }).format(date);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toTimeInput(value: string | null) {
  return value ? value.slice(11, 16) : "";
}

function buildInitialForm(selectedDate: string): EntryFormState {
  return {
    id: null,
    workDate: selectedDate,
    location: "",
    startTime: "",
    endTime: "",
    breakMinutes: "0",
    company: "Triple M Electric",
    notes: "",
    status: "IN_PROGRESS",
    hourlyRate: ""
  };
}

function getStatusLabel(status: Entry["status"]) {
  if (status === "APPROVED") {
    return "Approved";
  }

  if (status === "INVOICED") {
    return "Invoiced";
  }

  return "In progress";
}

function getEntryPaidAmount(entry: Entry) {
  if (entry.status !== "INVOICED" || !entry.hourlyRate) {
    return null;
  }

  return entry.totalHours * entry.hourlyRate;
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const startOffset = (firstDay.getUTCDay() + 6) % 7;
  const startDate = new Date(Date.UTC(year, month, 1 - startOffset));

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);
    return date;
  });
}

function groupEntriesByDate(entries: Entry[]) {
  return entries.reduce<Record<string, Entry[]>>((acc, entry) => {
    const key = entry.workDate.slice(0, 10);
    acc[key] = acc[key] || [];
    acc[key].push(entry);
    return acc;
  }, {});
}

function formatTimeLabel(value: string) {
  if (!value) {
    return "Select time";
  }

  const [hoursString, minutes] = value.split(":");
  const hours = Number(hoursString);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function toPickerParts(value: string) {
  if (!value) {
    return {
      hour: "",
      minute: "00",
      meridiem: "AM" as "AM" | "PM"
    };
  }

  const [hourString, minute] = value.split(":");
  const hourValue = Number(hourString);
  const meridiem: "AM" | "PM" = hourValue >= 12 ? "PM" : "AM";
  const hour = String(hourValue % 12 || 12);

  return { hour, minute, meridiem };
}

function fromPickerParts(hour: string, minute: string, meridiem: "AM" | "PM") {
  const numericHour = Number(hour);
  const numericMinute = Number(minute);

  if (!numericHour || numericHour < 1 || numericHour > 12) {
    return "";
  }

  if (Number.isNaN(numericMinute) || numericMinute < 0 || numericMinute > 59) {
    return "";
  }

  const normalizedHour = meridiem === "AM" ? (numericHour === 12 ? 0 : numericHour) : numericHour === 12 ? 12 : numericHour + 12;

  return `${String(normalizedHour).padStart(2, "0")}:${String(numericMinute).padStart(2, "0")}`;
}

function TimePickerField({
  id,
  label,
  value,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("00");
  const [meridiem, setMeridiem] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const next = toPickerParts(value);
    setHour(next.hour);
    setMinute(next.minute);
    setMeridiem(next.meridiem);
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function applyTime() {
    const nextValue = fromPickerParts(hour, minute, meridiem);

    if (!nextValue) {
      return;
    }

    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <>
      <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-sand">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-[#161d2b] px-4 py-3 text-left text-sm text-white outline-none transition hover:border-white/30"
      >
        <span className={value ? "text-white" : "text-sand/45"}>{formatTimeLabel(value)}</span>
        <Clock3 size={18} className="text-sand/65" />
      </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white p-6 text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Enter Time</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">{label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-[1fr_auto_1fr_auto] items-start gap-4">
              <div>
                <div className="rounded-2xl border-2 border-[#5b34f2] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(91,52,242,0.08)]">
                  <input
                    value={hour}
                    onChange={(event) => {
                      const next = event.target.value.replace(/\D/g, "").slice(0, 2);

                      if (!next) {
                        setHour("");
                        return;
                      }

                      const numericHour = Number(next);

                      if (numericHour >= 1 && numericHour <= 12) {
                        setHour(String(numericHour));
                      }
                    }}
                    className="w-full border-0 bg-transparent text-center text-5xl font-semibold text-slate-950 outline-none"
                    inputMode="numeric"
                    placeholder="--"
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">Hour</p>
                <p className="mt-3 text-xs text-slate-500">Use values from 1 to 12.</p>
              </div>

              <div className="pt-8 text-5xl font-semibold text-slate-900">:</div>

              <div>
                <div className="rounded-2xl bg-slate-200 p-4">
                  <input
                    value={minute}
                    onChange={(event) => {
                      const next = event.target.value.replace(/\D/g, "").slice(0, 2);
                      setMinute(next);
                    }}
                    className="w-full border-0 bg-transparent text-center text-5xl font-semibold text-slate-950 outline-none"
                    inputMode="numeric"
                    placeholder="00"
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">Minute</p>
                <p className="mt-3 text-xs text-slate-500">Use any value from 00 to 59.</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#d7c9ff]">
                {(["AM", "PM"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMeridiem(option)}
                    className={`block w-full px-5 py-4 text-xl font-semibold transition ${
                      meridiem === option ? "bg-[#eadfff] text-[#5b34f2]" : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500">
                <Clock3 size={20} />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#5b34f2] transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyTime}
                  className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#5b34f2] transition hover:bg-slate-100"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function EmployeeHoursPanel({ entries, currentUserRole }: Props) {
  const router = useRouter();
  const todayKey = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const [year, month] = todayKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, 1));
  });
  const [form, setForm] = useState<EntryFormState>(buildInitialForm(todayKey));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const entriesByDate = useMemo(() => groupEntriesByDate(entries), [entries]);
  const selectedEntries = entriesByDate[selectedDate] || [];
  const selectedTotal = selectedEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  function resetForm(dateKey: string) {
    setForm(buildInitialForm(dateKey));
  }

  function openNewEntryModal() {
    resetForm(selectedDate);
    setError("");
    setSuccess("");
    setIsEntryModalOpen(true);
  }

  function handleSelectDate(dateKey: string) {
    setSelectedDate(dateKey);
    resetForm(dateKey);
    setError("");
    setSuccess("");
  }

  function handleEdit(entry: Entry) {
    if (entry.status === "INVOICED" && currentUserRole !== "ADMIN") {
      setError("This invoiced entry can only be modified by an admin.");
      setSuccess("");
      return;
    }

    setSelectedDate(entry.workDate.slice(0, 10));
    setForm({
      id: entry.id,
      workDate: entry.workDate.slice(0, 10),
      location: entry.location,
      startTime: toTimeInput(entry.startTime),
      endTime: toTimeInput(entry.endTime),
      breakMinutes: String(entry.breakMinutes),
      company: entry.company || "Triple M Electric",
      notes: entry.notes || "",
      status: entry.status,
      hourlyRate: entry.hourlyRate ? String(entry.hourlyRate) : ""
    });
    setError("");
    setSuccess("");
    setIsEntryModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const payload = {
        workDate: form.workDate,
        location: form.location,
        startTime: form.startTime,
        endTime: form.endTime,
        breakMinutes: Number(form.breakMinutes || 0),
        company: form.company,
        notes: form.notes,
        ...(currentUserRole === "ADMIN"
          ? {
              status: form.status,
              hourlyRate: form.status === "IN_PROGRESS" ? null : form.hourlyRate
            }
          : {})
      };

      const response = await fetch(form.id ? `/api/work-entries/${form.id}` : "/api/work-entries", {
        method: form.id ? "PUT" : "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to save the work entry.");
        return;
      }

      setSuccess(form.id ? "Work entry updated." : "Work entry saved.");
      setIsEntryModalOpen(false);
      resetForm(form.workDate);
      router.refresh();
    } catch {
      setError("Unable to save the work entry.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(entryId: string) {
    setError("");
    setSuccess("");
    setDeletingId(entryId);

    try {
      const response = await fetch(`/api/work-entries/${entryId}`, {
        method: "DELETE"
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to delete the work entry.");
        return;
      }

      if (form.id === entryId) {
        resetForm(selectedDate);
      }

      setSuccess("Work entry removed.");
      router.refresh();
    } catch {
      setError("Unable to delete the work entry.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Calendar</p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">Select a work date</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVisibleMonth(new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() - 1, 1)))}
              className="rounded-full border border-white/10 p-2 text-sand/75 transition hover:border-white/25 hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth(new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1, 1)))}
              className="rounded-full border border-white/10 p-2 text-sand/75 transition hover:border-white/25 hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-[#08101c] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-[var(--font-display)] text-xl font-bold text-white">{formatMonthTitle(visibleMonth)}</h4>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setVisibleMonth(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
                handleSelectDate(todayKey);
              }}
              className="text-sm text-sand/60 transition hover:text-white"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-sand/45">
            {weekdayLabels.map((label) => (
              <div key={label} className="py-2">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((date) => {
              const key = toDateKey(date);
              const isCurrentMonth = date.getUTCMonth() === visibleMonth.getUTCMonth();
              const isSelected = key === selectedDate;
              const count = entriesByDate[key]?.length || 0;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectDate(key)}
                  className={`min-h-[74px] rounded-2xl border px-2 py-3 text-left transition ${
                    isSelected
                      ? "border-amber-300 bg-amber-300/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                  } ${isCurrentMonth ? "text-white" : "text-sand/35"}`}
                >
                  <div className="text-sm font-semibold">{date.getUTCDate()}</div>
                  {count ? <div className="mt-3 text-xs font-semibold text-amber-300">{count}</div> : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <article className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Selected date</p>
              <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">
                {new Intl.DateTimeFormat("en-CA", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC"
                }).format(new Date(`${selectedDate}T00:00:00Z`))}
              </h3>
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-sand/70">
              Total hours: <span className="font-semibold text-white">{selectedTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Daily entries</p>
              <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">Recorded work segments</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-sand/60">{selectedEntries.length} item{selectedEntries.length === 1 ? "" : "s"}</div>
              <button
                type="button"
                onClick={openNewEntryModal}
                className="rounded-full bg-ember px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
              >
                Add entry
              </button>
            </div>
          </div>

          {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}

          <div className="mt-6 space-y-4">
            {selectedEntries.length ? (
              selectedEntries.map((entry) => {
                const paidAmount = getEntryPaidAmount(entry);

                return (
                <article
                  key={entry.id}
                  className={`rounded-[1.4rem] border p-4 ${
                    entry.status === "INVOICED"
                      ? "border-emerald-400/30 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(5,18,13,0.92))]"
                      : entry.status === "APPROVED"
                        ? "border-sky-300/25 bg-[linear-gradient(180deg,rgba(56,189,248,0.1),rgba(5,18,13,0.92))]"
                      : "border-white/10 bg-[#08101c]"
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-lg font-bold text-white">{entry.location}</p>
                        <p className="mt-1 text-sm text-sand/60">{entry.company || "No company set"}</p>
                      </div>

                      <div className="flex items-center gap-2 sm:self-start">
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
                          {getStatusLabel(entry.status)}
                        </span>
                        {entry.status === "IN_PROGRESS" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEdit(entry)}
                              className="rounded-full border border-white/15 p-2.5 text-sand/75 transition hover:border-white/30 hover:text-white"
                              aria-label="Edit entry"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(entry.id)}
                              disabled={deletingId === entry.id}
                              className="rounded-full border border-rose-400/20 p-2.5 text-rose-300 transition hover:border-rose-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label="Delete entry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-sand/70">
                      <span className="rounded-full border border-white/10 px-3 py-1.5">
                        {toTimeInput(entry.startTime)} - {toTimeInput(entry.endTime)}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1.5">Break: {entry.breakMinutes} min</span>
                      <span className="rounded-full border border-white/10 px-3 py-1.5">Total: {entry.totalHours.toFixed(2)} h</span>
                      {(entry.status === "APPROVED" || entry.status === "INVOICED") && entry.hourlyRate ? (
                        <span className="rounded-full border border-emerald-300/25 px-3 py-1.5 text-emerald-100">
                          Rate: ${entry.hourlyRate.toFixed(2)}/h
                        </span>
                      ) : null}
                    </div>

                    {entry.notes ? <p className="text-sm leading-relaxed text-sand/75">{entry.notes}</p> : null}
                    {entry.status !== "IN_PROGRESS" ? (
                      <p className="text-xs font-medium text-emerald-200/85">
                        Locked after approval. Only a payroll action can move this record forward.
                      </p>
                    ) : null}
                  </div>
                </article>
                );
              })
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-sand/65">
                No entries recorded for this date yet. Select the day and add the first work segment.
              </div>
            )}
          </div>
        </article>
      </section>

      {isEntryModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[1.75rem] border border-white/10 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                  {form.id ? "Edit entry" : "Add entry"}
                </p>
                <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">
                  {new Intl.DateTimeFormat("en-CA", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC"
                  }).format(new Date(`${selectedDate}T00:00:00Z`))}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEntryModalOpen(false)}
                className="rounded-full border border-white/10 p-2 text-sand/70 transition hover:border-white/25 hover:text-white"
                aria-label="Close entry modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 md:px-8">
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-semibold text-sand">
                    Location
                  </label>
                  <input
                    id="location"
                    value={form.location}
                    onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                    placeholder="167 Caster"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="block text-sm font-semibold text-sand">
                    Company
                  </label>
                  <input
                    id="company"
                    value={form.company}
                    onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                    placeholder="Triple M Electric"
                  />
                </div>
              </div>

              {currentUserRole === "ADMIN" ? (
                <div className="space-y-2">
                  <label htmlFor="entry-status" className="block text-sm font-semibold text-sand">
                    Status
                  </label>
                  <select
                    id="entry-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as "IN_PROGRESS" | "APPROVED" | "INVOICED",
                        hourlyRate: event.target.value === "IN_PROGRESS" ? "" : current.hourlyRate
                      }))
                    }
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  >
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="APPROVED">Approved</option>
                    <option value="INVOICED">Invoiced</option>
                  </select>
                </div>
              ) : null}

              {currentUserRole === "ADMIN" && form.status !== "IN_PROGRESS" ? (
                <div className="space-y-2">
                  <label htmlFor="hourly-rate" className="block text-sm font-semibold text-sand">
                    Hourly rate
                  </label>
                  <input
                    id="hourly-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.hourlyRate}
                    onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                    placeholder="45.00"
                    required
                  />
                  <p className="text-xs text-sand/55">Required when the entry is marked as approved or invoiced.</p>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <TimePickerField
                  id="start-time"
                  label="Start time"
                  value={form.startTime}
                  onChange={(value) => setForm((current) => ({ ...current, startTime: value }))}
                />

                <TimePickerField
                  id="end-time"
                  label="End time"
                  value={form.endTime}
                  onChange={(value) => setForm((current) => ({ ...current, endTime: value }))}
                />

                <div className="space-y-2">
                  <label htmlFor="break-minutes" className="block text-sm font-semibold text-sand">
                    Break (min)
                  </label>
                  <input
                    id="break-minutes"
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
                <label htmlFor="notes" className="block text-sm font-semibold text-sand">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  placeholder="Add job notes, site details, or anything important about the day."
                />
              </div>

              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => resetForm(selectedDate)}
                  className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-sand/80 transition hover:border-white/30 hover:text-white"
                >
                  Clear form
                </button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsEntryModalOpen(false)}
                    className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-sand/80 transition hover:border-white/30 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : form.id ? "Update entry" : "Add entry"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
