import { NextResponse } from "next/server";
import { WorkEntryStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUserFromSession } from "@/lib/auth/session";
import { getPublicBaseUrl } from "@/lib/admin/users";
import { calculateHours, parseDateInput, parseTimeForDate } from "@/lib/work-entries";
import { deleteAttachmentFromR2, prepareAttachmentFile, uploadPreparedAttachmentToR2 } from "@/lib/r2";
import { sendWorkEntryChangeToAdmins } from "@/lib/admin/work-entry-notifications";

type WorkEntryPayload = {
  workDate?: string;
  clientName?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  company?: string;
  notes?: string;
  status?: string;
  hourlyRate?: number | string | null;
};

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

async function getAccessibleEntry(entryId: string, userId: string, role: "EMPLOYEE" | "ADMIN") {
  if (role === "ADMIN") {
    return db.workEntry.findUnique({
      where: { id: entryId },
      include: {
        user: {
          select: {
            fullName: true,
            username: true
          }
        }
      }
    });
  }

  return db.workEntry.findFirst({
    where: {
      id: entryId,
      userId
    },
    include: {
      user: {
        select: {
          fullName: true,
          username: true
        }
      }
    }
  });
}

export async function PUT(request: Request, context: { params: Promise<{ entryId: string }> }) {
  const user = await getCurrentUserFromSession();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { entryId } = await context.params;
    const entry = await getAccessibleEntry(entryId, user.id, user.role);

    if (!entry) {
      return NextResponse.json({ ok: false, error: "Entry not found." }, { status: 404 });
    }

    if (entry.status !== WorkEntryStatus.IN_PROGRESS && user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "Approved or invoiced entries cannot be modified from the record editor." },
        { status: 403 }
      );
    }

    const { payload: body, attachments } = await parseEntryRequest(request);
    const workDateInput = String(body.workDate || "");
    const clientName = String(body.clientName || "").trim();
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
      return NextResponse.json({ ok: false, error: "Only admins can change the record status." }, { status: 403 });
    }

    if (body.hourlyRate !== undefined && user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Only admins can change the hourly rate." }, { status: 403 });
    }

    if (breakMinutes < 0 || breakMinutes > 600) {
      return NextResponse.json({ ok: false, error: "Break time is not valid." }, { status: 400 });
    }

    if (hourlyRate !== null && (Number.isNaN(hourlyRate) || hourlyRate <= 0 || hourlyRate > 100000)) {
      return NextResponse.json({ ok: false, error: "Hourly rate is not valid." }, { status: 400 });
    }

    const nextStatus = user.role === "ADMIN" ? requestedStatus || entry.status : entry.status;
    const nextHourlyRate =
      nextStatus === WorkEntryStatus.APPROVED || nextStatus === WorkEntryStatus.INVOICED
        ? hourlyRate ?? Number(entry.hourlyRate ?? 0)
        : null;

    if (
      (nextStatus === WorkEntryStatus.APPROVED || nextStatus === WorkEntryStatus.INVOICED) &&
      !nextHourlyRate
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

    const updatedEntry = await db.workEntry.update({
      where: { id: entryId },
      data: {
        workDate,
        clientName: clientName || null,
        location,
        startTime,
        endTime,
        breakMinutes,
        totalHours,
        company: company || null,
        notes: notes || null,
        status: nextStatus,
        hourlyRate:
          nextStatus === WorkEntryStatus.APPROVED || nextStatus === WorkEntryStatus.INVOICED
            ? nextHourlyRate
            : null
      }
    });

    const preparedAttachments = attachments.length ? await Promise.all(attachments.map((file) => prepareAttachmentFile(file))) : [];

    if (preparedAttachments.length) {
      const uploadedAttachments = await Promise.all(
        preparedAttachments.map((attachment) => uploadPreparedAttachmentToR2({ entryId, attachment }))
      );

      await db.workEntryAttachment.createMany({
        data: uploadedAttachments.map((attachment) => ({
          workEntryId: entryId,
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
        id: updatedEntry.id,
        workDate: updatedEntry.workDate.toISOString(),
        clientName: updatedEntry.clientName,
        location: updatedEntry.location,
        startTime: updatedEntry.startTime?.toISOString() || null,
        endTime: updatedEntry.endTime?.toISOString() || null,
        breakMinutes: updatedEntry.breakMinutes,
        totalHours: Number(updatedEntry.totalHours),
        company: updatedEntry.company,
        notes: updatedEntry.notes,
        status: updatedEntry.status,
        hourlyRate: updatedEntry.hourlyRate ? Number(updatedEntry.hourlyRate) : null,
        user: {
          fullName: entry.user.fullName,
          username: entry.user.username
        }
      },
      actorName: user.fullName,
      action: "updated",
      attachments: preparedAttachments
    }).catch((error) => {
      console.error("work-entries notification error:", error);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("work-entries PUT error:", error);
    return NextResponse.json({ ok: false, error: "Unable to update the work entry right now." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ entryId: string }> }) {
  const user = await getCurrentUserFromSession();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { entryId } = await context.params;
    const entry = await getAccessibleEntry(entryId, user.id, user.role);

    if (!entry) {
      return NextResponse.json({ ok: false, error: "Entry not found." }, { status: 404 });
    }

    if (entry.status !== WorkEntryStatus.IN_PROGRESS && user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "Approved or invoiced entries cannot be removed from the record editor." },
        { status: 403 }
      );
    }

    const attachments = await db.workEntryAttachment.findMany({
      where: { workEntryId: entryId },
      select: { storageKey: true }
    });

    await Promise.all(attachments.map((attachment) => deleteAttachmentFromR2(attachment.storageKey)));

    await db.workEntry.delete({
      where: { id: entryId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("work-entries DELETE error:", error);
    return NextResponse.json({ ok: false, error: "Unable to delete the work entry right now." }, { status: 500 });
  }
}
