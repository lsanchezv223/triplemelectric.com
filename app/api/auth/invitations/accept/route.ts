import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession, getSessionCookieName } from "@/lib/auth/session";
import { hashInvitationToken } from "@/lib/auth/invitations";

type AcceptInvitePayload = {
  token?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AcceptInvitePayload;
    const token = String(body.token || "").trim();
    const password = String(body.password || "");

    if (!token || password.length < 8) {
      return NextResponse.json({ ok: false, error: "Use a password with at least 8 characters." }, { status: 400 });
    }

    const invitation = await db.invitation.findUnique({
      where: { tokenHash: hashInvitationToken(token) },
      include: { user: true }
    });

    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, error: "This invitation is no longer valid." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    await db.$transaction([
      db.user.update({
        where: { id: invitation.userId },
        data: {
          passwordHash,
          isActive: true
        }
      }),
      db.invitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date()
        }
      })
    ]);

    const tokenValue = await createSession({
      sub: invitation.user.id,
      role: invitation.user.role,
      username: invitation.user.username
    });

    const response = NextResponse.json({ ok: true, redirectTo: "/panel" });

    response.cookies.set(getSessionCookieName(), tokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to activate the account right now." }, { status: 500 });
  }
}
