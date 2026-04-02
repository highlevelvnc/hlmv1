import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLang } from "@/i18n/get-lang";
import { getDict } from "@/i18n/dictionaries";
import { LangProvider } from "@/i18n/context";
import { LANGS } from "@/i18n/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://hlm.com";

// ── Dynamic metadata per language ─────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const dict = getDict(lang);

  const localeMap: Record<string, string> = { en: "en_US", pt: "pt_BR", fr: "fr_FR", de: "de_DE" };

  return {
    metadataBase: new URL(BASE_URL),
    title: { default: dict.meta_title, template: "%s | HLM" },
    description: dict.meta_description,
    keywords: ["revenue systems", "paid traffic", "marketing automation", "AI solutions", "growth agency", "ROAS", "lead generation"],
    authors: [{ name: "HLM" }],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    icons: { icon: "/favicon.ico", apple: "/logo.png" },
    alternates: {
      languages: Object.fromEntries(LANGS.map(l => [l, `${BASE_URL}?lang=${l}`])),
    },
    openGraph: {
      type: "website",
      url: BASE_URL,
      siteName: "HLM",
      title: dict.meta_title,
      description: dict.meta_description,
      locale: localeMap[lang] ?? "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta_title,
      description: dict.meta_description,
    },
  };
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  const dict = getDict(lang);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* hreflang tags for SEO */}
        {LANGS.map(l => (
          <link key={l} rel="alternate" hrefLang={l} href={`${BASE_URL}?lang=${l}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
      </head>
      <body className="min-h-full bg-white overflow-x-hidden">
        <LangProvider lang={lang} dict={dict}>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
