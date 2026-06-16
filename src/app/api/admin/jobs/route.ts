import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getJobs, addJob, updateJobStatus, updateJob, deleteJob } from "@/lib/job-store";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });
  return null;
}

export async function GET() {
  const jobs = await getJobs();
  return NextResponse.json({ ok: true, data: jobs });
}

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  try {
    const body = await req.json();
    if (!body.name || !body.description) {
      return NextResponse.json({ ok: false, error: "Name and description required" }, { status: 400 });
    }
    const job = await addJob({
      name: body.name,
      email: body.email || "",
      phone: body.phone || "",
      postalCode: body.postalCode || "",
      budget: body.budget || "",
      description: body.description,
    });
    return NextResponse.json({ ok: true, data: job });
  } catch (err) {
    console.error("Admin add job error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
    if (body.status) {
      const ok = await updateJobStatus(body.id, body.status);
      if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    if (body.title !== undefined || body.description !== undefined || body.postalCode !== undefined || body.budget !== undefined) {
      const ok = await updateJob(body.id, {
        title: body.title,
        description: body.description,
        postalCode: body.postalCode,
        budget: body.budget,
      });
      if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin update job error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
    const ok = await deleteJob(id);
    if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin delete job error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
