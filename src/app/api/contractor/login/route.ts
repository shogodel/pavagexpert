import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { verifyContractorPassword } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const contractor = await verifyContractorPassword(username, password);
    if (!contractor) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const token = await signToken({ sub: contractor.id, role: "contractor" });
    const res = NextResponse.json({ ok: true, data: contractor });
    const isHttps = req.headers.get("x-forwarded-proto") === "https";
    res.cookies.set("contractor_token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
