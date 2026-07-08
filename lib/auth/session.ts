import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";

type SessionPayload = {
  sub: string;
  role: "EMPLOYEE" | "ADMIN";
  username: string;
};

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.");
  }

  return new TextEncoder().encode(secret);
}

export function getSessionCookieName() {
  return process.env.AUTH_SESSION_NAME || "triplem_session";
}

export async function createSession(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName());
}

export async function readSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    if (!payload.sub || typeof payload.role !== "string" || typeof payload.username !== "string") {
      return null;
    }

    return {
      userId: payload.sub,
      role: payload.role as SessionPayload["role"],
      username: payload.username
    };
  } catch {
    return null;
  }
}

export async function getCurrentUserFromSession() {
  const session = await readSession();

  if (!session) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      lastLoginAt: true
    }
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export const getCurrentUser = cache(getCurrentUserFromSession);

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/panel");
  }

  return user;
}
