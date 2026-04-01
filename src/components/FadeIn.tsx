"use client";

import { useEffect, useRef, useState, useCallback, ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  /** Micro parallax: max px shift based on scroll position (0 = disabled) */
  parallax?: number;
}

export default function FadeIn({
  children,
  delay = 0,
  className = "",
  threshold = 0.12,
  parallax = 6,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [shift, setShift] = useState(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotionRef.current) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  // Micro parallax — subtle vertical shift based on distance from viewport center
  const handleScroll = useCallback(() => {
    if (!visible || !parallax || reducedMotionRef.current) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // Element center relative to viewport center, normalized to [-1, 1]
    const elementCenter = rect.top + rect.height / 2;
    const normalized = (elementCenter - vh / 2) / (vh / 2);
    // Clamp and apply — positive when below center, negative when above
    const clamped = Math.max(-1, Math.min(1, normalized));
    setShift(clamped * parallax);
  }, [visible, parallax]);

  useEffect(() => {
    if (!visible || !parallax || reducedMotionRef.current) return;

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // seed initial position
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visible, parallax, handleScroll]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? `translateY(${shift}px)`
          : "translateY(28px)",
        transition: visible
          ? `transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)`
          : `opacity 1s ease ${delay}ms, transform 1s ease ${delay}ms`,
        willChange: visible ? "transform" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
