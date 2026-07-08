import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromSession } from "@/lib/auth/session";
import { isValidEmail, normalizeEmail, normalizeUsername, parseRole, sendUserAccessLink } from "@/lib/admin/users";

type InvitePayload = {
  fullName?: string;
  username?: string;
  email?: string;
  role?: string;
  hourlyRate?: number | string | null;
};

function parseHourlyRate(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return { ok: true, rate: null as number | null };
  }

  const rate = Number(value);

  if (Number.isNaN(rate) || rate <= 0 || rate > 100000) {
    return { ok: false, rate: null as number | null };
  }

  return { ok: true, rate };
}

export async function POST(request: Request) {
  const admin = await getCurrentUserFromSession();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as InvitePayload;
    const fullName = String(body.fullName || "").trim();
    const username = normalizeUsername(String(body.username || ""));
    const email = normalizeEmail(String(body.email || ""));
    const role = parseRole(String(body.role || "EMPLOYEE"));
    const hourlyRateInput = parseHourlyRate(body.hourlyRate);

    if (!fullName || !username || !email) {
      return NextResponse.json({ ok: false, error: "Complete all fields." }, { status: 400 });
    }

    if (!hourlyRateInput.ok) {
      return NextResponse.json({ ok: false, error: "Enter a valid hourly rate." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json({ ok: false, error: "Username must be between 3 and 50 characters." }, { status: 400 });
    }

    const existingByUsername = await db.user.findUnique({ where: { username } });
    const existingByEmail = await db.user.findUnique({ where: { email } });

    const conflictingUser =
      (existingByUsername && existingByUsername.email && existingByUsername.email !== email && existingByUsername.id) ||
      (existingByEmail && existingByEmail.username !== username && existingByEmail.id);

    if (conflictingUser) {
      return NextResponse.json({ ok: false, error: "That email or username is already assigned to another user." }, { status: 409 });
    }

    const user =
      existingByUsername ||
      existingByEmail ||
      (await db.user.create({
        data: {
          fullName,
          username,
          email,
          role,
          isActive: true,
          hourlyRate: hourlyRateInput.rate
        }
      }));

    if (existingByUsername || existingByEmail) {
      await db.user.update({
        where: { id: user.id },
        data: {
          fullName,
          username,
          email,
          role,
          isActive: true,
          hourlyRate: hourlyRateInput.rate
        }
      });
    }

    const expiresAt = await sendUserAccessLink({
      userId: user.id,
      invitedById: admin.id,
      email,
      fullName,
      requestUrl: request.url,
      mode: "invite"
    });

    return NextResponse.json({ ok: true, expiresAt: expiresAt.toISOString() });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to send the invitation right now." }, { status: 500 });
  }
}
