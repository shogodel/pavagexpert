import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getContractorProfile, updateContractorProfile } from "@/lib/contractor-profile-store";
import { getSocialProfiles } from "@/lib/contractor-social-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const profile = await getContractorProfile(payload.sub);
  if (!profile) return NextResponse.json({ ok: false }, { status: 404 });
  const socials = await getSocialProfiles(payload.sub);
  return NextResponse.json({ ok: true, data: profile, socials });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const body = await req.json();
    const updated = await updateContractorProfile(payload.sub, body);
    if (!updated) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
