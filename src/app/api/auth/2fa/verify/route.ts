import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getTwoFactorStatus, enableTwoFactor } from "@/lib/security-store";
import speakeasy from "speakeasy";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value || req.cookies.get("contractor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const status = await getTwoFactorStatus(payload.role as "admin" | "contractor", payload.sub);
    if (!status.hasSecret) return NextResponse.json({ error: "2FA not set up" }, { status: 400 });

    const verified = speakeasy.totp.verify({
      secret: status.secret || "",
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!verified) return NextResponse.json({ error: "Invalid code" }, { status: 401 });

    await enableTwoFactor(payload.role as "admin" | "contractor", payload.sub);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
