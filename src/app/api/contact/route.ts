import { NextRequest, NextResponse } from "next/server";
import { addJob, ensureJobPhotoDir, readJobs, writeJobs } from "@/lib/job-store";
import { checkRateLimit } from "@/lib/rate-limit";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Trop de demandes. Réessayez dans une heure." },
        { status: 429, headers: { "Retry-After": "3600", "X-RateLimit-Remaining": "0" } }
      );
    }

    const form = await req.formData();
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const phone = form.get("phone") as string;
    const postalCode = form.get("postalCode") as string;
    const budget = form.get("budget") as string;
    const description = form.get("description") as string;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ ok: false, errors: ["name"] }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, errors: ["email"] }, { status: 400 });
    }
    if (!phone || phone.trim().length < 6) {
      return NextResponse.json({ ok: false, errors: ["phone"] }, { status: 400 });
    }
    if (!budget || budget.trim().length < 1) {
      return NextResponse.json({ ok: false, errors: ["budget"] }, { status: 400 });
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json({ ok: false, errors: ["description"] }, { status: 400 });
    }

    const photoEntries = form.getAll("photos") as File[];

    if (photoEntries.length > 5) {
      return NextResponse.json({ ok: false, errors: ["photos"] }, { status: 400 });
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    for (const file of photoEntries) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ ok: false, errors: ["photos"] }, { status: 400 });
      }
    }

    const job = addJob({ name, email, postalCode: postalCode || "", phone, budget, description });
    const photoDir = ensureJobPhotoDir(job.id);

    const savedPhotos: string[] = [];
    for (const file of photoEntries) {
      if (file.size === 0) continue;
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(`${photoDir}/${filename}`, buffer);
      savedPhotos.push(filename);
    }

    if (savedPhotos.length > 0) {
      const jobs = readJobs();
      const idx = jobs.findIndex((j) => j.id === job.id);
      if (idx !== -1) {
        jobs[idx].photos = savedPhotos;
        writeJobs(jobs);
      }
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"${name}" <${process.env.SMTP_FROM}>`,
        replyTo: process.env.SMTP_FROM,
        to: process.env.SMTP_TO,
        subject: "Nouveau devis - Pavagexpert",
        html: `
          <h2>Nouvelle demande de devis</h2>
          <table>
            <tr><td><strong>Nom</strong></td><td>${name}</td></tr>
            <tr><td><strong>Courriel</strong></td><td>${email}</td></tr>
            <tr><td><strong>Téléphone</strong></td><td>${phone}</td></tr>
            <tr><td><strong>Code postal</strong></td><td>${postalCode || "—"}</td></tr>
            <tr><td><strong>Budget</strong></td><td>${budget || "—"}</td></tr>
            <tr><td><strong>Description</strong></td><td>${description}</td></tr>
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
