import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactInfo } from "@/lib/site-data";

type ContactPayload = {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  website?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ContactPayload>;

    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const message = (body.message || "").trim();

    if (!fullName || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
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
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "N/A"}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
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
