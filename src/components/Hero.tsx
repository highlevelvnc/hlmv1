"use client";

import { useEffect, useRef, useState } from "react";

// ─── Utilities ────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;

function smoothstep(lo: number, hi: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

// ─── Funnel geometry — 8 glass rings ──────────────────────────────────────────

const RINGS = [
  { depth: 0.00, radius: 0.48 },
  { depth: 0.14, radius: 0.42 },
  { depth: 0.28, radius: 0.35 },
  { depth: 0.42, radius: 0.28 },
  { depth: 0.56, radius: 0.22 },
  { depth: 0.70, radius: 0.16 },
  { depth: 0.82, radius: 0.11 },
  { depth: 0.94, radius: 0.06 },
];

// ─── Stage data — metrics that count up ───────────────────────────────────────

const STAGES = [
  { depth: 0.22, countTo: 10000, format: (n: number) => `${Math.round(n / 1000)}K+`,   label: "Monthly visitors captured" },
  { depth: 0.42, countTo: 2400,  format: (n: number) => n < 10 ? Math.round(n).toString() : Math.round(n).toLocaleString("en"), label: "Qualified leads generated" },
  { depth: 0.62, countTo: 4.8,   format: (n: number) => `${n.toFixed(1)}×`,             label: "Average return on ad spend" },
  { depth: 0.80, countTo: 3,     format: (n: number) => `$${Math.round(n)}M+`,          label: "Revenue attributed" },
];

// ─── Particle type ────────────────────────────────────────────────────────────

interface FP {
  depth: number;
  angle: number;
  radOff: number; // 0 = center, 1 = wall
  speed: number;
  size: number;
  alpha: number;
}

function spawn(): FP {
  return {
    depth: Math.random() * 0.1,
    angle: Math.random() * TAU,
    radOff: 0.3 + Math.random() * 0.6,
    speed: 0.001 + Math.random() * 0.002,
    size: 1.5 + Math.random() * 2,
    alpha: 0.3 + Math.random() * 0.4,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Hero() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  // Scroll handler — writes to ref (for RAF) and state (for JSX)
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const p = clamp01(-rect.top / (sectionRef.current.offsetHeight - window.innerHeight));
      progressRef.current = p;
      setProgress(p);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Canvas renderer ─────────────────────────────────────────────────────
  useEffect(() => {
    const _c = canvasRef.current;
    if (!_c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const _x = _c.getContext("2d", { alpha: true });
    if (!_x) return;
    const canvas: HTMLCanvasElement = _c;
    const ctx: CanvasRenderingContext2D = _x;

    const mouse = { x: 0.5, y: 0.5 }, sm = { x: 0.5, y: 0.5 };
    let time = 0, raf = 0, vis = true, W = 0, H = 0;
    const particles: FP[] = Array.from({ length: 40 }, spawn);

    // Stage count-up state (mutable, in RAF closure)
    const stageState = STAGES.map(() => ({
      active: false,
      startTime: 0,
      value: 0,
      peaked: false,
    }));

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMouse(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
    }
    function onTouch(e: TouchEvent) {
      const t = e.touches[0]; if (!t) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = (t.clientX - r.left) / r.width;
      mouse.y = (t.clientY - r.top) / r.height;
    }
    function onTouchEnd() { mouse.x = 0.5; mouse.y = 0.5; }

    // ── Main render ───────────────────────────────────────────────────
    function render() {
      raf = requestAnimationFrame(render);
      if (!vis) return;
      time += 0.004;
      sm.x += (mouse.x - sm.x) * 0.035;
      sm.y += (mouse.y - sm.y) * 0.035;

      const p = progressRef.current;

      // Camera position: maps scroll to depth through funnel
      const cameraY = p < 0.12 ? 0 : p > 0.88 ? 1.0 : (p - 0.12) / 0.76;

      // Exit fade
      const exitFade = 1 - smoothstep(0.88, 1.0, p);

      ctx.clearRect(0, 0, W, H);

      // ── Background gradient — subtle blue tint mid-journey ─────
      const blueness = Math.sin(clamp01(cameraY) * Math.PI) * 0.04;
      if (blueness > 0.001) {
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, `rgba(220,228,255,${blueness})`);
        bg.addColorStop(0.5, `rgba(210,220,250,${blueness * 1.5})`);
        bg.addColorStop(1, `rgba(225,232,255,${blueness * 0.5})`);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
      }

      const cx = W / 2 + (sm.x - 0.5) * 18;
      const baseSize = Math.min(W, H);

      // ── Draw rings (back to front based on depth) ──────────────
      // Sort rings: furthest ahead first (smallest), nearest/behind last (largest)
      const sorted = RINGS.map((ring, i) => ({ ...ring, i }))
        .sort((a, b) => {
          const da = a.depth - cameraY;
          const db = b.depth - cameraY;
          return db - da; // furthest first
        });

      for (const ring of sorted) {
        const rel = ring.depth - cameraY; // negative = behind, positive = ahead

        // ── Compute projected size ─────────────────────────────
        let scale: number;
        let alpha: number;

        if (rel < -0.05) {
          // Behind camera — scale up dramatically, fade out
          scale = 1 + Math.abs(rel) * 6;
          alpha = Math.max(0, 1 - Math.abs(rel) * 3.5);
        } else if (rel < 0.08) {
          // At camera level — near 1:1
          scale = 1 + rel * 0.5;
          alpha = 0.9;
        } else {
          // Ahead — perspective diminish
          scale = 1 / (1 + rel * 3);
          alpha = clamp01(1 - rel * 1.2);
        }

        alpha *= exitFade;
        if (alpha < 0.005) continue; // cull invisible rings

        const rx = ring.radius * baseSize * scale;
        const ry = rx * (0.32 + (sm.y - 0.5) * 0.06); // ellipse squash + cursor look
        const ringCy = H * 0.5 + rel * baseSize * 0.3 * scale;

        // ── Glass surface between this ring and the next ─────
        if (ring.i < RINGS.length - 1) {
          const nextRing = RINGS[ring.i + 1];
          const nextRel = nextRing.depth - cameraY;
          let nextScale: number;
          if (nextRel < -0.05) nextScale = 1 + Math.abs(nextRel) * 6;
          else if (nextRel < 0.08) nextScale = 1 + nextRel * 0.5;
          else nextScale = 1 / (1 + nextRel * 3);

          const nrx = nextRing.radius * baseSize * nextScale;
          const nry = nrx * (0.32 + (sm.y - 0.5) * 0.06);
          const ncy = H * 0.5 + nextRel * baseSize * 0.3 * nextScale;

          const surfAlpha = Math.min(alpha, 0.08 + ring.i * 0.015) * exitFade;
          if (surfAlpha > 0.005) {
            ctx.save();
            ctx.globalAlpha = surfAlpha;
            // Draw trapezoid between two ellipses
            ctx.beginPath();
            ctx.ellipse(cx, ringCy, rx, ry, 0, 0, Math.PI); // top half of upper ring
            ctx.ellipse(cx, ncy, nrx, nry, 0, Math.PI, 0);  // bottom half of lower ring (reversed)
            ctx.closePath();
            const sf = ctx.createLinearGradient(cx, ringCy, cx, ncy);
            sf.addColorStop(0, "rgba(190,200,240,0.6)");
            sf.addColorStop(1, "rgba(170,185,235,0.3)");
            ctx.fillStyle = sf;
            ctx.fill();
            ctx.restore();
          }
        }

        // ── Ring edge — glass highlight ──────────────────────
        // Outer glow
        ctx.save();
        ctx.globalAlpha = alpha * 0.15;
        ctx.strokeStyle = "rgba(200,215,255,1)";
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.ellipse(cx, ringCy, rx, ry, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();

        // Sharp bright edge
        ctx.save();
        ctx.globalAlpha = alpha * 0.55;
        ctx.strokeStyle = "rgba(220,230,255,1)";
        ctx.lineWidth = Math.max(0.8, 1.2 * scale);
        ctx.beginPath();
        ctx.ellipse(cx, ringCy, rx, ry, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();

        // ── Specular highlight (cursor-driven) ──────────────
        if (alpha > 0.1 && scale < 3) {
          const specX = cx + (sm.x - 0.5) * rx * 0.8;
          const specY = ringCy - ry * 0.3;
          const specR = rx * 0.25;
          ctx.save();
          ctx.globalAlpha = alpha * 0.12;
          const sg = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
          sg.addColorStop(0, "rgba(230,240,255,1)");
          sg.addColorStop(1, "rgba(230,240,255,0)");
          ctx.fillStyle = sg;
          ctx.beginPath(); ctx.arc(specX, specY, specR, 0, TAU); ctx.fill();
          ctx.restore();
        }
      }

      // ── Particles flowing downward ─────────────────────────
      for (const pt of particles) {
        pt.depth += pt.speed;
        pt.angle += 0.003;
        if (pt.depth > 1.05) { Object.assign(pt, spawn()); pt.depth = -0.02; }

        const rel = pt.depth - cameraY;
        let scale: number, alpha: number;
        if (rel < -0.05) { scale = 1 + Math.abs(rel) * 4; alpha = Math.max(0, 1 - Math.abs(rel) * 4); }
        else if (rel < 0.06) { scale = 1; alpha = 0.8; }
        else { scale = 1 / (1 + rel * 3); alpha = clamp01(1 - rel * 1.5); }

        alpha *= pt.alpha * exitFade;
        if (alpha < 0.02) continue;

        // Funnel radius at this depth
        const fR = lerp(RINGS[0].radius, RINGS[RINGS.length - 1].radius, clamp01(pt.depth));
        const worldR = fR * baseSize * scale * pt.radOff;
        const px = cx + Math.cos(pt.angle + time) * worldR * 0.5;
        const py = H * 0.5 + rel * baseSize * 0.3 * scale;

        const r = pt.size * scale;
        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
        g.addColorStop(0, `rgba(170,190,255,${(alpha * 0.5).toFixed(3)})`);
        g.addColorStop(1, "rgba(170,190,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, r * 3, 0, TAU); ctx.fill();
        // Core
        ctx.beginPath(); ctx.arc(px, py, r, 0, TAU);
        ctx.fillStyle = `rgba(200,215,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }

      // ── Stage metrics ──────────────────────────────────────
      const now = performance.now();
      for (let si = 0; si < STAGES.length; si++) {
        const st = STAGES[si];
        const ss = stageState[si];
        const dist = Math.abs(cameraY - st.depth);

        // Activate when camera is close
        if (dist < 0.10 && !ss.active) {
          ss.active = true;
          ss.startTime = now;
          ss.peaked = false;
        }
        // Deactivate when camera moves far away (allows scroll-back retrigger)
        if (dist > 0.22 && ss.active && ss.peaked) {
          ss.active = false;
          ss.value = 0;
        }

        if (ss.active) {
          const elapsed = (now - ss.startTime) / 1500;
          const t = clamp01(elapsed);
          const eased = 1 - Math.pow(1 - t, 3);
          ss.value = eased * st.countTo;
          if (t >= 1) ss.peaked = true;
        }

        // Visibility: fade in when near, fade out when past
        const stageAlpha = (1 - smoothstep(0, 0.12, dist)) * exitFade;
        if (stageAlpha < 0.01 || !ss.active) continue;

        // Draw metric
        ctx.save();
        ctx.globalAlpha = stageAlpha;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Big number
        const fontSize = Math.round(Math.min(W * 0.10, 90));
        ctx.font = `200 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.fillStyle = "rgba(30,35,60,0.90)";
        ctx.fillText(st.format(ss.value), W / 2, H * 0.46);

        // Label
        ctx.font = `300 ${Math.round(fontSize * 0.16)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.fillStyle = "rgba(100,110,150,0.70)";
        ctx.fillText(st.label, W / 2, H * 0.46 + fontSize * 0.7);

        ctx.restore();
      }

      // ── Exit white overlay ─────────────────────────────────
      if (exitFade < 0.99) {
        ctx.save();
        ctx.globalAlpha = 1 - exitFade;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    }

    const obs = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0.02 });
    obs.observe(canvas);
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf); obs.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // ── Scroll-driven JSX ───────────────────────────────────────────────────
  const promptAlpha = Math.max(0, 1 - progress * 8);

  return (
    <section ref={sectionRef} aria-label="HLM — Interactive revenue funnel"
      className="relative bg-white" style={{ height: "400vh" }}>

      {/* Accessibility: metrics as hidden text */}
      <div className="sr-only">
        <h1>HLM Revenue Funnel</h1>
        <p>10,000+ monthly visitors captured</p>
        <p>2,400 qualified leads generated</p>
        <p>4.8× average return on ad spend</p>
        <p>$3M+ revenue attributed</p>
      </div>

      <div className="sticky top-0 flex w-full items-center justify-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}>

        <canvas ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />

        {/* Scroll prompt — visible only at approach */}
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
          aria-hidden="true" style={{ opacity: promptAlpha }}>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-medium tracking-[0.35em] text-neutral-400">
              ENTER THE FUNNEL
            </span>
            <div className="h-10 w-px bg-gradient-to-b from-neutral-300 to-transparent"
              style={{ animation: "scrollPulse 2.5s ease-in-out infinite" }} />
          </div>
        </div>

        {/* Bottom vignette for smooth exit */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/80 to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}
