import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactInfo } from "@/lib/site-data";

type ContactPayload = {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  website?: string;
  company?: string;
  submittedAt?: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_STORE = new Map<string, RateLimitState>();

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();

  if (RATE_LIMIT_STORE.size > 2000) {
    for (const [key, state] of RATE_LIMIT_STORE.entries()) {
      if (state.resetAt <= now) {
        RATE_LIMIT_STORE.delete(key);
      }
    }
  }

  const current = RATE_LIMIT_STORE.get(ip);
  if (!current || current.resetAt <= now) {
    RATE_LIMIT_STORE.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  RATE_LIMIT_STORE.set(ip, current);
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false, error: "Too many attempts. Please try again shortly." }, { status: 429 });
    }

    const body = (await request.json()) as Partial<ContactPayload>;

    if (body.website || body.company) {
      return NextResponse.json({ ok: true });
    }

    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const message = (body.message || "").trim();
    const submittedAt = Number(body.submittedAt || 0);
    const now = Date.now();

    if (!Number.isFinite(submittedAt) || submittedAt <= 0 || now - submittedAt < 2500 || now - submittedAt > 2 * 60 * 60 * 1000) {
      return NextResponse.json({ ok: false, error: "Validation failed." }, { status: 400 });
    }

    if (!fullName || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
    }

    if (fullName.length > 100 || email.length > 254 || phone.length > 40 || message.length > 2000) {
      return NextResponse.json({ ok: false, error: "Input is too long." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = process.env.SMTP_SECURE === "true";

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { ok: false, error: "Email service is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const toEmail = process.env.CONTACT_TO_EMAIL || contactInfo.email;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || smtpUser;
    const subject = `New contact form message - ${fullName}`;
    const escapedName = escapeHtml(fullName);
    const escapedEmail = escapeHtml(email);
    const escapedPhone = escapeHtml(phone || "N/A");
    const escapedMessage = escapeHtml(message).replace(/\n/g, "<br/>");

    const text = [
      "New website contact message:",
      "",
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone || "N/A"}`,
      "",
      "Message:",
      message
    ].join("\n");

    const html = `
      <h2>New website contact message</h2>
      <p><strong>Name:</strong> ${escapedName}</p>
      <p><strong>Email:</strong> ${escapedEmail}</p>
      <p><strong>Phone:</strong> ${escapedPhone}</p>
      <p><strong>Message:</strong></p>
      <p>${escapedMessage}</p>
    `;

    await transporter.sendMail({
      to: toEmail,
      from: fromEmail,
      replyTo: email,
      subject,
      text,
      html
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to send message right now." }, { status: 500 });
  }
}
