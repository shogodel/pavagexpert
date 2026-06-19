import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getTwoFactorStatus, setTwoFactorSecret } from "@/lib/security-store";
import speakeasy from "speakeasy";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value || req.cookies.get("contractor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const status = await getTwoFactorStatus(payload.role as "admin" | "contractor", payload.sub);
    if (status.enabled) {
      return NextResponse.json({ error: "2FA already enabled" }, { status: 400 });
    }

    const secret = speakeasy.generateSecret({ name: `Pavagexpert (${payload.sub})` });
    await setTwoFactorSecret(payload.role as "admin" | "contractor", payload.sub, secret.base32);

    const qrcode = await import("qrcode");
    const qrDataUrl = await qrcode.default.toDataURL(secret.otpauth_url || "");

    return NextResponse.json({ ok: true, secret: secret.base32, qrDataUrl });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
