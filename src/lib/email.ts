import { Resend } from "resend";

interface Attachment {
  filename: string;
  content: string;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL] To: ${payload.to}`);
    console.log(`[EMAIL] Subject: ${payload.subject}`);
    console.log(`[EMAIL] Body: ${payload.html}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Pavagexpert <noreply@pavagexpert.space>",
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    attachments: payload.attachments,
  });
  if (error) console.error("[EMAIL] Resend error:", error);
}
