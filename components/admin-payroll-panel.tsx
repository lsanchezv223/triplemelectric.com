"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Mail, Send, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

type PayrollEntry = {
  id: string;
  workDate: string;
  location: string;
  company: string | null;
  totalHours: number;
  rate: number;
  amount: number;
  status: "IN_PROGRESS" | "APPROVED" | "INVOICED";
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string | null;
    hourlyRate: number | null;
  };
};

type PayrollEmployee = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  rate: number;
  hours: number;
  amount: number;
  entries: PayrollEntry[];
};

type Props = {
  entries: PayrollEntry[];
  settings: {
    toEmail: string | null;
    ccEmails: string[];
    enabled: boolean;
  };
  startDate: string;
  endDate: string;
  periodLabel: string;
  currentWeekHref: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function getStatusLabel(status: PayrollEntry["status"]) {
  if (status === "APPROVED") {
    return "Approved";
  }

  if (status === "INVOICED") {
    return "Invoiced";
  }

  return "In Process";
}

function buildEmployees(entries: PayrollEntry[]) {
  return Object.values(
    entries.reduce<Record<string, PayrollEmployee>>((acc, entry) => {
      if (!acc[entry.user.id]) {
        acc[entry.user.id] = {
          id: entry.user.id,
          fullName: entry.user.fullName,
          username: entry.user.username,
          email: entry.user.email,
          rate: entry.rate,
          hours: 0,
          amount: 0,
          entries: []
        };
      }

      acc[entry.user.id].hours += entry.totalHours;
      acc[entry.user.id].amount += entry.amount;
      acc[entry.user.id].entries.push(entry);
      return acc;
    }, {})
  ).sort((a, b) => b.hours - a.hours);
}

export function AdminPayrollPanel({ entries, settings, startDate, endDate, periodLabel, currentWeekHref }: Props) {
  const router = useRouter();
  const [rangeStart, setRangeStart] = useState(startDate);
  const [rangeEnd, setRangeEnd] = useState(endDate);
  const [recipient, setRecipient] = useState(settings.toEmail || "");
  const [ccEmails, setCcEmails] = useState(settings.ccEmails.join(", "));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const employees = useMemo(() => buildEmployees(entries), [entries]);
  const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  useEffect(() => {
    setRangeStart(startDate);
    setRangeEnd(endDate);
  }, [startDate, endDate]);

  async function saveSettings() {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/payroll", {
        method: "PUT",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          toEmail: recipient,
          ccEmails
        })
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to save payroll settings.");
        return;
      }

      setSuccess("Payroll email settings saved.");
      router.refresh();
    } catch {
      setError("Unable to save payroll settings.");
    } finally {
      setIsSaving(false);
    }
  }

  async function sendEmail() {
    setError("");
    setSuccess("");
    setIsSending(true);

    try {
      const response = await fetch("/api/admin/payroll", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          startDate,
          endDate,
          toEmail: recipient,
          ccEmails
        })
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to send the payroll email.");
        return false;
      }

      setSuccess("Payroll email sent successfully.");
      router.refresh();
      return true;
    } catch {
      setError("Unable to send the payroll email.");
      return false;
    } finally {
      setIsSending(false);
    }
  }

  function updateRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!rangeStart || !rangeEnd) {
      return;
    }

    router.push(`/panel?view=payroll&start=${rangeStart}&end=${rangeEnd}`);
  }

  return (
    <>
      <section className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Payroll emails</p>
            <h2 className="mt-3 max-w-xl font-[var(--font-display)] text-3xl font-bold text-white md:text-4xl">
              Weekly payroll summary
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand/70">
              Build a weekly payroll email, keep the recipient and CC list stored in the database, and send a clean summary
              like the sample you shared.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-left sm:text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-sand/45">Selected period</p>
            <p className="mt-2 text-lg font-semibold text-sand/75">{periodLabel}</p>
            <p className="mt-1 text-3xl font-bold text-white">{formatCurrency(totalAmount)}</p>
            <p className="mt-1 text-sm text-sand/60">{entries.length} records</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/20 p-4 sm:p-5">
          <form
            onSubmit={updateRange}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_auto_auto] xl:items-end"
          >
            <div className="min-w-0 space-y-2 overflow-hidden">
              <label htmlFor="payroll-start" className="block text-sm font-semibold text-sand">
                Start date
              </label>
              <input
                id="payroll-start"
                name="start"
                type="date"
                value={rangeStart}
                onChange={(event) => setRangeStart(event.target.value)}
                className="block w-full min-w-0 max-w-full appearance-none overflow-hidden rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </div>

            <div className="min-w-0 space-y-2 overflow-hidden">
              <label htmlFor="payroll-end" className="block text-sm font-semibold text-sand">
                End date
              </label>
              <input
                id="payroll-end"
                name="end"
                type="date"
                value={rangeEnd}
                onChange={(event) => setRangeEnd(event.target.value)}
                className="block w-full min-w-0 max-w-full appearance-none overflow-hidden rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-[3.5rem] w-full items-center justify-center rounded-full bg-amber-400 px-5 text-sm font-bold text-black transition hover:brightness-110 sm:col-span-2 xl:col-span-1"
            >
              Update range
            </button>

            <a
              href={currentWeekHref}
              className="inline-flex h-[3.5rem] w-full items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-sand/80 transition hover:border-white/30 hover:text-white sm:col-span-2 xl:col-span-1"
            >
              Current week
            </a>
          </form>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.1fr_1.1fr_auto] xl:items-end">
            <div className="min-w-0 space-y-2">
              <label htmlFor="payroll-to-email" className="block text-sm font-semibold text-sand">
                To email
              </label>
              <input
                id="payroll-to-email"
                type="email"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="payroll@company.com"
                className="w-full min-w-0 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </div>

            <div className="min-w-0 space-y-2">
              <label htmlFor="payroll-cc-emails" className="block text-sm font-semibold text-sand">
                CC emails
              </label>
              <input
                id="payroll-cc-emails"
                type="text"
                value={ccEmails}
                onChange={(event) => setCcEmails(event.target.value)}
                placeholder="copy1@company.com, copy2@company.com"
                className="w-full min-w-0 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </div>

            <button
              type="button"
              onClick={saveSettings}
              disabled={isSaving}
              className="inline-flex h-[3.5rem] w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2 xl:col-span-1"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            disabled={!entries.length}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-4 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send size={16} />
            Send payroll email
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-sand/60">Employees</p>
            <p className="mt-2 text-2xl font-bold text-white">{employees.length}</p>
          </article>
          <article className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-sand/60">Entries</p>
            <p className="mt-2 text-2xl font-bold text-white">{entries.length}</p>
          </article>
          <article className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-sand/60">Total hours</p>
            <p className="mt-2 text-2xl font-bold text-white">{totalHours.toFixed(2)} h</p>
          </article>
          <article className="rounded-[1.3rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm text-emerald-100/70">Total pay</p>
            <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
          </article>
        </div>

        {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-6 space-y-4">
          {employees.length ? (
            employees.map((employee) => (
              <article key={employee.id} className="rounded-[1.4rem] border border-white/10 bg-[#08101c] p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">{employee.fullName}</p>
                    <p className="mt-1 text-sm text-sand/60">@{employee.username}</p>
                    <p className="mt-1 text-sm text-sand/50">{employee.email || "No email on file"}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <span className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white">
                      {employee.hours.toFixed(2)} h
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-sand/75">
                      {formatCurrency(employee.rate)}/h
                    </span>
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
                      {formatCurrency(employee.amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {employee.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-2 rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {formatShortDate(entry.workDate)} · {entry.location}
                        </p>
                        <p className="text-xs text-sand/55">{entry.company || "Triple M Electric"}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-sand/75">
                          {entry.totalHours.toFixed(2)} h
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-sand/75">
                          {formatCurrency(entry.amount)}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                            entry.status === "INVOICED"
                              ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
                              : entry.status === "APPROVED"
                                ? "border-sky-300/25 bg-sky-300/10 text-sky-100"
                                : "border-amber-300/20 bg-amber-300/10 text-amber-200"
                          }`}
                        >
                          {getStatusLabel(entry.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-sand/65">
              No approved entries were found in the selected period.
            </div>
          )}
        </div>
      </section>

      {isPreviewOpen ? (
        <PayrollPreviewModal
          entries={entries}
          employees={employees}
          recipient={recipient}
          ccEmails={ccEmails}
          periodLabel={periodLabel}
          isSending={isSending}
          onClose={() => setIsPreviewOpen(false)}
          onConfirm={async () => {
            const ok = await sendEmail();
            if (ok) {
              setIsPreviewOpen(false);
            }
          }}
        />
      ) : null}
    </>
  );
}

function PayrollPreviewModal({
  entries,
  employees,
  recipient,
  ccEmails,
  periodLabel,
  isSending,
  onClose,
  onConfirm
}: {
  entries: PayrollEntry[];
  employees: PayrollEmployee[];
  recipient: string;
  ccEmails: string;
  periodLabel: string;
  isSending: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const ccList = ccEmails
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-[1.75rem] border border-white/10 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Preview email</p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">Weekly payroll summary</h3>
            <p className="mt-2 text-sm text-sand/65">{periodLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-sand/70 transition hover:border-white/25 hover:text-white"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6 md:px-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[1.1rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-sand/50">Recipient</p>
              <p className="mt-2 break-all text-sm font-semibold text-white">{recipient || "Not set"}</p>
            </article>
            <article className="rounded-[1.1rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-sand/50">CC</p>
              <p className="mt-2 text-sm font-semibold text-white">{ccList.length ? `${ccList.length} addresses` : "None"}</p>
            </article>
            <article className="rounded-[1.1rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-100/70">Total pay</p>
              <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
            </article>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[1.1rem] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-sand/60">Employees</p>
              <p className="mt-2 text-2xl font-bold text-white">{employees.length}</p>
            </article>
            <article className="rounded-[1.1rem] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-sand/60">Entries</p>
              <p className="mt-2 text-2xl font-bold text-white">{entries.length}</p>
            </article>
            <article className="rounded-[1.1rem] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-sand/60">Total hours</p>
              <p className="mt-2 text-2xl font-bold text-white">{totalHours.toFixed(2)} h</p>
            </article>
            <article className="rounded-[1.1rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm text-emerald-100/70">After send</p>
              <p className="mt-2 text-2xl font-bold text-white">Approved to invoiced</p>
            </article>
          </div>

          <div className="space-y-3">
            {employees.map((employee) => (
              <article key={employee.id} className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{employee.fullName}</p>
                    <p className="text-sm text-sand/55">@{employee.username}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-sand/75">
                      {employee.hours.toFixed(2)} h
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-sand/75">
                      {formatCurrency(employee.amount)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-sand/80 transition hover:border-white/30 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSending || !recipient}
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSending ? "Sending..." : "Send payroll email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
