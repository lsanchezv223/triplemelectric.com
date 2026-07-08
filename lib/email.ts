import nodemailer from "nodemailer";

function getTransportConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is incomplete.");
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  };
}

export async function sendEmail({
  to,
  cc,
  subject,
  text,
  html
}: {
  to: string;
  cc?: string | string[];
  subject: string;
  text: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport(getTransportConfig());
  const from = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    to,
    cc,
    from,
    subject,
    text,
    html
  });
}
