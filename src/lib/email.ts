import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL] To: ${payload.to}`);
    console.log(`[EMAIL] Subject: ${payload.subject}`);
    console.log(`[EMAIL] Body: ${payload.html}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@pavagexpert.space",
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
}
