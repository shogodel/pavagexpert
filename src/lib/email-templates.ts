function wrap(html: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#c87d5d;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Pavagexpert</h1>
        </td></tr>
        <tr><td style="padding:24px;color:#292524;font-size:14px;line-height:1.6">
          ${html}
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;text-align:center;color:#a8a29e;font-size:11px">
          Pavagexpert &mdash; Montréal, QC
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function newApplicationAdmin(company: string, email: string, phone: string): string {
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#292524">Nouvelle candidature d&rsquo;entrepreneur</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td style="padding:6px 0;color:#78716c">Entreprise</td><td style="padding:6px 0;font-weight:500">${company}</td></tr>
      <tr><td style="padding:6px 0;color:#78716c">Courriel</td><td style="padding:6px 0;font-weight:500">${email}</td></tr>
      <tr><td style="padding:6px 0;color:#78716c">Téléphone</td><td style="padding:6px 0;font-weight:500">${phone}</td></tr>
    </table>
    <p style="margin-top:16px"><a href="https://pavagexpert.space/admin" style="display:inline-block;background:#c87d5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Voir dans le panneau admin</a></p>
  `.trim());
}

export function jobAssignedContractor(company: string, jobDescription: string, jobBudget: string, jobPostal: string): string {
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#292524">Un projet vous a été attribué</p>
    <p>Bonjour <strong>${company}</strong>,</p>
    <p>Un nouveau projet vous a été assigné sur Pavagexpert :</p>
    <div style="background:#fafaf9;border-radius:8px;padding:16px;margin:16px 0;font-size:13px">
      <p style="margin:0 0 8px"><strong>Description :</strong> ${jobDescription}</p>
      <p style="margin:0 0 8px"><strong>Budget :</strong> ${jobBudget || "—"}</p>
      <p style="margin:0"><strong>Code postal :</strong> ${jobPostal || "—"}</p>
    </div>
    <a href="https://pavagexpert.space/contractor/dashboard" style="display:inline-block;background:#c87d5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Voir dans mon tableau de bord</a>
  `.trim());
}

export function jobAssignedClient(clientName: string, company: string): string {
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#292524">Un entrepreneur a été assigné à votre projet</p>
    <p>Bonjour <strong>${clientName}</strong>,</p>
    <p>Un entrepreneur a été assigné à votre projet sur Pavagexpert :</p>
    <p style="font-size:16px;font-weight:600;text-align:center;margin:16px 0">${company}</p>
    <p>Il vous contactera sous peu pour discuter des détails et vous proposer un devis personnalisé.</p>
    <a href="https://pavagexpert.space/mon-projet" style="display:inline-block;background:#c87d5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Suivre mon projet</a>
  `.trim());
}

export function jobCompleteClient(clientName: string): string {
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#292524">Votre projet est terminé</p>
    <p>Bonjour <strong>${clientName}</strong>,</p>
    <p>Merci d&rsquo;avoir confirmé la fin de votre projet sur Pavagexpert.</p>
    <p>Nous espérons que le résultat est à la hauteur de vos attentes. Si vous avez aimé travailler avec votre entrepreneur, laissez un avis pour aider la communauté.</p>
    <a href="https://pavagexpert.space/mon-projet" style="display:inline-block;background:#c87d5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Laisser un avis</a>
  `.trim());
}

export function reviewInvite(clientName: string): string {
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#292524">Comment s&rsquo;est passé votre projet ?</p>
    <p>Bonjour <strong>${clientName}</strong>,</p>
    <p>Votre projet est terminé depuis quelques jours. Nous serions ravis de connaître votre expérience.</p>
    <p>Partager votre avis aide d&rsquo;autres propriétaires à choisir le bon entrepreneur en toute confiance.</p>
    <a href="https://pavagexpert.space/mon-projet" style="display:inline-block;background:#c87d5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Donner mon avis</a>
  `.trim());
}

export function newJobToContractors(): string {
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#292524">Nouveau projet disponible</p>
    <p>Un nouveau projet a été publié sur Pavagexpert.</p>
    <p>Connectez-vous pour voir les détails et manifester votre intérêt.</p>
    <a href="https://pavagexpert.space/fr/jobs" style="display:inline-block;background:#c87d5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Voir les projets</a>
  `.trim());
}

export function leadVerification(clientName: string, verifyUrl: string): string {
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#292524">Confirmez votre projet</p>
    <p>Bonjour <strong>${clientName}</strong>,</p>
    <p>Cliquez sur le bouton ci-dessous pour confirmer votre projet. Une fois confirmé, il sera transmis aux entrepreneurs certifiés de notre réseau.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:#c87d5d;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;margin:16px 0">Confirmer mon projet</a>
    <p style="color:#a8a29e;font-size:12px;line-height:1.4">Ce lien expire dans 7 jours. Si vous n'êtes pas à l'origine de cette demande, ignorez ce courriel.</p>
  `.trim());
}

export function invoiceReady(company: string, totalCents: number, periodStart: string, periodEnd: string): string {
  const total = (totalCents / 100).toFixed(2);
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#292524">Facture mensuelle disponible</p>
    <p>Bonjour <strong>${company}</strong>,</p>
    <p>Votre facture pour la période du <strong>${periodStart}</strong> au <strong>${periodEnd}</strong> est prête.</p>
    <div style="background:#fafaf9;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
      <p style="margin:0;color:#78716c;font-size:13px">Montant dû</p>
      <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#292524">${total} $</p>
    </div>
    <p style="font-size:13px;color:#78716c">Veuillez effectuer le virement Interac à <strong>pavagexpertmtl@gmail.com</strong>.</p>
    <a href="https://pavagexpert.space/contractor/bills" style="display:inline-block;background:#c87d5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Voir ma facture</a>
  `.trim());
}

export function paymentReceived(company: string, totalCents: number): string {
  const total = (totalCents / 100).toFixed(2);
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#292524">Paiement reçu</p>
    <p>Bonjour <strong>${company}</strong>,</p>
    <p>Nous avons bien reçu votre paiement de <strong>${total} $</strong>. Merci !</p>
    <p>Vous pouvez consulter l&rsquo;historique de vos factures dans votre tableau de bord.</p>
    <a href="https://pavagexpert.space/contractor/bills" style="display:inline-block;background:#c87d5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Voir mes factures</a>
  `.trim());
}

export function paymentOverdue(company: string, totalCents: number): string {
  const total = (totalCents / 100).toFixed(2);
  return wrap(`
    <p style="font-size:16px;font-weight:600;color:#dc2626">Paiement en retard</p>
    <p>Bonjour <strong>${company}</strong>,</p>
    <p>Nous n&rsquo;avons pas encore reçu votre paiement de <strong>${total} $</strong>.</p>
    <p>Veuillez effectuer le virement Interac à <strong>pavagexpertmtl@gmail.com</strong> dès que possible pour éviter toute suspension de votre compte.</p>
    <a href="https://pavagexpert.space/contractor/bills" style="display:inline-block;background:#dc2626;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Régler ma facture</a>
  `.trim());
}
