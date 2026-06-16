import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getJobs } from "@/lib/job-store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("contractor_token")?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (payload?.role !== "contractor") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let jobs = await getJobs();
  const { searchParams } = new URL(req.url);
  const postalCode = searchParams.get("postalCode")?.trim();
  const status = searchParams.get("status")?.trim();

  if (postalCode) {
    jobs = jobs.filter((j) => j.postalCode.startsWith(postalCode));
  }
  if (status && ["new", "in_progress", "completed"].includes(status)) {
    jobs = jobs.filter((j) => j.status === status);
  }

  return NextResponse.json(jobs);
}
