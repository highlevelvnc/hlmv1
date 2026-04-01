"use client";

import { useEffect, useRef, useState } from "react";
import FadeIn from "./FadeIn";

// ─── Static data (outside component for stable format-fn references) ─────────

const METRICS = [
  {
    to:      3,
    format:  (n: number) => `$${Math.round(n)}M+`,
    label:   "Revenue attributed to HLM systems",
    primary: true,   // anchor metric — subtly brighter
  },
  {
    to:      4.8,
    format:  (n: number) => `${n.toFixed(1)}×`,
    label:   "Average return on ad spend",
    primary: false,
  },
  {
    to:      50,
    format:  (n: number) => `${Math.round(n)}+`,
    label:   "Automated pipelines deployed",
    primary: false,
  },
  {
    to:      97,
    format:  (n: number) => `${Math.round(n)}%`,
    label:   "Client retention over 12 months",
    primary: false,
  },
] as const;

const TESTIMONIALS = [
  {
    quote:   "HLM didn't pitch us a media plan. They mapped our entire revenue motion and rebuilt it from scratch. Three months in, our cost per acquisition dropped 40%.",
    author:  "Founder",
    company: "B2B SaaS — Series A",
  },
  {
    quote:   "The automation layer alone replaced two full-time SDR positions. The system qualifies, follows up, and books — around the clock.",
    author:  "Head of Growth",
    company: "E-commerce",
  },
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
                RESULTS
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
