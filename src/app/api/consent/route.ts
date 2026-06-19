import { NextRequest, NextResponse } from "next/server";
import { logConsent } from "@/lib/compliance-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, consentType, consentGiven, categories } = body;

    if (!visitorId || !consentType || typeof consentGiven !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const ua = req.headers.get("user-agent") || "";

    await logConsent({
      visitorId,
      consentType,
      consentGiven,
      categories: Array.isArray(categories) ? categories : [],
      ipAddress: ip,
      userAgent: ua,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
