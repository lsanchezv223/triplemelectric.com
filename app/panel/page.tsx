import Link from "next/link";
import { WorkEntryStatus } from "@prisma/client";
import { ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, Receipt, Shield, Users, Wallet } from "lucide-react";
import { AdminRecordsPanel } from "@/components/admin-records-panel";
import { AdminInviteForm } from "@/components/admin-invite-form";
import { AdminPayrollPanel } from "@/components/admin-payroll-panel";
import { AdminOverviewRecords } from "@/components/admin-overview-records";
import { AdminUserManager } from "@/components/admin-user-manager";
import { EmployeeHoursPanel } from "@/components/employee-hours-panel";
import { EmployeeOverviewSegments } from "@/components/employee-overview-segments";
import { getOrCreatePayrollEmailSettings } from "@/lib/admin/payroll";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

type DashboardEntry = {
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
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getWeekStart(date: Date) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const offset = (utcDate.getUTCDay() + 6) % 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - offset);
  return utcDate;
}

function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + index);
    return date;
  });
}

function formatRangeDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function formatDateField(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function formatWeekdayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    timeZone: "UTC"
  }).format(date);
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function getEntryPaidAmount(entry: DashboardEntry) {
  if (entry.status === "IN_PROGRESS" || !entry.hourlyRate) {
    return null;
  }

  return entry.totalHours * entry.hourlyRate;
}

function parseRangeDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseStatusFilter(value?: string) {
  if (
    value === WorkEntryStatus.IN_PROGRESS ||
    value === WorkEntryStatus.APPROVED ||
    value === WorkEntryStatus.INVOICED
  ) {
    return value;
  }

  return "";
}

function getActiveView(role: "ADMIN" | "EMPLOYEE", view?: string) {
  if (role === "ADMIN") {
    return view === "team" || view === "overview" || view === "records" || view === "payroll" ? view : "overview";
  }

  return view === "hours" || view === "overview" ? view : "overview";
}

export default async function PanelPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string; start?: string; end?: string; employee?: string; status?: string; entry?: string; q?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const activeView = getActiveView(user.role, params.view);
  const users =
    user.role === "ADMIN"
      ? await db.user.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            invitations: {
              where: {
                acceptedAt: null
              },
              orderBy: {
                createdAt: "desc"
              },
              take: 1
            }
          }
        })
      : [];
  const serializedUsers =
    user.role === "ADMIN"
      ? users.map((teamUser) => ({
          id: teamUser.id,
          fullName: teamUser.fullName,
          username: teamUser.username,
          email: teamUser.email,
          role: teamUser.role,
          isActive: teamUser.isActive,
          hourlyRate: teamUser.hourlyRate ? Number(teamUser.hourlyRate) : null,
          hasPassword: Boolean(teamUser.passwordHash),
          pendingInviteExpiresAt: teamUser.invitations[0]?.expiresAt.toISOString() || null
        }))
      : [];
  const availableEmployees =
    user.role === "ADMIN"
      ? users
          .filter((teamUser) => teamUser.isActive)
          .map((teamUser) => ({
            id: teamUser.id,
            fullName: teamUser.fullName,
            role: teamUser.role,
            hourlyRate: teamUser.hourlyRate ? Number(teamUser.hourlyRate) : null
          }))
      : [];
  const sharedTeamMembers =
    user.role === "ADMIN"
      ? availableEmployees
      : (
          await db.user.findMany({
            where: {
              isActive: true
            },
            select: {
              id: true,
              fullName: true,
              role: true,
              hourlyRate: true
            }
          })
        ).map((teamUser) => ({
          id: teamUser.id,
          fullName: teamUser.fullName,
          role: teamUser.role,
          hourlyRate: teamUser.hourlyRate ? Number(teamUser.hourlyRate) : null
        }));
  const workEntries = await db.workEntry.findMany({
    where: { userId: user.id },
    include: {
      attachments: {
        select: {
          id: true
        }
      }
    },
    orderBy: [{ workDate: "desc" }, { startTime: "asc" }]
  });
  const serializedWorkEntries = workEntries.map((entry) => ({
    id: entry.id,
    sharedGroupId: entry.sharedGroupId,
    workDate: entry.workDate.toISOString(),
    clientName: entry.clientName,
    location: entry.location,
    startTime: entry.startTime?.toISOString() || null,
    endTime: entry.endTime?.toISOString() || null,
    breakMinutes: entry.breakMinutes,
    totalHours: Number(entry.totalHours),
    company: entry.company,
    notes: entry.notes,
    status: entry.status,
    hourlyRate: entry.hourlyRate ? Number(entry.hourlyRate) : null,
    attachmentsCount: entry.attachments.length
  }));
  const currentDate = new Date();
  const defaultWeekStart = getWeekStart(currentDate);
  const defaultWeekDays = getWeekDays(defaultWeekStart);
  const defaultWeekEnd = defaultWeekDays[6];
  const rangeStart = parseRangeDate(params.start) || defaultWeekStart;
  const rangeEnd = parseRangeDate(params.end) || defaultWeekEnd;
  const normalizedRangeStart = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
  const normalizedRangeEnd = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
  const rangeDays = Array.from(
    {
      length:
        Math.floor((normalizedRangeEnd.getTime() - normalizedRangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    },
    (_, index) => {
      const date = new Date(normalizedRangeStart);
      date.setUTCDate(normalizedRangeStart.getUTCDate() + index);
      return date;
    }
  );
  const rangeKeys = new Set(rangeDays.map(toDateKey));
  const filteredEntries = serializedWorkEntries.filter((entry) => rangeKeys.has(entry.workDate.slice(0, 10)));
  const entriesByDate = filteredEntries.reduce<Record<string, DashboardEntry[]>>((acc, entry) => {
    const key = entry.workDate.slice(0, 10);
    acc[key] = acc[key] || [];
    acc[key].push(entry);
    return acc;
  }, {});
  const totalHoursInRange = filteredEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const totalBreakMinutes = filteredEntries.reduce((sum, entry) => sum + entry.breakMinutes, 0);
  const totalSegments = filteredEntries.length;
  const activeDays = rangeDays.filter((date) => (entriesByDate[toDateKey(date)] || []).length > 0).length;
  const approvedSegments = filteredEntries.filter((entry) => entry.status === "APPROVED").length;
  const invoicedSegments = filteredEntries.filter((entry) => entry.status === "INVOICED").length;
  const inProgressSegments = filteredEntries.filter((entry) => entry.status === "IN_PROGRESS").length;
  const totalEarned = filteredEntries.reduce((sum, entry) => sum + (getEntryPaidAmount(entry) || 0), 0);
  const topLocations = Object.values(
    filteredEntries.reduce<Record<string, { location: string; hours: number; count: number; earned: number }>>((acc, entry) => {
      const key = entry.location.trim().toLowerCase();

      if (!acc[key]) {
        acc[key] = {
          location: entry.location,
          hours: 0,
          count: 0,
          earned: 0
        };
      }

      acc[key].hours += entry.totalHours;
      acc[key].count += 1;
      acc[key].earned += getEntryPaidAmount(entry) || 0;
      return acc;
    }, {})
  )
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 4);
  const recentSegments = [...filteredEntries]
    .sort((a, b) => {
      if (a.workDate === b.workDate) {
        return (b.startTime || "").localeCompare(a.startTime || "");
      }

      return b.workDate.localeCompare(a.workDate);
    })
    .slice(0, 5);
  const menuItems =
    user.role === "ADMIN"
      ? [
          { href: "/panel?view=overview", label: "Overview", key: "overview" },
          { href: "/panel?view=records", label: "Records", key: "records" },
          { href: "/panel?view=payroll", label: "Payroll", key: "payroll" },
          { href: "/panel?view=team", label: "Team", key: "team" }
        ]
      : [
          { href: "/panel?view=overview", label: "Overview", key: "overview" },
          { href: "/panel?view=hours", label: "Hours", key: "hours" }
        ];
  const employeeFilter = user.role === "ADMIN" && params.employee ? params.employee : "";
  const statusFilter = parseStatusFilter(params.status);
  const recordSearch = user.role === "ADMIN" && params.q ? params.q.trim() : "";
  const recordFilterStart = parseRangeDate(params.start);
  const recordFilterEnd = parseRangeDate(params.end);
  const hasRecordFilters = Boolean(params.start || params.end || params.employee || params.status || recordSearch);
  const recordSearchUserIds =
    user.role === "ADMIN" && recordSearch
      ? (
          await db.user.findMany({
            where: {
              OR: [
                { fullName: { contains: recordSearch, mode: "insensitive" } },
                { username: { contains: recordSearch, mode: "insensitive" } }
              ]
            },
            select: { id: true }
          })
        ).map((teamUser) => teamUser.id)
      : [];
  const recordRangeStart =
    recordFilterStart && recordFilterEnd
      ? recordFilterStart <= recordFilterEnd
        ? recordFilterStart
        : recordFilterEnd
      : recordFilterStart || recordFilterEnd;
  const recordRangeEnd =
    recordFilterStart && recordFilterEnd
      ? recordFilterStart <= recordFilterEnd
        ? recordFilterEnd
        : recordFilterStart
      : recordFilterEnd || recordFilterStart;
  const adminOverviewEntries =
    user.role === "ADMIN" && activeView === "overview"
      ? await db.workEntry.findMany({
          where: {
            workDate: {
              gte: normalizedRangeStart,
              lte: normalizedRangeEnd
            }
          },
          include: {
            attachments: {
              select: {
                id: true
              }
            },
            user: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          },
          orderBy: [{ workDate: "desc" }, { startTime: "desc" }]
        })
      : [];
  const serializedAdminOverviewEntries =
    user.role === "ADMIN"
      ? adminOverviewEntries.map((entry) => ({
          id: entry.id,
          sharedGroupId: entry.sharedGroupId,
          workDate: entry.workDate.toISOString(),
          clientName: entry.clientName,
          location: entry.location,
          startTime: entry.startTime?.toISOString() || null,
          endTime: entry.endTime?.toISOString() || null,
          breakMinutes: entry.breakMinutes,
          totalHours: Number(entry.totalHours),
          company: entry.company,
          notes: entry.notes,
          status: entry.status,
          hourlyRate: entry.hourlyRate ? Number(entry.hourlyRate) : null,
          attachmentsCount: entry.attachments.length,
          user: entry.user
        }))
      : [];
  const adminOverviewApprovedSegments = serializedAdminOverviewEntries.filter((entry) => entry.status === "APPROVED").length;
  const adminOverviewInvoicedSegments = serializedAdminOverviewEntries.filter((entry) => entry.status === "INVOICED").length;
  const adminOverviewInProgressSegments = serializedAdminOverviewEntries.filter((entry) => entry.status === "IN_PROGRESS").length;
  const adminRecordEntries =
    user.role === "ADMIN" && activeView === "records"
      ? await db.workEntry.findMany({
          where: {
            ...(hasRecordFilters ? {} : { status: WorkEntryStatus.IN_PROGRESS }),
            ...(employeeFilter ? { userId: employeeFilter } : {}),
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(recordSearch
              ? {
                  OR: [
                    { location: { contains: recordSearch, mode: "insensitive" } },
                    { clientName: { contains: recordSearch, mode: "insensitive" } },
                    { company: { contains: recordSearch, mode: "insensitive" } },
                    { notes: { contains: recordSearch, mode: "insensitive" } },
                    ...(recordSearchUserIds.length ? [{ userId: { in: recordSearchUserIds } }] : [])
                  ]
                }
              : {}),
            ...(recordRangeStart || recordRangeEnd
              ? {
                  workDate: {
                    ...(recordRangeStart ? { gte: recordRangeStart } : {}),
                    ...(recordRangeEnd ? { lte: recordRangeEnd } : {})
                  }
                }
              : {})
          },
          include: {
            attachments: {
              select: {
                id: true
              }
            },
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                hourlyRate: true
              }
            }
          },
          orderBy: [{ workDate: "desc" }, { startTime: "desc" }]
        })
      : [];
  const serializedAdminRecordEntries =
    user.role === "ADMIN"
      ? adminRecordEntries.map((entry) => ({
          id: entry.id,
          sharedGroupId: entry.sharedGroupId,
          workDate: entry.workDate.toISOString(),
          clientName: entry.clientName,
          location: entry.location,
          startTime: entry.startTime?.toISOString() || null,
          endTime: entry.endTime?.toISOString() || null,
          breakMinutes: entry.breakMinutes,
          totalHours: Number(entry.totalHours),
          company: entry.company,
          notes: entry.notes,
          status: entry.status,
          hourlyRate: entry.hourlyRate ? Number(entry.hourlyRate) : null,
          attachmentsCount: entry.attachments.length,
          user: {
            id: entry.user.id,
            fullName: entry.user.fullName,
            username: entry.user.username,
            hourlyRate: entry.user.hourlyRate ? Number(entry.user.hourlyRate) : null
          }
        }))
      : [];
  const payrollSettings =
    user.role === "ADMIN" && activeView === "payroll" ? await getOrCreatePayrollEmailSettings() : null;
  const payrollEntries =
    user.role === "ADMIN" && activeView === "payroll"
      ? await db.workEntry.findMany({
          where: {
            status: WorkEntryStatus.APPROVED,
            workDate: {
              gte: normalizedRangeStart,
              lte: normalizedRangeEnd
            }
          },
          include: {
            attachments: {
              select: {
                id: true
              }
            },
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                hourlyRate: true
              }
            }
          },
          orderBy: [{ workDate: "asc" }, { startTime: "asc" }]
        })
      : [];
  const serializedPayrollEntries =
    user.role === "ADMIN"
      ? payrollEntries.map((entry) => {
          const rate = Number(entry.user.hourlyRate || entry.hourlyRate || 0);
          const totalHours = Number(entry.totalHours);

          return {
            id: entry.id,
            sharedGroupId: entry.sharedGroupId,
            workDate: entry.workDate.toISOString(),
            startTime: entry.startTime?.toISOString() || null,
            endTime: entry.endTime?.toISOString() || null,
            clientName: entry.clientName,
            location: entry.location,
            company: entry.company,
            notes: entry.notes,
            totalHours,
            rate,
            amount: totalHours * rate,
            status: entry.status,
            attachmentsCount: entry.attachments.length,
            user: {
              id: entry.user.id,
              fullName: entry.user.fullName,
              username: entry.user.username,
              email: entry.user.email,
              hourlyRate: entry.user.hourlyRate ? Number(entry.user.hourlyRate) : null
            }
          };
        })
      : [];
  const recordSingleDate = recordRangeStart || recordRangeEnd;
  const recordPeriodLabel =
    recordRangeStart && recordRangeEnd
      ? recordRangeStart.getTime() === recordRangeEnd.getTime()
        ? formatRangeDate(recordRangeStart)
        : `${formatRangeDate(recordRangeStart)} - ${formatRangeDate(recordRangeEnd)}`
      : recordSingleDate
        ? formatRangeDate(recordSingleDate)
        : "All time";
  const currentWeekHref = `/panel?view=records&start=${toDateKey(defaultWeekStart)}&end=${toDateKey(defaultWeekEnd)}`;
  const payrollWeekHref = `/panel?view=payroll&start=${toDateKey(defaultWeekStart)}&end=${toDateKey(defaultWeekEnd)}`;

  return (
    <div className="space-y-6">
      <section className="rounded-[1.5rem] border border-white/10 bg-black/20 p-3">
        <nav className="flex flex-wrap gap-2">
          {menuItems.map((item) => {
            const isActive = activeView === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-ember text-white" : "text-sand/75 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </section>

      {activeView === "overview" ? (
        <>
          {user.role === "ADMIN" ? (
            <>
              <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,128,24,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Admin overview</p>
                        <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-white">
                          Team payroll snapshot
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand/70">
                          Summary of all employee hours recorded in the selected period, including what is still pending,
                          what has already been invoiced, and how much has been billed so far.
                        </p>
                      </div>

                      <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-right">
                        <p className="text-xs uppercase tracking-[0.14em] text-sand/45">Selected period</p>
                        <p className="mt-2 text-3xl font-bold text-white">
                          {formatRangeDate(normalizedRangeStart)} - {formatRangeDate(normalizedRangeEnd)}
                        </p>
                        <p className="mt-1 text-sm text-sand/60">{serializedAdminOverviewEntries.length} records</p>
                      </div>
                    </div>

                    <form className="grid gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <input type="hidden" name="view" value="overview" />
                      <div className="space-y-2">
                        <label htmlFor="admin-overview-start" className="block text-sm font-semibold text-sand">
                          Start date
                        </label>
                        <input
                          id="admin-overview-start"
                          name="start"
                          type="date"
                          defaultValue={toDateKey(normalizedRangeStart)}
                          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="admin-overview-end" className="block text-sm font-semibold text-sand">
                          End date
                        </label>
                        <input
                          id="admin-overview-end"
                          name="end"
                          type="date"
                          defaultValue={toDateKey(normalizedRangeEnd)}
                          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                        />
                      </div>

                      <div className="flex flex-col gap-3 md:col-span-2 md:flex-row xl:col-span-1 xl:self-end">
                        <button
                          type="submit"
                          className="rounded-full bg-ember px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
                        >
                          Update
                        </button>

                        <Link
                          href="/panel?view=overview"
                          className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-sand/80 transition hover:border-white/25 hover:text-white"
                        >
                          Current week
                        </Link>
                      </div>
                    </form>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <article className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-amber-300">
                          <Users size={18} />
                        </div>
                        <p className="mt-4 text-sm text-sand/60">Employees with hours</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {new Set(serializedAdminOverviewEntries.map((entry) => entry.user.id)).size}
                        </p>
                      </article>

                      <article className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-amber-300">
                          <Clock3 size={18} />
                        </div>
                        <p className="mt-4 text-sm text-sand/60">Total hours</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {serializedAdminOverviewEntries.reduce((sum, entry) => sum + entry.totalHours, 0).toFixed(2)} h
                        </p>
                      </article>

                      <article className="rounded-[1.35rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/15 text-emerald-100">
                          <Wallet size={18} />
                        </div>
                        <p className="mt-4 text-sm text-emerald-100/70">Billable amount</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {formatCurrency(
                            serializedAdminOverviewEntries.reduce((sum, entry) => sum + (getEntryPaidAmount(entry) || 0), 0)
                          )}
                        </p>
                      </article>

                      <article className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-amber-300">
                          <Receipt size={18} />
                        </div>
                        <p className="mt-4 text-sm text-sand/60">Pending records</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {serializedAdminOverviewEntries.filter((entry) => entry.status !== "INVOICED").length}
                        </p>
                      </article>
                    </div>
                  </div>
                </article>

                <article className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6 md:p-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Status summary</p>
                    <h3 className="mt-3 font-[var(--font-display)] text-2xl font-bold text-white">Hours by state</h3>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      {
                        label: "Approved",
                        count: adminOverviewApprovedSegments,
                        hours: serializedAdminOverviewEntries
                          .filter((entry) => entry.status === "APPROVED")
                          .reduce((sum, entry) => sum + entry.totalHours, 0),
                        tone: "border-sky-300/25 bg-sky-300/10 text-sky-100"
                      },
                      {
                        label: "Invoiced",
                        count: adminOverviewInvoicedSegments,
                        hours: serializedAdminOverviewEntries
                          .filter((entry) => entry.status === "INVOICED")
                          .reduce((sum, entry) => sum + entry.totalHours, 0),
                        tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                      },
                      {
                        label: "In progress",
                        count: adminOverviewInProgressSegments,
                        hours: serializedAdminOverviewEntries
                          .filter((entry) => entry.status === "IN_PROGRESS")
                          .reduce((sum, entry) => sum + entry.totalHours, 0),
                        tone: "border-amber-300/20 bg-amber-300/10 text-amber-200"
                      }
                    ].map((item) => (
                      <div key={item.label} className="rounded-[1.25rem] border border-white/10 bg-[#08101c] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${item.tone}`}>
                              {item.label}
                            </span>
                            <p className="mt-3 text-sm text-sand/60">{item.count} records</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">{item.hours.toFixed(2)} h</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/panel?view=records&start=${toDateKey(normalizedRangeStart)}&end=${toDateKey(normalizedRangeEnd)}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-sand/80 transition hover:border-white/25 hover:text-white"
                  >
                    Open records
                    <ArrowRight size={16} />
                  </Link>
                </article>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <article className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-ember text-white">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Employee summary</p>
                      <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">Team totals</h3>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {Object.values(
                      serializedAdminOverviewEntries.reduce<
                        Record<string, { id: string; fullName: string; username: string; hours: number; records: number; paid: number; pending: number }>
                      >((acc, entry) => {
                        if (!acc[entry.user.id]) {
                          acc[entry.user.id] = {
                            id: entry.user.id,
                            fullName: entry.user.fullName,
                            username: entry.user.username,
                            hours: 0,
                            records: 0,
                            paid: 0,
                            pending: 0
                          };
                        }

                        acc[entry.user.id].hours += entry.totalHours;
                        acc[entry.user.id].records += 1;
                        acc[entry.user.id].paid += getEntryPaidAmount(entry) || 0;
                        acc[entry.user.id].pending += entry.status === "IN_PROGRESS" ? 1 : 0;
                        return acc;
                      }, {})
                    )
                      .sort((a, b) => b.hours - a.hours)
                      .map((employee) => (
                        <article key={employee.id} className="rounded-[1.25rem] border border-white/10 bg-[#08101c] p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-lg font-bold text-white">{employee.fullName}</p>
                              <p className="mt-1 text-sm text-sand/60">@{employee.username}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white">
                                {employee.hours.toFixed(2)} h
                              </span>
                              <span className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-sand/75">
                                {employee.records} records
                              </span>
                              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
                                {formatCurrency(employee.paid)}
                              </span>
                              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm text-amber-200">
                                {employee.pending} pending
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                  </div>
                </article>

                <AdminOverviewRecords entries={serializedAdminOverviewEntries.slice(0, 6)} />
              </section>
            </>
          ) : (
            <>
          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,128,24,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Weekly overview</p>
                    <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-white">
                      {formatRangeDate(normalizedRangeStart)} - {formatRangeDate(normalizedRangeEnd)}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand/70">
                      Review any period you want. By default the panel opens on the current week, from Monday through
                      Sunday, and updates the summary, billed amount, and recorded work automatically.
                    </p>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-right">
                    <p className="text-xs uppercase tracking-[0.14em] text-sand/45">Selected period</p>
                    <p className="mt-2 text-3xl font-bold text-white">{totalHoursInRange.toFixed(2)} h</p>
                    <p className="mt-1 text-sm text-sand/60">{totalSegments} recorded segments</p>
                  </div>
                </div>

                <form className="grid gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <input type="hidden" name="view" value="overview" />
                  <div className="space-y-2">
                    <label htmlFor="start" className="block text-sm font-semibold text-sand">
                      Start date
                    </label>
                    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                      <span className="block pr-8 text-sm text-white">
                        {formatDateField(normalizedRangeStart)}
                      </span>
                      <input
                        id="start"
                        name="start"
                        type="date"
                        defaultValue={toDateKey(normalizedRangeStart)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="end" className="block text-sm font-semibold text-sand">
                      End date
                    </label>
                    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                      <span className="block pr-8 text-sm text-white">
                        {formatDateField(normalizedRangeEnd)}
                      </span>
                      <input
                        id="end"
                        name="end"
                        type="date"
                        defaultValue={toDateKey(normalizedRangeEnd)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:col-span-2 md:flex-row xl:col-span-1 xl:self-end">
                    <button
                      type="submit"
                      className="rounded-full bg-ember px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
                    >
                      Update
                    </button>

                    <Link
                      href="/panel?view=overview"
                      className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-sand/80 transition hover:border-white/25 hover:text-white"
                    >
                      Current week
                    </Link>
                  </div>
                </form>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <article className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-amber-300">
                      <CalendarDays size={18} />
                    </div>
                    <p className="mt-4 text-sm text-sand/60">Worked days</p>
                    <p className="mt-1 text-2xl font-bold text-white">{activeDays}</p>
                  </article>

                  <article className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-amber-300">
                      <Clock3 size={18} />
                    </div>
                    <p className="mt-4 text-sm text-sand/60">Break time</p>
                    <p className="mt-1 text-2xl font-bold text-white">{totalBreakMinutes} min</p>
                  </article>

                  <article className="rounded-[1.35rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/15 text-emerald-100">
                      <Receipt size={18} />
                    </div>
                    <p className="mt-4 text-sm text-emerald-100/70">Earned</p>
                    <p className="mt-1 text-2xl font-bold text-white">${totalEarned.toFixed(2)}</p>
                    <p className="mt-1 text-xs text-emerald-100/70">{invoicedSegments} invoiced segment{invoicedSegments === 1 ? "" : "s"}</p>
                  </article>

                  <article className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-amber-300">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="mt-4 text-sm text-sand/60">In progress</p>
                    <p className="mt-1 text-2xl font-bold text-white">{inProgressSegments}</p>
                  </article>
                </div>
              </div>
            </article>

            <article className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Week status</p>
                  <h3 className="mt-3 font-[var(--font-display)] text-2xl font-bold text-white">Daily breakdown</h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {rangeDays.map((date) => {
                  const key = toDateKey(date);
                  const dailyEntries = entriesByDate[key] || [];
                  const dailyHours = dailyEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
                  const dailyEarned = dailyEntries.reduce((sum, entry) => sum + (getEntryPaidAmount(entry) || 0), 0);
                  const isToday = key === toDateKey(currentDate);

                  return (
                    <div
                      key={key}
                      className={`rounded-[1.2rem] border px-4 py-3 ${
                        isToday
                          ? "border-amber-300/35 bg-amber-300/10"
                          : dailyEntries.length
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-white/8 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{formatWeekdayLabel(date)}</p>
                          <p className="mt-1 text-xs text-sand/55">{formatRangeDate(date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{dailyHours ? `${dailyHours.toFixed(2)} h` : "--"}</p>
                          <p className="mt-1 text-xs text-sand/55">
                            {dailyEntries.length ? `${dailyEntries.length} segment${dailyEntries.length === 1 ? "" : "s"}` : "No records"}
                          </p>
                          {dailyEarned ? <p className="mt-1 text-xs font-semibold text-emerald-200">${dailyEarned.toFixed(2)}</p> : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-ember text-white">
                  <BriefcaseBusiness size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Top job sites</p>
                  <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">Where the week went</h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {topLocations.length ? (
                  topLocations.map((item) => (
                    <div key={item.location} className="rounded-[1.25rem] border border-white/10 bg-[#08101c] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-bold text-white">{item.location}</p>
                          <p className="mt-1 text-sm text-sand/60">{item.count} segment{item.count === 1 ? "" : "s"} this week</p>
                          {item.earned ? <p className="mt-2 text-xs font-semibold text-emerald-200">${item.earned.toFixed(2)} billed</p> : null}
                        </div>
                        <div className="rounded-full border border-white/10 px-3 py-1.5 text-sm font-semibold text-white">
                          {item.hours.toFixed(2)} h
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-sand/65">
                    No work segments have been added for this week yet.
                  </div>
                )}
              </div>
            </article>

            <EmployeeOverviewSegments entries={recentSegments} openHoursHref="/panel?view=hours" />
          </section>
            </>
          )}
        </>
      ) : null}

      {user.role === "ADMIN" && activeView === "team" ? (
        <>
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">New invitation</p>
              <h3 className="mt-3 font-[var(--font-display)] text-2xl font-bold text-white">Create a user and assign a role</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-sand/70">
                Only admins can send invitations. The email will include a secure link so the user can create their password
                and enter the employee panel.
              </p>
              <div className="mt-6">
                <AdminInviteForm />
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Access policy</p>
              <h3 className="mt-3 font-[var(--font-display)] text-2xl font-bold text-white">Admin-only tools</h3>
              <div className="mt-5 space-y-3 text-sm leading-relaxed text-sand/75">
                <p>Admins can create users and choose between `Employee` and `Admin` roles.</p>
                <p>Every invited user receives an email to create a password from a private link.</p>
                <p>Users who have not completed the invitation cannot sign in until they set their password.</p>
              </div>
            </article>
          </section>

          <AdminUserManager currentAdminId={user.id} users={serializedUsers} />
        </>
      ) : null}

      {user.role === "ADMIN" && activeView === "payroll" ? (
        <AdminPayrollPanel
          entries={serializedPayrollEntries}
          settings={{
            toEmail: payrollSettings?.toEmail || null,
            ccEmails: payrollSettings?.ccEmails || [],
            enabled: payrollSettings?.enabled ?? true
          }}
          startDate={toDateKey(normalizedRangeStart)}
          endDate={toDateKey(normalizedRangeEnd)}
          periodLabel={recordPeriodLabel}
          currentWeekHref={payrollWeekHref}
        />
      ) : null}

      {user.role === "ADMIN" && activeView === "records" ? (
        <AdminRecordsPanel
          entries={serializedAdminRecordEntries}
          users={availableEmployees}
          currentAdminId={user.id}
          currentAdminName={user.fullName}
          filters={{
            start: params.start || "",
            end: params.end || "",
            employee: employeeFilter,
            status: statusFilter,
            q: recordSearch
          }}
          currentWeekHref={currentWeekHref}
          periodLabel={recordPeriodLabel}
          focusEntryId={params.entry || null}
        />
      ) : null}

      {activeView === "hours" ? (
              <EmployeeHoursPanel entries={serializedWorkEntries} currentUserRole={user.role} coworkers={sharedTeamMembers.filter((member) => member.id !== user.id)} currentUserId={user.id} />
      ) : null}
    </div>
  );
}
