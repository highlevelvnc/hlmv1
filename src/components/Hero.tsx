"use client";

import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      video.play().catch(() => {});
      return;
    }

    // iOS unlock: play then immediately pause so currentTime seeking is unblocked
    const unlock = () => {
      video.play().then(() => {
        video.pause();
        video.currentTime = 0;
      }).catch(() => {});
    };

    if (video.readyState >= 1) {
      unlock();
    } else {
      video.addEventListener("loadedmetadata", unlock, { once: true });
    }

    // Lerp-based smooth seeking — scroll sets target, RAF eases toward it
    let currentTime = 0;
    let targetTime = 0;
    let rafId: number;

    const animate = () => {
      if (video.duration) {
        currentTime += (targetTime - currentTime) * 0.08;

        if (Math.abs(currentTime - targetTime) > 0.005) {
          try {
            video.currentTime = currentTime;
          } catch {
            // ignore
          }
        }
      }
      rafId = requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      if (!sectionRef.current || !video.duration) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / sectionHeight));
      setProgress(p);
      targetTime = p * video.duration;
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fade out hero content as the user scrolls deeper
  const contentOpacity = Math.max(0, 1 - progress * 2.5);
  // Slight parallax shift on content
  const contentTranslateY = progress * 60;

  return (
    <section
      ref={sectionRef}
      aria-label="HLM — Intelligent revenue systems"
      className="relative bg-white"
      style={{ height: "250vh" }}
    >
      {/* Sticky viewport container — stays on screen while scrolling through the section */}
      <div
        className="sticky top-0 flex w-full items-center justify-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}
      >
        {/* Logo — top left */}
        <div className="absolute top-8 left-8 z-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="HLM"
            className="w-12 sm:w-14 opacity-80 mix-blend-multiply"
            style={{ height: "auto" }}
            fetchPriority="high"
          />
        </div>

        {/* Language switcher — top right */}
        <div className="absolute top-9 right-8 z-20">
          <LanguageSwitcher />
        </div>

        {/* Decorative video layer */}
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            style={{
              filter: "saturate(0.8) contrast(0.92) brightness(1.0) blur(0.3px)",
            }}
          >
            <source src="/FunnelSequence.mp4" type="video/mp4" />
          </video>
        </div>

        {/* White overlay — light veil to integrate with page */}
        <div className="absolute inset-0 bg-white/[0.18]" aria-hidden="true" />

        {/* Inward masking gradient — center breathes, edges dissolve to white */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 68% 62% at 50% 50%, transparent 0%, rgba(255,255,255,0.12) 38%, rgba(255,255,255,0.60) 65%, white 88%)",
          }}
        />

        {/* Edge vignettes */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
          <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-white to-transparent" />
          <div className="absolute inset-y-0 right-0 w-36 bg-gradient-to-l from-white to-transparent" />
        </div>

        {/* Hero content — fades out and shifts up as user scrolls */}
        <div
          className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
          style={{
            opacity: contentOpacity,
            transform: `translateY(${contentTranslateY}px)`,
          }}
        >
          <h1 className="sr-only">HLM — Intelligent Revenue Systems</h1>
          <p className="max-w-md text-base font-light leading-relaxed tracking-wide text-neutral-500">
            Intelligent systems, refined by design.
          </p>
        </div>

        {/* Scroll indicator — fades out quickly */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          aria-hidden="true"
          style={{ opacity: Math.max(0, 1 - progress * 5) }}
        >
          <div className="flex flex-col items-center gap-2 opacity-40">
            <span className="text-[10px] font-light tracking-[0.3em] text-neutral-400">SCROLL</span>
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

/* ── Inline language switcher ── */
function LanguageSwitcher() {
  return (
    <div className="flex items-center gap-0.5">
      {(["PT", "EN", "DE", "FR"] as const).map((lang, i) => (
        <span key={lang} className="flex items-center">
          {i > 0 && <span className="mx-1 text-neutral-200 text-[10px] select-none">/</span>}
          <button
            className="text-[11px] font-light tracking-wider text-neutral-400 transition-colors duration-300 hover:text-neutral-800 cursor-pointer"
          >
            {lang}
          </button>
        </span>
      ))}
    </div>
  );
}
