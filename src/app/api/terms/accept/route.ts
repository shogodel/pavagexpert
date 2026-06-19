import { NextRequest, NextResponse } from "next/server";
import { recordTermsAcceptance } from "@/lib/compliance-store";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    let payload = null;

    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      payload = await verifyToken(auth.slice(7));
    }

    if (!payload) {
      const cookieToken = req.cookies.get("contractor_token")?.value || req.cookies.get("token")?.value;
      if (cookieToken) {
        payload = await verifyToken(cookieToken);
      }
    }

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { termsVersion } = body;

    if (!termsVersion) {
      return NextResponse.json({ error: "termsVersion required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    await recordTermsAcceptance({
      userType: payload.role as "client" | "contractor" | "admin",
      userId: payload.sub,
      termsVersion,
      ipAddress: ip,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
