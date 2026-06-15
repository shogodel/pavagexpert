import ApplyForm from "./form";
import { getMessages } from "@/i18n/get-messages";
import { isLocale, defaultLocale } from "@/i18n/config";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const messages = await getMessages(locale);
  return <ApplyForm locale={locale} t={messages.apply} />;
}
