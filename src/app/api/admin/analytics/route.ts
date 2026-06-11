import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAnalytics } from "@/lib/admin-store";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, data: getAnalytics() });
}
