import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { verifyAdmin, verifyContractorPassword } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false, code: "missing_fields" }, { status: 400 });
    }

    const isHttps = req.headers.get("x-forwarded-proto") === "https";
    const cookieOptions = {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24,
    };

    // Try admin first
    const adminValid = await verifyAdmin(username, password);
    if (adminValid) {
      const token = await signToken({ sub: username, role: "admin" });
      const res = NextResponse.json({ ok: true, role: "admin" });
      res.cookies.set("admin_token", token, cookieOptions);
      return res;
    }

    // Then try contractor
    const contractor = await verifyContractorPassword(username, password);
    if (contractor) {
      const token = await signToken({ sub: contractor.id, role: "contractor" });
      const res = NextResponse.json({ ok: true, role: "contractor" });
      res.cookies.set("contractor_token", token, cookieOptions);
      return res;
    }

    return NextResponse.json({ ok: false, code: "invalid_credentials" }, { status: 401 });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ ok: false, code: "server_error" }, { status: 500 });
  }
}
