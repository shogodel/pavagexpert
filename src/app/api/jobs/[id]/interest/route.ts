import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { expressInterest } from "@/lib/claim-store";
import { getJobById } from "@/lib/job-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") return NextResponse.json({ ok: false }, { status: 401 });

  const job = await getJobById(id);
  if (!job) return NextResponse.json({ ok: false }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  try {
    const claim = await expressInterest(id, payload.sub, body.message || "");
    return NextResponse.json({ ok: true, data: claim });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "ALREADY_EXISTS") {
      return NextResponse.json({ ok: false, code: "already_exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
