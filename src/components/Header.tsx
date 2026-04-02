"use client";

import { useEffect, useState } from "react";

const NAV = [
  { label: "PROCESS",  href: "#s-scroll-seq" },
  { label: "SERVICES", href: "#s-value-prop"  },
  { label: "RESULTS",  href: "#s-proof"       },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 72);
      setRevealed(window.scrollY > window.innerHeight * 4.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      aria-label="Site navigation"
      className="fixed inset-x-0 top-0 z-50"
      style={{
        opacity: revealed ? 1 : 0,
        pointerEvents: revealed ? "auto" : "none",
        backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.055)" : "1px solid transparent",
        transition: "opacity 800ms ease, background-color 600ms ease, backdrop-filter 600ms ease, border-color 500ms ease",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex-shrink-0" aria-label="HLM home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HLM" className="mix-blend-multiply"
            style={{ width: 36, height: "auto", opacity: 0.72 }} />
        </a>

        {/* Nav — Dala-style uppercase, wider spacing */}
        <nav className="hidden sm:flex items-center gap-10" aria-label="Main">
          {NAV.map(({ label, href }) => (
            <a key={label} href={href}
              className="text-[13px] font-semibold tracking-[0.08em] text-neutral-500 transition-colors duration-300 hover:text-neutral-900">
              {label}
            </a>
          ))}
        </nav>

        {/* CTA — purple like Dala */}
        <a href="#s-cta"
          className="rounded-full bg-purple-600 px-6 py-2.5 text-[13px] font-semibold tracking-wide text-white transition-colors duration-300 hover:bg-purple-500">
          REQUEST A CONVERSATION
        </a>
      </div>
    </header>
  );
}
