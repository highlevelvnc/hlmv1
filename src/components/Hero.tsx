"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

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

    const seekTo = (t: number) => {
      try {
        const media = video as HTMLVideoElement & { fastSeek?: (time: number) => void };
        if (typeof media.fastSeek === "function") media.fastSeek(t);
        else video.currentTime = t;
      } catch {
        // ignore — may fire before metadata is ready
      }
    };

    const handleScroll = () => {
      if (!video.duration) return;
      const progress = Math.max(0, Math.min(1, window.scrollY / window.innerHeight));
      seekTo(progress * video.duration);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      aria-label="HLM — Intelligent revenue systems"
      className="relative flex w-full items-center justify-center overflow-hidden bg-white"
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

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Visually hidden h1 — preserves heading structure for SEO/a11y; logo carries visual brand */}
        <h1 className="sr-only">HLM — Intelligent Revenue Systems</h1>
        <p className="max-w-md text-base font-light leading-relaxed tracking-wide text-neutral-500">
          Intelligent systems, refined by design.
        </p>
      </div>
    </section>
  );
}
