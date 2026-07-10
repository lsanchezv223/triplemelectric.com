import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromSession } from "@/lib/auth/session";
import { getAttachmentUrl } from "@/lib/r2";

async function getAccessibleEntry(entryId: string, userId: string, role: "EMPLOYEE" | "ADMIN") {
  if (role === "ADMIN") {
    return db.workEntry.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        userId: true
      }
    });
  }

  return db.workEntry.findFirst({
    where: {
      id: entryId,
      userId
    },
    select: {
      id: true,
      userId: true
    }
  });
}

export async function GET(_: Request, context: { params: Promise<{ entryId: string }> }) {
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

    const attachments = await db.workEntryAttachment.findMany({
      where: { workEntryId: entryId },
      orderBy: { createdAt: "asc" }
    });

    const items = await Promise.all(
      attachments.map(async (attachment) => ({
        id: attachment.id,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        createdAt: attachment.createdAt.toISOString(),
        url: await getAttachmentUrl(attachment.storageKey)
      }))
    );

    return NextResponse.json({ ok: true, attachments: items });
  } catch (error) {
    console.error("work-entries/[entryId]/attachments error:", error);
    return NextResponse.json({ ok: false, error: "Unable to load attachments right now." }, { status: 500 });
  }
}
