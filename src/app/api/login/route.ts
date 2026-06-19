import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { verifyAdmin, verifyContractorPassword } from "@/lib/auth-store";
import { recordLoginAttempt, getRecentFailedAttempts, getRecentFailedAttemptsByIP } from "@/lib/security-store";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false, code: "missing_fields" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    const [userFails, ipFails] = await Promise.all([
      getRecentFailedAttempts(username, 15),
      getRecentFailedAttemptsByIP(ip, 15),
    ]);

    if (userFails >= 5) {
      return NextResponse.json({ ok: false, code: "too_many_attempts", retryAfter: 15 }, { status: 429 });
    }
    if (ipFails >= 10) {
      return NextResponse.json({ ok: false, code: "ip_blocked", retryAfter: 15 }, { status: 429 });
    }

    const isHttps = req.headers.get("x-forwarded-proto") === "https";
    const cookieOptions = {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24,
    };

    const adminValid = await verifyAdmin(username, password);
    if (adminValid) {
      await recordLoginAttempt(username, ip, true);
      const token = await signToken({ sub: username, role: "admin" });
      const res = NextResponse.json({ ok: true, role: "admin" });
      res.cookies.set("admin_token", token, cookieOptions);
      return res;
    }

    const contractor = await verifyContractorPassword(username, password);
    if (contractor) {
      await recordLoginAttempt(username, ip, true);
      const token = await signToken({ sub: contractor.id, role: "contractor" });
      const res = NextResponse.json({ ok: true, role: "contractor" });
      res.cookies.set("contractor_token", token, cookieOptions);
      return res;
    }

    await recordLoginAttempt(username, ip, false);
    return NextResponse.json({ ok: false, code: "invalid_credentials" }, { status: 401 });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ ok: false, code: "server_error" }, { status: 500 });
  }
}
