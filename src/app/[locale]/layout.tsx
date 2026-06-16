import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { locales, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import I18nProvider from "@/components/i18n-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import JsonLd from "@/components/json-ld";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `https://pavagexpert.space/${locale}`,
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      siteName: "Pavagexpert",
      images: [{ url: "/images/icon-512.png" }],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

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
    <html lang={locale} className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <JsonLd locale={locale} />
        <I18nProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
