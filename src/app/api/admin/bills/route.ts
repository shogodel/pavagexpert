import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getBills } from "@/lib/billing-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const bills = await getBills();
  return NextResponse.json({ ok: true, data: bills });
}
