"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/context";

export default function ScrollSequence() {
  const t = useT();
  const stages = [
    { label: t.scroll_s1_label, title: t.scroll_s1_title, description: t.scroll_s1_desc },
    { label: t.scroll_s2_label, title: t.scroll_s2_title, description: t.scroll_s2_desc },
    { label: t.scroll_s3_label, title: t.scroll_s3_title, description: t.scroll_s3_desc },
  ];
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const prefersReducedRef = useRef(false);

  // Setup: reduced-motion check + iOS video unlock + lerp animation loop
  useEffect(() => {
    prefersReducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedRef.current) {
      video.play().catch(() => {});
      return;
    }

    // iOS unlock
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

    // Smooth seeking — slow lerp + minimum seek threshold to prevent stutter
    let currentTime = 0;
    let lastSeekTime = 0;
    let rafId: number;

    const animate = () => {
      if (video.duration && targetTimeRef.current >= 0) {
        // Very gentle lerp — prevents rapid frame-by-frame seeking
        currentTime += (targetTimeRef.current - currentTime) * 0.04;

        const delta = Math.abs(currentTime - lastSeekTime);
        // Only seek if delta is large enough (prevents micro-stutters)
        // AND enough time has passed since last seek (throttle to ~20fps max)
        if (delta > 0.03) {
          try {
            video.currentTime = currentTime;
            lastSeekTime = currentTime;
          } catch {
            // ignore
          }
        }
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Ref to pass target time from progress into the RAF loop
  const targetTimeRef = useRef(-1);

  // Update target time whenever progress changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedRef.current || !video.duration) return;
    targetTimeRef.current = progress * video.duration;
  }, [progress]);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / sectionHeight));
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Video always visible — no fade-in to avoid white gap on transition from hero

  const getStageOpacity = (index: number) => {
    const stageStart = 0.1 + index * 0.28;
    const stagePeak = stageStart + 0.1;
    const stageEnd = stageStart + 0.28;

    if (progress < stageStart) return 0;
    if (progress < stagePeak) return (progress - stageStart) / (stagePeak - stageStart);
    if (progress < stageEnd) return 1;
    return Math.max(0, 1 - (progress - stageEnd) / 0.08);
  };

  const getStageTranslate = (index: number) => {
    const stageStart = 0.1 + index * 0.28;
    const stagePeak = stageStart + 0.1;

    if (progress < stageStart) return 30;
    if (progress < stagePeak) {
      return 30 * (1 - (progress - stageStart) / (stagePeak - stageStart));
    }
    return 0;
  };

  return (
    <section
      ref={sectionRef}
      aria-label="How the revenue system works"
      className="relative bg-white"
      style={{ height: "650vh" }}
    >
      {/* Sticky viewport container */}
      <div
        className="sticky top-0 flex w-full items-center justify-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}
      >
        {/* Decorative video layer */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
        >
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            style={{
              filter: "saturate(0.92) contrast(1.0) brightness(1.0)",
            }}
          >
            <source src="/anima2.mp4" type="video/mp4" />
          </video>
        </div>

        {/* White overlay — kept light to let video depth show */}
        <div className="absolute inset-0 bg-white/[0.07]" aria-hidden="true" />

        {/* Inward masking gradient */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 74% 68% at 50% 50%, transparent 0%, rgba(255,255,255,0.20) 72%, white 91%)",
          }}
        />

        {/* Edge vignettes */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
          <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-white to-transparent" />
          <div className="absolute inset-y-0 right-0 w-36 bg-gradient-to-l from-white to-transparent" />
        </div>

        {/* Scroll-driven content stages */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
          {stages.map((stage, i) => (
            <div
              key={stage.label}
              className="absolute flex flex-col items-center gap-3"
              aria-hidden={getStageOpacity(i) < 0.5}
              style={{
                opacity: getStageOpacity(i),
                transform: `translateY(${getStageTranslate(i)}px)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <span className="text-[11px] font-medium tracking-[0.35em] text-neutral-400">
                {stage.label}
              </span>
              <h2 className="max-w-lg text-2xl font-light tracking-tight text-neutral-800 sm:text-4xl">
                {stage.title}
              </h2>
              <p className="max-w-sm text-sm font-light leading-relaxed text-neutral-500">
                {stage.description}
              </p>
            </div>
          ))}
        </div>

        {/* Scroll progress indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2" aria-hidden="true">
          <div className="h-12 w-px bg-neutral-200">
            <div
              className="w-full bg-neutral-400 transition-all duration-150"
              style={{ height: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
