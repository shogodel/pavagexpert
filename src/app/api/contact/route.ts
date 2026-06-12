import { NextRequest, NextResponse } from "next/server";
import { addJob } from "@/lib/job-store";
import { checkRateLimit } from "@/lib/rate-limit";

function validate(data: Record<string, unknown>) {
  const errors: string[] = [];
  if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2)
    errors.push("name");
  if (!data.phone || typeof data.phone !== "string" || data.phone.trim().length < 6)
    errors.push("phone");
  if (!data.description || typeof data.description !== "string" || data.description.trim().length < 10)
    errors.push("description");
  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Trop de demandes. Réessayez dans une heure." },
        { status: 429, headers: { "Retry-After": "3600", "X-RateLimit-Remaining": "0" } }
      );
    }

    const body = await req.json();
    const errors = validate(body);
    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    addJob({
      name: body.name,
      postalCode: body.postalCode || "",
      phone: body.phone,
      description: body.description,
    });

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"${body.name}" <${process.env.SMTP_FROM}>`,
        replyTo: process.env.SMTP_FROM,
        to: process.env.SMTP_TO,
        subject: "Nouveau devis - Pavagexpert",
        html: `
          <h2>Nouvelle demande de devis</h2>
          <table>
            <tr><td><strong>Nom</strong></td><td>${body.name}</td></tr>
            <tr><td><strong>Téléphone</strong></td><td>${body.phone}</td></tr>
            <tr><td><strong>Code postal</strong></td><td>${body.postalCode || "—"}</td></tr>
            <tr><td><strong>Description</strong></td><td>${body.description}</td></tr>
          </table>
        `.trim(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ ok: false, errors: ["server"] }, { status: 500 });
  }
}
