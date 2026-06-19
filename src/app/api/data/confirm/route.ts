import { NextRequest, NextResponse } from "next/server";
import { verifyDataRequest, anonPseudonymizeLeadsByEmail, exportUserData, completeDataRequest } from "@/lib/compliance-store";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/fr/data-request?error=missing-token", req.url));
    }

    const request = await verifyDataRequest(token);
    if (!request) {
      return NextResponse.redirect(new URL("/fr/data-request?error=invalid-expired", req.url));
    }

    if (request.requestType === "deletion") {
      await anonPseudonymizeLeadsByEmail(request.email);
      await completeDataRequest(request.id);

      await sendEmail({
        to: request.email,
        subject: "Pavagexpert — Demande de suppression traitée",
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#c87d5d;padding:24px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Pavagexpert</h1>
</td></tr>
<tr><td style="padding:24px;color:#292524;font-size:14px;line-height:1.6">
<p style="font-size:16px;font-weight:600;color:#292524">Demande de suppression traitée</p>
<p>Bonjour,</p>
<p>Vos données personnelles ont été anonymisées conformément à votre demande.</p>
<p>Conformément à la Loi sur la protection des renseignements personnels du Québec et au RGPD, vos informations ont été supprimées de nos systèmes actifs.</p>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;text-align:center;color:#a8a29e;font-size:11px">
Pavagexpert &mdash; Montréal, QC
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
      });

      return NextResponse.redirect(new URL("/fr/data-request?success=deletion", req.url));
    }

    const data = await exportUserData(request.email);
    await completeDataRequest(request.id);

    const json = JSON.stringify(data, null, 2);

    await sendEmail({
      to: request.email,
      subject: "Pavagexpert — Export de vos données personnelles",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#c87d5d;padding:24px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Pavagexpert</h1>
</td></tr>
<tr><td style="padding:24px;color:#292524;font-size:14px;line-height:1.6">
<p style="font-size:16px;font-weight:600;color:#292524">Export de vos données</p>
<p>Bonjour,</p>
<p>Vos données personnelles sont jointes à ce courriel au format JSON.</p>
<p>Conformément à la Loi sur la protection des renseignements personnels du Québec et au RGPD, vous trouverez ci-joint l'ensemble des données que nous détenons à votre sujet.</p>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;text-align:center;color:#a8a29e;font-size:11px">
Pavagexpert &mdash; Montréal, QC
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
    });

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="pavagexpert-data-${request.email}.json"`,
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/fr/data-request?error=internal", req.url));
  }
}
