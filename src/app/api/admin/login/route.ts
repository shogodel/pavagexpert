import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { verifyAdmin } from "@/lib/auth-store";
import { recordLoginAttempt, getRecentFailedAttempts, getRecentFailedAttemptsByIP } from "@/lib/security-store";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    const [userFails, ipFails] = await Promise.all([
      getRecentFailedAttempts(username, 15),
      getRecentFailedAttemptsByIP(ip, 15),
    ]);

    if (userFails >= 5 || ipFails >= 10) {
      return NextResponse.json({ ok: false, code: "too_many_attempts" }, { status: 429 });
    }

    const valid = await verifyAdmin(username, password);
    if (!valid) {
      await recordLoginAttempt(username, ip, false);
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    await recordLoginAttempt(username, ip, true);
    const token = await signToken({ sub: username, role: "admin" });
    const res = NextResponse.json({ ok: true });
    const isHttps = req.headers.get("x-forwarded-proto") === "https";
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
