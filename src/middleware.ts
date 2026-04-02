import { NextRequest, NextResponse } from "next/server";
import { LANGS, LANG_COOKIE } from "./i18n/constants";

export function middleware(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lang = searchParams.get("lang");

  if (lang && (LANGS as readonly string[]).includes(lang)) {
    // Set cookie and keep the param in URL for SEO (distinct indexable URLs)
    const res = NextResponse.next();
    res.cookies.set(LANG_COOKIE, lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  return NextResponse.next();
}

export const config = { matcher: "/" };
