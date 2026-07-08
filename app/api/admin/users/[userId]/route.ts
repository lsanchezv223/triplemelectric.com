import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromSession } from "@/lib/auth/session";
import { isValidEmail, normalizeEmail, normalizeUsername, parseRole } from "@/lib/admin/users";

type UpdateUserPayload = {
  fullName?: string;
  username?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
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

export async function PUT(request: Request, context: { params: Promise<{ userId: string }> }) {
  const admin = await getCurrentUserFromSession();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 403 });
  }

  try {
    const { userId } = await context.params;
    const body = (await request.json()) as UpdateUserPayload;
    const fullName = String(body.fullName || "").trim();
    const username = normalizeUsername(String(body.username || ""));
    const email = normalizeEmail(String(body.email || ""));
    const role = parseRole(String(body.role || "EMPLOYEE"));
    const isActive = Boolean(body.isActive);
    const hourlyRateInput = parseHourlyRate(body.hourlyRate);

    if (!fullName || !username || !email) {
      return NextResponse.json({ ok: false, error: "Complete all required fields." }, { status: 400 });
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

    const existingUser = await db.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }

    if (existingUser.id === admin.id && !isActive) {
      return NextResponse.json({ ok: false, error: "You cannot disable your own account." }, { status: 400 });
    }

    if (existingUser.id === admin.id && role !== existingUser.role) {
      return NextResponse.json({ ok: false, error: "You cannot change your own admin role here." }, { status: 400 });
    }

    const conflictByUsername = await db.user.findUnique({ where: { username } });
    if (conflictByUsername && conflictByUsername.id !== userId) {
      return NextResponse.json({ ok: false, error: "That username is already in use." }, { status: 409 });
    }

    const conflictByEmail = await db.user.findUnique({ where: { email } });
    if (conflictByEmail && conflictByEmail.id !== userId) {
      return NextResponse.json({ ok: false, error: "That email is already in use." }, { status: 409 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        fullName,
        username,
        email,
        role,
        isActive,
        hourlyRate: hourlyRateInput.rate
      }
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        fullName: updated.fullName,
        username: updated.username,
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
        hourlyRate: updated.hourlyRate ? Number(updated.hourlyRate) : null
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to update the user right now." }, { status: 500 });
  }
}
