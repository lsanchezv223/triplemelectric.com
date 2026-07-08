import { NextResponse } from "next/server";
import { WorkEntryStatus } from "@prisma/client";
import { getCurrentUserFromSession } from "@/lib/auth/session";
import { calculateHours, parseDateInput, parseTimeForDate } from "@/lib/work-entries";
import { db } from "@/lib/db";

type WorkEntryPayload = {
  workDate?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  company?: string;
  notes?: string;
  status?: string;
  hourlyRate?: number | string | null;
};

function parseWorkEntryStatus(value?: string) {
  if (!value) {
    return null;
  }

  if (
    value === WorkEntryStatus.IN_PROGRESS ||
    value === WorkEntryStatus.APPROVED ||
    value === WorkEntryStatus.INVOICED
  ) {
    return value;
  }

  return WorkEntryStatus.IN_PROGRESS;
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromSession();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as WorkEntryPayload;
    const workDateInput = String(body.workDate || "");
    const location = String(body.location || "").trim();
    const startTimeInput = String(body.startTime || "");
    const endTimeInput = String(body.endTime || "");
    const breakMinutes = Number(body.breakMinutes || 0);
    const company = String(body.company || "").trim();
    const notes = String(body.notes || "").trim();
    const requestedStatus = parseWorkEntryStatus(body.status);
    const hourlyRate = body.hourlyRate === null || body.hourlyRate === undefined || body.hourlyRate === ""
      ? null
      : Number(body.hourlyRate);

    if (!workDateInput || !location || !startTimeInput || !endTimeInput) {
      return NextResponse.json({ ok: false, error: "Complete date, location, start time, and end time." }, { status: 400 });
    }

    if (body.status && user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Only admins can set the invoice status." }, { status: 403 });
    }

    if (body.hourlyRate !== undefined && user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Only admins can set the hourly rate." }, { status: 403 });
    }

    if (breakMinutes < 0 || breakMinutes > 600) {
      return NextResponse.json({ ok: false, error: "Break time is not valid." }, { status: 400 });
    }

    if (hourlyRate !== null && (Number.isNaN(hourlyRate) || hourlyRate <= 0 || hourlyRate > 100000)) {
      return NextResponse.json({ ok: false, error: "Hourly rate is not valid." }, { status: 400 });
    }

    if (
      (requestedStatus === WorkEntryStatus.APPROVED || requestedStatus === WorkEntryStatus.INVOICED) &&
      !hourlyRate
    ) {
      return NextResponse.json(
        { ok: false, error: "Enter the hourly rate before marking an entry as approved or invoiced." },
        { status: 400 }
      );
    }

    const workDate = parseDateInput(workDateInput);
    const startTime = parseTimeForDate(workDateInput, startTimeInput);
    const endTime = parseTimeForDate(workDateInput, endTimeInput);

    if (!workDate || !startTime || !endTime) {
      return NextResponse.json({ ok: false, error: "Date or time format is invalid." }, { status: 400 });
    }

    const totalHours = calculateHours(startTime, endTime, breakMinutes);

    if (totalHours <= 0) {
      return NextResponse.json({ ok: false, error: "End time must be later than start time." }, { status: 400 });
    }

    const entry = await db.workEntry.create({
      data: {
        userId: user.id,
        workDate,
        location,
        startTime,
        endTime,
        breakMinutes,
        totalHours,
        company: company || null,
        notes: notes || null,
        status: requestedStatus || WorkEntryStatus.IN_PROGRESS,
        hourlyRate:
          requestedStatus === WorkEntryStatus.APPROVED || requestedStatus === WorkEntryStatus.INVOICED
            ? hourlyRate
            : null
      }
    });

    return NextResponse.json({ ok: true, entryId: entry.id });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to save the work entry right now." }, { status: 500 });
  }
}
