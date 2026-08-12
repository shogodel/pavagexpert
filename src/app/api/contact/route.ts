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
    const phone = form.get("phone") as string;
    const leadSource = form.get("lead_source") as string | null;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ ok: false, errors: ["name"] }, { status: 400 });
    }
    if (!phone || phone.trim().length < 6) {
      return NextResponse.json({ ok: false, errors: ["phone"] }, { status: 400 });
    }

    let leadSourceHtml = "";
    if (leadSource) {
      try {
        const parsed = JSON.parse(leadSource);
        leadSourceHtml = `<p><strong>Source:</strong> ${parsed.utm_source || "direct"}<br><strong>Campagne:</strong> ${parsed.utm_campaign || "—"}<br><strong>Page:</strong> ${parsed.landing_page || "—"}</p>`;
      } catch { /* ignore malformed */ }
    }

    await sendEmail({
      to: CONTACT_EMAIL,
      subject: `Nouveau lead: ${name} — ${phone}`,
      html: `
        <html><body style="font-family:sans-serif;padding:20px;">
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Téléphone:</strong> ${phone}</p>
        ${leadSourceHtml}
        </body></html>
      `,
    }).catch(() => { console.error("[contact] notification email failed"); });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ ok: false, errors: ["server"] }, { status: 500 });
  }
}
