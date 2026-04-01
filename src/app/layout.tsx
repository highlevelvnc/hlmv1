import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "HLM — Revenue Systems for Serious Operators",
    template: "%s | HLM",
  },
  description:
    "HLM builds intelligent revenue systems — combining paid traffic, automation, and AI to help B2B and e-commerce operators grow predictably.",
  keywords: [
    "revenue systems",
    "paid traffic",
    "marketing automation",
    "AI solutions",
    "growth agency",
    "ROAS",
    "lead generation",
  ],
  authors: [{ name: "HLM" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "HLM",
    title: "HLM — Revenue Systems for Serious Operators",
    description:
      "HLM builds intelligent revenue systems — combining paid traffic, automation, and AI to help operators grow predictably.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HLM — Revenue Systems for Serious Operators",
    description:
      "HLM builds intelligent revenue systems — combining paid traffic, automation, and AI to help operators grow predictably.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white overflow-x-hidden">{children}</body>
    </html>
  );
}
