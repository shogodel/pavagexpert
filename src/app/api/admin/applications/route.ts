import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getPendingApplications, approveApplication, rejectApplication } from "@/lib/auth-store";
import { sendEmail } from "@/lib/email";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  try {
    const data = await getPendingApplications();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Get applications error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req);
  if (auth) return auth;
  try {
    const { id, action, notes } = await req.json();
    if (!id || !action) {
      return NextResponse.json({ ok: false, error: "Missing id or action" }, { status: 400 });
    }
    if (action === "approve") {
      const result = await approveApplication(id);
      if (!result) return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
      const approveNotes = notes ? `<p><strong>Note de l'administrateur :</strong> ${notes}</p>` : "";
      await sendEmail({
        to: result.email,
        subject: "Candidature approuvée — Pavagexpert",
        html: `<p>Bonjour ${result.company},</p>
<p>Votre candidature d'entrepreneur a été <strong>approuvée</strong> !</p>
${approveNotes}
<p>Connectez-vous avec les identifiants suivants :</p>
<p>
  Identifiant : <strong>${result.username}</strong><br>
  Mot de passe : <strong>${result.password}</strong>
</p>
<p><a href="https://pavagexpert.space/login">Se connecter</a></p>
<p>Nous vous recommandons de changer votre mot de passe après la première connexion.</p>
<p>— L'équipe Pavagexpert</p>`,
      });
      return NextResponse.json({ ok: true });
    }
    if (action === "reject") {
      const result = await rejectApplication(id);
      if (!result) return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
      const rejectNotes = notes ? `<p><strong>Note de l'administrateur :</strong> ${notes}</p>` : "";
      await sendEmail({
        to: result.email,
        subject: "Candidature — Pavagexpert",
        html: `<p>Bonjour ${result.company},</p>
<p>Nous avons examiné votre candidature d'entrepreneur.</p>
<p>Malheureusement, nous ne pouvons pas donner suite à votre demande à ce moment-ci.</p>
${rejectNotes}
<p>— L'équipe Pavagexpert</p>`,
      });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Application action error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
