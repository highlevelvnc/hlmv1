"use client";

import { useEffect, useRef } from "react";

// ─── Noise ────────────────────────────────────────────────────────────────────

function noise(x: number, y: number): number {
  return (
    Math.sin(x * 1.2 + y * 0.9) * 0.35 +
    Math.sin(x * 2.1 - y * 1.7 + 1.3) * 0.25 +
    Math.sin(x * 3.5 + y * 2.4 - 0.8) * 0.18 +
    Math.sin(x * 5.2 - y * 3.8 + 2.1) * 0.12 +
    Math.sin(x * 7.1 + y * 5.3 - 1.5) * 0.06
  );
}

// Ridged noise — brain sulci (deep grooves) and gyri (ridges)
function ridged(x: number, y: number): number {
  const r1 = 1 - Math.abs(Math.sin(x * 1.6 + y * 1.2) * 0.65 + Math.sin(x * 3.4 - y * 2.5) * 0.35);
  const r2 = 1 - Math.abs(Math.sin(x * 2.8 + y * 1.9 + 1.4) * 0.55 + Math.sin(x * 4.3 - y * 3.6) * 0.45);
  const r3 = 1 - Math.abs(Math.sin(x * 5.1 + y * 3.2 - 0.7) * 0.5 + Math.sin(x * 6.8 - y * 4.9) * 0.5);
  return r1 * 0.5 + r2 * 0.35 + r3 * 0.15;
}

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

const LABELS = [
  "Traffic", "Leads", "Pipeline", "Revenue",
  "ROAS 4.8×", "Automation", "AI Scoring", "Conversion",
];

// ─── Generators ───────────────────────────────────────────────────────────────

function generateNodes(count: number): Node3D[] {
  const ga = Math.PI * (3 - Math.sqrt(5));
  const nodes: Node3D[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = ga * i;
    const depth = i < LABELS.length ? 0.5 + Math.random() * 0.3 : 0.25 + Math.random() * 0.75;
    nodes.push({
      x: Math.cos(t) * r * depth, y: y * depth, z: Math.sin(t) * r * depth,
      label: i < LABELS.length ? LABELS[i] : null,
      phase: Math.random() * TAU, drift: 0.4 + Math.random() * 0.6,
    });
  }
  return nodes;
}

function generateConns(nodes: Node3D[], k: number): Conn[] {
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const _s = sectionRef.current, _c = canvasRef.current;
    if (!_s || !_c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const _x = _c.getContext("2d", { alpha: true });
    if (!_x) return;
    const section: HTMLDivElement = _s;
    const canvas: HTMLCanvasElement = _c;
    const ctx: CanvasRenderingContext2D = _x;

    const isMobile = window.innerWidth < 640;
    const nodes = generateNodes(isMobile ? 22 : 40);
    const conns = generateConns(nodes, 3);
    const PTS = isMobile ? 90 : 140;

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

      const sA = 1 - smoothstep(0.10, 0.48, prog);           // surface opacity
      const sF = 1 + smoothstep(0.10, 0.48, prog) * 5;       // fold amplification
      const exp = smoothstep(0.10, 0.72, prog);               // node expansion
      const lA = isMobile ? 0 : smoothstep(0.48, 0.70, prog); // label alpha
      const cA = 0.08 + smoothstep(0.10, 0.42, prog) * 0.24;  // connection alpha

      ctx.clearRect(0, 0, W, H);

      const cx = W / 2 + (sm.x - 0.5) * 22;
      const cy = H / 2 + (sm.y - 0.5) * 16;
      // Bigger orb
      const bR = Math.min(W, H) * 0.30;

      const rotY = (sm.x - 0.5) * 0.35;
      const cosR = Math.cos(rotY), sinR = Math.sin(rotY);

      // ── Project nodes ──────────────────────────────────────────────
      const pr: { sx: number; sy: number; s: number; z: number; i: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const ex = n.x * 3.2, ey = n.y * 3.2, ez = n.z * 3.2;
        let px = n.x + (ex - n.x) * exp;
        let py = n.y + (ey - n.y) * exp;
        let pz = n.z + (ez - n.z) * exp;
        const d = exp * 0.028;
        px += Math.sin(time * n.drift + n.phase) * d;
        py += Math.cos(time * n.drift * 0.7 + n.phase) * d;
        const rx = px * cosR - pz * sinR, rz = px * sinR + pz * cosR;
        const p = proj3d(rx, py, rz, cx, cy, bR);
        pr.push({ sx: p.sx, sy: p.sy, s: p.s, z: rz, i });
      }
      pr.sort((a, b) => b.z - a.z);

      // ── Connections ────────────────────────────────────────────────
      if (cA > 0.02) {
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = `rgba(100,112,175,${cA.toFixed(3)})`;
        ctx.beginPath();
        for (const c of conns) {
          const a = pr.find(p => p.i === c.a), b = pr.find(p => p.i === c.b);
          if (!a || !b) continue;
          ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
        }
        ctx.stroke();
      }

      // ── Brain surface ──────────────────────────────────────────────
      if (sA > 0.01) {
        // Brain shape: wider than tall (1.25:1), with central fissure at top
        const path = new Path2D();
        for (let i = 0; i <= PTS; i++) {
          const a = (i / PTS) * TAU;
          const nx = Math.cos(a), ny = Math.sin(a);

          // Hemispheric aspect: stretch X, compress Y slightly
          const hx = nx * 1.22;
          const hy = ny * 0.92;

          // Central fissure — deep indent at top (angle ≈ -π/2) and slight at bottom
          const topFissure = Math.pow(Math.max(0, -ny), 6) * bR * 0.18;

          // Temporal indent — slight scoop at the bottom-sides
          const temporalIndent = Math.pow(Math.max(0, ny), 4) * Math.abs(nx) * bR * 0.06;

          // Brain folds
          const fold = ridged(hx * 3.5 + time * 0.25, hy * 3.5 + time * 0.15) * bR * 0.22 * sF;
          const organic = noise(hx * 2.5 + time * 0.35, hy * 2.5 + time * 0.2) * bR * 0.06 * sF;

          const r = bR + fold + organic - topFissure - temporalIndent;
          const x = cx + r * hx;
          const y = cy + r * hy;
          if (i === 0) path.moveTo(x, y); else path.lineTo(x, y);
        }
        path.closePath();

        const lx = cx + (sm.x - 0.5) * bR * 0.7;
        const ly = cy + (sm.y - 0.5) * bR * 0.5;

        // Outer glow
        const gl = ctx.createRadialGradient(cx, cy, bR * 0.15, cx, cy, bR * 1.9);
        gl.addColorStop(0,   `rgba(110,120,180,${(0.22 * sA).toFixed(3)})`);
        gl.addColorStop(0.5, `rgba(110,120,180,${(0.08 * sA).toFixed(3)})`);
        gl.addColorStop(1,   "rgba(110,120,180,0)");
        ctx.fillStyle = gl;
        ctx.beginPath(); ctx.arc(cx, cy, bR * 1.9, 0, TAU); ctx.fill();

        // Body — very visible
        const bd = ctx.createRadialGradient(lx, ly, 0, cx, cy, bR * 1.15);
        bd.addColorStop(0,    `rgba(135,142,195,${(0.82 * sA).toFixed(3)})`);
        bd.addColorStop(0.25, `rgba(120,130,185,${(0.62 * sA).toFixed(3)})`);
        bd.addColorStop(0.6,  `rgba(105,115,172,${(0.35 * sA).toFixed(3)})`);
        bd.addColorStop(1,    `rgba(88,98,155,${(0.12 * sA).toFixed(3)})`);
        ctx.fillStyle = bd;
        ctx.fill(path);

        // Inner highlight
        const ih = ctx.createRadialGradient(lx - bR * 0.06, ly - bR * 0.06, 0, cx, cy, bR * 0.5);
        ih.addColorStop(0, `rgba(170,176,222,${(0.45 * sA).toFixed(3)})`);
        ih.addColorStop(1, "rgba(170,176,222,0)");
        ctx.fillStyle = ih;
        ctx.fill(path);

        // Rim fresnel
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const rm = ctx.createRadialGradient(cx, cy, bR * 0.5, cx, cy, bR * 1.08);
        rm.addColorStop(0,   "rgba(0,0,0,0)");
        rm.addColorStop(0.55, `rgba(130,140,200,${(0.08 * sA).toFixed(3)})`);
        rm.addColorStop(1,    `rgba(150,160,215,${(0.25 * sA).toFixed(3)})`);
        ctx.fillStyle = rm;
        ctx.fill(path);
        ctx.restore();

        // ── Internal fold lines (brain convolutions) ─────────────────
        // Draw curved paths across the brain interior that follow ridge contours
        ctx.save();
        ctx.clip(path);
        ctx.lineWidth = 0.9;

        // Multiple fold sets at different orientations
        for (let setIdx = 0; setIdx < 3; setIdx++) {
          const rot = setIdx * 1.1;  // rotate each set
          const freq = 3.0 + setIdx * 1.5;
          ctx.strokeStyle = `rgba(90,100,165,${(0.18 * sA).toFixed(3)})`;
          ctx.beginPath();

          // Draw ~12 fold lines per set
          for (let line = 0; line < 12; line++) {
            const offset = (line - 6) * bR * 0.12;
            let drawing = false;

            for (let s = 0; s <= 40; s++) {
              const t2 = (s / 40) * 2 - 1; // -1 to 1
              // Base position: horizontal line across the brain
              const bx = t2 * bR * 1.0;
              const by = offset;
              // Rotate
              const px = bx * Math.cos(rot) - by * Math.sin(rot);
              const py = bx * Math.sin(rot) + by * Math.cos(rot);
              // Displace with brain folds
              const fv = ridged(
                (px / bR) * freq + time * 0.2,
                (py / bR) * freq + time * 0.15,
              );
              const dy = fv * bR * 0.06 * sF;
              const fx = cx + px;
              const fy = cy + py + dy;

              // Only draw if inside a reasonable radius
              const dx2 = fx - cx, dy2 = fy - cy;
              if (dx2 * dx2 + dy2 * dy2 < bR * bR * 1.2) {
                if (!drawing) { ctx.moveTo(fx, fy); drawing = true; }
                else ctx.lineTo(fx, fy);
              } else {
                drawing = false;
              }
            }
          }
          ctx.stroke();
        }

        // Highlight lines on ridges (brighter)
        ctx.strokeStyle = `rgba(160,168,220,${(0.12 * sA).toFixed(3)})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let i = 0; i <= PTS; i++) {
          const a = (i / PTS) * TAU;
          const nx = Math.cos(a), ny = Math.sin(a);
          const hx = nx * 1.22, hy = ny * 0.92;
          const fold = ridged(hx * 3.5 + time * 0.25, hy * 3.5 + time * 0.15);
          const r = bR + fold * bR * 0.22 * sF;
          if (fold > 0.55) ctx.lineTo(cx + r * hx, cy + r * hy);
          else ctx.moveTo(cx + r * hx, cy + r * hy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // ── Nodes ──────────────────────────────────────────────────────
      for (const p of pr) {
        const n = nodes[p.i];
        const pulse = 0.7 + 0.3 * Math.sin(time * 1.5 + n.phase);
        const behind = sA > 0.01 ? (0.30 + 0.70 * (1 - sA)) : 1;
        const nA = pulse * behind;

        const gr = 14 * p.s;
        const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, gr);
        g.addColorStop(0, `rgba(120,135,210,${(0.22 * nA).toFixed(3)})`);
        g.addColorStop(1, "rgba(120,135,210,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, gr, 0, TAU); ctx.fill();

        const cr = Math.max(1.8, 3.2 * p.s);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, cr, 0, TAU);
        ctx.fillStyle = `rgba(150,162,230,${(0.65 * nA).toFixed(3)})`;
        ctx.fill();
      }

      // ── Labels ─────────────────────────────────────────────────────
      if (lA > 0.01) {
        ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.textBaseline = "middle";
        for (const p of pr) {
          const n = nodes[p.i]; if (!n.label) continue;
          const w = lw[p.i];
          const ox = p.sx > cx ? 14 : -(14 + w);
          ctx.fillStyle = `rgba(100,110,170,${(lA * 0.9).toFixed(3)})`;
          ctx.fillText(n.label, Math.round(p.sx + ox), Math.round(p.sy));
          ctx.strokeStyle = `rgba(100,110,170,${(lA * 0.35).toFixed(3)})`;
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
      <div className="sticky top-0 flex w-full items-center justify-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}>
        <canvas ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
      </div>
    </section>
  );
}
