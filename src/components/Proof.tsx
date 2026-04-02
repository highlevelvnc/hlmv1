"use client";

import { useEffect, useRef, useState } from "react";
import FadeIn from "./FadeIn";
import { useT } from "@/i18n/context";

// Format functions stay outside (no translation needed — numbers are universal)
const METRIC_FORMATS = [
  { to: 3,   format: (n: number) => `$${Math.round(n)}M+`,    primary: true },
  { to: 4.8, format: (n: number) => `${n.toFixed(1)}×`,       primary: false },
  { to: 50,  format: (n: number) => `${Math.round(n)}+`,      primary: false },
  { to: 97,  format: (n: number) => `${Math.round(n)}%`,      primary: false },
] as const;

// ─── Count-up ─────────────────────────────────────────────────────────────────

function CountUp({
  to,
  format,
  duration = 1500,
}: {
  to:       number;
  format:   (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay]  = useState(() => format(0));
  const spanRef                = useRef<HTMLSpanElement>(null);
  const startedRef             = useRef(false);

  useEffect(() => {
    // Respect reduced-motion — show final value instantly
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(format(to));
      return;
    }

    const el = spanRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();

        const startTime = performance.now();

        const tick = (now: number) => {
          const t      = Math.min((now - startTime) / duration, 1);
          const eased  = 1 - Math.pow(1 - t, 3); // ease-out cubic
          setDisplay(format(eased * to));
          if (t < 1) requestAnimationFrame(tick);
          else setDisplay(format(to)); // pin exact final value
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, format, duration]);

  return <span ref={spanRef}>{display}</span>;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Proof() {
  const t = useT();
  const METRICS = METRIC_FORMATS.map((m, i) => ({
    ...m,
    label: [t.m1_label, t.m2_label, t.m3_label, t.m4_label][i],
  }));
  const TESTIMONIALS = [
    { quote: t.t1_quote, author: t.t1_author, company: t.t1_company },
    { quote: t.t2_quote, author: t.t2_author, company: t.t2_company },
  ];
  return (
    <section className="relative w-full overflow-hidden" aria-label="Results and client testimonials">

      {/* White → dark ramp — h-48 for a gradual transition */}
      <div className="h-48 bg-gradient-to-b from-white to-[#0B0B0F]" />

      {/* Dark content area */}
      <div className="relative bg-[#0B0B0F] px-6 py-28 sm:py-40">
        <div className="relative mx-auto max-w-5xl">

          {/* Section label */}
          <FadeIn>
            <div className="mb-20 flex items-center gap-6">
              <div className="h-px w-10 bg-neutral-700" />
              <span className="text-xs font-medium tracking-[0.35em] text-neutral-500">
                {t.proof_tag}
              </span>
            </div>
          </FadeIn>

          {/* ── Metrics ── */}
          <div className="mb-32">
            <div className="grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-4 sm:gap-x-12">
              {METRICS.map((m, i) => (
                <FadeIn key={m.label} delay={i * 90}>
                  <div className="flex flex-col gap-4">
                    {/* Number — primary metric is pure white, others slightly dimmed */}
                    <span
                      className="text-[3.25rem] font-[200] leading-none tracking-tight sm:text-[4rem]"
                      style={{ color: m.primary ? "rgb(255,255,255)" : "rgb(244,244,245)" }}
                    >
                      <CountUp to={m.to} format={m.format} />
                    </span>

                    {/* Thin rule */}
                    <div className="h-px w-8 bg-neutral-800" />

                    {/* Label — neutral-400 on dark reads clearly without glare */}
                    <span className="text-xs font-light leading-[1.7] text-neutral-400">
                      {m.label}
                    </span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* ── Testimonials ── */}
          <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-20">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={i} delay={i * 140}>
                <div className="relative flex flex-col gap-6 border-l border-neutral-700 pl-8">
                  {/* Decorative open-quote mark */}
                  <span
                    className="absolute -left-2 -top-2 select-none text-[3rem] font-extralight leading-none text-neutral-700"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>

                  {/* Quote */}
                  <p className="text-[15px] font-light leading-[1.9] text-neutral-300">
                    {t.quote}
                  </p>

                  {/* Attribution */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal tracking-wide text-neutral-400">
                      {t.author}
                    </span>
                    <span className="text-[11px] font-light text-neutral-500">
                      {t.company}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

        </div>
      </div>

      {/* Dark → white ramp */}
      <div className="h-48 bg-gradient-to-b from-[#0B0B0F] to-white" />

    </section>
  );
}
