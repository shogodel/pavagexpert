import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<{ id: string; logo_url: string; primary_color: string; welcome_message: string; domain: string; active: boolean }>(
    `SELECT * FROM contractor_branding WHERE contractor_id = $1`,
    [payload.sub]
  );

  return NextResponse.json({
    ok: true,
    branding: rows.length > 0 ? {
      id: rows[0].id, logoUrl: rows[0].logo_url, primaryColor: rows[0].primary_color,
      welcomeMessage: rows[0].welcome_message, domain: rows[0].domain, active: rows[0].active,
    } : null,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("contractor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "contractor") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { logoUrl, primaryColor, welcomeMessage, domain, active } = body;

    await query(
      `INSERT INTO contractor_branding (contractor_id, logo_url, primary_color, welcome_message, domain, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (contractor_id) DO UPDATE SET
         logo_url = COALESCE($2, contractor_branding.logo_url),
         primary_color = COALESCE($3, contractor_branding.primary_color),
         welcome_message = COALESCE($4, contractor_branding.welcome_message),
         domain = COALESCE($5, contractor_branding.domain),
         active = COALESCE($6, contractor_branding.active),
         updated_at = now()`,
      [payload.sub, logoUrl || "", primaryColor || "#c87d5d", welcomeMessage || "", domain || "", active ?? false]
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
