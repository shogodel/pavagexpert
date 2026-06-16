import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getContractors, updateContractor } from "@/lib/auth-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  const contractors = await getContractors();
  const me = contractors.find((c) => c.id === payload.sub);
  if (!me) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, data: me });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const body = await req.json();
    const { company, phone, email, rbqLicense, yearsInBusiness, serviceAreas } = body;
    const updated = await updateContractor(payload.sub, { company, phone, email, rbqLicense, yearsInBusiness, serviceAreas });
    if (!updated) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
