import crypto from "node:crypto";

const INVITATION_TTL_HOURS = 72;

export function createInvitationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashInvitationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getInvitationExpiry() {
  return new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
}
