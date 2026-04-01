"use client";

import { useEffect, useRef } from "react";

// ─── Noise ────────────────────────────────────────────────────────────────────
// Multi-frequency sin harmonics — smooth organic variation, no grid artifacts,
// no external dependencies. Incommensurate frequencies avoid visible repetition.

function noise(x: number, y: number): number {
  return (
    Math.sin(x * 1.2 + y * 0.9) * 0.35 +
    Math.sin(x * 2.1 - y * 1.7 + 1.3) * 0.25 +
    Math.sin(x * 3.5 + y * 2.4 - 0.8) * 0.18 +
    Math.sin(x * 5.2 - y * 3.8 + 2.1) * 0.12 +
    Math.sin(x * 7.1 + y * 5.3 - 1.5) * 0.06
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Orb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const _canvas = canvasRef.current;
    if (!_canvas) return;

    // Skip entirely for reduced-motion users
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const _ctx = _canvas.getContext("2d", { alpha: true });
    if (!_ctx) return;

    // Aliased after null checks — survives TS closure narrowing
    const canvas: HTMLCanvasElement          = _canvas;
    const ctx:    CanvasRenderingContext2D    = _ctx;

    // ── Mutable state ──────────────────────────────────────────────────────
    const mouse  = { x: 0.5, y: 0.5 };
    const smooth = { x: 0.5, y: 0.5 };
    let scrollNorm = 0;
    let time       = 0;
    let rafId      = 0;
    let visible    = true;
    let dots: Dot[] = [];
    let W = 0;
    let H = 0;

    // ── Resize (DPR-aware, capped at 2× for perf) ─────────────────────────
    function resize() {
      if (!canvas) return;
      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedDots();
    }

    // ── Particle field ─────────────────────────────────────────────────────
    function seedDots() {
      const count = Math.min(50, Math.floor((W * H) / 20000));
      dots = Array.from({ length: count }, () => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        r:  Math.random() * 1.0 + 0.4,
        a:  Math.random() * 0.045 + 0.015,
      }));
    }

    // ── Input handlers ─────────────────────────────────────────────────────
    function onMouse(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
    }
    function onTouch(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = (t.clientX - r.left) / r.width;
      mouse.y = (t.clientY - r.top) / r.height;
    }
    function onTouchEnd() {
      mouse.x = 0.5;
      mouse.y = 0.5;
    }
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollNorm = max > 0 ? window.scrollY / max : 0;
    }

    // ── Render loop ────────────────────────────────────────────────────────
    function render() {
      rafId = requestAnimationFrame(render);

      // Pause when off-screen (IntersectionObserver toggles `visible`)
      if (!visible) return;

      time += 0.005;

      // Heavy lerp — orb tracks cursor slowly, feels deliberate
      smooth.x += (mouse.x - smooth.x) * 0.03;
      smooth.y += (mouse.y - smooth.y) * 0.03;

      ctx.clearRect(0, 0, W, H);

      const mx = smooth.x * W;
      const my = smooth.y * H;

      // ─── Particles ─────────────────────────────────────────────────
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;

        // Gentle cursor repulsion
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const f = ((150 - dist) / 150) * 0.25;
          d.x += (dx / dist) * f;
          d.y += (dy / dist) * f;
        }

        // Wrap edges
        if (d.x < -8) d.x = W + 8;
        if (d.x > W + 8) d.x = -8;
        if (d.y < -8) d.y = H + 8;
        if (d.y > H + 8) d.y = -8;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,162,168,${d.a})`;
        ctx.fill();
      }

      // ─── Orb ───────────────────────────────────────────────────────
      // Centre with subtle cursor drift
      const cx = W / 2 + (smooth.x - 0.5) * 20;
      const cy = H / 2 + (smooth.y - 0.5) * 14;
      const baseR = Math.min(W, H) * 0.24;

      // Build deformed silhouette
      const N    = 100;
      const path = new Path2D();

      for (let i = 0; i <= N; i++) {
        const a  = (i / N) * Math.PI * 2;
        const nx = Math.cos(a);
        const ny = Math.sin(a);

        // Noise displacement — scroll shifts the phase
        const disp = noise(
          nx * 2.2 + time * 0.5 + scrollNorm * 1.6,
          ny * 2.2 + time * 0.3,
        ) * baseR * 0.065;

        // Cursor attraction — orb bulges slightly toward pointer
        const cdx = smooth.x - 0.5;
        const cdy = smooth.y - 0.5;
        const cD  = Math.sqrt(cdx * cdx + cdy * cdy);
        const pull = Math.max(0, 1 - cD * 3.5) * 3.5;
        const cAngle = Math.atan2(cdy, cdx);
        const cursorBulge = pull * Math.max(0, Math.cos(a - cAngle)) * baseR * 0.03;

        const r = baseR + disp + cursorBulge;
        const x = cx + r * nx;
        const y = cy + r * ny;

        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.closePath();

      // Light source follows cursor
      const lx = cx + (smooth.x - 0.5) * baseR * 0.65;
      const ly = cy + (smooth.y - 0.5) * baseR * 0.45;

      // Layer 1 — soft outer glow (gradient circle, no filter blur)
      const glow = ctx.createRadialGradient(cx, cy, baseR * 0.25, cx, cy, baseR * 1.65);
      glow.addColorStop(0,   "rgba(175,178,188,0.05)");
      glow.addColorStop(0.5, "rgba(175,178,188,0.018)");
      glow.addColorStop(1,   "rgba(175,178,188,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.65, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2 — body (follows deformed path)
      const body = ctx.createRadialGradient(lx, ly, 0, cx, cy, baseR * 1.05);
      body.addColorStop(0,   "rgba(192,195,206,0.14)");
      body.addColorStop(0.35, "rgba(172,175,188,0.09)");
      body.addColorStop(0.75, "rgba(155,158,172,0.045)");
      body.addColorStop(1,   "rgba(140,143,158,0.015)");
      ctx.fillStyle = body;
      ctx.fill(path);

      // Layer 3 — inner highlight (offset toward light)
      const inner = ctx.createRadialGradient(
        lx - baseR * 0.1, ly - baseR * 0.1, 0,
        cx, cy, baseR * 0.5,
      );
      inner.addColorStop(0, "rgba(212,215,225,0.10)");
      inner.addColorStop(1, "rgba(212,215,225,0)");
      ctx.fillStyle = inner;
      ctx.fill(path);

      // Layer 4 — rim / fresnel (brighter at edges, screen-blended)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const rim = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, baseR);
      rim.addColorStop(0,   "rgba(0,0,0,0)");
      rim.addColorStop(0.7, "rgba(185,188,202,0.02)");
      rim.addColorStop(1,   "rgba(198,201,215,0.05)");
      ctx.fillStyle = rim;
      ctx.fill(path);
      ctx.restore();
    }

    // ── Viewport gating — pause RAF work when off-screen ───────────────
    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0.05 },
    );
    observer.observe(canvas);

    // ── Bind ───────────────────────────────────────────────────────────
    resize();
    onScroll();
    window.addEventListener("resize",    resize,     { passive: true });
    window.addEventListener("mousemove", onMouse,    { passive: true });
    window.addEventListener("touchmove", onTouch,    { passive: true });
    window.addEventListener("touchend",  onTouchEnd, { passive: true });
    window.addEventListener("scroll",    onScroll,   { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend",  onTouchEnd);
      window.removeEventListener("scroll",    onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
