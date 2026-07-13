import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const PAYROLL_SETTINGS_KEY = "weekly-payroll";

export type PayrollEmailSettings = {
  id: string;
  key: string;
  toEmail: string | null;
  ccEmails: string[];
  enabled: boolean;
};

export type PayrollEntrySummary = {
  id: string;
  workDate: string;
  clientName: string | null;
  location: string;
  company: string | null;
  totalHours: number;
  rate: number;
  amount: number;
  status: "IN_PROGRESS" | "APPROVED" | "INVOICED";
};

export type PayrollEmployeeSummary = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  rate: number;
  hours: number;
  amount: number;
  entries: PayrollEntrySummary[];
};

export type PayrollWeekEmployeeSummary = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  rate: number;
  hours: number;
  amount: number;
};

export type PayrollWeekSummary = {
  startDate: string;
  endDate: string;
  label: string;
  totalHours: number;
  totalAmount: number;
  employeeCount: number;
  entryCount: number;
  employees: PayrollWeekEmployeeSummary[];
};

export type PayrollReportSummary = {
  startDate: string;
  endDate: string;
  totalHours: number;
  totalAmount: number;
  employeeCount: number;
  entryCount: number;
  employees: PayrollEmployeeSummary[];
  weeks: PayrollWeekSummary[];
};

function parseEmailList(value: string | null | undefined) {
  if (!value) {
    return [] as string[];
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index);
}

function formatPayrollDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function formatPayrollWeekRange(startDate: Date, endDate: Date) {
  const startMonth = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(startDate);
  const endMonth = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(endDate);

  return startDate.getUTCMonth() === endDate.getUTCMonth() && startDate.getUTCFullYear() === endDate.getUTCFullYear()
    ? `${new Intl.DateTimeFormat("en-CA", { month: "long", day: "numeric", timeZone: "UTC" }).format(startDate)} - ${new Intl.DateTimeFormat("en-CA", { day: "numeric", timeZone: "UTC" }).format(endDate)}`
    : `${startMonth} - ${endMonth}`;
}

function toUtcDateOnly(value: string | Date) {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  return new Date(`${value.slice(0, 10)}T00:00:00Z`);
}

function getWeekStart(date: Date) {
  const next = toUtcDateOnly(date);
  const offset = (next.getUTCDay() + 6) % 7;
  next.setUTCDate(next.getUTCDate() - offset);
  return next;
}

function getWeekEnd(date: Date) {
  const next = getWeekStart(date);
  next.setUTCDate(next.getUTCDate() + 6);
  return next;
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizePayrollCcEmails(value: string) {
  return parseEmailList(value);
}

export async function getOrCreatePayrollEmailSettings() {
  const existing = await db.payrollEmailSettings.findUnique({
    where: { key: PAYROLL_SETTINGS_KEY }
  });

  if (existing) {
    return existing;
  }

  return db.payrollEmailSettings.create({
    data: {
      key: PAYROLL_SETTINGS_KEY,
      toEmail: process.env.PAYROLL_TO_EMAIL?.trim() || null,
      ccEmails: parseEmailList(process.env.PAYROLL_CC_EMAILS)
    }
  });
}

export async function upsertPayrollEmailSettings({
  toEmail,
  ccEmails
}: {
  toEmail: string | null;
  ccEmails: string[];
}) {
  return db.payrollEmailSettings.upsert({
    where: { key: PAYROLL_SETTINGS_KEY },
    update: {
      toEmail,
      ccEmails
    },
    create: {
      key: PAYROLL_SETTINGS_KEY,
      toEmail,
      ccEmails
    }
  });
}

export async function buildPayrollReportSummary(startDate: Date, endDate: Date, entryIds?: string[]) {
  const entries = await db.workEntry.findMany({
    where: {
      status: "APPROVED",
      workDate: {
        gte: startDate,
        lte: endDate
      },
      ...(entryIds?.length ? { id: { in: entryIds } } : {})
    },
    include: {
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
  });

  const employees = Object.values(
    entries.reduce<Record<string, PayrollEmployeeSummary>>((acc, entry) => {
      const rate = toNumber(entry.hourlyRate ?? entry.user.hourlyRate);
      const hours = Number(entry.totalHours);
      const amount = hours * rate;
      const key = entry.user.id;

      if (!acc[key]) {
        acc[key] = {
          id: entry.user.id,
          fullName: entry.user.fullName,
          username: entry.user.username,
          email: entry.user.email,
          rate,
          hours: 0,
          amount: 0,
          entries: []
        };
      }

      acc[key].hours += hours;
      acc[key].amount += amount;
      acc[key].entries.push({
        id: entry.id,
        workDate: entry.workDate.toISOString(),
        clientName: entry.clientName,
        location: entry.location,
        company: entry.company,
        totalHours: hours,
        rate,
        amount,
        status: entry.status
      });
      return acc;
    }, {})
  ).sort((a, b) => b.hours - a.hours);

  const weekMap = entries.reduce<Record<string, PayrollWeekSummary>>((acc, entry) => {
    const entryDate = toUtcDateOnly(entry.workDate);
    const weekStart = getWeekStart(entryDate);
    const weekEnd = getWeekEnd(entryDate);
    const key = weekStart.toISOString().slice(0, 10);
    const rate = toNumber(entry.hourlyRate ?? entry.user.hourlyRate);
    const hours = Number(entry.totalHours);
    const amount = hours * rate;

    if (!acc[key]) {
      acc[key] = {
        startDate: weekStart.toISOString().slice(0, 10),
        endDate: weekEnd.toISOString().slice(0, 10),
        label: formatPayrollWeekRange(weekStart, weekEnd),
        totalHours: 0,
        totalAmount: 0,
        employeeCount: 0,
        entryCount: 0,
        employees: []
      };
    }

    const week = acc[key];
    let employee = week.employees.find((item) => item.id === entry.user.id);

    if (!employee) {
      employee = {
        id: entry.user.id,
        fullName: entry.user.fullName,
        username: entry.user.username,
        email: entry.user.email,
        rate,
        hours: 0,
        amount: 0
      };
      week.employees.push(employee);
    }

    employee.hours += hours;
    employee.amount += amount;
    week.totalHours += hours;
    week.totalAmount += amount;
    week.entryCount += 1;
    week.employeeCount = week.employees.length;
    return acc;
  }, {});

  const weeks = Object.values(weekMap).sort((a, b) => a.startDate.localeCompare(b.startDate));

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    totalHours: employees.reduce((sum, item) => sum + item.hours, 0),
    totalAmount: employees.reduce((sum, item) => sum + item.amount, 0),
    employeeCount: employees.length,
    entryCount: entries.length,
    employees,
    weeks
  } satisfies PayrollReportSummary;
}

export function buildPayrollEmailText(summary: PayrollReportSummary) {
  const lines = [
    `Payroll summary ${formatPayrollDate(summary.startDate)} - ${formatPayrollDate(summary.endDate)}`,
    `Total employees: ${summary.employeeCount}`,
    `Total hours: ${summary.totalHours.toFixed(2)}`,
    `Total amount: $${summary.totalAmount.toFixed(2)}`,
    ""
  ];

  for (const week of summary.weeks) {
    lines.push(week.label);

    for (const employee of week.employees) {
      lines.push(
        `${employee.fullName} ${employee.hours.toFixed(2)} hours`,
        `Rate: $${employee.rate.toFixed(2)}/h | Amount: $${employee.amount.toFixed(2)}`
      );
    }

    lines.push("");
  }

  return lines.join("\n");
}

export function buildPayrollEmailHtml(summary: PayrollReportSummary) {
  const weekBlocks = summary.weeks
    .map((week) => {
      const weekRows = week.employees
        .map(
          (person) => `
            <tr>
              <td style="padding:10px 0;color:#ffffff;font-weight:700;">${person.fullName}</td>
              <td style="padding:10px 0;color:#cbd5e1;">@${person.username}</td>
              <td style="padding:10px 0;color:#ffffff;text-align:right;">${person.hours.toFixed(2)} hours</td>
            </tr>
            <tr>
              <td colspan="3" style="padding:0 0 6px 0;color:#86efac;text-align:right;font-size:13px;">
                Rate: $${person.rate.toFixed(2)}/h · Amount: $${person.amount.toFixed(2)}
              </td>
            </tr>
          `
        )
        .join("");

      return `
        <div style="margin:22px 0 14px 0;padding-top:18px;border-top:1px solid rgba(255,255,255,0.12);">
          <div style="font-size:18px;font-weight:700;color:#ffffff;">${week.label}</div>
          <div style="margin-top:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              ${weekRows}
            </table>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#060b16;color:#e5e7eb;padding:24px;">
      <div style="max-width:760px;margin:0 auto;background:#0b1220;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;">
        <div style="text-transform:uppercase;letter-spacing:0.16em;color:#fcd34d;font-size:12px;font-weight:700;">Payroll</div>
        <h1 style="margin:12px 0 8px 0;color:#ffffff;font-size:28px;line-height:1.2;">${formatPayrollDate(summary.startDate)} - ${formatPayrollDate(summary.endDate)}</h1>
        <p style="margin:0 0 24px 0;color:#94a3b8;font-size:14px;">Weekly payroll summary for the selected period.</p>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
          <tr>
            <td style="padding:14px 16px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:rgba(255,255,255,0.03);">
              <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Employees</div>
              <div style="margin-top:8px;font-size:28px;font-weight:700;color:#ffffff;">${summary.employeeCount}</div>
            </td>
            <td style="width:12px;"></td>
            <td style="padding:14px 16px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:rgba(255,255,255,0.03);">
              <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Hours</div>
              <div style="margin-top:8px;font-size:28px;font-weight:700;color:#ffffff;">${summary.totalHours.toFixed(2)}</div>
            </td>
            <td style="width:12px;"></td>
            <td style="padding:14px 16px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:rgba(16,185,129,0.12);">
              <div style="font-size:12px;color:#a7f3d0;text-transform:uppercase;letter-spacing:0.1em;">Amount</div>
              <div style="margin-top:8px;font-size:28px;font-weight:700;color:#ffffff;">$${summary.totalAmount.toFixed(2)}</div>
            </td>
          </tr>
        </table>

        ${summary.weeks
          .map(
            (week) => `
              <div style="margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.12);">
                <div style="font-size:18px;font-weight:700;color:#ffffff;margin-bottom:12px;">${week.label}</div>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  ${week.employees
                    .map(
                      (person) => `
                        <tr>
                          <td style="padding:8px 0;color:#ffffff;font-weight:700;">${person.fullName}</td>
                          <td style="padding:8px 0;color:#94a3b8;">@${person.username}</td>
                          <td style="padding:8px 0;color:#fcd34d;text-align:right;">${person.hours.toFixed(2)} hours</td>
                        </tr>
                        <tr>
                          <td colspan="3" style="padding:0 0 6px 0;color:#86efac;text-align:right;font-size:13px;">
                            Rate: $${person.rate.toFixed(2)}/h · Amount: $${person.amount.toFixed(2)}
                          </td>
                        </tr>
                      `
                    )
                    .join("")}
                </table>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

export async function sendPayrollSummaryEmail({
  startDate,
  endDate,
  toEmail,
  ccEmails,
  entryIds
}: {
  startDate: Date;
  endDate: Date;
  toEmail: string;
  ccEmails: string[];
  entryIds?: string[];
}) {
  const summary = await buildPayrollReportSummary(startDate, endDate, entryIds);
  const subject = `Payroll ${formatPayrollDate(summary.startDate)} - ${formatPayrollDate(summary.endDate)}`;
  const text = buildPayrollEmailText(summary);
  const html = buildPayrollEmailHtml(summary);

  await sendEmail({
    to: toEmail,
    cc: ccEmails,
    subject,
    text,
    html
  });

  return summary;
}
