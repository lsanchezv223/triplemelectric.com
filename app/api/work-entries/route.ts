import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { WorkEntryStatus } from "@prisma/client";
import { getCurrentUserFromSession } from "@/lib/auth/session";
import { getPublicBaseUrl } from "@/lib/admin/users";
import { calculateHours, parseDateInput, parseTimeForDate } from "@/lib/work-entries";
import { db } from "@/lib/db";
import { prepareAttachmentFile, uploadPreparedAttachmentToR2 } from "@/lib/r2";
import { sendWorkEntryChangeToAdmins } from "@/lib/admin/work-entry-notifications";

type WorkEntryPayload = {
  userId?: string;
  sharedWithUserIds?: string[];
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

function parseUserIdList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
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
    const targetUserId = user.role === "ADMIN" && body.userId ? String(body.userId) : user.id;
    const participantIds = Array.from(
      new Set([targetUserId, ...parseUserIdList(body.sharedWithUserIds).filter((id) => id !== targetUserId)])
    );
    const participants = await db.user.findMany({
      where: {
        id: { in: participantIds },
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true
      }
    });
    const participantsById = new Map(participants.map((participant) => [participant.id, participant]));
    const orderedParticipants = participantIds
      .map((participantId) => participantsById.get(participantId))
      .filter(Boolean) as NonNullable<(typeof participants)[number]>[];
    const targetUser = participantsById.get(targetUserId) || null;

    if (!targetUser || orderedParticipants.length !== participantIds.length) {
      return NextResponse.json({ ok: false, error: "Select a valid employee." }, { status: 400 });
    }

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
    const sharedGroupId = orderedParticipants.length > 1 ? randomUUID() : null;

    if (totalHours <= 0) {
      return NextResponse.json({ ok: false, error: "End time must be later than start time." }, { status: 400 });
    }

    const createdEntries = await db.$transaction(
      orderedParticipants.map((participant) =>
        db.workEntry.create({
          data: {
            userId: participant.id,
            sharedGroupId,
            workDate,
            clientName: clientName || null,
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
        })
      )
    );

    const preparedAttachments = attachments.length ? await Promise.all(attachments.map((file) => prepareAttachmentFile(file))) : [];

    if (preparedAttachments.length) {
      const uploadedAttachments = await Promise.all(
        preparedAttachments.map((attachment) => uploadPreparedAttachmentToR2({ entryId: createdEntries[0].id, attachment }))
      );

      await db.$transaction(
        createdEntries.map((createdEntry) =>
          db.workEntryAttachment.createMany({
            data: uploadedAttachments.map((attachment) => ({
              workEntryId: createdEntry.id,
              fileName: attachment.fileName,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              storageKey: attachment.storageKey
            }))
          })
        )
      );
    }

    void sendWorkEntryChangeToAdmins({
      baseUrl: getPublicBaseUrl(request),
      entry: {
        id: createdEntries[0].id,
        workDate: createdEntries[0].workDate.toISOString(),
        clientName: clientName || null,
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
          fullName: targetUser.fullName,
          username: targetUser.username
        },
        sharedWith:
          orderedParticipants.length > 1
            ? orderedParticipants
                .filter((participant) => participant.id !== targetUser.id)
                .map((participant) => participant.fullName)
            : []
      },
      actorName: user.fullName,
      action: "created",
      attachments: preparedAttachments
    }).catch((error) => {
      console.error("work-entries notification error:", error);
    });

    return NextResponse.json({ ok: true, entryId: createdEntries[0].id, sharedGroupId });
  } catch (error) {
    console.error("work-entries POST error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to save the work entry right now.",
        details: error instanceof Error ? error.message : "Unknown server error."
      },
      { status: 500 }
    );
  }
}
