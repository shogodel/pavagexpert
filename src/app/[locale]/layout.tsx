import { notFound } from "next/navigation";
import { locales, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import I18nProvider from "@/components/i18n-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);

  return (
    <html lang={locale} className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <I18nProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
