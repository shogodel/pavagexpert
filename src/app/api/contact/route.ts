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

    const wpUrl = process.env.WORDPRESS_API_URL;
    const wpKey = process.env.WORDPRESS_API_KEY;
    let wpOk = false;
    if (wpUrl && wpKey) {
      try {
        const wpRes = await fetch(wpUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": wpKey,
          },
          body: JSON.stringify({ name, email, phone, postalCode, budget, description, ip }),
        });
        wpOk = wpRes.ok;
        if (!wpOk) console.error("[contact] WordPress error:", wpRes.status, await wpRes.text().catch(() => ""));
      } catch (wpErr) {
        console.error("[contact] WordPress fetch error:", wpErr);
      }
    }

    try {
      await sendEmail({
        to: CONTACT_EMAIL,
        subject: `Nouveau lead: ${name} — ${phone}`,
        html: `
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Courriel:</strong> ${email}</p>
          <p><strong>Téléphone:</strong> ${phone}</p>
          <p><strong>Code postal:</strong> ${postalCode || "—"}</p>
          <p><strong>Budget:</strong> ${budget}</p>
          <p><strong>Description:</strong><br>${description}</p>
        `,
      });
    } catch {
      console.error("[contact] notification email failed");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ ok: false, errors: ["server"] }, { status: 500 });
  }
}
