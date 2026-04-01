"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface FadeInProps {
  children:   ReactNode;
  delay?:     number;
  className?: string;
  threshold?: number;
}

export default function FadeIn({
  children,
  delay     = 0,
  className = "",
  threshold = 0.12,
}: FadeInProps) {
  const ref               = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respect system preference — show immediately, CSS handles transition suppression
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  `translateY(${visible ? 0 : 24}px)`,
        // Unified transition — both opacity and transform always animate together
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
