"use client";

import { useEffect, useRef } from "react";

// ─── Noise ────────────────────────────────────────────────────────────────────
// Multi-frequency sin harmonics — smooth, no grid artifacts, no dependencies.

function noise(x: number, y: number): number {
  return (
    Math.sin(x * 1.2 + y * 0.9) * 0.35 +
    Math.sin(x * 2.1 - y * 1.7 + 1.3) * 0.25 +
    Math.sin(x * 3.5 + y * 2.4 - 0.8) * 0.18 +
    Math.sin(x * 5.2 - y * 3.8 + 2.1) * 0.12 +
    Math.sin(x * 7.1 + y * 5.3 - 1.5) * 0.06
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function smoothstep(lo: number, hi: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

const FOCAL = 600;
const TAU   = Math.PI * 2;

// ─── Data types ───────────────────────────────────────────────────────────────

interface Node3D {
  x: number; y: number; z: number;
  label: string | null;
  phase: number;       // pulse offset
  drift: number;       // drift speed
}

interface Conn { a: number; b: number }

// ─── Node generation — Fibonacci sphere ───────────────────────────────────────

const LABELS = [
  "Traffic", "Leads", "Pipeline", "Revenue",
  "ROAS 4.8×", "Automation", "AI Scoring", "Conversion",
];

function generateNodes(count: number): Node3D[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const nodes: Node3D[] = [];

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere surface point
    const y   = 1 - (i / (count - 1)) * 2;           // -1 to 1
    const r   = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x   = Math.cos(theta) * r;
    const z   = Math.sin(theta) * r;

    // Push nodes inside the sphere (not just on surface)
    const depth = i < LABELS.length ? 0.5 + Math.random() * 0.35 : 0.3 + Math.random() * 0.7;

    nodes.push({
      x: x * depth,
      y: y * depth,
      z: z * depth,
      label: i < LABELS.length ? LABELS[i] : null,
      phase: Math.random() * TAU,
      drift: 0.4 + Math.random() * 0.6,
    });
  }
  return nodes;
}

// ─── Connection generation — nearest neighbours ──────────────────────────────

function generateConnections(nodes: Node3D[], perNode: number): Conn[] {
  const set = new Set<string>();
  const conns: Conn[] = [];

  for (let i = 0; i < nodes.length; i++) {
    // Compute distances to all other nodes
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dz = nodes[i].z - nodes[j].z;
      dists.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    dists.sort((a, b) => a.d - b.d);

    for (let k = 0; k < Math.min(perNode, dists.length); k++) {
      const j   = dists[k].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!set.has(key)) {
        set.add(key);
        conns.push({ a: i, b: j });
      }
    }
  }
  return conns;
}

// ─── 3D → 2D projection ─────────────────────────────────────────────────────

function project(
  nx: number, ny: number, nz: number,
  cx: number, cy: number, radius: number,
) {
  const x = nx * radius;
  const y = ny * radius;
  const z = nz * radius;
  const s = FOCAL / (FOCAL + z);
  return { sx: cx + x * s, sy: cy + y * s, s };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrainOrb() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const _section = sectionRef.current;
    const _canvas  = canvasRef.current;
    if (!_section || !_canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const _ctx = _canvas.getContext("2d", { alpha: true });
    if (!_ctx) return;

    // Aliased after null checks — survives TS closure narrowing
    const section: HTMLDivElement             = _section;
    const canvas:  HTMLCanvasElement          = _canvas;
    const ctx:     CanvasRenderingContext2D   = _ctx;

    // ── Data ──────────────────────────────────────────────────────────────
    const isMobile = window.innerWidth < 640;
    const nodeCount = isMobile ? 20 : 35;
    const nodes = generateNodes(nodeCount);
    const conns = generateConnections(nodes, 2);
    const SURFACE_PTS = isMobile ? 60 : 100;

    // Pre-measure label widths
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const labelWidths: number[] = nodes.map(n =>
      n.label ? ctx.measureText(n.label).width : 0,
    );

    // ── Mutable state ─────────────────────────────────────────────────────
    const mouse  = { x: 0.5, y: 0.5 };
    const smooth = { x: 0.5, y: 0.5 };
    let progress = 0;
    let time     = 0;
    let rafId    = 0;
    let visible  = true;
    let W = 0, H = 0;

    // ── Resize ────────────────────────────────────────────────────────────
    function resize() {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ── Scroll ────────────────────────────────────────────────────────────
    function onScroll() {
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      progress = Math.max(0, Math.min(1, -rect.top / travel));
    }

    // ── Input ─────────────────────────────────────────────────────────────
    function onMouse(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top)  / r.height;
    }
    function onTouch(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = (t.clientX - r.left) / r.width;
      mouse.y = (t.clientY - r.top)  / r.height;
    }
    function onTouchEnd() { mouse.x = 0.5; mouse.y = 0.5; }

    // ── Render ────────────────────────────────────────────────────────────
    function render() {
      rafId = requestAnimationFrame(render);
      if (!visible) return;

      time += 0.005;

      // Smooth cursor
      smooth.x += (mouse.x - smooth.x) * 0.03;
      smooth.y += (mouse.y - smooth.y) * 0.03;

      // Scroll-driven state
      const surfaceOpacity = 1 - smoothstep(0.12, 0.52, progress);
      const surfaceNoise   = 1 + smoothstep(0.12, 0.52, progress) * 3.5;
      const expansion      = smoothstep(0.12, 0.78, progress);
      const labelAlpha     = isMobile ? 0 : smoothstep(0.52, 0.75, progress);
      const connAlpha      = 0.03 + smoothstep(0.12, 0.48, progress) * 0.07;

      ctx.clearRect(0, 0, W, H);

      // Orb centre — drifts with cursor
      const cx    = W / 2 + (smooth.x - 0.5) * 20;
      const cy    = H / 2 + (smooth.y - 0.5) * 14;
      const baseR = Math.min(W, H) * 0.24;

      // Cursor-driven Y-axis rotation
      const rotY = (smooth.x - 0.5) * 0.3;
      const cosR = Math.cos(rotY);
      const sinR = Math.sin(rotY);

      // ─── Compute node screen positions ─────────────────────────────
      const projected: { sx: number; sy: number; s: number; z: number; idx: number }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Expand outward
        const ex = n.x * 2.3;
        const ey = n.y * 2.3;
        const ez = n.z * 2.3;
        let px = n.x + (ex - n.x) * expansion;
        let py = n.y + (ey - n.y) * expansion;
        let pz = n.z + (ez - n.z) * expansion;

        // Gentle drift in expanded state
        const d = expansion * 0.018;
        px += Math.sin(time * n.drift + n.phase) * d;
        py += Math.cos(time * n.drift * 0.7 + n.phase) * d;

        // Y-axis rotation
        const rx = px * cosR - pz * sinR;
        const rz = px * sinR + pz * cosR;

        const { sx, sy, s } = project(rx, py, rz, cx, cy, baseR);
        projected.push({ sx, sy, s, z: rz, idx: i });
      }

      // Z-sort back to front
      projected.sort((a, b) => b.z - a.z);

      // ─── Connection lines ──────────────────────────────────────────
      if (connAlpha > 0.015) {
        ctx.lineWidth   = 0.5;
        ctx.strokeStyle = `rgba(170,175,188,${connAlpha.toFixed(3)})`;
        ctx.beginPath();
        for (const c of conns) {
          const pa = projected.find(p => p.idx === c.a);
          const pb = projected.find(p => p.idx === c.b);
          if (!pa || !pb) continue;
          ctx.moveTo(pa.sx, pa.sy);
          ctx.lineTo(pb.sx, pb.sy);
        }
        ctx.stroke();
      }

      // ─── Surface shell ─────────────────────────────────────────────
      if (surfaceOpacity > 0.01) {
        // Build deformed path
        const path = new Path2D();
        for (let i = 0; i <= SURFACE_PTS; i++) {
          const a  = (i / SURFACE_PTS) * TAU;
          const nx = Math.cos(a);
          const ny = Math.sin(a);
          const d  = noise(
            nx * 2.2 + time * 0.5,
            ny * 2.2 + time * 0.3,
          ) * baseR * 0.065 * surfaceNoise;
          const r = baseR + d;
          const x = cx + r * nx;
          const y = cy + r * ny;
          if (i === 0) path.moveTo(x, y); else path.lineTo(x, y);
        }
        path.closePath();

        // Light position
        const lx = cx + (smooth.x - 0.5) * baseR * 0.65;
        const ly = cy + (smooth.y - 0.5) * baseR * 0.45;

        // Outer glow
        const glow = ctx.createRadialGradient(cx, cy, baseR * 0.25, cx, cy, baseR * 1.65);
        glow.addColorStop(0,   `rgba(175,178,188,${(0.05 * surfaceOpacity).toFixed(3)})`);
        glow.addColorStop(0.5, `rgba(175,178,188,${(0.018 * surfaceOpacity).toFixed(3)})`);
        glow.addColorStop(1,   "rgba(175,178,188,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * 1.65, 0, TAU);
        ctx.fill();

        // Body
        const body = ctx.createRadialGradient(lx, ly, 0, cx, cy, baseR * 1.05);
        body.addColorStop(0,   `rgba(192,195,208,${(0.14 * surfaceOpacity).toFixed(3)})`);
        body.addColorStop(0.35, `rgba(172,175,190,${(0.09 * surfaceOpacity).toFixed(3)})`);
        body.addColorStop(0.75, `rgba(155,158,172,${(0.045 * surfaceOpacity).toFixed(3)})`);
        body.addColorStop(1,   `rgba(140,143,158,${(0.015 * surfaceOpacity).toFixed(3)})`);
        ctx.fillStyle = body;
        ctx.fill(path);

        // Inner highlight
        const inner = ctx.createRadialGradient(
          lx - baseR * 0.1, ly - baseR * 0.1, 0,
          cx, cy, baseR * 0.5,
        );
        inner.addColorStop(0, `rgba(212,215,228,${(0.10 * surfaceOpacity).toFixed(3)})`);
        inner.addColorStop(1, "rgba(212,215,228,0)");
        ctx.fillStyle = inner;
        ctx.fill(path);

        // Rim / fresnel
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const rim = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, baseR);
        rim.addColorStop(0,   "rgba(0,0,0,0)");
        rim.addColorStop(0.7, `rgba(185,188,202,${(0.02 * surfaceOpacity).toFixed(3)})`);
        rim.addColorStop(1,   `rgba(198,201,215,${(0.05 * surfaceOpacity).toFixed(3)})`);
        ctx.fillStyle = rim;
        ctx.fill(path);
        ctx.restore();
      }

      // ─── Nodes ─────────────────────────────────────────────────────
      for (const p of projected) {
        const n    = nodes[p.idx];
        const pulse = 0.7 + 0.3 * Math.sin(time * 1.5 + n.phase);

        // Nodes behind the surface are dimmer when surface is still visible
        const behindFade = surfaceOpacity > 0.01 ? (0.4 + 0.6 * (1 - surfaceOpacity)) : 1;
        const nodeAlpha  = pulse * behindFade;

        // Glow
        const gr = 8 * p.s;
        const grd = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, gr);
        grd.addColorStop(0, `rgba(190,195,212,${(0.07 * nodeAlpha).toFixed(3)})`);
        grd.addColorStop(1, "rgba(190,195,212,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, gr, 0, TAU);
        ctx.fill();

        // Core dot
        const cr = Math.max(1, 2.2 * p.s);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, cr, 0, TAU);
        ctx.fillStyle = `rgba(200,205,220,${(0.2 * nodeAlpha).toFixed(3)})`;
        ctx.fill();
      }

      // ─── Labels ────────────────────────────────────────────────────
      if (labelAlpha > 0.01) {
        ctx.font         = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.textBaseline = "middle";

        for (const p of projected) {
          const n = nodes[p.idx];
          if (!n.label) continue;

          const lw = labelWidths[p.idx];
          // Place label on the side away from centre
          const offsetX = p.sx > cx ? 12 : -(12 + lw);

          ctx.fillStyle = `rgba(163,163,170,${labelAlpha.toFixed(3)})`;
          ctx.fillText(n.label, Math.round(p.sx + offsetX), Math.round(p.sy));

          // Thin connector dash from node to label
          ctx.strokeStyle = `rgba(163,163,170,${(labelAlpha * 0.4).toFixed(3)})`;
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          const dashStart = p.sx > cx ? p.sx + 4 : p.sx - 4;
          const dashEnd   = p.sx > cx ? p.sx + 10 : p.sx - 10;
          ctx.moveTo(dashStart, p.sy);
          ctx.lineTo(dashEnd, p.sy);
          ctx.stroke();
        }
      }
    }

    // ── Viewport gating ───────────────────────────────────────────────
    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0.02 },
    );
    observer.observe(canvas);

    // ── Bind ──────────────────────────────────────────────────────────
    resize();
    onScroll();
    window.addEventListener("resize",    resize,     { passive: true });
    window.addEventListener("scroll",    onScroll,   { passive: true });
    window.addEventListener("mousemove", onMouse,    { passive: true });
    window.addEventListener("touchmove", onTouch,    { passive: true });
    window.addEventListener("touchend",  onTouchEnd, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize",    resize);
      window.removeEventListener("scroll",    onScroll);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, []);

  // ── JSX ─────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      aria-label="HLM system architecture"
      className="relative bg-white"
      style={{ height: "400vh" }}
    >
      <div
        className="sticky top-0 flex w-full items-center justify-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
