import type { Metadata } from "next";
import { getMessages } from "@/i18n/get-messages";
import { isLocale, defaultLocale } from "@/i18n/config";
import ContractorProfileClient from "./profile";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const messages = await getMessages(locale);
  return { title: messages.profile?.title ? `${messages.profile.title} - Pavagexpert` : "Mon profil - Pavagexpert" };
}

export default function ContractorProfilePage() {
  return <ContractorProfileClient />;
}
