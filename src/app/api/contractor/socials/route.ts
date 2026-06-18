import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getSocialProfiles, upsertSocialProfile, deleteSocialProfile } from "@/lib/contractor-social-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const socials = await getSocialProfiles(payload.sub);
  return NextResponse.json({ ok: true, data: socials });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.platform || !body.url) {
    return NextResponse.json({ ok: false, error: "Missing platform or url" }, { status: 400 });
  }
  const social = await upsertSocialProfile(payload.sub, {
    platform: body.platform,
    url: body.url,
    label: body.label,
  });
  return NextResponse.json({ ok: true, data: social });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  const ok = await deleteSocialProfile(id, payload.sub);
  if (!ok) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true });
}
