import { NextResponse } from "next/server";
import { WorkEntryStatus } from "@prisma/client";
import { getCurrentUserFromSession } from "@/lib/auth/session";
import { getPublicBaseUrl } from "@/lib/admin/users";
import { calculateHours, parseDateInput, parseTimeForDate } from "@/lib/work-entries";
import { db } from "@/lib/db";
import { prepareAttachmentFile, uploadPreparedAttachmentToR2 } from "@/lib/r2";
import { sendWorkEntryChangeToAdmins } from "@/lib/admin/work-entry-notifications";

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

async function parseEntryRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const payload = JSON.parse(String(formData.get("payload") || "{}")) as WorkEntryPayload;
    const attachments = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File && value.size > 0);

    return { payload, attachments };
  }

  const payload = (await request.json()) as WorkEntryPayload;
  return { payload, attachments: [] as File[] };
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromSession();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { payload: body, attachments } = await parseEntryRequest(request);
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

    const preparedAttachments = attachments.length ? await Promise.all(attachments.map((file) => prepareAttachmentFile(file))) : [];

    if (preparedAttachments.length) {
      const uploadedAttachments = await Promise.all(
        preparedAttachments.map((attachment) => uploadPreparedAttachmentToR2({ entryId: entry.id, attachment }))
      );

      await db.workEntryAttachment.createMany({
        data: uploadedAttachments.map((attachment) => ({
          workEntryId: entry.id,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
          storageKey: attachment.storageKey
        }))
      });

    }

    void sendWorkEntryChangeToAdmins({
      baseUrl: getPublicBaseUrl(request),
      entry: {
        id: entry.id,
        workDate: entry.workDate.toISOString(),
        location,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        breakMinutes,
        totalHours,
        company: company || null,
        notes: notes || null,
        status: requestedStatus || WorkEntryStatus.IN_PROGRESS,
        hourlyRate:
          requestedStatus === WorkEntryStatus.APPROVED || requestedStatus === WorkEntryStatus.INVOICED
            ? hourlyRate
            : null,
        user: {
          fullName: user.fullName,
          username: user.username
        }
      },
      actorName: user.fullName,
      action: "created",
      attachments: preparedAttachments
    }).catch((error) => {
      console.error("work-entries notification error:", error);
    });

    return NextResponse.json({ ok: true, entryId: entry.id });
  } catch (error) {
    console.error("work-entries POST error:", error);
    return NextResponse.json({ ok: false, error: "Unable to save the work entry right now." }, { status: 500 });
  }
}
