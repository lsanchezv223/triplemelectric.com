import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, getSessionCookieName } from "@/lib/auth/session";

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "Enter your username or email and password." }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: {
        OR: [{ username }, { email: username }]
      }
    });

    if (!user || !user.isActive || !user.passwordHash) {
      return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const token = await createSession({
      sub: user.id,
      role: user.role,
      username: user.username
    });

    const response = NextResponse.json({ ok: true, redirectTo: "/panel" });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to sign in right now." }, { status: 500 });
  }
}
