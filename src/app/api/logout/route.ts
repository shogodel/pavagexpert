import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const isHttps = req.headers.get("x-forwarded-proto") === "https";
  const opts = { httpOnly: true, secure: isHttps, sameSite: "lax" as const, path: "/", maxAge: 0 };
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", "", opts);
  res.cookies.set("contractor_token", "", opts);
  res.cookies.set("client_token", "", opts);
  return res;
}
