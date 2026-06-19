import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { acceptClaim } from "@/lib/claim-store";
import { sendEmail } from "@/lib/email";
import { jobAssignedContractor, jobAssignedClient } from "@/lib/email-templates";
import { query } from "@/lib/db";
import { getJobById } from "@/lib/job-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });

  const claim = await acceptClaim(id);
  if (!claim) return NextResponse.json({ ok: false, code: "not_found_or_not_pending" }, { status: 404 });

  try {
    const [contractor, job] = await Promise.all([
      query<{ company: string; email: string }>(
        "SELECT company, email FROM contractors WHERE id = $1", [claim.contractorId]
      ),
      getJobById(claim.jobId),
    ]);

    if (contractor.length > 0 && job) {
      await sendEmail({
        to: contractor[0].email,
        subject: "Un projet vous a été attribué — Pavagexpert",
        html: jobAssignedContractor(contractor[0].company, job.description, job.budget, job.postalCode),
      });
      await sendEmail({
        to: job.email,
        subject: "Un entrepreneur a été assigné à votre projet — Pavagexpert",
        html: jobAssignedClient(job.name, contractor[0].company),
      });
    }
  } catch { /* assignment emails are best-effort */ }

  return NextResponse.json({ ok: true, data: claim });
}
