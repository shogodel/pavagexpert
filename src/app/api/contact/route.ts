import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { CONTACT_EMAIL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const website = form.get("_website") as string | null;
    if (website) {
      return NextResponse.json({ ok: true });
    }

    const formMountRaw = form.get("_fm") as string | null;
    if (formMountRaw) {
      const mountTime = parseInt(formMountRaw, 10);
      if (!isNaN(mountTime) && Date.now() - mountTime < 5000) {
        return NextResponse.json(
          { ok: false, errors: ["temporal"] },
          { status: 400 }
        );
      }
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    const { allowed: ipAllowed } = checkRateLimit(ip);
    if (!ipAllowed) {
      return NextResponse.json(
        { ok: false, error: "Trop de demandes. Réessayez dans une heure." },
        { status: 429, headers: { "Retry-After": "3600", "X-RateLimit-Remaining": "0" } }
      );
    }

    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const phone = form.get("phone") as string;
    const postalCode = form.get("postalCode") as string;
    const budget = form.get("budget") as string;
    const description = form.get("description") as string;
    const leadSource = form.get("lead_source") as string | null;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ ok: false, errors: ["name"] }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, errors: ["email"] }, { status: 400 });
    }
    if (!phone || phone.trim().length < 6) {
      return NextResponse.json({ ok: false, errors: ["phone"] }, { status: 400 });
    }
    if (!postalCode || postalCode.trim().length < 3) {
      return NextResponse.json({ ok: false, errors: ["postalCode"] }, { status: 400 });
    }
    if (!budget || budget.trim().length < 1) {
      return NextResponse.json({ ok: false, errors: ["budget"] }, { status: 400 });
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json({ ok: false, errors: ["description"] }, { status: 400 });
    }

    const photos = form.getAll("photos") as File[];
    const attachments = await Promise.all(
      photos.map(async (photo) => ({
        filename: photo.name,
        content: Buffer.from(await photo.arrayBuffer()).toString("base64"),
      }))
    );

    let leadSourceHtml = "";
    if (leadSource) {
      try {
        const parsed = JSON.parse(leadSource);
        leadSourceHtml = `<p><strong>Source:</strong> ${parsed.utm_source || "direct"}<br><strong>Campagne:</strong> ${parsed.utm_campaign || "—"}<br><strong>Page:</strong> ${parsed.landing_page || "—"}</p>`;
      } catch { /* ignore malformed */ }
    }

    const locale = form.get("locale") as string | null;

    const adminSent = await sendEmail({
      to: CONTACT_EMAIL,
      subject: `Nouveau lead: ${name} — ${phone}`,
      html: `
        <html><body style="font-family:sans-serif;padding:20px;">
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Courriel:</strong> ${email}</p>
        <p><strong>Téléphone:</strong> ${phone}</p>
        <p><strong>Code postal:</strong> ${postalCode}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Description:</strong><br>${description}</p>
        ${leadSourceHtml}
        </body></html>
      `,
      attachments: attachments.length > 0 ? attachments : undefined,
    }).catch(() => { console.error("[contact] notification email failed"); });

    if (email) {
      const isEn = locale === "en";
      await sendEmail({
        to: email,
        subject: isEn
          ? "We received your paving project request!"
          : "Nous avons reçu votre demande de projet de pavage !",
        html: isEn
          ? `<html><body style="font-family:sans-serif;background:#f9f9f9;padding:40px 20px;">
          <table align="center" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <tr><td style="background:#c44a30;padding:24px;text-align:center;">
              <h1 style="font-family:Georgia,serif;color:white;margin:0;font-size:22px;">Pavagexpert</h1>
            </td></tr>
            <tr><td style="padding:32px 24px;">
              <h2 style="font-family:Georgia,serif;color:#343a40;margin:0 0 12px;font-size:20px;">Hi ${name},</h2>
              <p style="color:#495057;line-height:1.6;margin:0 0 20px;font-size:15px;">Thanks for telling us about your project! Here&rsquo;s what happens next:</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
                <tr><td style="padding:12px 0;border-top:1px solid #eee;"><span style="color:#c44a30;font-weight:bold;margin-right:8px;">1.</span><span style="color:#495057;"> We review your project details</span></td></tr>
                <tr><td style="padding:12px 0;border-top:1px solid #eee;"><span style="color:#c44a30;font-weight:bold;margin-right:8px;">2.</span><span style="color:#495057;"> We match you with the right RBQ-certified expert</span></td></tr>
                <tr><td style="padding:12px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;"><span style="color:#c44a30;font-weight:bold;margin-right:8px;">3.</span><span style="color:#495057;"> They reach out within 48 hours for a free estimate</span></td></tr>
              </table>
              <p style="color:#868e96;font-size:13px;line-height:1.5;margin:0;">Need to reach us? Reply to this email or call us.</p>
            </td></tr>
            <tr><td style="background:#f8f9fa;padding:16px 24px;text-align:center;">
              <p style="color:#adb5bd;font-size:12px;margin:0;">Pavagexpert &mdash; Montreal, Laval, South Shore</p>
            </td></tr>
          </table></body></html>`
          : `<html><body style="font-family:sans-serif;background:#f9f9f9;padding:40px 20px;">
          <table align="center" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <tr><td style="background:#c44a30;padding:24px;text-align:center;">
              <h1 style="font-family:Georgia,serif;color:white;margin:0;font-size:22px;">Pavagexpert</h1>
            </td></tr>
            <tr><td style="padding:32px 24px;">
              <h2 style="font-family:Georgia,serif;color:#343a40;margin:0 0 12px;font-size:20px;">Bonjour ${name},</h2>
              <p style="color:#495057;line-height:1.6;margin:0 0 20px;font-size:15px;">Merci de nous avoir parl&eacute; de votre projet ! Voici la suite :</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
                <tr><td style="padding:12px 0;border-top:1px solid #eee;"><span style="color:#c44a30;font-weight:bold;margin-right:8px;">1.</span><span style="color:#495057;"> Nous analysons les d&eacute;tails de votre projet</span></td></tr>
                <tr><td style="padding:12px 0;border-top:1px solid #eee;"><span style="color:#c44a30;font-weight:bold;margin-right:8px;">2.</span><span style="color:#495057;"> Nous vous jumelons avec le bon expert certifi&eacute; RBQ</span></td></tr>
                <tr><td style="padding:12px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;"><span style="color:#c44a30;font-weight:bold;margin-right:8px;">3.</span><span style="color:#495057;"> Il vous contacte sous 48 h pour une estimation gratuite</span></td></tr>
              </table>
              <p style="color:#868e96;font-size:13px;line-height:1.5;margin:0;">Besoin de nous joindre ? R&eacute;pondez &agrave; ce courriel ou appelez-nous.</p>
            </td></tr>
            <tr><td style="background:#f8f9fa;padding:16px 24px;text-align:center;">
              <p style="color:#adb5bd;font-size:12px;margin:0;">Pavagexpert &mdash; Montr&eacute;al, Laval, Rive-Sud</p>
            </td></tr>
          </table></body></html>`,
      }).catch(() => { console.error("[contact] confirmation email failed"); });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ ok: false, errors: ["server"] }, { status: 500 });
  }
}
