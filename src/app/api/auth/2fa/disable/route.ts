import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { disableTwoFactor } from "@/lib/security-store";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value || req.cookies.get("contractor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await disableTwoFactor(payload.role as "admin" | "contractor", payload.sub);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
