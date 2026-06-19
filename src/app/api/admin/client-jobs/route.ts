import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

interface JobRow {
  id: string;
  title: string;
  description: string;
  postal_code: string;
  budget: string;
  status: string;
  created_at: Date;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ ok: false, error: "clientId required" }, { status: 400 });

  const rows = await query<JobRow>(
    `SELECT id, title, description, postal_code, budget, status, created_at
     FROM jobs WHERE client_id = $1 ORDER BY created_at DESC`,
    [clientId]
  );

  return NextResponse.json({
    ok: true,
    data: rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      postalCode: r.postal_code,
      budget: r.budget,
      status: r.status,
      createdAt: r.created_at.toISOString(),
    })),
  });
}
