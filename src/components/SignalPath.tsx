"use client";

import { useEffect, useState } from "react";

interface Metrics {
  lineStart: number;   // document Y where line begins (hero bottom)
  lineLength: number;  // total drawable length
  leftPx: number;      // X aligned to content grid left edge
  zones: number[];     // document Y of each activation zone center
}

function docTop(el: Element): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

export default function SignalPath() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [progress, setProgress] = useState(0);
  const [inZone, setInZone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect reduced-motion preference once on client
  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // Measure section boundaries — runs after mount and on resize
  useEffect(() => {
    const measure = () => {
      const heroEl      = document.getElementById("s-hero");
      const scrollSeqEl = document.getElementById("s-scroll-seq");
      const valuePropEl = document.getElementById("s-value-prop");
      const proofEl     = document.getElementById("s-proof");
      const ctaEl       = document.getElementById("s-cta");

      if (!heroEl || !scrollSeqEl || !valuePropEl || !proofEl || !ctaEl) return;

      const heroH = heroEl.getBoundingClientRect().height;
      const proofH = proofEl.getBoundingClientRect().height;

      const lineStart  = docTop(heroEl) + heroH;
      const ctaTop     = docTop(ctaEl);
      const lineLength = ctaTop - lineStart;

      // Align to left edge of max-w-5xl (1024px) content column.
      // On narrow viewports, clamp to 16px so the line sits in the outer
      // gutter rather than flush with content text (which starts at 24px).
      const leftPx = Math.max(16, (window.innerWidth - 1024) / 2);

      setMetrics({
        lineStart,
        lineLength,
        leftPx,
        zones: [
          docTop(scrollSeqEl),                // zone 1 — hero → scroll sequence
          docTop(valuePropEl),                // zone 2 — scroll sequence → value prop
          docTop(proofEl) + proofH,           // zone 3 — proof → CTA
        ],
      });
    };

    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll listener — drives drawn progress and zone opacity
  useEffect(() => {
    if (!metrics || metrics.lineLength <= 0) return;

    const ZONE_RADIUS = 150; // px on each side of a boundary

    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Line tip leads scroll by 80% of viewport height —
      // the signal is slightly ahead of the user
      const drawToY = scrollY + vh * 0.8;
      setProgress(
        Math.max(0, Math.min(1, (drawToY - metrics.lineStart) / metrics.lineLength))
      );

      // Brighten slightly when viewport center is near a zone boundary
      const center = scrollY + vh / 2;
      setInZone(metrics.zones.some((z) => Math.abs(center - z) < ZONE_RADIUS));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // seed on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, [metrics]);

  if (!metrics || metrics.lineLength <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        top: metrics.lineStart,
        left: metrics.leftPx,
        width: 1,
        height: metrics.lineLength,
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {/* The drawn line — scaleY from top is GPU-composited */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgb(180, 185, 190)",
          opacity: inZone ? 0.055 : 0.025,
          transformOrigin: "top",
          transform: `scaleY(${reducedMotion ? 1 : progress})`,
          transition: "opacity 400ms ease",
          willChange: "transform",
        }}
      />
    </div>
  );
}
