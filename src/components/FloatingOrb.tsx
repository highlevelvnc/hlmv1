"use client";

import { useEffect, useRef } from "react";

/**
 * Floating companion orb that traverses the viewport as you scroll.
 * Oscillates horizontally (sine wave), rotates in the direction of
 * movement, and breathes gently. Creates a living UX thread across
 * the entire page.
 */
export default function FloatingOrb() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const _el = ref.current;
    if (!_el) return;
    const el: HTMLDivElement = _el;

    let scrollNorm = 0;

    // Current interpolated state (lerped each frame)
    let curX   = 0.5;   // 0-1 across viewport width
    let curY   = 0.15;  // 0-1 across viewport height
    let curRot = 0;     // degrees
    let curScale = 1;

    let rafId: number;

    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollNorm = max > 0 ? window.scrollY / max : 0;
    }

    function tick() {
      // ── Target Y: scroll top → bottom ────────────────────────────
      const yTarget = 0.10 + scrollNorm * 0.80;

      // ── Target X: sinusoidal oscillation across viewport ─────────
      // 2.5 full oscillations across the page, amplitude ±38% from center
      const xTarget = 0.50 + Math.sin(scrollNorm * Math.PI * 5) * 0.38;

      // ── Lerp toward targets ──────────────────────────────────────
      const prevX = curX;
      curX += (xTarget - curX) * 0.025;
      curY += (yTarget - curY) * 0.025;

      // ── Rotation: follows horizontal velocity ────────────────────
      // Positive velocity (moving right) → clockwise tilt
      const xVelocity = curX - prevX;
      const rotTarget = xVelocity * 4000; // amplify for visible rotation
      curRot += (rotTarget - curRot) * 0.04;

      // ── Breathing scale ──────────────────────────────────────────
      curScale = 1 + Math.sin(performance.now() * 0.0008) * 0.10;

      // ── Apply ────────────────────────────────────────────────────
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const px = curX * vw;
      const py = curY * vh;

      el.style.transform = [
        `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`,
        `rotate(${curRot.toFixed(1)}deg)`,
        `scale(${curScale.toFixed(3)})`,
      ].join(" ");

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed z-30"
      aria-hidden="true"
      style={{
        left: 0,
        top: 0,
        // Center the orb on its own coordinates
        marginLeft: -20,
        marginTop: -20,
        width: 40,
        height: 40,
        borderRadius: "50%",
        // Asymmetric gradient — light spot at 35% 30% makes rotation visible
        background: [
          "radial-gradient(circle at 35% 30%, rgba(130,140,200,0.40), rgba(115,125,185,0.18) 40%, rgba(105,115,170,0.06) 65%, transparent 100%)",
        ].join(","),
        boxShadow: "0 0 24px 10px rgba(115,125,185,0.10), 0 0 60px 20px rgba(115,125,185,0.04)",
      }}
    />
  );
}
