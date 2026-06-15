import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { verifyAdmin } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const valid = await verifyAdmin(username, password);
    if (!valid) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
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
