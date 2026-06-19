import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event as string;
    if (!event || !["impression", "form_start"].includes(event)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const page = (body.page as string) || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
    const ua = req.headers.get("user-agent") || "";

    await query(
      "INSERT INTO analytics_events (event, page, ip, ua) VALUES ($1, $2, $3, $4)",
      [event, page, ip, ua]
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
