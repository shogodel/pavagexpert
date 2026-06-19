import { NextRequest, NextResponse } from "next/server";
import { processDripActions } from "@/lib/drip-store";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sent = await processDripActions();
  return NextResponse.json({ ok: true, sent });
}
