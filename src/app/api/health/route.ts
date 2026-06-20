import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/db";

export async function GET() {
  const dbOk = await healthCheck();
  if (!dbOk) {
    return NextResponse.json({ ok: false, status: "degraded" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
