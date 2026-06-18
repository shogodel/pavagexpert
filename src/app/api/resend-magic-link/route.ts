import { NextRequest, NextResponse } from "next/server";
import { getOrCreateMagicLink } from "@/lib/client-store";
import { getJobById } from "@/lib/job-store";
import { sendEmail } from "@/lib/email";

const rateStore = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ ok: false, code: "missing_job_id" }, { status: 400 });
    }

    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ ok: false, code: "not_found" }, { status: 404 });
    }

    const rateKey = `magic:${job.email}`;
    const lastSent = rateStore.get(rateKey);
    if (lastSent && Date.now() - lastSent < 60000) {
      return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
    }

    const link = await getOrCreateMagicLink(jobId);
    if (!link) {
      return NextResponse.json({ ok: false, code: "error" }, { status: 500 });
    }

    const origin = req.headers.get("origin") || "https://pavagexpert.space";
    const magicUrl = `${origin}/api/auth/client?token=${link.token}`;

    await sendEmail({
      to: job.email,
      subject: "Votre lien magique — Pavagexpert",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <div style="background:#c87d5d;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">Pavagexpert</h1>
          </div>
          <div style="background:#fafaf9;padding:24px;border-radius:0 0 12px 12px">
            <p style="color:#292524;font-size:16px">Bonjour ${job.name},</p>
            <p style="color:#57534e;font-size:14px;line-height:1.6">
              Voici votre lien pour accéder à votre projet en un clic :
            </p>
            <a href="${magicUrl}" style="display:inline-block;background:#c87d5d;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
              Voir mon projet
            </a>
            <p style="color:#a8a29e;font-size:12px;line-height:1.4">
              Ce lien expire dans 7 jours et ne peut être utilisé qu'une seule fois.
              Si vous n'avez pas demandé ce lien, ignorez cet email.
            </p>
          </div>
        </div>
      `.trim(),
    });

    rateStore.set(rateKey, Date.now());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend magic link error:", err);
    return NextResponse.json({ ok: false, code: "server_error" }, { status: 500 });
  }
}
