import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { updateJobStatus } from "@/lib/job-store";
import { getJobById } from "@/lib/job-store";
import { sendEmail } from "@/lib/email";
import { jobCompleteClient, reviewInvite } from "@/lib/email-templates";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("client_token")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "client" || payload.sub !== id) {
    return NextResponse.json({ ok: false, code: "forbidden" }, { status: 403 });
  }
  const ok = await updateJobStatus(id, "completed");
  if (!ok) {
    return NextResponse.json({ ok: false, code: "not_found" }, { status: 404 });
  }

  try {
    const job = await getJobById(id);
    if (job) {
      await sendEmail({
        to: job.email,
        subject: "Votre projet est terminé — Pavagexpert",
        html: jobCompleteClient(job.name),
      });
    }
  } catch { /* completion emails are best-effort */ }

  return NextResponse.json({ ok: true });
}
