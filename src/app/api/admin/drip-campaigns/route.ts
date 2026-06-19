import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAllCampaigns, upsertCampaign } from "@/lib/drip-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const campaigns = await getAllCampaigns();
  return NextResponse.json({ ok: true, campaigns });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { slug, name, triggerEvent, delayMinutes, subject, template, active } = body;
    if (!slug || !name || !triggerEvent || delayMinutes === undefined || !subject || !template) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await upsertCampaign({ slug, name, triggerEvent, delayMinutes, subject, template, active });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
