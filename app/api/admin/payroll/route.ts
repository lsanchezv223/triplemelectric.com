import { NextResponse } from "next/server";
import { WorkEntryStatus } from "@prisma/client";
import { getCurrentUserFromSession } from "@/lib/auth/session";
import { isValidEmail, normalizeEmail } from "@/lib/admin/users";
import { db } from "@/lib/db";
import {
  buildPayrollReportSummary,
  getOrCreatePayrollEmailSettings,
  normalizePayrollCcEmails,
  sendPayrollSummaryEmail,
  upsertPayrollEmailSettings
} from "@/lib/admin/payroll";

type PayrollSettingsPayload = {
  toEmail?: string | null;
  ccEmails?: string | string[];
  startDate?: string;
  endDate?: string;
  action?: "send" | "invoice";
  entryIds?: string[];
};

function parseDateInput(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseCcEmails(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return normalizePayrollCcEmails(value.join(","));
  }

  return normalizePayrollCcEmails(value || "");
}

function parseEntryIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function validateEmails(toEmail: string | null, ccEmails: string[]) {
  if (toEmail && !isValidEmail(toEmail)) {
    return "Enter a valid recipient email address.";
  }

  if (ccEmails.some((email) => !isValidEmail(email))) {
    return "One or more CC emails are not valid.";
  }

  return null;
}

export async function GET() {
  const user = await getCurrentUserFromSession();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 403 });
  }

  const settings = await getOrCreatePayrollEmailSettings();
  return NextResponse.json({
    ok: true,
    settings: {
      toEmail: settings.toEmail,
      ccEmails: settings.ccEmails,
      enabled: settings.enabled
    }
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUserFromSession();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as PayrollSettingsPayload;
    const toEmail = body.toEmail ? normalizeEmail(String(body.toEmail)) : null;
    const ccEmails = parseCcEmails(body.ccEmails);
    const validationError = validateEmails(toEmail, ccEmails);

    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const settings = await upsertPayrollEmailSettings({
      toEmail,
      ccEmails
    });

    return NextResponse.json({
      ok: true,
      settings: {
        toEmail: settings.toEmail,
        ccEmails: settings.ccEmails,
        enabled: settings.enabled
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to save payroll settings right now." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromSession();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as PayrollSettingsPayload;
    const startDate = parseDateInput(body.startDate);
    const endDate = parseDateInput(body.endDate);
    const action = body.action === "invoice" ? "invoice" : "send";
    const toEmail = body.toEmail ? normalizeEmail(String(body.toEmail)) : null;
    const ccEmails = parseCcEmails(body.ccEmails);
    const entryIds = parseEntryIds(body.entryIds);

    if (!startDate || !endDate) {
      return NextResponse.json({ ok: false, error: "Select a valid date range." }, { status: 400 });
    }

    const summary = await buildPayrollReportSummary(startDate, endDate, entryIds);

    if (!summary.entryCount) {
      return NextResponse.json({ ok: false, error: "No approved entries were found for this range." }, { status: 400 });
    }

    if (action === "invoice") {
      await db.workEntry.updateMany({
        where: {
          status: WorkEntryStatus.APPROVED,
          workDate: {
            gte: startDate,
            lte: endDate
          },
          ...(entryIds.length ? { id: { in: entryIds } } : {})
        },
        data: {
          status: WorkEntryStatus.INVOICED
        }
      });

      return NextResponse.json({
        ok: true,
        summary,
        invoiced: true
      });
    }

    const validationError = validateEmails(toEmail, ccEmails);

    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const savedSettings = await upsertPayrollEmailSettings({
      toEmail,
      ccEmails
    });

    if (!savedSettings.toEmail) {
      return NextResponse.json({ ok: false, error: "Add a recipient email before sending." }, { status: 400 });
    }

    await sendPayrollSummaryEmail({
      startDate,
      endDate,
      toEmail: savedSettings.toEmail,
      ccEmails: savedSettings.ccEmails,
      entryIds
    });

    return NextResponse.json({
      ok: true,
      summary,
      settings: {
        toEmail: savedSettings.toEmail,
        ccEmails: savedSettings.ccEmails,
        enabled: savedSettings.enabled
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to send the payroll email right now." }, { status: 500 });
  }
}
