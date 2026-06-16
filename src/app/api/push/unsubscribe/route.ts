import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const { endpoint } = await req.json();
    if (endpoint) {
      await query("DELETE FROM push_subscriptions WHERE contractor_id = $1 AND endpoint = $2", [payload.sub, endpoint]);
    } else {
      await query("DELETE FROM push_subscriptions WHERE contractor_id = $1", [payload.sub]);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
