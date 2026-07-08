import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { createInvitationToken, getInvitationExpiry, hashInvitationToken } from "@/lib/auth/invitations";
import { sendEmail } from "@/lib/email";

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendUserAccessLink({
  userId,
  invitedById,
  email,
  fullName,
  requestUrl,
  mode
}: {
  userId: string;
  invitedById: string;
  email: string;
  fullName: string;
  requestUrl: string;
  mode: "invite" | "reset";
}) {
  await db.invitation.deleteMany({
    where: {
      userId,
      acceptedAt: null
    }
  });

  const token = createInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = getInvitationExpiry();

  await db.invitation.create({
    data: {
      userId,
      invitedById,
      email,
      tokenHash,
      expiresAt
    }
  });

  const inviteUrl = new URL("/activate-account", requestUrl);
  inviteUrl.searchParams.set("token", token);

  const subject = mode === "reset" ? "Triple M Electric password reset" : "Triple M Electric account invitation";
  const intro =
    mode === "reset"
      ? "A password reset has been requested for your Triple M Electric employee portal access."
      : "You have been invited to access the Triple M Electric employee portal.";
  const actionLabel = mode === "reset" ? "Create or update your password" : "Create your password";

  const text = [
    `Hello ${fullName},`,
    "",
    intro,
    `${actionLabel}:`,
    inviteUrl.toString(),
    "",
    "This link expires in 72 hours."
  ].join("\n");

  const html = `
    <p>Hello ${fullName},</p>
    <p>${intro}</p>
    <p><a href="${inviteUrl.toString()}">${actionLabel}</a></p>
    <p>This link expires in 72 hours.</p>
  `;

  await sendEmail({ to: email, subject, text, html });

  return expiresAt;
}

export function parseRole(value: string) {
  return value === "ADMIN" ? UserRole.ADMIN : UserRole.EMPLOYEE;
}
