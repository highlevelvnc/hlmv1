"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const TAU = Math.PI * 2;
const N_DESK = 40000;
const N_MOB  = 18000;
const N_BG   = 350;
const BG     = 0x000000; // pure black like Dala

function ss(lo: number, hi: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}
function c01(v: number) { return Math.max(0, Math.min(1, v)); }

const PAL = [
  [0.55, 0.22, 0.95], [0.95, 0.78, 0.18], [0.18, 0.90, 0.75],
  [0.95, 0.30, 0.60], [0.90, 0.88, 0.96], [0.30, 0.92, 0.35],
  [0.72, 0.48, 0.98], [0.98, 0.58, 0.20],
];

// ─── Shapes ───────────────────────────────────────────────────────────────────

function shapeFunnel(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = Math.random();
    const r = 4.5 - 3.9 * Math.pow(t, 0.65);
    const a = Math.random() * TAU;
    const sh = 0.94 + Math.random() * 0.06;
    p[i*3]=Math.cos(a)*r*sh; p[i*3+1]=4.2-t*8.4; p[i*3+2]=Math.sin(a)*r*sh;
  }
  return p;
}

function shapeBrain(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(1 - 2*(i+0.5)/N), th = ga * i;
    // Lateral view brain — viewed from the side
    const sinP = Math.sin(phi), cosP = Math.cos(phi);
    const sinT = Math.sin(th), cosT = Math.cos(th);
    let r = 3.8;
    // Frontal lobe — rounded front bulge
    const frontal = Math.max(0, cosT) * Math.pow(sinP, 2) * 0.6;
    // Occipital lobe — rear bump
    const occipital = Math.max(0, -cosT) * Math.pow(sinP, 2) * 0.35;
    // Temporal lobes — side bulges at mid-height
    const temporal = Math.pow(Math.max(0, sinP * 0.9 - Math.abs(cosP) * 0.3), 2) * Math.abs(sinT) * 0.5;
    // Cerebellum — smaller bulge at back-bottom
    const cerebellum = Math.max(0, -cosT * 0.8 + cosP * 0.6 - 0.4) * 1.2;
    // Brain stem — thin extension downward at back
    const stem = Math.max(0, cosP - 0.7) * Math.max(0, -cosT) * 2.5;
    // Deep sulci (brain folds) — multiple frequencies
    const sulci = 0.45 * Math.sin(phi*4.5) * Math.cos(th*3.2)
                + 0.25 * Math.sin(phi*8.0 + th*4.5)
                + 0.12 * Math.cos(phi*12.0 - th*7.0)
                + 0.06 * Math.sin(phi*18.0 + th*11.0);
    // Central fissure — deep groove at top dividing hemispheres
    const fissure = Math.pow(Math.max(0, -cosP), 5) * Math.pow(Math.abs(sinT), 0.3) * 1.0;
    // Lateral fissure (Sylvian)
    const sylvian = Math.max(0, sinP - 0.3) * Math.pow(Math.max(0, Math.sin(th - 0.8)), 3) * 0.4;

    r += frontal + occipital + temporal + cerebellum + stem + sulci - fissure - sylvian;
    r = Math.max(r, 0.3); // prevent negative radius
    const d = 0.94 + Math.random() * 0.06;
    r *= d;
    // Brain is wider than tall, slightly elongated front-to-back
    p[i*3]   = r * sinP * cosT * 1.15; // X: left-right (wider)
    p[i*3+1] = r * cosP * 0.82;        // Y: top-bottom (shorter)
    p[i*3+2] = r * sinP * sinT * 1.05;  // Z: front-back
  }
  return p;
}

function shapeLightbulb(N: number): Float32Array {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = Math.random();
    const th = Math.random() * TAU;
    const d = 0.95 + Math.random() * 0.05;
    if (t < 0.40) {
      // Glass bulb — full sphere top, A19 bulb profile
      const phi = Math.acos(Math.random()); // upper hemisphere
      const r = 3.5 * d;
      p[i*3]=r*Math.sin(phi)*Math.cos(th); p[i*3+1]=r*Math.cos(phi)+1.0; p[i*3+2]=r*Math.sin(phi)*Math.sin(th);
    } else if (t < 0.58) {
      // Bulb lower taper — smooth pear shape transition
      const h = Math.random(); // 0=equator, 1=neck
      // Pear profile: starts at full radius, curves inward following real bulb shape
      const profile = Math.cos(h * Math.PI * 0.5); // cosine taper
      const r = 3.5 * profile * d;
      p[i*3]=Math.cos(th)*r; p[i*3+1]=-h*3.0+1.0; p[i*3+2]=Math.sin(th)*r;
    } else if (t < 0.72) {
      // Neck — narrow cylinder connecting bulb to base
      const h = Math.random() * 1.2;
      const r = (0.9 + Math.sin(h*3)*0.05) * d;
      p[i*3]=Math.cos(th)*r; p[i*3+1]=-2.0-h; p[i*3+2]=Math.sin(th)*r;
    } else if (t < 0.88) {
      // Edison screw base — wider with visible thread ridges
      const h = Math.random() * 2.5;
      const baseR = 1.15 - h*0.08;
      // Screw thread — pronounced sine ridges
      const thread = Math.sin(h * 16) * 0.15;
      const r = (baseR + thread) * d;
      p[i*3]=Math.cos(th)*r; p[i*3+1]=-3.2-h; p[i*3+2]=Math.sin(th)*r;
    } else if (t < 0.94) {
      // Base contact — flat disc at bottom
      const r = Math.random() * 0.7 * d;
      p[i*3]=Math.cos(th)*r; p[i*3+1]=-5.7; p[i*3+2]=Math.sin(th)*r;
    } else {
      // Filament — glowing coil inside the bulb
      const h = Math.random() * 2.0;
      const coilR = 0.3 + Math.sin(h*8)*0.15;
      p[i*3]=Math.cos(th+h*6)*coilR; p[i*3+1]=0.5+h; p[i*3+2]=Math.sin(th+h*6)*coilR;
    }
  }
  return p;
}

// Simplified continent boundaries — checks if lat/lon (radians) is over land
function isLand(latR: number, lonR: number): boolean {
  const lat = latR * 180 / Math.PI; // degrees
  const lon = lonR * 180 / Math.PI;
  // North America
  if (lat>25&&lat<72&&lon>-170&&lon<-50) {
    if (lat>48&&lon<-55) return true; // Canada
    if (lat>25&&lat<50&&lon>-130&&lon<-65) return true; // USA
    if (lat>15&&lat<32&&lon>-120&&lon<-85) return true; // Mexico
    return false;
  }
  // South America
  if (lat>-58&&lat<15&&lon>-82&&lon<-34) {
    if (lon>-75&&lon<-35&&lat>-55&&lat<10) return true;
    return false;
  }
  // Europe
  if (lat>35&&lat<72&&lon>-12&&lon<45) return true;
  // Africa
  if (lat>-36&&lat<38&&lon>-18&&lon<52) {
    if (lat>0&&lon>42) return false; // Arabian sea
    return true;
  }
  // Asia
  if (lat>10&&lat<75&&lon>45&&lon<180) return true;
  if (lat>-10&&lat<10&&lon>95&&lon<140) return true; // SE Asia islands
  // Australia
  if (lat>-45&&lat<-10&&lon>112&&lon<155) return true;
  // Greenland
  if (lat>60&&lat<84&&lon>-55&&lon<-15) return true;
  // Antarctica
  if (lat<-65) return true;
  return false;
}

function shapeGlobe(N: number): Float32Array {
  const p = new Float32Array(N * 3); let idx = 0;
  while (idx < N) {
    const phi = Math.acos(2*Math.random()-1), th = Math.random()*TAU;
    const lat = Math.PI/2 - phi;  // -π/2 to π/2
    const lon = th - Math.PI;     // -π to π
    const land = isLand(lat, lon);
    // Land: on surface. Ocean: slightly inward + sparser
    const r = land ? 4.2*(0.97+Math.random()*0.03) : 4.2*(0.88+Math.random()*0.06);
    // Skip 55% of ocean particles — creates visible continent outlines
    if (!land && Math.random() < 0.55) continue;
    p[idx*3]=r*Math.sin(phi)*Math.cos(th); p[idx*3+1]=r*Math.cos(phi); p[idx*3+2]=r*Math.sin(phi)*Math.sin(th);
    idx++; if (idx >= N) break;
  }
  return p;
}

// All particles start at origin (invisible) — they explode outward on first scroll
function shapeOrigin(N: number): Float32Array { return new Float32Array(N * 3); }

function makeScatter(N: number): Float32Array {
  const s = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const phi=Math.acos(2*Math.random()-1),th=Math.random()*TAU,r=5+Math.random()*7;
    s[i*3]=Math.sin(phi)*Math.cos(th)*r; s[i*3+1]=Math.cos(phi)*r; s[i*3+2]=Math.sin(phi)*Math.sin(th)*r;
  }
  return s;
}

function latLonTo3D(lat: number, lon: number, r: number): THREE.Vector3 {
  const la=lat*Math.PI/180,lo=lon*Math.PI/180;
  return new THREE.Vector3(r*Math.cos(la)*Math.sin(lo),r*Math.sin(la),-r*Math.cos(la)*Math.cos(lo));
}

// ─── Text — Dala style: hero heading first, then sections ─────────────────────

const HERO_TITLE = "Revenue systems\nthat run while\nyou sleep.";
const HERO_SUB = "INTELLIGENT SYSTEMS. REFINED BY DESIGN.";
const HERO_BODY = "We build automated revenue engines — combining\npaid traffic, automation, and AI to help\noperators grow predictably.";

const SECTIONS = [
  { t: "We capture\nevery signal",  s: "10,000+ touchpoints tracked.\nEvery channel optimized." },
  { t: "AI processes\neverything",   s: "Lead scoring, intent mapping,\nand predictive routing." },
  { t: "Data becomes\nintelligence", s: "Patterns recognized. Every lead\nrouted with precision." },
  { t: "Insights\nthat convert",    s: "From data to decisions.\nAutomated sequences that close." },
  { t: "Revenue\nwithout borders",  s: "Systems that scale globally.\nBuilt once. Running always." },
];

// ─── Shaders ──────────────────────────────────────────────────────────────────

const VERT = `
  attribute float aSize;
  attribute float aRot;
  varying vec3 vC; varying float vD; varying float vRot;
  uniform float uPR, uScale, uMR;
  uniform vec3 uMouse;
  void main() {
    vC = color; vRot = aRot;
    vec3 p = position;
    vec3 tm = p - uMouse; float d = length(tm);
    if (d < uMR && d > 0.01) { float f = (1.0-d/uMR); p += normalize(tm)*f*f*2.2; }
    vD = d;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float sz = aSize * uScale * uPR * (160.0 / -mv.z);
    if (d < uMR) sz *= 1.0 + (1.0-d/uMR)*2.0;
    gl_PointSize = max(1.5, sz);
  }
`;
const FRAG = `
  varying vec3 vC; varying float vD; varying float vRot;
  uniform float uMR;
  void main() {
    float ca=cos(vRot),sa=sin(vRot);
    vec2 uv=gl_PointCoord-0.5; uv=vec2(uv.x*ca-uv.y*sa,uv.x*sa+uv.y*ca);
    float tri=max(abs(uv.x)*1.732+uv.y,-uv.y*2.0)*1.8;
    if (tri>0.5) discard;
    float isOut=step(0.5,fract(vRot*3.183));
    float fill=smoothstep(0.5,0.15,tri);
    float outline=smoothstep(0.5,0.40,tri)-smoothstep(0.40,0.30,tri);
    float alpha=mix(fill,max(fill*0.3,outline),isOut);
    float boost=vD<uMR?1.0+(1.0-vD/uMR)*2.0:1.0;
    gl_FragColor=vec4(vC*3.0*boost,alpha*0.95);
  }
`;
const BG_VERT = `
  attribute float aSize; attribute float aRot;
  varying vec3 vC; varying float vRot;
  uniform float uPR, uTime;
  void main() {
    vC=color; vRot=aRot+uTime*0.2;
    vec4 mv=modelViewMatrix*vec4(position,1.0);
    gl_Position=projectionMatrix*mv;
    gl_PointSize=max(4.0,aSize*uPR*(350.0/-mv.z));
  }
`;
const BG_FRAG = `
  varying vec3 vC; varying float vRot;
  void main() {
    float ca=cos(vRot),sa=sin(vRot);
    vec2 uv=gl_PointCoord-0.5; uv=vec2(uv.x*ca-uv.y*sa,uv.x*sa+uv.y*ca);
    float tri=max(abs(uv.x)*1.732+uv.y,-uv.y*2.0)*1.8;
    float outline=smoothstep(0.5,0.42,tri)-smoothstep(0.42,0.35,tri);
    if (outline<0.05) discard;
    gl_FragColor=vec4(vC*2.2,outline*0.55);
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
      const v = c01(-r.top/(sRef.current.offsetHeight-window.innerHeight));
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

    // Shapes: origin (invisible) → funnel → brain → lightbulb → globe
    const shapes = [shapeOrigin(N), shapeFunnel(N), shapeBrain(N), shapeLightbulb(N), shapeGlobe(N)];
    const scatter = makeScatter(N);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    cam.position.set(mob ? 0 : 2, 0, 11);

    const ren = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    ren.setClearColor(BG, 1);
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N*3);
    const col = new Float32Array(N*3);
    const siz = new Float32Array(N);
    const rot = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      const c = PAL[Math.floor(Math.random()*PAL.length)];
      col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      // Dala-level sizes: lots of medium + many large visible triangles
      const r = Math.random();
      siz[i] = r<0.40 ? 0.08+Math.random()*0.18 : r<0.75 ? 0.28+Math.random()*0.55 : 0.70+Math.random()*0.90;
      rot[i] = Math.random()*TAU;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(siz, 1));
    geo.setAttribute("aRot", new THREE.BufferAttribute(rot, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uPR:{value:Math.min(window.devicePixelRatio,2)}, uScale:{value:1.0}, uMouse:{value:new THREE.Vector3(100,100,0)}, uMR:{value:2.5} },
      vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, vertexColors: true, depthWrite: true, depthTest: true, blending: THREE.NormalBlending,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    // Background triangles
    const bgGeo = new THREE.BufferGeometry();
    const bgP=new Float32Array(N_BG*3),bgC=new Float32Array(N_BG*3),bgS=new Float32Array(N_BG),bgR=new Float32Array(N_BG);
    for (let i=0;i<N_BG;i++) {
      const c=PAL[Math.floor(Math.random()*PAL.length)];
      bgC[i*3]=c[0];bgC[i*3+1]=c[1];bgC[i*3+2]=c[2];
      bgS[i]=0.4+Math.random()*1.2; bgR[i]=Math.random()*TAU;
      const phi=Math.acos(2*Math.random()-1),th=Math.random()*TAU,r=8+Math.random()*25;
      bgP[i*3]=r*Math.sin(phi)*Math.cos(th);bgP[i*3+1]=r*Math.cos(phi);bgP[i*3+2]=r*Math.sin(phi)*Math.sin(th);
    }
    bgGeo.setAttribute("position",new THREE.BufferAttribute(bgP,3));
    bgGeo.setAttribute("color",new THREE.BufferAttribute(bgC,3));
    bgGeo.setAttribute("aSize",new THREE.BufferAttribute(bgS,1));
    bgGeo.setAttribute("aRot",new THREE.BufferAttribute(bgR,1));
    const bgMat = new THREE.ShaderMaterial({
      uniforms:{uPR:{value:Math.min(window.devicePixelRatio,2)},uTime:{value:0}},
      vertexShader:BG_VERT, fragmentShader:BG_FRAG,
      transparent:true, vertexColors:true, depthWrite:false, depthTest:true, blending:THREE.AdditiveBlending,
    });
    const bgPts = new THREE.Points(bgGeo, bgMat);
    scene.add(bgPts);

    // Pin
    const pinGroup = new THREE.Group(); pinGroup.visible = false; scene.add(pinGroup);
    const pinDot=new THREE.Mesh(new THREE.SphereGeometry(0.18,12,12),new THREE.MeshBasicMaterial({color:0x44ff88}));
    pinGroup.add(pinDot);
    const pinNeedle=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.2,6),new THREE.MeshBasicMaterial({color:0x44ff88,transparent:true,opacity:0.7}));
    pinNeedle.position.y=0.6; pinGroup.add(pinNeedle);
    const pinRingMat=new THREE.MeshBasicMaterial({color:0x44ff88,transparent:true,opacity:0.5,side:THREE.DoubleSide});
    const pinRing=new THREE.Mesh(new THREE.RingGeometry(0.35,0.42,32),pinRingMat); pinGroup.add(pinRing);
    let pinReady=false, pinPos=new THREE.Vector3(0,4.2,0);
    fetch("https://ipapi.co/json/").then(r=>r.json()).then(d=>{pinPos=latLonTo3D(d.latitude??38.7,d.longitude??-9.1,4.5);pinReady=true;}).catch(()=>{pinPos=latLonTo3D(38.7,-9.1,4.5);pinReady=true;});

    const mouse={x:0.5,y:0.5},sm={x:0.5,y:0.5};
    const rc=new THREE.Raycaster(),mNDC=new THREE.Vector2(),m3D=new THREE.Vector3(100,100,0);
    let raf=0,vis=true,brainRotOff=0,time=0;

    function onR() {
      const r=canvas.parentElement?.getBoundingClientRect(); if(!r) return;
      cam.aspect=r.width/r.height; cam.updateProjectionMatrix(); ren.setSize(r.width,r.height);
      mat.uniforms.uPR.value=Math.min(window.devicePixelRatio,2); bgMat.uniforms.uPR.value=mat.uniforms.uPR.value;
    }
    function onM(e:MouseEvent){mouse.x=e.clientX/window.innerWidth;mouse.y=e.clientY/window.innerHeight;const r=canvas.getBoundingClientRect();mNDC.x=((e.clientX-r.left)/r.width)*2-1;mNDC.y=-((e.clientY-r.top)/r.height)*2+1;}
    function onT(e:TouchEvent){const t=e.touches[0];if(!t)return;mouse.x=t.clientX/window.innerWidth;mouse.y=t.clientY/window.innerHeight;const r=canvas.getBoundingClientRect();mNDC.x=((t.clientX-r.left)/r.width)*2-1;mNDC.y=-((t.clientY-r.top)/r.height)*2+1;}

    /*
      SCROLL TIMELINE (1000vh = 900vh travel, much slower):
      0.00-0.06: Hero text only
      0.06-0.12: Explode origin → funnel
      0.12-0.22: FUNNEL stable
      0.22-0.28: Explode funnel → brain
      0.28-0.46: BRAIN (long hold, 2 texts, rotates 120°)
      0.46-0.52: Explode brain → lightbulb
      0.52-0.64: LIGHTBULB stable
      0.64-0.70: Explode lightbulb → globe
      0.70-0.86: GLOBE stable
      0.86-1.00: Fade out
    */

    function animate() {
      raf=requestAnimationFrame(animate);
      if(!vis) return;
      time+=0.004; sm.x+=(mouse.x-sm.x)*0.04; sm.y+=(mouse.y-sm.y)*0.04;
      const p=pRef.current;

      let shA=0,shB=0,lT=0,isTr=false;
      if (p<0.06)      { shA=0;shB=0;lT=0; }
      else if (p<0.12) { shA=0;shB=1;lT=ss(0.06,0.12,p);isTr=true; }
      else if (p<0.22) { shA=1;shB=1;lT=0; }
      else if (p<0.28) { shA=1;shB=2;lT=ss(0.22,0.28,p);isTr=true; }
      else if (p<0.46) { shA=2;shB=2;lT=0; }
      else if (p<0.52) { shA=2;shB=3;lT=ss(0.46,0.52,p);isTr=true; }
      else if (p<0.64) { shA=3;shB=3;lT=0; }
      else if (p<0.70) { shA=3;shB=4;lT=ss(0.64,0.70,p);isTr=true; }
      else             { shA=4;shB=4;lT=0; }

      const from=shapes[shA],to=shapes[shB];
      const explode=isTr?Math.sin(lT*Math.PI):0;
      for(let i=0;i<N*3;i++) pos[i]=from[i]+(to[i]-from[i])*lT+scatter[i]*explode*0.7;
      geo.attributes.position.needsUpdate=true;

      rc.setFromCamera(mNDC,cam);
      const plane=new THREE.Plane(new THREE.Vector3(0,0,1),0);
      rc.ray.intersectPlane(plane,m3D);
      m3D.applyMatrix4(pts.matrixWorld.clone().invert());
      mat.uniforms.uMouse.value.copy(m3D);

      // Very slow rotation like Dala
      const tRY=(sm.x-0.5)*0.3,tRX=(sm.y-0.5)*-0.2;
      pts.rotation.y+=(tRY-pts.rotation.y)*0.02;
      pts.rotation.x+=(tRX-pts.rotation.x)*0.02;
      pts.rotation.y+=0.0003;

      // Brain: exactly ONE full 360° rotation over its scroll range
      if(p>=0.28&&p<=0.46) brainRotOff=((p-0.28)/0.18)*TAU; // 0 → 2π (one full turn)
      else if(p<0.28) brainRotOff=0;
      else brainRotOff=TAU; // stay at final angle after brain section
      if(shA===2&&!isTr) pts.rotation.y=brainRotOff+(sm.x-0.5)*0.3; // SET not ADD — prevents accumulation

      bgPts.rotation.y=time*0.02; bgPts.rotation.x=Math.sin(time*0.2)*0.02;
      bgMat.uniforms.uTime.value=time;

      cam.position.x=(mob?0:2)+(sm.x-0.5)*1.0;
      cam.position.y=(sm.y-0.5)*-0.6;
      cam.lookAt(mob?0:0.8,0,0);

      // Pin on globe
      if(pinReady&&shA===4&&!isTr){
        pinGroup.visible=true;pinGroup.position.copy(pinPos);pinGroup.lookAt(0,0,0);pinGroup.rotateX(Math.PI/2);pinGroup.position.applyEuler(pts.rotation);
        const pulse=1+Math.sin(Date.now()*0.004)*0.2;pinRingMat.opacity=0.3+Math.sin(Date.now()*0.003)*0.2;pinDot.scale.setScalar(pulse);pinRing.scale.setScalar(pulse*1.3);
      } else { pinGroup.visible=false; }

      const fade=p>0.86?1-ss(0.86,1.0,p):1;
      mat.uniforms.uScale.value=fade;
      ren.render(scene,cam);
    }

    const obs=new IntersectionObserver(([e])=>{vis=e.isIntersecting;},{threshold:0.02});
    obs.observe(canvas); onR();
    window.addEventListener("resize",onR,{passive:true});
    window.addEventListener("mousemove",onM,{passive:true});
    window.addEventListener("touchmove",onT,{passive:true});
    raf=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(raf);obs.disconnect();window.removeEventListener("resize",onR);window.removeEventListener("mousemove",onM);window.removeEventListener("touchmove",onT);ren.dispose();geo.dispose();mat.dispose();bgGeo.dispose();bgMat.dispose();};
  }, []);

  // ── Text ranges for vertical slide ──────────────────────────────────────────
  const RANGES: [number,number][] = [
    [0.12, 0.25], // funnel
    [0.28, 0.38], // brain 1
    [0.38, 0.48], // brain 2
    [0.52, 0.66], // lightbulb
    [0.70, 0.86], // globe
  ];

  function txStyle(i: number) {
    const [s,e] = RANGES[i];
    const fi=ss(s,s+0.04,prog), fo=1-ss(e-0.04,e,prog);
    const op=Math.min(fi,fo)*(prog>0.88?1-ss(0.88,1.0,prog):1);
    const si=(1-ss(s,s+0.06,prog))*60, so=ss(e-0.06,e,prog)*-60;
    return { opacity:op, transform:`translateY(${si+so}px)` };
  }

  // Hero heading fades out as particles appear
  const heroOp = 1 - ss(0.03, 0.10, prog);
  const heroY = ss(0.02, 0.10, prog) * -80;
  const exit = ss(0.88, 1.0, prog);

  return (
    <section ref={sRef} aria-label="HLM — Interactive revenue funnel"
      className="relative" style={{ height: "1000vh", backgroundColor: "#000" }}>
      <div className="sr-only"><h1>HLM Revenue System</h1></div>
      <div className="sticky top-0 flex w-full items-center overflow-hidden"
        style={{ height: "100svh", minHeight: "100vh" }}>
        <canvas ref={cRef} className="absolute inset-0 h-full w-full" style={{ display: "block" }} />

        {/* HERO — large centered text, like Dala's first view. Fades as particles appear */}
        <div className="absolute inset-0 z-10 flex flex-col items-start justify-center px-8 sm:px-12 md:px-20 lg:px-28"
          style={{ opacity: heroOp, transform: `translateY(${heroY}px)`, pointerEvents: heroOp < 0.1 ? "none" : "auto" }}>
          <h1 className="text-[2.8rem] sm:text-[4.5rem] md:text-[7rem] lg:text-[7.5rem] font-[400] leading-[1.02] tracking-tight text-white whitespace-pre-line">
            {HERO_TITLE}
          </h1>
          <p className="mt-8 text-[11px] sm:text-[13px] font-semibold tracking-[0.25em] text-purple-400 uppercase">
            {HERO_SUB}
          </p>
          <p className="mt-5 text-[14px] sm:text-[16px] font-light leading-[1.7] text-white/50 max-w-lg whitespace-pre-line">
            {HERO_BODY}
          </p>
          <a href="#s-cta" className="mt-10 rounded-full bg-purple-600 px-8 py-3 text-[13px] font-medium tracking-wide text-white transition-colors hover:bg-purple-500">
            REQUEST A CONVERSATION
          </a>
        </div>

        {/* Funnel hover leads — floating labels showing leads entering */}
        {prog > 0.10 && prog < 0.25 && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" aria-hidden="true">
            {["João Silva — Lead Qualificado", "Maria Santos — Demo Agendada", "Tech Corp — Proposta Enviada",
              "Growth Ltd — Reunião Marcada", "Ana Costa — Formulário Preenchido", "Pedro Lima — Retargeting Ativo",
              "StartupXYZ — Interesse Alto", "Carlos Faria — MQL Confirmado"
            ].map((label, i) => {
              const x = 25 + Math.sin(i * 1.7 + prog * 20) * 25;
              const y = 10 + (i * 11 + prog * 300 + i * 50) % 85;
              const op = 0.15 + Math.sin(i * 2.3 + prog * 15) * 0.15;
              return (
                <div key={i} className="absolute text-[10px] sm:text-[11px] font-light text-purple-300/60 whitespace-nowrap"
                  style={{ left: `${x}%`, top: `${y}%`, opacity: op, transition: "none" }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400/50 mr-2 align-middle" />
                  {label}
                </div>
              );
            })}
          </div>
        )}

        {/* Section texts — alternate left/right like Dala */}
        <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
          {SECTIONS.map((tx, i) => {
            // Alternate sides: 0=left, 1=right, 2=right, 3=left, 4=right
            const isRight = i === 1 || i === 2 || i === 4;
            return (
              <div key={i} className={`absolute top-1/2 -translate-y-1/2 flex flex-col gap-4 max-w-lg ${isRight ? "right-8 sm:right-12 md:right-20 lg:right-28 text-right items-end" : "left-8 sm:left-12 md:left-20 lg:left-28 text-left items-start"}`}
                style={{ ...txStyle(i), transition: "none" }}>
                <h2 className="text-[2rem] sm:text-[2.8rem] md:text-[3.2rem] font-[400] leading-[1.08] tracking-tight text-white whitespace-pre-line">
                  {tx.t}
                </h2>
                <p className="text-[14px] sm:text-[16px] font-light leading-[1.7] text-white/50 max-w-md whitespace-pre-line">
                  {tx.s}
                </p>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
          aria-hidden="true" style={{ opacity: Math.max(0,1-prog*6) }}>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-medium tracking-[0.35em] text-white/30">SCROLL TO EXPLORE</span>
            <div className="h-10 w-px bg-gradient-to-b from-white/20 to-transparent"
              style={{ animation: "scrollPulse 2.5s ease-in-out infinite" }} />
          </div>
        </div>
        {exit>0.01&&<div className="absolute inset-0 z-20 bg-white" style={{opacity:exit}} />}
      </div>
    </section>
  );
}
