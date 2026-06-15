import { NextRequest, NextResponse } from "next/server";
import { createApplication } from "@/lib/auth-store";
import { sendEmail } from "@/lib/email";

const rbqRegex = /^RBQ\s?\d{4,6}-\d{4,5}-\d{2}$/i;
const phoneRegex = /^\(?\d{3}\)?\s?\d{3}-?\d{4}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, rbqLicense, phone, email, yearsInBusiness, serviceAreas } = body;

    const errors: string[] = [];
    if (!company || typeof company !== "string" || company.length > 100) errors.push("company");
    if (!rbqLicense || !rbqRegex.test(rbqLicense)) errors.push("rbqLicense");
    if (!phone || !phoneRegex.test(phone)) errors.push("phone");
    if (!email || !email.includes("@")) errors.push("email");
    if (typeof yearsInBusiness !== "number" || yearsInBusiness < 0 || yearsInBusiness > 100) errors.push("yearsInBusiness");
    if (!Array.isArray(serviceAreas) || serviceAreas.length === 0) errors.push("serviceAreas");
    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    await createApplication({
      company: company.trim(),
      rbqLicense: rbqLicense.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      yearsInBusiness,
      serviceAreas,
    });

    await sendEmail({
      to: email.trim().toLowerCase(),
      subject: "Candidature reçue — Pavagexpert",
      html: `<p>Bonjour ${company},</p>
<p>Nous avons bien reçu votre candidature d'entrepreneur.</p>
<p>Notre équipe l'examinera sous 48 heures. Vous recevrez un courriel dès qu'une décision sera prise.</p>
<p>Merci de votre intérêt !</p>
<p>— L'équipe Pavagexpert</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message === "Email already registered") {
      return NextResponse.json({ ok: false, errors: ["email"] }, { status: 409 });
    }
    console.error("Apply error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
