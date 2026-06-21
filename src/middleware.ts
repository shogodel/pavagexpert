import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, isLocale } from "./i18n/config";

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function findLocale(pathname: string): string | undefined {
  return locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const found = findLocale(pathname);

  if (found) {
    const response = NextResponse.next();
    setLocaleCookie(response, found);
    return response;
  }

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  const newUrl = new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url);
  newUrl.search = search;

  const response = NextResponse.redirect(newUrl);
  setLocaleCookie(response, locale);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|images|sw\\.js|favicon.ico).*)",
  ],
};
