import { NextRequest, NextResponse } from "next/server";
import { purgeOldData } from "@/lib/compliance-store";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(auth.slice(7));
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await purgeOldData();

    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.headers.get("x-cron-secret");

  if (cronSecret === process.env.CRON_SECRET) {
    const result = await purgeOldData();
    return NextResponse.json({ ok: true, ...result });
  }

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(authHeader.slice(7));
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await purgeOldData();
  return NextResponse.json({ ok: true, ...result });
}
