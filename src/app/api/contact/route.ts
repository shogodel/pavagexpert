import { NextRequest, NextResponse } from "next/server";
import { addJob } from "@/lib/job-store";

function validate(data: Record<string, unknown>) {
  const errors: string[] = [];
  if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2)
    errors.push("name");
  if (!data.email || typeof data.email !== "string" || !data.email.includes("@"))
    errors.push("email");
  if (!data.phone || typeof data.phone !== "string" || data.phone.trim().length < 6)
    errors.push("phone");
  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const errors = validate(body);
    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    const job = addJob({
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address || "",
      projectType: body.projectType || "",
      description: body.description || "",
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
        replyTo: body.email,
        to: process.env.SMTP_TO,
        subject: `Nouveau devis - ${body.projectType || "Général"}`,
        html: `
          <h2>Nouvelle demande de devis</h2>
          <table>
            <tr><td><strong>Nom</strong></td><td>${body.name}</td></tr>
            <tr><td><strong>Courriel</strong></td><td>${body.email}</td></tr>
            <tr><td><strong>Téléphone</strong></td><td>${body.phone}</td></tr>
            <tr><td><strong>Adresse</strong></td><td>${body.address || "—"}</td></tr>
            <tr><td><strong>Type de projet</strong></td><td>${body.projectType || "—"}</td></tr>
            <tr><td><strong>Description</strong></td><td>${body.description || "—"}</td></tr>
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
