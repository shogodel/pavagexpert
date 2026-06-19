import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAuditLog } from "@/lib/security-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100", 10);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);
  const logs = await getAuditLog(limit, offset);

  return NextResponse.json({ ok: true, logs });
}
