import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  let dbOk = false;
  let migrationCount = 0;
  try {
    const result = await query<{ count: number }>("SELECT count(*) as count FROM _migrations");
    migrationCount = Number(result[0]?.count ?? 0);
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return NextResponse.json({
    ok: true,
    data: {
      dbConnected: dbOk,
      migrationCount,
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
    },
  });
}
