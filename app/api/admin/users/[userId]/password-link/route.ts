import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromSession } from "@/lib/auth/session";
import { sendUserAccessLink } from "@/lib/admin/users";

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  const admin = await getCurrentUserFromSession();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { userId } = await context.params;
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.email) {
      return NextResponse.json({ ok: false, error: "This user does not have a valid email address." }, { status: 400 });
    }

    if (!user.isActive) {
      return NextResponse.json({ ok: false, error: "Enable the user before sending a password link." }, { status: 400 });
    }

    const expiresAt = await sendUserAccessLink({
      userId: user.id,
      invitedById: admin.id,
      email: user.email,
      fullName: user.fullName,
      requestUrl: request.url,
      mode: user.passwordHash ? "reset" : "invite"
    });

    return NextResponse.json({
      ok: true,
      expiresAt: expiresAt.toISOString()
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to send the password link right now." }, { status: 500 });
  }
}
