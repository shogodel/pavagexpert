import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getBillsByContractor } from "@/lib/billing-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });

  const bills = await getBillsByContractor(payload.sub);
  return NextResponse.json({ ok: true, data: bills });
}
