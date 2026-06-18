import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { verifyMagicLink } from "@/lib/client-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ ok: false, code: "missing_token" }, { status: 400 });
    }

    const result = await verifyMagicLink(token);
    if (!result) {
      return NextResponse.redirect(new URL("/fr?magic=expired", req.url));
    }

    const jwt = await signToken({ sub: result.jobId, role: "client" });

    const isHttps = req.headers.get("x-forwarded-proto") === "https";
    const url = new URL(`/fr/mon-projet/${result.jobId}`, req.url);
    const response = NextResponse.redirect(url);
    response.cookies.set("client_token", jwt, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (err) {
    console.error("Magic link auth error:", err);
    return NextResponse.json({ ok: false, code: "server_error" }, { status: 500 });
  }
}
