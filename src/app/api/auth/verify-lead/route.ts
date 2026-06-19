import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { verifyMagicLink } from "@/lib/client-store";
import { verifyJob } from "@/lib/job-store";
import { sendEmail } from "@/lib/email";
import { newJobToContractors } from "@/lib/email-templates";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ ok: false, code: "missing_token" }, { status: 400 });
    }

    const result = await verifyMagicLink(token);
    if (!result) {
      return NextResponse.redirect(new URL("/fr?magic=expired", req.url));
    }

    const jobId = result.jobId;

    // Mark job as verified
    const didVerify = await verifyJob(jobId);
    if (!didVerify) {
      // Already verified — still allow login
    }

    // Sign JWT for client access
    const jwt = await signToken({ sub: jobId, role: "client" });

    const isHttps = req.headers.get("x-forwarded-proto") === "https";
    const url = new URL(`/fr/mon-projet/${jobId}`, req.url);
    const response = NextResponse.redirect(url);
    response.cookies.set("client_token", jwt, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    // Async: notify contractors about the new verified lead
    if (didVerify) {
      notifyContractors(jobId).catch(() => {});
    }

    return response;
  } catch (err) {
    console.error("Verify lead error:", err);
    return NextResponse.json({ ok: false, code: "server_error" }, { status: 500 });
  }
}

async function notifyContractors(jobId: string) {
  try {
    const jobRow = await query<{
      id: string; postal_code: string; budget: string; name: string; description: string
    }>(
      `SELECT j.id, j.postal_code, j.budget, c.name, j.description
       FROM jobs j JOIN clients c ON c.id = j.client_id
       WHERE j.id = $1`,
      [jobId]
    );
    if (jobRow.length === 0) return;
    const job = jobRow[0];

    // Push notification
    try {
      const { sendPushToAll } = await import("@/lib/push");
      const { CONTACT_PHONE_TEL } = await import("@/lib/constants");
      await sendPushToAll({
        title: `Nouveau projet${job.postal_code ? " — " + job.postal_code : ""}`,
        body: `Budget: ${job.budget || "—"} • ${job.name}`,
        url: `/fr/jobs`,
        phone: CONTACT_PHONE_TEL,
      });
    } catch {}

    // Email notification to all active contractors
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
    } catch {}

    // Email notification to admin
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Pavagexpert <noreply@pavagexpert.space>",
        replyTo: job.name,
        to: process.env.NOTIFICATION_EMAIL || "pavagexpertmtl@gmail.com",
        subject: "Nouveau devis confirmé - Pavagexpert",
        html: `
          <h2>Nouvelle demande de devis confirmée</h2>
          <table>
            <tr><td><strong>Nom</strong></td><td>${job.name}</td></tr>
            <tr><td><strong>Budget</strong></td><td>${job.budget || "—"}</td></tr>
            <tr><td><strong>Code postal</strong></td><td>${job.postal_code || "—"}</td></tr>
          </table>
        `.trim(),
      });
    }
  } catch (err) {
    console.error("Contractor notification error:", err);
  }
}
