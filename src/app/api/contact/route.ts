import { NextRequest, NextResponse } from "next/server";
import { addJob, ensureJobPhotoDir } from "@/lib/job-store";
import { generateMagicLink } from "@/lib/client-store";
import { sendEmail } from "@/lib/email";
import { newJobToContractors } from "@/lib/email-templates";
import { query } from "@/lib/db";
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
    const leadSourceRaw = form.get("lead_source") as string | null;
    let leadSource: Record<string, string> | undefined;
    if (leadSourceRaw) { try { leadSource = JSON.parse(leadSourceRaw); } catch { /* ignore invalid JSON */ } }

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

    // Save photos to disk and collect filenames
    const savedPhotos: string[] = [];
    for (const file of photoEntries) {
      if (file.size === 0) continue;
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${crypto.randomUUID()}.${ext}`;
      savedPhotos.push(filename);
    }

    // Create client + job + photo records in a DB transaction
    const job = await addJob({ name, email, postalCode: postalCode || "", phone, budget, description, photos: savedPhotos, leadSource });

    // Notify subscribed contractors of the new job
    if (job) {
      try {
        const { sendPushToAll } = await import("@/lib/push");
        const { CONTACT_PHONE_TEL } = await import("@/lib/constants");
        await sendPushToAll({
          title: `Nouveau projet${job.postalCode ? " — " + job.postalCode : ""}`,
          body: `Budget: ${job.budget || "—"} • ${job.name}`,
          url: `/fr/jobs`,
          phone: CONTACT_PHONE_TEL,
        });
      } catch { /* push notifications are best-effort */ }

      try {
        const contractors = await query<{ email: string; company: string }>(
          "SELECT email, company FROM contractors WHERE status = 'active' AND email != ''"
        );
        for (const c of contractors) {
          await sendEmail({
            to: c.email,
            subject: "Nouveau projet disponible — Pavagexpert",
            html: newJobToContractors(),
          });
        }
      } catch { /* contractor notification emails are best-effort */ }
    }
    const photoDir = ensureJobPhotoDir(job.id);

    // Write photo files to disk
    let fileIdx = 0;
    for (const file of photoEntries) {
      if (file.size === 0) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(`${photoDir}/${savedPhotos[fileIdx]}`, buffer);
      fileIdx++;
    }

    // Send magic link email to the client
    if (job) {
      try {
        const link = await generateMagicLink(job.id);
        const origin = req.headers.get("origin") || "https://pavagexpert.space";
        const magicUrl = `${origin}/api/auth/client?token=${link.token}`;
        await sendEmail({
          to: email,
          subject: "Votre demande a été reçue — Pavagexpert",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <div style="background:#c87d5d;padding:24px;border-radius:12px 12px 0 0">
                <h1 style="color:white;margin:0;font-size:20px">Pavagexpert</h1>
              </div>
              <div style="background:#fafaf9;padding:24px;border-radius:0 0 12px 12px">
                <p style="color:#292524;font-size:16px">Bonjour ${name},</p>
                <p style="color:#57534e;font-size:14px;line-height:1.6">
                  Votre projet a bien été transmis à notre réseau d'entrepreneurs certifiés RBQ.
                  Vous recevrez bientôt des offres adaptées à vos besoins.
                </p>
                <a href="${magicUrl}" style="display:inline-block;background:#c87d5d;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
                  Suivre l'avancement de mon projet
                </a>
                <p style="color:#a8a29e;font-size:12px;line-height:1.4">
                  Ce lien est personnel et sécurisé. Il expire dans 7 jours.
                  Utilisez-le pour consulter le statut de votre projet à tout moment.
                </p>
              </div>
            </div>
          `.trim(),
        });
      } catch { /* magic link email is best-effort */ }
    }

    // Send notification to admin
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Pavagexpert <noreply@pavagexpert.space>",
        replyTo: email,
        to: process.env.NOTIFICATION_EMAIL || "pavagexpertmtl@gmail.com",
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
