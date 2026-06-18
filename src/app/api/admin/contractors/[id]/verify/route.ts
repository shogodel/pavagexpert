import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { verifyContractor, unverifyContractor } from "@/lib/contractor-profile-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const profile = await verifyContractor(id);
  if (!profile) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, data: profile });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const profile = await unverifyContractor(id);
  if (!profile) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, data: profile });
}
