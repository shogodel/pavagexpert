import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createDataRequest } from "@/lib/compliance-store";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, requestType } = body;

    if (!email || !requestType || !["deletion", "export"].includes(requestType)) {
      return NextResponse.json({ error: "Email and valid requestType required" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await createDataRequest({ email, requestType, token });

    const confirmUrl = `https://pavagexpert.space/api/data/confirm?token=${token}`;
    const typeLabel = requestType === "deletion" ? "suppression" : "export";
    const subjectFr = `Confirmation de demande de ${typeLabel} de données`;
    const subjectEn = `Confirm your data ${requestType} request`;

    await sendEmail({
      to: email,
      subject: `Pavagexpert — ${subjectFr}`,
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#c87d5d;padding:24px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Pavagexpert</h1>
</td></tr>
<tr><td style="padding:24px;color:#292524;font-size:14px;line-height:1.6">
<p style="font-size:16px;font-weight:600;color:#292524">Confirmez votre demande de ${typeLabel}</p>
<p>Bonjour,</p>
<p>Vous avez demandé la <strong>${typeLabel}</strong> de vos données personnelles sur Pavagexpert.</p>
<p>Cliquez sur le bouton ci-dessous pour confirmer votre demande :</p>
<a href="${confirmUrl}" style="display:inline-block;background:#c87d5d;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;margin:16px 0">Confirmer la demande</a>
<p style="color:#a8a29e;font-size:12px">Ce lien expire dans 7 jours. Si vous n'êtes pas à l'origine de cette demande, ignorez ce courriel.</p>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;text-align:center;color:#a8a29e;font-size:11px">
Pavagexpert &mdash; Montréal, QC
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
    });

    return NextResponse.json({ ok: true, message: "Verification email sent" });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
