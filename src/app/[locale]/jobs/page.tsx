import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import JobsBoard from "./board";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.jobs_title,
    description: messages.seo?.jobs_desc,
    alternates: { languages: { fr: "/fr/jobs", en: "/en/jobs" } },
  };
}

export default function JobsPage() {
  return <JobsBoard />;
}
