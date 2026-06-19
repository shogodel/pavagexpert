import { NextRequest, NextResponse } from "next/server";
import { addJobWithMeta, ensureJobPhotoDir } from "@/lib/job-store";
import { generateMagicLink } from "@/lib/client-store";
import { sendEmail } from "@/lib/email";
import { leadVerification } from "@/lib/email-templates";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  validateEmail,
  checkContent,
  runDedupChecks,
  checkEmailDomainRate,
  type DedupMeta,
} from "@/lib/dedup";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // Honeypot: silently reject if hidden field is filled
    const website = form.get("_website") as string | null;
    if (website) {
      return NextResponse.json({ ok: true, verify: false });
    }

    // Temporal fingerprint: reject if form completed too fast
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

    const browserFingerprint = (form.get("_fp") as string) || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    // Rate limit per IP (existing)
    const { allowed: ipAllowed } = checkRateLimit(ip);
    if (!ipAllowed) {
      return NextResponse.json(
        { ok: false, error: "Trop de demandes. Réessayez dans une heure." },
        { status: 429, headers: { "Retry-After": "3600", "X-RateLimit-Remaining": "0" } }
      );
    }

    // Extract form fields
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const phone = form.get("phone") as string;
    const postalCode = form.get("postalCode") as string;
    const budget = form.get("budget") as string;
    const description = form.get("description") as string;
    const leadSourceRaw = form.get("lead_source") as string | null;
    let leadSource: Record<string, string> | undefined;
    if (leadSourceRaw) { try { leadSource = JSON.parse(leadSourceRaw); } catch {} }

    // Basic field validation
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

    // Email validation (MX + disposable domains)
    const emailCheck = await validateEmail(email);
    if (emailCheck.isSpam) {
      return NextResponse.json(
        { ok: false, errors: ["email"], spamReason: emailCheck.reason },
        { status: 400 }
      );
    }

    // Content analysis
    const contentCheck = checkContent(description);
    if (contentCheck.isSpam) {
      return NextResponse.json(
        { ok: false, errors: ["description"], spamReason: contentCheck.reason },
        { status: 400 }
      );
    }

    // Domain rate limit
    const domainRate = checkEmailDomainRate(email);
    if (!domainRate.allowed) {
      return NextResponse.json(
        { ok: false, error: "Trop de demandes pour ce domaine. Réessayez plus tard." },
        { status: 429 }
      );
    }

    // Dedup checks (soft flags — still save but mark)
    const dedupMeta: DedupMeta = { email, phone, name, postalCode, ip, browserFingerprint };
    const dedupReport = await runDedupChecks(dedupMeta);
    const flagReasons = dedupReport.flagReasons;

    // Photo handling
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

    const savedPhotos: string[] = [];
    for (const file of photoEntries) {
      if (file.size === 0) continue;
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${crypto.randomUUID()}.${ext}`;
      savedPhotos.push(filename);
    }

    // Save job with metadata (unverified, flagged if duplicate)
    const job = await addJobWithMeta({
      name, email, postalCode: postalCode || "", phone, budget, description,
      photos: savedPhotos, leadSource,
      ipAddress: ip, browserFingerprint,
      flagReason: flagReasons.length > 0 ? flagReasons.join(";") : "",
    });

    // Fire-and-forget fraud check
    try {
      const { flagIfSuspicious } = await import("@/lib/fraud-store");
      flagIfSuspicious(job.id, ip, phone).catch(() => {});
    } catch {}

    // Write photos to disk
    if (job) {
      const photoDir = ensureJobPhotoDir(job.id);
      let fileIdx = 0;
      for (const file of photoEntries) {
        if (file.size === 0) continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(`${photoDir}/${savedPhotos[fileIdx]}`, buffer);
        fileIdx++;
      }
    }

    // Send verification email
    if (job) {
      try {
        const { token } = await generateMagicLink(job.id);
        const origin = req.headers.get("origin") || "https://pavagexpert.space";
        const verifyUrl = `${origin}/api/auth/verify-lead?token=${token}`;
        await sendEmail({
          to: email,
          subject: "Confirmez votre projet — Pavagexpert",
          html: leadVerification(name, verifyUrl),
        });
      } catch { /* verification email is best-effort */ }
    }

    return NextResponse.json({ ok: true, verify: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ ok: false, errors: ["server"] }, { status: 500 });
  }
}
