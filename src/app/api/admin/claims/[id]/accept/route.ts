import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { acceptClaim } from "@/lib/claim-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const claim = await acceptClaim(id);
  if (!claim) return NextResponse.json({ ok: false, code: "not_found_or_not_pending" }, { status: 404 });
  return NextResponse.json({ ok: true, data: claim });
}
