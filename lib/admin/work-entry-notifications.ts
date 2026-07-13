import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import type { PreparedAttachmentFile } from "@/lib/r2";

type WorkEntryNotification = {
  id: string;
  workDate: string;
  clientName: string | null;
  location: string;
  startTime: string | null;
  endTime: string | null;
  breakMinutes: number;
  totalHours: number;
  company: string | null;
  notes: string | null;
  status: "IN_PROGRESS" | "APPROVED" | "INVOICED";
  hourlyRate: number | null;
  user: {
    fullName: string;
    username: string;
  };
  sharedWith?: string[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatHtmlMultilineText(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function formatTime(value: string | null) {
  return value ? value.slice(11, 16) : "--:--";
}

function formatMoney(value: number | null) {
  return value === null ? "--" : `$${value.toFixed(2)}`;
}

function buildEntryLink(baseUrl: string, entry: WorkEntryNotification) {
  const url = new URL("/panel", baseUrl);
  url.searchParams.set("view", "records");
  url.searchParams.set("start", entry.workDate.slice(0, 10));
  url.searchParams.set("end", entry.workDate.slice(0, 10));
  url.searchParams.set("entry", entry.id);
  return url.toString();
}

export async function sendWorkEntryNotificationEmail({
  to,
  baseUrl,
  entry,
  actorName,
  action,
  attachments
}: {
  to: string;
  baseUrl: string;
  entry: WorkEntryNotification;
  actorName: string;
  action: "created" | "updated";
  attachments: PreparedAttachmentFile[];
}) {
  const subject = action === "created" ? `New work entry: ${entry.location}` : `Work entry updated: ${entry.location}`;
  const entryLink = buildEntryLink(baseUrl, entry);
  const dateLabel = formatDate(entry.workDate);
  const statusLabel =
    entry.status === "INVOICED" ? "Invoiced" : entry.status === "APPROVED" ? "Approved" : "In progress";
  const totalAmount = entry.hourlyRate ? entry.hourlyRate * entry.totalHours : null;
  const attachmentLines = attachments.map((file) => `- ${file.originalName}`).join("\n");
  const sharedWithLabel = entry.sharedWith?.length ? entry.sharedWith.join(", ") : "";

  const text = [
    `${actorName} ${action === "created" ? "added" : "updated"} a work entry for ${dateLabel}.`,
    "",
    `Employee: ${entry.user.fullName} (@${entry.user.username})`,
    sharedWithLabel ? `Shared with: ${sharedWithLabel}` : null,
    `Client: ${entry.clientName || "-"}`,
    `Location: ${entry.location}`,
    `Company: ${entry.company || "Triple M Electric"}`,
    `Start time: ${formatTime(entry.startTime)}`,
    `End time: ${formatTime(entry.endTime)}`,
    `Break: ${entry.breakMinutes} min`,
    `Total hours: ${entry.totalHours.toFixed(2)}`,
    `Status: ${statusLabel}`,
    `Hourly rate: ${formatMoney(entry.hourlyRate)}`,
    `Total amount: ${formatMoney(totalAmount)}`,
    entry.notes ? `Notes: ${entry.notes}` : "Notes: -",
    "",
    `Open in app: ${entryLink}`,
    "",
    attachments.length ? `Attachments:\n${attachmentLines}` : "Attachments: None"
  ].filter((line): line is string => Boolean(line)).join("\n");

  const attachmentCards = attachments.length
    ? `
        <div style="margin-top:20px;">
          <div style="font-size:13px;font-weight:700;color:#fde68a;text-transform:uppercase;letter-spacing:0.12em;">Attachments</div>
          <ul style="margin:10px 0 0 18px;padding:0;color:#e5e7eb;font-size:14px;line-height:1.7;">
            ${attachments
              .map((file) => `<li>${escapeHtml(file.originalName)} (${escapeHtml(file.mimeType)})</li>`)
              .join("")}
          </ul>
        </div>
      `
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;background:#050a14;padding:24px;color:#e5e7eb;">
      <div style="max-width:760px;margin:0 auto;background:#08101c;border:1px solid rgba(255,255,255,0.08);border-radius:22px;overflow:hidden;">
        <div style="padding:28px 30px;border-bottom:1px solid rgba(255,255,255,0.08);background:linear-gradient(180deg,rgba(255,128,24,0.12),rgba(255,255,255,0));">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#fcd34d;">Work entry</div>
          <h1 style="margin:10px 0 0 0;font-size:28px;line-height:1.2;color:#ffffff;">${escapeHtml(entry.location)}</h1>
          <p style="margin:10px 0 0 0;color:#94a3b8;font-size:15px;">
            ${escapeHtml(actorName)} ${action === "created" ? "added" : "updated"} this record on ${escapeHtml(dateLabel)}.
          </p>
        </div>

        <div style="padding:28px 30px;">
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:22px;">
            <span style="display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,0.10);border-radius:999px;padding:8px 12px;color:#ffffff;">${escapeHtml(
              statusLabel
            )}</span>
            <span style="display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,0.10);border-radius:999px;padding:8px 12px;color:#ffffff;">${escapeHtml(
              formatTime(entry.startTime)
            )} - ${escapeHtml(formatTime(entry.endTime))}</span>
            <span style="display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,0.10);border-radius:999px;padding:8px 12px;color:#ffffff;">Break: ${entry.breakMinutes} min</span>
            <span style="display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,0.10);border-radius:999px;padding:8px 12px;color:#ffffff;">Hours: ${entry.totalHours.toFixed(
              2
            )}</span>
            ${
              entry.hourlyRate
                ? `<span style="display:inline-flex;align-items:center;border:1px solid rgba(16,185,129,0.28);border-radius:999px;padding:8px 12px;color:#d1fae5;">Rate: $${entry.hourlyRate.toFixed(
                    2
                  )}/h</span>`
                : ""
            }
            ${
              totalAmount !== null
                ? `<span style="display:inline-flex;align-items:center;border:1px solid rgba(16,185,129,0.28);border-radius:999px;padding:8px 12px;color:#d1fae5;">Amount: $${totalAmount.toFixed(
                    2
                  )}</span>`
                : ""
            }
          </div>

          ${
            sharedWithLabel
              ? `<div style="margin-bottom:18px;font-size:14px;line-height:1.7;color:#cbd5e1;"><strong style="color:#ffffff;">Shared with:</strong> ${escapeHtml(
                  sharedWithLabel
                )}</div>`
              : ""
          }

          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:18px 20px;">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#fcd34d;">Details</div>
            <div style="margin-top:10px;color:#e5e7eb;font-size:15px;line-height:1.8;">
              <div><strong style="color:#ffffff;">Employee:</strong> ${escapeHtml(entry.user.fullName)} (@${escapeHtml(
    entry.user.username
  )})</div>
              <div><strong style="color:#ffffff;">Client:</strong> ${escapeHtml(entry.clientName || "-")}</div>
              <div><strong style="color:#ffffff;">Company:</strong> ${escapeHtml(entry.company || "Triple M Electric")}</div>
              <div><strong style="color:#ffffff;">Date:</strong> ${escapeHtml(dateLabel)}</div>
              <div><strong style="color:#ffffff;">Link:</strong> <a href="${entryLink}" style="color:#fbbf24;text-decoration:none;">Open in app</a></div>
            </div>
            ${
              entry.notes
                ? `<div style="margin-top:16px;color:#e5e7eb;font-size:15px;line-height:1.7;"><strong style="color:#ffffff;">Notes:</strong><div style="margin-top:6px;">${formatHtmlMultilineText(
                    entry.notes
                  )}</div></div>`
                : ""
            }
            ${attachmentCards}
          </div>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to,
    subject,
    text,
    html,
    attachments: attachments.map((file) => ({
      filename: file.fileName,
      content: file.buffer,
      contentType: file.mimeType
    }))
  });
}

export async function sendWorkEntryChangeToAdmins({
  baseUrl,
  entry,
  actorName,
  action,
  attachments
}: {
  baseUrl: string;
  entry: WorkEntryNotification;
  actorName: string;
  action: "created" | "updated";
  attachments: PreparedAttachmentFile[];
}) {
  const admins = await db.user.findMany({
    where: {
      role: "ADMIN",
      isActive: true,
      email: {
        not: null
      }
    },
    select: {
      email: true
    }
  });

  const recipients = admins.map((admin) => admin.email).filter((email): email is string => Boolean(email));

  if (!recipients.length) {
    return;
  }

  await Promise.all(
    recipients.map((email) =>
      sendWorkEntryNotificationEmail({
        to: email,
        baseUrl,
        entry,
        actorName,
        action,
        attachments
      })
    )
  );
}
