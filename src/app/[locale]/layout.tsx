import { notFound } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import Script from "next/script";
import { locales, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import I18nProvider from "@/components/i18n-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import JsonLd from "@/components/json-ld";
import BreadcrumbJsonLd from "@/components/breadcrumb-json-ld";
import UtmCapture from "@/components/utm-capture";
import CookieConsent from "@/components/cookie-consent";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: messages.seo?.home_title,
    description: messages.seo?.home_desc,
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
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get("cookie_consent")?.value || "";
  const analyticsConsent = consentCookie.includes("analytics");

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18245853211" strategy="afterInteractive" />
        <Script id="google-ads-config" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:${analyticsConsent?'"granted"':'"denied"'},
ad_user_data:${analyticsConsent?'"granted"':'"denied"'},
ad_personalization:${analyticsConsent?'"granted"':'"denied"'},
analytics_storage:${analyticsConsent?'"granted"':'"denied"'}});gtag('js',new Date());gtag('config','AW-18245853211');`,
        }} />
        <JsonLd locale={locale} />
        <BreadcrumbJsonLd locale={locale} />
        <I18nProvider locale={locale} messages={messages}>
          <UtmCapture />
          <Header />
          <main className="flex-1 pb-[52px] lg:pb-0">{children}</main>
          <Footer />
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  );
}
