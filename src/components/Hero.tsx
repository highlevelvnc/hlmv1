"use client";

import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  // Autoplay loop — plays continuously
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  // Scroll progress — drives content fade + scroll indicator (not the video)
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect          = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight;
      const scrolled      = -rect.top;
      setProgress(Math.max(0, Math.min(1, scrolled / sectionHeight)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Content fades out by 50 % progress, shifts up slightly
  const contentOpacity    = Math.max(0, 1 - progress * 2);
  const contentTranslateY = progress * 56;

  return (
    <section
      ref={sectionRef}
      aria-label="HLM — Revenue systems for serious operators"
      className="relative bg-white"
      style={{ height: "170vh" }}
    >
      {/* ── Sticky viewport ── */}
      <div
        className="sticky top-0 flex w-full items-center justify-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}
      >

        {/* ── Video — plays once, freezes on last frame ── */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ animation: "heroFadeIn 0.8s ease forwards" }}
        >
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            style={{ filter: "saturate(1.0) contrast(1.05) brightness(1.02)" }}
          >
            <source src="/FunnelSequence.mp4" type="video/mp4" />
          </video>
        </div>

        {/* ── Overlays — light touch, video stays dominant ── */}
        {/* Radial edge fade — keeps centre fully clear, only edges blend to white */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 0%, rgba(255,255,255,0.10) 82%, white 96%)",
          }}
        />

        {/* Thin edge vignettes — just enough to anchor the video to the white page */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/60 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/60 to-transparent" />
        </div>

        {/* ── Hero content — fades + rises on scroll ── */}
        <div
          className="relative z-10 flex flex-col items-center px-6 text-center"
          style={{
            gap: "1.25rem",
            opacity: contentOpacity,
            transform: `translateY(${contentTranslateY}px)`,
          }}
        >
          {/* Eyebrow */}
          <p className="text-[11px] font-light tracking-[0.35em] text-neutral-400">
            HLM
          </p>

          {/* Primary headline — visible, concrete, authoritative */}
          <h1 className="max-w-2xl text-[2.1rem] font-extralight leading-[1.1] tracking-tight text-neutral-900 sm:text-[3.75rem]">
            Revenue systems that
            <br className="hidden sm:block" />{" "}
            run while you sleep.
          </h1>

          {/* Sub-headline — specific capabilities */}
          <p className="max-w-xs text-[13px] font-light leading-relaxed tracking-[0.06em] text-neutral-500 sm:max-w-sm">
            Paid traffic. Automation. AI.
            <br />
            One integrated engine.
          </p>
        </div>

        {/* ── Scroll indicator ── */}
        <div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          aria-hidden="true"
          style={{ opacity: Math.max(0, 1 - progress * 5) }}
        >
          <div className="flex flex-col items-center gap-2 opacity-40">
            <span className="text-[10px] font-light tracking-[0.3em] text-neutral-400">
              SCROLL
            </span>
            <div
              className="h-8 w-px bg-gradient-to-b from-neutral-300 to-transparent"
              style={{ animation: "scrollPulse 2.5s ease-in-out infinite" }}
            />
          </div>
        </div>

      </div>
    </section>
  );
}
