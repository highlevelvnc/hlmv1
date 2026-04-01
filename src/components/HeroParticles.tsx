"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const TAU = Math.PI * 2;
const N_DESK = 40000;
const N_MOB  = 18000;
const N_BG   = 400;   // floating background triangles
const BG     = 0x0e0a1e; // deep purple-black (Dala-style)

function ss(lo: number, hi: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}
function c01(v: number) { return Math.max(0, Math.min(1, v)); }

// ─── Vibrant Dala-style palette ───────────────────────────────────────────────

const PAL = [
  [0.55, 0.22, 0.95], // vibrant purple
  [0.95, 0.78, 0.18], // bright gold
  [0.18, 0.90, 0.75], // bright cyan
  [0.95, 0.30, 0.60], // hot pink
  [0.90, 0.88, 0.96], // purple-tinted white
  [0.30, 0.92, 0.35], // bright green
  [0.72, 0.48, 0.98], // lavender
  [0.98, 0.58, 0.20], // bright orange
];

// ─── Shapes ───────────────────────────────────────────────────────────────────

function shapeFunnel(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = Math.random();
    const r = 4.5 - 3.9 * Math.pow(t, 0.65);
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
    r += 0.55*Math.sin(phi*3.2)*Math.cos(th*2.8);
    r += 0.30*Math.sin(phi*6.5+th*3.5);
    r += 0.15*Math.cos(phi*9.2-th*5.1);
    r += 0.08*Math.sin(phi*14+th*8);
    const topness = Math.pow(Math.max(0, Math.cos(phi)), 4);
    r -= topness * Math.pow(Math.abs(Math.sin(th)), 0.5) * 0.8;
    r += Math.max(0, Math.sin(phi-2.2)) * Math.max(0, -Math.cos(th)) * 0.4;
    r += Math.pow(Math.max(0, Math.sin(phi-1.3)), 3) * Math.abs(Math.sin(th)) * 0.3;
    r *= 0.93 + Math.random() * 0.07;
    p[i*3] = r*Math.sin(phi)*Math.cos(th)*1.22;
    p[i*3+1] = r*Math.cos(phi)*0.85;
    p[i*3+2] = r*Math.sin(phi)*Math.sin(th);
  }
  return p;
}

function shapeLightbulb(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = Math.random();
    if (t < 0.50) {
      const phi = Math.acos(Math.random()), th = Math.random()*TAU;
      const r = 3.6*(0.94+Math.random()*0.06);
      p[i*3]=r*Math.sin(phi)*Math.cos(th); p[i*3+1]=r*Math.cos(phi)+0.8; p[i*3+2]=r*Math.sin(phi)*Math.sin(th);
    } else if (t < 0.72) {
      const h = Math.random(), th = Math.random()*TAU;
      const r = 3.6*(1-h*0.68)*(0.94+Math.random()*0.06);
      p[i*3]=Math.cos(th)*r; p[i*3+1]=-h*2.8+0.8; p[i*3+2]=Math.sin(th)*r;
    } else if (t < 0.90) {
      const th = Math.random()*TAU, h = Math.random()*3.2;
      const br = 1.1-h*0.12+Math.sin(h*14)*0.10;
      p[i*3]=Math.cos(th)*br; p[i*3+1]=-2.0-h; p[i*3+2]=Math.sin(th)*br;
    } else {
      const th = Math.random()*TAU, r = 0.35*Math.random();
      p[i*3]=Math.cos(th)*r; p[i*3+1]=0.5+Math.random()*1.2; p[i*3+2]=Math.sin(th)*r;
    }
  }
  return p;
}

function isLandish(lat: number, lon: number): boolean {
  return Math.sin(lat*2.5+0.3)*Math.cos(lon*3.1-0.8)*0.5
       + Math.sin(lat*5.2-lon*2.3)*0.25
       + Math.cos(lat*1.2+lon*4.5)*0.15 > -0.1;
}

function shapeGlobe(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  let idx = 0;
  while (idx < N) {
    const phi = Math.acos(2*Math.random()-1), th = Math.random()*TAU;
    const lat = Math.PI/2 - phi, lon = th - Math.PI;
    const land = isLandish(lat, lon);
    const r = land ? 4.2*(0.97+Math.random()*0.03) : 4.2*(0.90+Math.random()*0.05);
    if (!land && Math.random() < 0.4) continue;
    p[idx*3]=r*Math.sin(phi)*Math.cos(th); p[idx*3+1]=r*Math.cos(phi); p[idx*3+2]=r*Math.sin(phi)*Math.sin(th);
    idx++; if (idx >= N) break;
  }
  return p;
}

function makeScatter(N: number): Float32Array {
  const s = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(2*Math.random()-1), th = Math.random()*TAU;
    const r = 5+Math.random()*6;
    s[i*3]=Math.sin(phi)*Math.cos(th)*r; s[i*3+1]=Math.cos(phi)*r; s[i*3+2]=Math.sin(phi)*Math.sin(th)*r;
  }
  return s;
}

function latLonTo3D(lat: number, lon: number, r: number): THREE.Vector3 {
  const la = lat*Math.PI/180, lo = lon*Math.PI/180;
  return new THREE.Vector3(r*Math.cos(la)*Math.sin(lo), r*Math.sin(la), -r*Math.cos(la)*Math.cos(lo));
}

// ─── Text ─────────────────────────────────────────────────────────────────────

const TEXTS = [
  { t: "We capture\nevery signal",  s: "10,000+ touchpoints tracked.\nEvery channel optimized." },
  { t: "AI processes\neverything",   s: "Lead scoring, intent mapping,\nand predictive routing." },
  { t: "Data becomes\nintelligence", s: "Patterns recognized. Every lead\nrouted with precision." },
  { t: "Insights\nthat convert",    s: "From data to decisions.\nAutomated sequences that close." },
  { t: "Revenue\nwithout borders",  s: "Systems that scale globally.\nBuilt once. Running always." },
];

// ─── Triangle vertex/fragment shaders ─────────────────────────────────────────

const VERT = `
  attribute float aSize;
  attribute float aRot;
  varying vec3 vC;
  varying float vD;
  varying float vRot;
  uniform float uPR, uScale;
  uniform vec3 uMouse;
  uniform float uMR;
  void main() {
    vC = color;
    vRot = aRot;
    vec3 p = position;
    vec3 tm = p - uMouse;
    float d = length(tm);
    if (d < uMR && d > 0.01) {
      float f = (1.0 - d/uMR);
      p += normalize(tm) * f * f * 2.2;
    }
    vD = d;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float sz = aSize * uScale * uPR * (120.0 / -mv.z);
    if (d < uMR) sz *= 1.0 + (1.0-d/uMR)*2.0;
    gl_PointSize = max(1.5, sz);
  }
`;

const FRAG = `
  varying vec3 vC;
  varying float vD;
  varying float vRot;
  uniform float uMR;
  void main() {
    float ca = cos(vRot), sa = sin(vRot);
    vec2 uv = gl_PointCoord - 0.5;
    uv = vec2(uv.x*ca - uv.y*sa, uv.x*sa + uv.y*ca);

    // Triangle SDF
    float tri = max(abs(uv.x)*1.732 + uv.y, -uv.y*2.0) * 1.8;
    if (tri > 0.5) discard;

    // Mix filled and outline based on rotation (deterministic per particle)
    float isOutline = step(0.5, fract(vRot * 3.183));
    float fill = smoothstep(0.5, 0.15, tri);
    float outline = smoothstep(0.5, 0.40, tri) - smoothstep(0.40, 0.30, tri);
    float alpha = mix(fill, max(fill * 0.3, outline), isOutline);

    float boost = vD < uMR ? 1.0 + (1.0-vD/uMR)*2.0 : 1.0;
    gl_FragColor = vec4(vC * 3.0 * boost, alpha * 0.95);
  }
`;

// Background triangles shader (larger, slower, dimmer)
const BG_VERT = `
  attribute float aSize;
  attribute float aRot;
  varying vec3 vC;
  varying float vRot;
  uniform float uPR, uTime;
  void main() {
    vC = color;
    vRot = aRot + uTime * 0.3;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(4.0, aSize * uPR * (350.0 / -mv.z));
  }
`;

const BG_FRAG = `
  varying vec3 vC;
  varying float vRot;
  void main() {
    float ca = cos(vRot), sa = sin(vRot);
    vec2 uv = gl_PointCoord - 0.5;
    uv = vec2(uv.x*ca - uv.y*sa, uv.x*sa + uv.y*ca);
    // Triangle outline only (hollow)
    float tri = max(abs(uv.x)*1.732 + uv.y, -uv.y*2.0) * 1.8;
    float outline = smoothstep(0.5, 0.42, tri) - smoothstep(0.42, 0.35, tri);
    if (outline < 0.05) discard;
    gl_FragColor = vec4(vC * 2.2, outline * 0.55);
  }
`;

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
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    cam.position.set(mob ? 0 : 4, 0.5, 14);

    const ren = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    ren.setClearColor(BG, 1);
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Main particles ──────────────────────────────────────────────
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N*3);
    const col = new Float32Array(N*3);
    const siz = new Float32Array(N);
    const rot = new Float32Array(N); // triangle rotation per particle

    for (let i = 0; i < N; i++) {
      const c = PAL[Math.floor(Math.random()*PAL.length)];
      col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      // Wide size range — mix of tiny dots and large visible triangles (like Dala)
      const r = Math.random();
      siz[i] = r < 0.6 ? 0.06 + Math.random()*0.15    // 60% small
             : r < 0.9 ? 0.20 + Math.random()*0.35    // 30% medium
             :            0.45 + Math.random()*0.55;   // 10% large (very visible)
      rot[i] = Math.random() * TAU;
    }
    pos.set(shapes[0]);

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(siz, 1));
    geo.setAttribute("aRot", new THREE.BufferAttribute(rot, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uPR: { value: Math.min(window.devicePixelRatio, 2) },
        uScale: { value: 1.0 },
        uMouse: { value: new THREE.Vector3(100,100,0) },
        uMR: { value: 2.5 },
      },
      vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, vertexColors: true,
      depthWrite: true, depthTest: true,
      blending: THREE.NormalBlending,
    });

    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    // ── Background floating triangles ───────────────────────────────
    const bgGeo = new THREE.BufferGeometry();
    const bgPos = new Float32Array(N_BG*3);
    const bgCol = new Float32Array(N_BG*3);
    const bgSiz = new Float32Array(N_BG);
    const bgRot = new Float32Array(N_BG);

    for (let i = 0; i < N_BG; i++) {
      const c = PAL[Math.floor(Math.random()*PAL.length)];
      bgCol[i*3]=c[0]; bgCol[i*3+1]=c[1]; bgCol[i*3+2]=c[2];
      bgSiz[i] = 0.4 + Math.random()*1.2;
      bgRot[i] = Math.random()*TAU;
      // Spread across large volume, excluding the center where main shape is
      const phi = Math.acos(2*Math.random()-1), th = Math.random()*TAU;
      const r = 8 + Math.random()*25;
      bgPos[i*3]=r*Math.sin(phi)*Math.cos(th);
      bgPos[i*3+1]=r*Math.cos(phi);
      bgPos[i*3+2]=r*Math.sin(phi)*Math.sin(th);
    }

    bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute("color", new THREE.BufferAttribute(bgCol, 3));
    bgGeo.setAttribute("aSize", new THREE.BufferAttribute(bgSiz, 1));
    bgGeo.setAttribute("aRot", new THREE.BufferAttribute(bgRot, 1));

    const bgMat = new THREE.ShaderMaterial({
      uniforms: {
        uPR: { value: Math.min(window.devicePixelRatio, 2) },
        uTime: { value: 0 },
      },
      vertexShader: BG_VERT, fragmentShader: BG_FRAG,
      transparent: true, vertexColors: true,
      depthWrite: false, depthTest: true,
      blending: THREE.AdditiveBlending,
    });

    const bgPts = new THREE.Points(bgGeo, bgMat);
    scene.add(bgPts);

    // ── Geolocation pin ─────────────────────────────────────────────
    const pinGroup = new THREE.Group();
    pinGroup.visible = false;
    scene.add(pinGroup);

    const pinDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x44ff88 })
    );
    pinGroup.add(pinDot);

    const pinNeedle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6),
      new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.7 })
    );
    pinNeedle.position.y = 0.6;
    pinGroup.add(pinNeedle);

    const pinRingMat = new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const pinRing = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.42, 32), pinRingMat);
    pinGroup.add(pinRing);

    let pinReady = false, pinPos = new THREE.Vector3(0,4.2,0);
    fetch("https://ipapi.co/json/").then(r=>r.json()).then(d=>{
      pinPos = latLonTo3D(d.latitude??38.7, d.longitude??-9.1, 4.5);
      pinReady = true;
    }).catch(()=>{ pinPos = latLonTo3D(38.7,-9.1,4.5); pinReady = true; });

    // ── State ───────────────────────────────────────────────────────
    const mouse={x:0.5,y:0.5}, sm={x:0.5,y:0.5};
    const rc = new THREE.Raycaster();
    const mNDC = new THREE.Vector2();
    const m3D = new THREE.Vector3(100,100,0);
    let raf=0, vis=true, brainRotOff=0, time=0;

    function onR() {
      const r = canvas.parentElement?.getBoundingClientRect();
      if (!r) return;
      cam.aspect = r.width/r.height; cam.updateProjectionMatrix();
      ren.setSize(r.width, r.height);
      mat.uniforms.uPR.value = Math.min(window.devicePixelRatio, 2);
      bgMat.uniforms.uPR.value = mat.uniforms.uPR.value;
    }
    function onM(e: MouseEvent) {
      mouse.x=e.clientX/window.innerWidth; mouse.y=e.clientY/window.innerHeight;
      const r=canvas.getBoundingClientRect();
      mNDC.x=((e.clientX-r.left)/r.width)*2-1;
      mNDC.y=-((e.clientY-r.top)/r.height)*2+1;
    }
    function onT(e: TouchEvent) {
      const t=e.touches[0]; if (!t) return;
      mouse.x=t.clientX/window.innerWidth; mouse.y=t.clientY/window.innerHeight;
      const r=canvas.getBoundingClientRect();
      mNDC.x=((t.clientX-r.left)/r.width)*2-1;
      mNDC.y=-((t.clientY-r.top)/r.height)*2+1;
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      if (!vis) return;

      time += 0.004;
      sm.x += (mouse.x-sm.x)*0.04;
      sm.y += (mouse.y-sm.y)*0.04;

      const p = pRef.current;

      // ── Morph + explosion ─────────────────────────────────────────
      let shA=0,shB=0,lT=0,isTr=false;
      if (p<0.12)      { shA=0;shB=0;lT=0; }
      else if (p<0.20) { shA=0;shB=1;lT=ss(0.12,0.20,p);isTr=true; }
      else if (p<0.42) { shA=1;shB=1;lT=0; }
      else if (p<0.50) { shA=1;shB=2;lT=ss(0.42,0.50,p);isTr=true; }
      else if (p<0.62) { shA=2;shB=2;lT=0; }
      else if (p<0.70) { shA=2;shB=3;lT=ss(0.62,0.70,p);isTr=true; }
      else             { shA=3;shB=3;lT=0; }

      const from=shapes[shA], to=shapes[shB];
      const explode = isTr ? Math.sin(lT*Math.PI) : 0;

      for (let i=0;i<N*3;i++) {
        pos[i] = from[i]+(to[i]-from[i])*lT + scatter[i]*explode*0.7;
      }
      geo.attributes.position.needsUpdate = true;

      // ── Mouse 3D ──────────────────────────────────────────────────
      rc.setFromCamera(mNDC, cam);
      const plane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
      rc.ray.intersectPlane(plane, m3D);
      m3D.applyMatrix4(pts.matrixWorld.clone().invert());
      mat.uniforms.uMouse.value.copy(m3D);

      // ── Rotation ──────────────────────────────────────────────────
      const tRY=(sm.x-0.5)*0.6, tRX=(sm.y-0.5)*-0.4;
      pts.rotation.y += (tRY-pts.rotation.y)*0.04;
      pts.rotation.x += (tRX-pts.rotation.x)*0.04;
      pts.rotation.y += 0.001;

      // Brain 120° scroll rotation
      if (p>=0.20 && p<=0.42) brainRotOff = ((p-0.20)/0.22)*(TAU/3);
      else if (p<0.20) brainRotOff = 0;
      if (shA===1 && !isTr) pts.rotation.y += brainRotOff;

      // Background triangles slow spin
      bgPts.rotation.y = time * 0.08;
      bgPts.rotation.x = Math.sin(time*0.5)*0.05;
      bgMat.uniforms.uTime.value = time;

      // Camera
      cam.position.x = (mob?0:4)+(sm.x-0.5)*1.5;
      cam.position.y = 0.5+(sm.y-0.5)*-1.0;
      cam.lookAt(mob?0:1.5, 0, 0);

      // ── Pin ───────────────────────────────────────────────────────
      if (pinReady && shA===3 && !isTr) {
        pinGroup.visible = true;
        pinGroup.position.copy(pinPos);
        pinGroup.lookAt(0,0,0);
        pinGroup.rotateX(Math.PI/2);
        pinGroup.position.applyEuler(pts.rotation);
        const pulse = 1+Math.sin(Date.now()*0.004)*0.2;
        pinRingMat.opacity = 0.3+Math.sin(Date.now()*0.003)*0.2;
        pinDot.scale.setScalar(pulse);
        pinRing.scale.setScalar(pulse*1.3);
      } else { pinGroup.visible = false; }

      // Fade
      const fade = p>0.88 ? 1-ss(0.88,1.0,p) : 1;
      mat.uniforms.uScale.value = fade;

      ren.render(scene, cam);
    }

    const obs = new IntersectionObserver(([e])=>{vis=e.isIntersecting;},{threshold:0.02});
    obs.observe(canvas);
    onR();
    window.addEventListener("resize",onR,{passive:true});
    window.addEventListener("mousemove",onM,{passive:true});
    window.addEventListener("touchmove",onT,{passive:true});
    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf); obs.disconnect();
      window.removeEventListener("resize",onR);
      window.removeEventListener("mousemove",onM);
      window.removeEventListener("touchmove",onT);
      ren.dispose(); geo.dispose(); mat.dispose(); bgGeo.dispose(); bgMat.dispose();
    };
  }, []);

  const si = prog<0.18?0:prog<0.32?1:prog<0.44?2:prog<0.64?3:4;
  const sA = prog<0.04?ss(0,0.04,prog):prog>0.88?1-ss(0.88,1.0,prog):1;
  const exit = ss(0.90, 1.0, prog);

  return (
    <section ref={sRef} aria-label="HLM — Interactive revenue funnel"
      className="relative" style={{ height: "600vh", backgroundColor: "#0e0a1e" }}>
      <div className="sr-only">
        <h1>HLM Revenue System</h1>
        {TEXTS.map((s,i)=><p key={i}>{s.t}: {s.s}</p>)}
      </div>
      <div className="sticky top-0 flex w-full items-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}>
        <canvas ref={cRef} className="absolute inset-0 h-full w-full" style={{ display: "block" }} />

        {/* Text — left side, Dala-style large typography */}
        <div className="relative z-10 flex h-full w-full items-center">
          <div className="flex flex-col gap-4 px-8 sm:px-12 md:px-20 lg:px-28 max-w-2xl"
            style={{ opacity: sA, transition: "opacity 500ms ease" }}>
            <h2 className="text-[2rem] sm:text-[2.8rem] md:text-[3.8rem] font-[300] leading-[1.05] tracking-tight text-white whitespace-pre-line">
              {TEXTS[si].t}
            </h2>
            <p className="text-[14px] sm:text-[16px] font-light leading-[1.7] text-white/50 max-w-md whitespace-pre-line">
              {TEXTS[si].s}
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
          aria-hidden="true" style={{ opacity: Math.max(0,1-prog*6) }}>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-medium tracking-[0.35em] text-white/30">SCROLL TO EXPLORE</span>
            <div className="h-10 w-px bg-gradient-to-b from-white/20 to-transparent"
              style={{ animation: "scrollPulse 2.5s ease-in-out infinite" }} />
          </div>
        </div>

        {exit>0.01 && <div className="absolute inset-0 z-20 bg-white" style={{ opacity: exit }} />}
      </div>
    </section>
  );
}
