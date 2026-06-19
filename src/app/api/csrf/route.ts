import { NextRequest, NextResponse } from "next/server";
import { createCsrfToken } from "@/lib/security-store";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value || req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const csrf = await createCsrfToken();
  return NextResponse.json({ ok: true, csrfToken: csrf });
}
