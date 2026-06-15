import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/job-store";

export async function GET(req: NextRequest) {
  let jobs = getJobs();
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
