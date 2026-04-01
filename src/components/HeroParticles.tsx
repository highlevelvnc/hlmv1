"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const TAU = Math.PI * 2;
const N_DESK = 8000;
const N_MOB  = 3500;
const BG     = 0x0a0a14;

function ss(lo: number, hi: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}
function c01(v: number) { return Math.max(0, Math.min(1, v)); }

// ─── Palette ──────────────────────────────────────────────────────────────────

const PAL = [
  [0.50, 0.20, 0.90], [0.92, 0.75, 0.15], [0.15, 0.85, 0.70],
  [0.90, 0.28, 0.55], [0.80, 0.80, 0.90], [0.35, 0.88, 0.30],
  [0.65, 0.45, 0.95], [0.95, 0.55, 0.18],
];

// ─── Shapes ───────────────────────────────────────────────────────────────────

function shapeFunnel(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = Math.random();
    const topR = 4.5, botR = 0.5;
    const r = topR - (topR - botR) * Math.pow(t, 0.65);
    const a = Math.random() * TAU;
    const sh = 0.94 + Math.random() * 0.06;
    p[i*3] = Math.cos(a)*r*sh; p[i*3+1] = 4.2-t*8.4; p[i*3+2] = Math.sin(a)*r*sh;
  }
  return p;
}

function shapeBrain(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(1 - 2*(i+0.5)/N);
    const th = ga * i;
    let r = 4.0;
    // Deep sulci — multiple octaves for realistic folds
    r += 0.55 * Math.sin(phi*3.2) * Math.cos(th*2.8);
    r += 0.30 * Math.sin(phi*6.5 + th*3.5);
    r += 0.15 * Math.cos(phi*9.2 - th*5.1);
    r += 0.08 * Math.sin(phi*14 + th*8);
    // Central fissure (longitudinal) — deep groove at top
    const topness = Math.pow(Math.max(0, Math.cos(phi)), 4);
    const fissure = topness * Math.pow(Math.abs(Math.sin(th)), 0.5) * 0.8;
    r -= fissure;
    // Cerebellum bump at back-bottom
    const backBot = Math.max(0, Math.sin(phi-2.2)) * Math.max(0, -Math.cos(th)) * 0.4;
    r += backBot;
    // Temporal lobe bulge
    const temporal = Math.pow(Math.max(0, Math.sin(phi-1.3)), 3) * Math.abs(Math.sin(th)) * 0.3;
    r += temporal;
    const d = 0.93 + Math.random() * 0.07;
    r *= d;
    p[i*3]   = r * Math.sin(phi) * Math.cos(th) * 1.22;
    p[i*3+1] = r * Math.cos(phi) * 0.85;
    p[i*3+2] = r * Math.sin(phi) * Math.sin(th);
  }
  return p;
}

function shapeLightbulb(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = Math.random();
    if (t < 0.50) {
      const phi = Math.acos(Math.random());
      const th = Math.random() * TAU;
      const r = 3.6 * (0.94 + Math.random()*0.06);
      p[i*3]=r*Math.sin(phi)*Math.cos(th); p[i*3+1]=r*Math.cos(phi)+0.8; p[i*3+2]=r*Math.sin(phi)*Math.sin(th);
    } else if (t < 0.72) {
      const h = Math.random();
      const th = Math.random() * TAU;
      const r = 3.6*(1-h*0.68)*(0.94+Math.random()*0.06);
      p[i*3]=Math.cos(th)*r; p[i*3+1]=-h*2.8+0.8; p[i*3+2]=Math.sin(th)*r;
    } else if (t < 0.90) {
      const th = Math.random()*TAU;
      const h = Math.random()*3.2;
      const br = 1.1-h*0.12+Math.sin(h*14)*0.10;
      p[i*3]=Math.cos(th)*br; p[i*3+1]=-2.0-h; p[i*3+2]=Math.sin(th)*br;
    } else {
      const th = Math.random()*TAU;
      const r = 0.35*Math.random();
      p[i*3]=Math.cos(th)*r; p[i*3+1]=0.5+Math.random()*1.2; p[i*3+2]=Math.sin(th)*r;
    }
  }
  return p;
}

function shapeGlobe(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(2*Math.random()-1);
    const th = Math.random()*TAU;
    const r = 4.2*(0.96+Math.random()*0.04);
    p[i*3]=r*Math.sin(phi)*Math.cos(th); p[i*3+1]=r*Math.cos(phi); p[i*3+2]=r*Math.sin(phi)*Math.sin(th);
  }
  return p;
}

// ─── Scatter directions for explosion effect ──────────────────────────────────

function makeScatter(N: number): Float32Array {
  const s = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(2*Math.random()-1);
    const th = Math.random()*TAU;
    const r = 5 + Math.random()*6;
    s[i*3] = Math.sin(phi)*Math.cos(th)*r;
    s[i*3+1] = Math.cos(phi)*r;
    s[i*3+2] = Math.sin(phi)*Math.sin(th)*r;
  }
  return s;
}

// ─── Text ─────────────────────────────────────────────────────────────────────

const TEXTS = [
  { t: "We capture\nevery signal",     s: "10,000+ touchpoints tracked.\nEvery channel optimized." },
  { t: "AI processes\neverything",      s: "Lead scoring, intent mapping,\nand predictive routing." },
  { t: "Data becomes\nintelligence",    s: "Patterns recognized. Every lead\nrouted with precision." },
  { t: "Insights\nthat convert",       s: "From data to decisions.\nAutomated sequences that close." },
  { t: "Revenue\nwithout borders",     s: "Systems that scale globally.\nBuilt once. Running always." },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroParticles() {
  const sRef = useRef<HTMLDivElement>(null);
  const cRef = useRef<HTMLCanvasElement>(null);
  const pRef = useRef(0);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const fn = () => {
      if (!sRef.current) return;
      const r = sRef.current.getBoundingClientRect();
      const v = c01(-r.top / (sRef.current.offsetHeight - window.innerHeight));
      pRef.current = v; setProg(v);
    };
    window.addEventListener("scroll", fn, { passive: true }); fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const _c = cRef.current;
    if (!_c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas: HTMLCanvasElement = _c;
    const mob = window.innerWidth < 768;
    const N = mob ? N_MOB : N_DESK;

    const shapes = [shapeFunnel(N), shapeBrain(N), shapeLightbulb(N), shapeGlobe(N)];
    const scatter = makeScatter(N);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.set(mob ? 0 : 4, 0.5, 14);

    const ren = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    ren.setClearColor(BG, 1);
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N*3);
    const col = new Float32Array(N*3);
    const siz = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      const c = PAL[Math.floor(Math.random()*PAL.length)];
      col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      siz[i] = 0.10 + Math.random()*0.25;
    }
    pos.set(shapes[0]);

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(siz, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uPR: { value: Math.min(window.devicePixelRatio, 2) },
        uScale: { value: 1.0 },
        uMouse: { value: new THREE.Vector3(100,100,0) },
        uMR: { value: 2.5 },
      },
      vertexShader: `
        attribute float aSize;
        varying vec3 vC;
        varying float vD;
        uniform float uPR, uScale;
        uniform vec3 uMouse;
        uniform float uMR;
        void main() {
          vC = color;
          vec3 p = position;
          vec3 tm = p - uMouse;
          float d = length(tm);
          if (d < uMR && d > 0.01) {
            float f = (1.0 - d/uMR);
            p += normalize(tm) * f * f * 2.0;
          }
          vD = d;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float sz = aSize * uScale * uPR * (75.0 / -mv.z);
          if (d < uMR) sz *= 1.0 + (1.0-d/uMR)*1.8;
          gl_PointSize = max(1.5, sz);
        }
      `,
      fragmentShader: `
        varying vec3 vC;
        varying float vD;
        uniform float uMR;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float e = smoothstep(0.5, 0.15, d);
          float b = vD < uMR ? 1.0 + (1.0-vD/uMR)*1.5 : 1.0;
          gl_FragColor = vec4(vC * 2.5 * b, e * 0.93);
        }
      `,
      transparent: true, vertexColors: true,
      depthWrite: true, depthTest: true,
      blending: THREE.NormalBlending,
    });

    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    const mouse = { x: 0.5, y: 0.5 }, sm = { x: 0.5, y: 0.5 };
    const rc = new THREE.Raycaster();
    const mNDC = new THREE.Vector2();
    const m3D = new THREE.Vector3(100,100,0);
    let raf = 0, vis = true;
    // Track scroll-driven rotation for brain stage
    let brainRotOffset = 0;

    function onR() {
      const r = canvas.parentElement?.getBoundingClientRect();
      if (!r) return;
      cam.aspect = r.width / r.height;
      cam.updateProjectionMatrix();
      ren.setSize(r.width, r.height);
      mat.uniforms.uPR.value = Math.min(window.devicePixelRatio, 2);
    }
    function onM(e: MouseEvent) {
      mouse.x = e.clientX/window.innerWidth; mouse.y = e.clientY/window.innerHeight;
      const r = canvas.getBoundingClientRect();
      mNDC.x = ((e.clientX-r.left)/r.width)*2-1;
      mNDC.y = -((e.clientY-r.top)/r.height)*2+1;
    }
    function onT(e: TouchEvent) {
      const t = e.touches[0]; if (!t) return;
      mouse.x = t.clientX/window.innerWidth; mouse.y = t.clientY/window.innerHeight;
      const r = canvas.getBoundingClientRect();
      mNDC.x = ((t.clientX-r.left)/r.width)*2-1;
      mNDC.y = -((t.clientY-r.top)/r.height)*2+1;
    }

    /*
      SCROLL TIMELINE (600vh section, 500vh travel):
      0.00-0.12  FUNNEL (static)
      0.12-0.20  EXPLODE → brain
      0.20-0.42  BRAIN (2 text sections, rotates 120°)
      0.42-0.50  EXPLODE → lightbulb
      0.50-0.62  LIGHTBULB
      0.62-0.70  EXPLODE → globe
      0.70-0.88  GLOBE
      0.88-1.00  Fade out
    */

    function animate() {
      raf = requestAnimationFrame(animate);
      if (!vis) return;

      sm.x += (mouse.x-sm.x)*0.04;
      sm.y += (mouse.y-sm.y)*0.04;

      const p = pRef.current;

      // ── Determine shape index + transition ────────────────────────
      let shapeA = 0, shapeB = 0, localT = 0, isTransition = false;

      if (p < 0.12)        { shapeA=0; shapeB=0; localT=0; }
      else if (p < 0.20)   { shapeA=0; shapeB=1; localT=ss(0.12,0.20,p); isTransition=true; }
      else if (p < 0.42)   { shapeA=1; shapeB=1; localT=0; }
      else if (p < 0.50)   { shapeA=1; shapeB=2; localT=ss(0.42,0.50,p); isTransition=true; }
      else if (p < 0.62)   { shapeA=2; shapeB=2; localT=0; }
      else if (p < 0.70)   { shapeA=2; shapeB=3; localT=ss(0.62,0.70,p); isTransition=true; }
      else                  { shapeA=3; shapeB=3; localT=0; }

      // ── Compute positions with explosion ──────────────────────────
      const from = shapes[shapeA], to = shapes[shapeB];
      const explode = isTransition ? Math.sin(localT * Math.PI) : 0;

      for (let i = 0; i < N*3; i++) {
        const morphed = from[i] + (to[i]-from[i]) * localT;
        pos[i] = morphed + scatter[i] * explode * 0.7;
      }
      geo.attributes.position.needsUpdate = true;

      // ── Mouse 3D ──────────────────────────────────────────────────
      rc.setFromCamera(mNDC, cam);
      const plane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
      rc.ray.intersectPlane(plane, m3D);
      m3D.applyMatrix4(pts.matrixWorld.clone().invert());
      mat.uniforms.uMouse.value.copy(m3D);

      // ── Rotation ──────────────────────────────────────────────────
      // Cursor-driven rotation
      const tRY = (sm.x-0.5)*0.6;
      const tRX = (sm.y-0.5)*-0.4;
      pts.rotation.y += (tRY - pts.rotation.y)*0.04;
      pts.rotation.x += (tRX - pts.rotation.x)*0.04;
      pts.rotation.y += 0.001; // slow auto-spin

      // Brain stage: scroll-driven 120° rotation (2π/3 ≈ 2.09 rad)
      if (p >= 0.20 && p <= 0.42) {
        const brainT = (p - 0.20) / 0.22; // 0→1 over brain section
        brainRotOffset = brainT * (TAU / 3); // 0→120°
      } else if (p < 0.20) {
        brainRotOffset = 0;
      }
      // Only apply brain rotation offset when in brain stage
      if (shapeA === 1 && !isTransition) {
        pts.rotation.y += brainRotOffset;
      }

      // Camera parallax
      cam.position.x = (mob?0:4) + (sm.x-0.5)*1.5;
      cam.position.y = 0.5 + (sm.y-0.5)*-1.0;
      cam.lookAt(mob?0:1.5, 0, 0);

      // Fade
      const fade = p > 0.88 ? 1 - ss(0.88,1.0,p) : 1;
      mat.uniforms.uScale.value = fade;

      ren.render(scene, cam);
    }

    const obs = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0.02 });
    obs.observe(canvas);
    onR();
    window.addEventListener("resize", onR, { passive: true });
    window.addEventListener("mousemove", onM, { passive: true });
    window.addEventListener("touchmove", onT, { passive: true });
    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf); obs.disconnect();
      window.removeEventListener("resize", onR);
      window.removeEventListener("mousemove", onM);
      window.removeEventListener("touchmove", onT);
      ren.dispose(); geo.dispose(); mat.dispose();
    };
  }, []);

  // ── Text stages (5 sections: funnel, brain1, brain2, lightbulb, globe) ────
  const si = prog<0.18 ? 0 : prog<0.32 ? 1 : prog<0.44 ? 2 : prog<0.64 ? 3 : 4;
  const sA = prog<0.04 ? ss(0,0.04,prog) : prog>0.88 ? 1-ss(0.88,1.0,prog) : 1;
  const exit = ss(0.90, 1.0, prog);

  return (
    <section ref={sRef} aria-label="HLM — Interactive revenue funnel"
      className="relative" style={{ height: "600vh", backgroundColor: "rgb(10,10,20)" }}>
      <div className="sr-only">
        <h1>HLM Revenue System</h1>
        {TEXTS.map((s,i) => <p key={i}>{s.t}: {s.s}</p>)}
      </div>
      <div className="sticky top-0 flex w-full items-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}>
        <canvas ref={cRef} className="absolute inset-0 h-full w-full" style={{ display: "block" }} />
        <div className="relative z-10 flex h-full w-full items-center">
          <div className="flex flex-col gap-5 px-8 sm:px-12 md:px-20 lg:px-28 max-w-lg"
            style={{ opacity: sA, transition: "opacity 500ms ease" }}>
            <h2 className="text-[1.6rem] sm:text-[2.2rem] md:text-[3rem] font-[200] leading-[1.08] tracking-tight text-white whitespace-pre-line">
              {TEXTS[si].t}
            </h2>
            <p className="text-[13px] sm:text-[15px] font-light leading-[1.75] text-white/45 max-w-sm whitespace-pre-line">
              {TEXTS[si].s}
            </p>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
          aria-hidden="true" style={{ opacity: Math.max(0, 1 - prog*6) }}>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-medium tracking-[0.35em] text-white/35">SCROLL TO EXPLORE</span>
            <div className="h-10 w-px bg-gradient-to-b from-white/25 to-transparent"
              style={{ animation: "scrollPulse 2.5s ease-in-out infinite" }} />
          </div>
        </div>
        {exit > 0.01 && <div className="absolute inset-0 z-20 bg-white" style={{ opacity: exit }} />}
      </div>
    </section>
  );
}
