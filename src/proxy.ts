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

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || locales.some((l) => pathname.startsWith(`/${l}/admin`));
}

function isAdminLoginPath(pathname: string): boolean {
  return pathname === "/login" || locales.some((l) => pathname === `/${l}/login`);
}

function isContractorLoginPath(pathname: string): boolean {
  return pathname === "/contractor/login" || locales.some((l) => pathname === `/${l}/contractor/login`);
}

function isContractorPath(pathname: string): boolean {
  return pathname.startsWith("/contractor/") || locales.some((l) => pathname.startsWith(`/${l}/contractor/`));
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // --- Admin auth check ---
  if (isAdminPath(pathname) && !isAdminLoginPath(pathname)) {
    const token = request.cookies.get("admin_token")?.value;
    if (token) {
      const { verifyToken } = await import("./lib/auth");
      const payload = await verifyToken(token);
      if (payload) {
        const found = findLocale(pathname);
        if (found) return NextResponse.next();
        const locale = defaultLocale;
        const url = new URL(`/${locale}/admin${pathname.replace(/^\/admin/, "") || ""}`, request.url);
        url.search = search;
        return NextResponse.redirect(url);
      }
    }
    // Not authenticated — redirect to login (preserve locale)
    const found = findLocale(pathname);
    const prefix = found ? `/${found}` : `/${defaultLocale}`;
    const loginUrl = new URL(`${prefix}/login`, request.url);
    loginUrl.search = search;
    return NextResponse.redirect(loginUrl);
  }

  // --- Contractor auth check ---
  if (isContractorPath(pathname) && !isContractorLoginPath(pathname)) {
    const token = request.cookies.get("contractor_token")?.value;
    if (token) {
      const { verifyToken } = await import("./lib/auth");
      const payload = await verifyToken(token);
      if (payload) {
        const found = findLocale(pathname);
        if (found) return NextResponse.next();
        const locale = defaultLocale;
        const url = new URL(`/${locale}/contractor${pathname.replace(/^\/contractor/, "") || ""}`, request.url);
        url.search = search;
        return NextResponse.redirect(url);
      }
    }
    const found = findLocale(pathname);
    const prefix = found ? `/${found}` : `/${defaultLocale}`;
    const loginUrl = new URL(`${prefix}/contractor/login`, request.url);
    loginUrl.search = search;
    return NextResponse.redirect(loginUrl);
  }

  // --- Locale detection ---
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
    "/((?!api|trpc|_next|_vercel|images|favicon.ico).*)",
  ],
};
