"use client";

import { useEffect, useState } from "react";

const NAV = [
  { label: "Process",  href: "#s-scroll-seq"  },
  { label: "Services", href: "#s-value-prop"   },
  { label: "Results",  href: "#s-proof"        },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // seed on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      aria-label="Site navigation"
      className="fixed inset-x-0 top-0 z-50"
      style={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.90)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.055)"
          : "1px solid transparent",
        transition:
          "background-color 600ms ease, backdrop-filter 600ms ease, border-color 500ms ease",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-[18px]">

        {/* Logo */}
        <a href="/" className="flex-shrink-0" aria-label="HLM home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="HLM"
            className="mix-blend-multiply"
            style={{ width: 36, height: "auto", opacity: 0.72 }}
          />
        </a>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden sm:flex items-center gap-9" aria-label="Main">
          {NAV.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[11px] font-light tracking-[0.2em] text-neutral-500 transition-colors duration-300 hover:text-neutral-900"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA pill */}
        <a
          href="#s-cta"
          className="rounded-full border px-5 py-[7px] text-[11px] font-light tracking-[0.18em] text-neutral-600 transition-colors duration-300 hover:border-neutral-400 hover:text-neutral-900"
          style={{
            borderColor: "rgba(0,0,0,0.14)",
          }}
        >
          Contact
        </a>

      </div>
    </header>
  );
}
