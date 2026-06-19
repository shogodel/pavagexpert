import { upsertCampaign } from "./drip-store";

export async function seedDripCampaigns(): Promise<void> {
  await upsertCampaign({
    slug: "abandoned_lead_24h",
    name: "Relance projet abandonné (24h)",
    triggerEvent: "lead_created",
    delayMinutes: 1440,
    subject: "Vous avez un projet en attente sur Pavagexpert",
    template: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#c87d5d;padding:24px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Pavagexpert</h1>
</td></tr>
<tr><td style="padding:24px;color:#292524;font-size:14px;line-height:1.6">
<p style="font-size:16px;font-weight:600;color:#292524">Votre projet nous intéresse</p>
<p>Bonjour,</p>
<p>Nous avons remarqué que vous avez commencé une demande de soumission sans la finaliser. Votre projet est important pour nous.</p>
<p>En quelques clics, recevez des soumissions d'entrepreneurs certifiés RBQ dans votre région.</p>
<a href="https://pavagexpert.space/fr/get-quote" style="display:inline-block;background:#c87d5d;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;margin:16px 0">Finaliser ma demande</a>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;text-align:center;color:#a8a29e;font-size:11px">
Pavagexpert &mdash; Montréal, QC
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
  });

  await upsertCampaign({
    slug: "unverified_lead_48h",
    name: "Relance confirmation (48h)",
    triggerEvent: "lead_created",
    delayMinutes: 2880,
    subject: "Confirmez votre projet pour être contacté",
    template: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#c87d5d;padding:24px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Pavagexpert</h1>
</td></tr>
<tr><td style="padding:24px;color:#292524;font-size:14px;line-height:1.6">
<p style="font-size:16px;font-weight:600;color:#292524">N'oubliez pas de confirmer votre projet</p>
<p>Bonjour,</p>
<p>Votre projet est toujours en attente de confirmation. Sans confirmation, les entrepreneurs ne peuvent pas vous contacter.</p>
<p>Vérifiez votre boîte de réception et cliquez sur le lien de confirmation que nous vous avons envoyé.</p>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;text-align:center;color:#a8a29e;font-size:11px">
Pavagexpert &mdash; Montréal, QC
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
  });

  await upsertCampaign({
    slug: "lead_followup_7d",
    name: "Suivi projet (7 jours)",
    triggerEvent: "lead_verified",
    delayMinutes: 10080,
    subject: "Comment se passe votre projet ?",
    template: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#c87d5d;padding:24px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Pavagexpert</h1>
</td></tr>
<tr><td style="padding:24px;color:#292524;font-size:14px;line-height:1.6">
<p style="font-size:16px;font-weight:600;color:#292524">Des nouvelles de votre projet ?</p>
<p>Bonjour,</p>
<p>Nous espérons que votre projet avance bien. Avez-vous été contacté par des entrepreneurs ?</p>
<p>Si vous avez besoin d'aide ou de recommandations supplémentaires, n'hésitez pas à nous répondre.</p>
<a href="https://pavagexpert.space/fr/mon-projet" style="display:inline-block;background:#c87d5d;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;margin:16px 0">Suivre mon projet</a>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;text-align:center;color:#a8a29e;font-size:11px">
Pavagexpert &mdash; Montréal, QC
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
  });

  await upsertCampaign({
    slug: "reengagement_30d",
    name: "Réengagement (30 jours)",
    triggerEvent: "lead_created",
    delayMinutes: 43200,
    subject: "Pavagexpert — Vous nous manquez !",
    template: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#c87d5d;padding:24px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Pavagexpert</h1>
</td></tr>
<tr><td style="padding:24px;color:#292524;font-size:14px;line-height:1.6">
<p style="font-size:16px;font-weight:600;color:#292524">Toujours à la recherche d'un entrepreneur ?</p>
<p>Bonjour,</p>
<p>Nous avons de nouveaux entrepreneurs certifiés dans votre région. Si votre projet est toujours d'actualité, soumettez une nouvelle demande.</p>
<a href="https://pavagexpert.space/fr/get-quote" style="display:inline-block;background:#c87d5d;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;margin:16px 0">Nouvelle demande</a>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;text-align:center;color:#a8a29e;font-size:11px">
Pavagexpert &mdash; Montréal, QC
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
  });
}
