"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/i18n/context";

// ─── Utilities ────────────────────────────────────────────────────────────────

function smoothstep(lo: number, hi: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

const FOCAL = 600;
const TAU = Math.PI * 2;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Node3D {
  x: number; y: number; z: number;
  label: string | null;
  phase: number;
  drift: number;
}
interface Conn { a: number; b: number }

// LABELS built inside component from useT() — see below
let LABELS: string[] = [];

// ─── Generators ───────────────────────────────────────────────────────────────

function genNodes(count: number): Node3D[] {
  const ga = Math.PI * (3 - Math.sqrt(5));
  const out: Node3D[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = ga * i;
    const d = i < LABELS.length ? 0.5 + Math.random() * 0.3 : 0.25 + Math.random() * 0.75;
    out.push({
      x: Math.cos(t) * r * d, y: y * d, z: Math.sin(t) * r * d,
      label: i < LABELS.length ? LABELS[i] : null,
      phase: Math.random() * TAU, drift: 0.4 + Math.random() * 0.6,
    });
  }
  return out;
}

function genConns(nodes: Node3D[], k: number): Conn[] {
  const set = new Set<string>();
  const out: Conn[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const d: { j: number; d: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
      d.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    d.sort((a, b) => a.d - b.d);
    for (let m = 0; m < Math.min(k, d.length); m++) {
      const key = i < d[m].j ? `${i}-${d[m].j}` : `${d[m].j}-${i}`;
      if (!set.has(key)) { set.add(key); out.push({ a: i, b: d[m].j }); }
    }
  }
  return out;
}

function proj3d(nx: number, ny: number, nz: number, cx: number, cy: number, r: number) {
  const x = nx * r, y = ny * r, z = nz * r;
  const s = FOCAL / (FOCAL + z);
  return { sx: cx + x * s, sy: cy + y * s, s };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrainOrb() {
  const t = useT();
  // Set module-level LABELS from translated dict
  LABELS = [t.orb_traffic, t.orb_leads, t.orb_pipeline, t.orb_revenue, t.orb_roas, t.orb_automation, t.orb_scoring, t.orb_conversion];

  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const _s = sectionRef.current, _c = canvasRef.current, _img = imgRef.current;
    if (!_s || !_c || !_img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const _x = _c.getContext("2d", { alpha: true });
    if (!_x) return;
    const section: HTMLDivElement = _s;
    const canvas: HTMLCanvasElement = _c;
    const ctx: CanvasRenderingContext2D = _x;
    const brainImg: HTMLImageElement = _img;

    const isMobile = window.innerWidth < 640;
    const nodes = genNodes(isMobile ? 22 : 40);
    const conns = genConns(nodes, 3);

    ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const lw = nodes.map(n => n.label ? ctx.measureText(n.label).width : 0);

    const mouse = { x: 0.5, y: 0.5 }, sm = { x: 0.5, y: 0.5 };
    let prog = 0, time = 0, raf = 0, vis = true, W = 0, H = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function onScroll() {
      const r = section.getBoundingClientRect();
      prog = Math.max(0, Math.min(1, -r.top / (section.offsetHeight - window.innerHeight)));
    }
    function onMouse(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width; mouse.y = (e.clientY - r.top) / r.height;
    }
    function onTouch(e: TouchEvent) {
      const t = e.touches[0]; if (!t) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = (t.clientX - r.left) / r.width; mouse.y = (t.clientY - r.top) / r.height;
    }
    function onTouchEnd() { mouse.x = 0.5; mouse.y = 0.5; }

    // ── Render ────────────────────────────────────────────────────────────
    function render() {
      raf = requestAnimationFrame(render);
      if (!vis) return;
      time += 0.004;
      sm.x += (mouse.x - sm.x) * 0.03;
      sm.y += (mouse.y - sm.y) * 0.03;

      // ── Scroll state ───────────────────────────────────────────────
      const brainAlpha = 1 - smoothstep(0.18, 0.55, prog);        // image fades out
      const brainScale = 1 + smoothstep(0.10, 0.55, prog) * 0.35; // grows as it dissolves
      const expansion  = smoothstep(0.12, 0.75, prog);             // nodes expand outward
      const labelAlpha = isMobile ? 0 : smoothstep(0.50, 0.72, prog);
      const connAlpha  = 0.06 + smoothstep(0.12, 0.45, prog) * 0.22;

      ctx.clearRect(0, 0, W, H);

      // Centre with cursor drift
      const cx = W / 2 + (sm.x - 0.5) * 22;
      const cy = H / 2 + (sm.y - 0.5) * 16;
      const baseR = Math.min(W, H) * 0.30;

      // Cursor Y-rotation for nodes
      const rotY = (sm.x - 0.5) * 0.35;
      const cosR = Math.cos(rotY), sinR = Math.sin(rotY);

      // ── Brain image ────────────────────────────────────────────────
      if (brainAlpha > 0.01 && brainImg.complete && brainImg.naturalWidth > 0) {
        ctx.save();

        // Brain image size — fill proportionally
        const imgSize = baseR * 2.4 * brainScale;
        const ix = cx - imgSize / 2;
        const iy = cy - imgSize * 0.48; // slight upward offset (brain sits above center)

        ctx.globalAlpha = brainAlpha;
        // "screen" blend: black → transparent, bright → visible on white bg
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(brainImg, ix, iy, imgSize, imgSize * 0.68);

        // Draw again with "screen" for the luminous glow
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = brainAlpha * 0.6;
        ctx.drawImage(brainImg, ix, iy, imgSize, imgSize * 0.68);

        ctx.restore();
      }

      // ── Project nodes ──────────────────────────────────────────────
      const pr: { sx: number; sy: number; s: number; z: number; i: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const ex = n.x * 3.2, ey = n.y * 3.2, ez = n.z * 3.2;
        let px = n.x + (ex - n.x) * expansion;
        let py = n.y + (ey - n.y) * expansion;
        let pz = n.z + (ez - n.z) * expansion;
        const d = expansion * 0.028;
        px += Math.sin(time * n.drift + n.phase) * d;
        py += Math.cos(time * n.drift * 0.7 + n.phase) * d;
        const rx = px * cosR - pz * sinR, rz = px * sinR + pz * cosR;
        const p = proj3d(rx, py, rz, cx, cy, baseR);
        pr.push({ sx: p.sx, sy: p.sy, s: p.s, z: rz, i });
      }
      pr.sort((a, b) => b.z - a.z);

      // ── Connections ────────────────────────────────────────────────
      if (connAlpha > 0.02) {
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = `rgba(100,112,175,${connAlpha.toFixed(3)})`;
        ctx.beginPath();
        for (const c of conns) {
          const a = pr.find(p => p.i === c.a), b = pr.find(p => p.i === c.b);
          if (!a || !b) continue;
          ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
        }
        ctx.stroke();
      }

      // ── Nodes ──────────────────────────────────────────────────────
      for (const p of pr) {
        const n = nodes[p.i];
        const pulse = 0.7 + 0.3 * Math.sin(time * 1.5 + n.phase);
        const behind = brainAlpha > 0.3 ? (0.25 + 0.75 * (1 - brainAlpha)) : 1;
        const nA = pulse * behind;

        // Glow
        const gr = 14 * p.s;
        const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, gr);
        g.addColorStop(0, `rgba(120,135,210,${(0.22 * nA).toFixed(3)})`);
        g.addColorStop(1, "rgba(120,135,210,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, gr, 0, TAU); ctx.fill();

        // Core
        const cr = Math.max(1.8, 3.2 * p.s);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, cr, 0, TAU);
        ctx.fillStyle = `rgba(150,162,230,${(0.65 * nA).toFixed(3)})`;
        ctx.fill();
      }

      // ── Labels ─────────────────────────────────────────────────────
      if (labelAlpha > 0.01) {
        ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.textBaseline = "middle";
        for (const p of pr) {
          const n = nodes[p.i]; if (!n.label) continue;
          const w = lw[p.i];
          const ox = p.sx > cx ? 14 : -(14 + w);
          ctx.fillStyle = `rgba(100,110,170,${(labelAlpha * 0.9).toFixed(3)})`;
          ctx.fillText(n.label, Math.round(p.sx + ox), Math.round(p.sy));
          ctx.strokeStyle = `rgba(100,110,170,${(labelAlpha * 0.35).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.sx > cx ? p.sx + 5 : p.sx - 5, p.sy);
          ctx.lineTo(p.sx > cx ? p.sx + 12 : p.sx - 12, p.sy);
          ctx.stroke();
        }
      }
    }

    const obs = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0.02 });
    obs.observe(canvas);
    resize(); onScroll();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf); obs.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="HLM system architecture"
      className="relative bg-white" style={{ height: "400vh" }}>
      {/* Hidden image — loaded once, drawn to canvas each frame */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/brain.png"
        alt=""
        aria-hidden="true"
        className="hidden"
      />
      <div className="sticky top-0 flex w-full items-center justify-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}>
        <canvas ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
      </div>
    </section>
  );
}
