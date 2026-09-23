/*
 * creativecodecampus 3D motif — "website layers": wireframe → brushed metal with
 * an inlaid website UI → etched glass, rotating at 0.15 rad/s over a node graph
 * with pulsing data points.
 *
 * Port of design-system/assets/hero-3d.js (buildScene + the plain three.js mount
 * loop). Dropped from the source: the esm.sh / React Three Fiber CDN path, the
 * print compositions, frozen-frame mode, the colour setter and the (disabled)
 * pointer parallax. This module is only ever loaded through a dynamic import so
 * three.js stays out of the main chunk.
 */
import * as THREE from 'three';

const PALETTE = {
  bg: '#010808',
  cyan: '#7BC8E4',
  magenta: '#B82DBF',
};
const SPEED = 0.15; // rad/s, --ccc-rotation-speed
const PARTICLES = true;
const DPR_MAX = 1.75;
const CAMERA = { position: [0, 1.15, 9.4] as const, fov: 30, near: 0.1, far: 60 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Seg = [number, number, number, number];

function buildScene(reduced: boolean) {
  const C = (hex: THREE.ColorRepresentation) => new THREE.Color(hex);

  // --- Panel base shape: rounded 3:2 rectangle, very flat ---
  const PW = 3,
    PH = 2,
    PR = 0.16,
    PT = 0.07;
  const hw = PW / 2,
    hh = PH / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw + PR, -hh);
  shape.lineTo(hw - PR, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + PR);
  shape.lineTo(hw, hh - PR);
  shape.quadraticCurveTo(hw, hh, hw - PR, hh);
  shape.lineTo(-hw + PR, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - PR);
  shape.lineTo(-hw, -hh + PR);
  shape.quadraticCurveTo(-hw, -hh, -hw + PR, -hh);
  const panelGeo = new THREE.ExtrudeGeometry(shape, {
    depth: PT,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 2,
    curveSegments: 16,
    steps: 1,
  });
  panelGeo.center();

  // --- Procedural textures (no CDN, no HDR) ---
  const brushed = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const x = c.getContext('2d')!;
    x.fillStyle = '#8a8a8a';
    x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1400; i++) {
      const y = Math.random() * 512,
        l = 40 + Math.random() * 470,
        sx = Math.random() * 512;
      const g = Math.round(110 + Math.random() * 110);
      x.strokeStyle = `rgba(${g},${g},${g},${(0.05 + Math.random() * 0.16).toFixed(3)})`;
      x.lineWidth = Math.random() < 0.85 ? 1 : 2;
      x.beginPath();
      x.moveTo(sx - l, y);
      x.lineTo(sx + l, y);
      x.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.6, 1.1);
    return t;
  })();
  const dot = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  const additive = {
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  } as const;

  // --- Materials of the three layers ---
  const wireMat = new THREE.LineBasicMaterial({ color: C(PALETTE.cyan), ...additive });
  const wireFillMat = new THREE.MeshBasicMaterial({
    color: C(PALETTE.cyan),
    ...additive,
    side: THREE.DoubleSide,
  });
  const metalMat = new THREE.MeshPhysicalMaterial({
    color: 0xc9d9df,
    metalness: 0.82,
    roughness: 0.28,
    roughnessMap: brushed,
    bumpMap: brushed,
    bumpScale: 0.012,
    envMapIntensity: 1.9,
    transparent: true,
    opacity: 0,
  });
  // Glass: tinted translucent instead of transmission — reads as glass on near-black and stays cheap.
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x9fd2e6,
    metalness: 0.1,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 2.0,
    specularIntensity: 1,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const rimMat = new THREE.LineBasicMaterial({ color: C(PALETTE.cyan), ...additive });

  // --- Layer 1: wireframe (website skeleton as line art) ---
  const segs: number[] = [];
  const segPairs: Seg[] = [];
  const seg = (x1: number, y1: number, x2: number, y2: number) => {
    segs.push(x1, y1, 0, x2, y2, 0);
    segPairs.push([x1, y1, x2, y2]);
  };
  const rect = (x1: number, y1: number, x2: number, y2: number) => {
    seg(x1, y1, x2, y1);
    seg(x2, y1, x2, y2);
    seg(x2, y2, x1, y2);
    seg(x1, y2, x1, y1);
  };
  rect(-1.32, 0.6, -0.96, 0.74); // logo
  seg(0.35, 0.67, 0.6, 0.67); // nav
  seg(0.7, 0.67, 0.95, 0.67);
  seg(1.05, 0.67, 1.3, 0.67);
  seg(-1.32, 0.3, 0.05, 0.3); // headline lines
  seg(-1.32, 0.13, -0.35, 0.13);
  rect(-1.32, -0.16, -0.78, 0.02); // button
  rect(0.35, -0.42, 1.32, 0.4); // image placeholder
  seg(0.35, -0.42, 1.32, 0.4);
  seg(0.35, 0.4, 1.32, -0.42);
  rect(-1.32, -0.82, -0.52, -0.6); // cards
  rect(-0.4, -0.82, 0.4, -0.6);
  rect(0.52, -0.82, 1.32, -0.6);
  const segGeo = new THREE.BufferGeometry();
  segGeo.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
  const outlineGeo = new THREE.BufferGeometry().setFromPoints(shape.getPoints(64));
  const fillGeo = new THREE.ShapeGeometry(shape);

  // --- Layer groups (content built in XY, tilted toward the viewer) ---
  const TILT = -0.5;
  const LAYER_Y = [-1.05, 0, 1.05];
  const LAYER_Z = [-0.75, 0, 0.75];
  const mkLayer = (i: number, zRot: number) => {
    const g = new THREE.Group();
    g.rotation.x = TILT;
    g.rotation.z = zRot;
    g.position.set(0, LAYER_Y[i], LAYER_Z[i]);
    return g;
  };
  const mkFlat = (y: number, zRot: number) => {
    const g = new THREE.Group();
    g.rotation.x = -Math.PI / 2;
    g.rotation.z = zRot;
    g.position.y = y;
    return g;
  };
  const wireL = mkLayer(0, 0.06);
  wireL.add(new THREE.LineSegments(segGeo, wireMat));
  wireL.add(new THREE.LineLoop(outlineGeo, wireMat));
  const fillMesh = new THREE.Mesh(fillGeo, wireFillMat);
  fillMesh.position.z = -0.001;
  wireL.add(fillMesh);
  const metalL = mkLayer(1, 0);
  metalL.add(new THREE.Mesh(panelGeo, metalMat));
  const metalRim = new THREE.LineLoop(outlineGeo, rimMat);
  metalRim.position.z = 0.058;
  metalL.add(metalRim);
  const glassL = mkLayer(2, -0.05);
  glassL.add(new THREE.Mesh(panelGeo, glassMat));

  // --- Layer 2: website elements inlaid on the metal ---
  function roundedRect(w: number, h: number, r: number) {
    const hw2 = w / 2,
      hh2 = h / 2,
      s = new THREE.Shape();
    s.moveTo(-hw2 + r, -hh2);
    s.lineTo(hw2 - r, -hh2);
    s.quadraticCurveTo(hw2, -hh2, hw2, -hh2 + r);
    s.lineTo(hw2, hh2 - r);
    s.quadraticCurveTo(hw2, hh2, hw2 - r, hh2);
    s.lineTo(-hw2 + r, hh2);
    s.quadraticCurveTo(-hw2, hh2, -hw2, hh2 - r);
    s.lineTo(-hw2, -hh2 + r);
    s.quadraticCurveTo(-hw2, -hh2, -hw2 + r, -hh2);
    return s;
  }
  const rrGeo = (x1: number, y1: number, x2: number, y2: number, r: number) => {
    const w = Math.abs(x2 - x1),
      h = Math.abs(y2 - y1);
    const g = new THREE.ShapeGeometry(roundedRect(w, h, Math.min(r, w / 2, h / 2)), 8);
    g.translate((x1 + x2) / 2, (y1 + y2) / 2, 0);
    return g;
  };
  const uiScreen = new THREE.MeshPhysicalMaterial({
    color: 0x03090c,
    metalness: 0.15,
    roughness: 0.85,
    envMapIntensity: 0.35,
    transparent: true,
    opacity: 0,
  });
  const uiSoft = new THREE.MeshBasicMaterial({ color: 0xd3ebf4, ...additive });
  const uiDim = new THREE.MeshBasicMaterial({ color: 0x9fc4d2, ...additive });
  const uiCyan = new THREE.MeshBasicMaterial({ color: C(PALETTE.cyan), ...additive });
  const uiMag = new THREE.MeshBasicMaterial({ color: C(PALETTE.magenta), ...additive });
  const UI: Array<[number, number, number, number, number, THREE.Material, number]> = [
    [-1.42, -0.94, 1.42, 0.86, 0.1, uiScreen, 0.056], // screen
    [-1.34, 0.6, 1.34, 0.8, 0.05, uiDim, 0.06], // header bar
    [-1.28, 0.64, -1.13, 0.76, 0.03, uiCyan, 0.062], // logo
    [-1.08, 0.68, -0.88, 0.72, 0.02, uiSoft, 0.062], // wordmark
    [0.54, 0.685, 0.78, 0.715, 0.015, uiSoft, 0.062], // nav
    [0.86, 0.685, 1.1, 0.715, 0.015, uiSoft, 0.062],
    [1.18, 0.68, 1.32, 0.72, 0.02, uiCyan, 0.062],
    [-1.3, 0.26, 0.08, 0.4, 0.05, uiSoft, 0.062], // headline
    [-1.3, 0.06, -0.34, 0.2, 0.05, uiSoft, 0.062],
    [-1.3, -0.08, -0.62, -0.04, 0.015, uiDim, 0.06], // body copy
    [-1.3, -0.17, -0.8, -0.13, 0.015, uiDim, 0.06],
    [-1.3, -0.48, -0.74, -0.28, 0.06, uiCyan, 0.062], // CTA
    [-0.64, -0.48, -0.2, -0.28, 0.06, uiDim, 0.06], // second button
    [0.3, -0.34, 1.34, 0.42, 0.07, uiDim, 0.059], // image area
    [0.42, -0.22, 1.22, 0.3, 0.05, uiMag, 0.06],
    [-1.34, -0.88, -0.5, -0.54, 0.05, uiDim, 0.059], // cards
    [-0.42, -0.88, 0.42, -0.54, 0.05, uiDim, 0.059],
    [0.5, -0.88, 1.34, -0.54, 0.05, uiDim, 0.059],
    [-1.26, -0.64, -0.94, -0.6, 0.015, uiCyan, 0.062],
    [-0.34, -0.64, -0.02, -0.6, 0.015, uiCyan, 0.062],
    [0.58, -0.64, 0.9, -0.6, 0.015, uiCyan, 0.062],
  ];
  const uiGeos: THREE.BufferGeometry[] = [];
  UI.forEach(([x1, y1, x2, y2, r, mat, z]) => {
    const g = rrGeo(x1, y1, x2, y2, r);
    uiGeos.push(g);
    const m = new THREE.Mesh(g, mat);
    m.position.z = z;
    metalL.add(m);
  });

  // --- Layer 3: the same structure etched into the glass ---
  const etchMat = new THREE.LineBasicMaterial({ color: C(PALETTE.cyan), ...additive });
  const etch = new THREE.LineSegments(segGeo, etchMat);
  etch.position.z = 0.06;
  glassL.add(etch);
  const glassRim = new THREE.LineLoop(outlineGeo, rimMat);
  glassRim.position.z = 0.058;
  glassL.add(glassRim);

  // --- AI signal: node/edge graph under the stack ---
  const GNX = 9,
    GNY = 5,
    GW = 2.5,
    GH = 1.6;
  const gnodes: number[] = [];
  const gpairs: number[] = [];
  for (let iy = 0; iy < GNY; iy++)
    for (let ix = 0; ix < GNX; ix++) gnodes.push((ix / (GNX - 1) - 0.5) * GW, (iy / (GNY - 1) - 0.5) * GH, 0);
  for (let iy = 0; iy < GNY; iy++)
    for (let ix = 0; ix < GNX; ix++) {
      const i = iy * GNX + ix;
      if (ix < GNX - 1) gpairs.push(i, i + 1);
      if (iy < GNY - 1) gpairs.push(i, i + GNX);
    }
  const gEdgePos: number[] = [];
  const gEdgeSegs: Seg[] = [];
  for (let p = 0; p < gpairs.length; p += 2) {
    const a = gpairs[p] * 3,
      b = gpairs[p + 1] * 3;
    gEdgePos.push(gnodes[a], gnodes[a + 1], 0, gnodes[b], gnodes[b + 1], 0);
    gEdgeSegs.push([gnodes[a], gnodes[a + 1], gnodes[b], gnodes[b + 1]]);
  }
  const gNodeGeo = new THREE.BufferGeometry();
  gNodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(gnodes, 3));
  const gEdgeGeo = new THREE.BufferGeometry();
  gEdgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(gEdgePos, 3));
  const gNodeMat = new THREE.PointsMaterial({
    map: dot,
    color: C(PALETTE.cyan),
    size: 0.055,
    sizeAttenuation: true,
    ...additive,
  });
  const gEdgeMat = new THREE.LineBasicMaterial({ color: C(PALETTE.cyan), ...additive });
  const graphL = mkFlat(-1.7, 0.1);
  graphL.add(new THREE.Points(gNodeGeo, gNodeMat), new THREE.LineSegments(gEdgeGeo, gEdgeMat));

  // --- Data points running briefly along the edges ---
  function makePulses(list: Seg[], count: number, size: number) {
    const pos = new Float32Array(count * 3),
      col = new Float32Array(count * 3);
    const st: Array<{ s: number; p: number; v: number }> = [];
    const spawn = (o: { s: number; p: number; v: number }) => {
      o.s = Math.floor(Math.random() * list.length);
      o.p = -Math.random() * 0.8;
      o.v = 0.4 + Math.random() * 0.55;
    };
    for (let i = 0; i < count; i++) {
      const o = { s: 0, p: 0, v: 0 };
      spawn(o);
      st.push(o);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      map: dot,
      size,
      sizeAttenuation: true,
      vertexColors: true,
      ...additive,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    const base = C(PALETTE.cyan);
    return {
      points: pts,
      mat,
      geo,
      update(dt: number) {
        for (let i = 0; i < count; i++) {
          const o = st[i];
          o.p += o.v * dt;
          if (o.p > 1) spawn(o);
          const s = list[o.s],
            f = clamp01(o.p);
          pos[i * 3] = s[0] + (s[2] - s[0]) * f;
          pos[i * 3 + 1] = s[1] + (s[3] - s[1]) * f;
          pos[i * 3 + 2] = 0.006;
          const e = o.p < 0 ? 0 : Math.sin(Math.PI * f);
          col[i * 3] = base.r * e;
          col[i * 3 + 1] = base.g * e;
          col[i * 3 + 2] = base.b * e;
        }
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
      },
    };
  }
  const wirePulses = makePulses(segPairs, 10, 0.075);
  const graphPulses = makePulses(gEdgeSegs, 9, 0.065);
  wireL.add(wirePulses.points);
  graphL.add(graphPulses.points);

  // --- Particles: few, rising slowly, cyan ---
  const N = 64;
  const ppos = new Float32Array(N * 3),
    pspd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    ppos[i * 3] = (Math.random() - 0.5) * 7;
    ppos[i * 3 + 1] = (Math.random() - 0.5) * 3.8;
    ppos[i * 3 + 2] = (Math.random() - 0.5) * 3.4;
    pspd[i] = 0.05 + Math.random() * 0.11;
  }
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  const pmat = new THREE.PointsMaterial({
    map: dot,
    color: C(PALETTE.cyan),
    size: 0.07,
    sizeAttenuation: true,
    ...additive,
  });
  const points = new THREE.Points(pgeo, pmat);
  points.visible = PARTICLES;

  // --- Hierarchy: root > tilt > float > spin > layers ---
  const spin = new THREE.Group();
  spin.add(graphL, wireL, metalL, glassL);
  const floatG = new THREE.Group();
  floatG.add(spin, points);
  const tilt = new THREE.Group();
  tilt.add(floatG);
  tilt.rotation.x = 0.03;
  const root = new THREE.Group();
  root.add(tilt);
  root.position.y = 0.12;

  // --- Simple lights (no HDR) ---
  const rim = new THREE.DirectionalLight(C(PALETTE.cyan), 2.6);
  rim.position.set(-5, 6, -4);
  const key = new THREE.DirectionalLight(0xdfeef4, 1.8);
  key.position.set(4, 3, 6);
  const mag = new THREE.PointLight(C(PALETTE.magenta), 14, 18, 1.8);
  mag.position.set(3.4, -1.6, 2.8);
  const amb = new THREE.AmbientLight(C(PALETTE.cyan), 0.08);
  root.add(rim, key, mag, amb);

  // --- Procedural environment (PMREM from a mini scene, local) ---
  let pmrem: THREE.PMREMGenerator | null = null;
  let envRT: THREE.WebGLRenderTarget | null = null;
  function buildEnv(renderer: THREE.WebGLRenderer) {
    pmrem = pmrem ?? new THREE.PMREMGenerator(renderer);
    const es = new THREE.Scene();
    es.background = C('#000000');
    const P = (w: number, h: number, color: string, intensity: number, p: [number, number, number]) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: C(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
      );
      m.position.set(...p);
      m.lookAt(0, 0, 0);
      es.add(m);
    };
    P(16, 7, '#cfe4ec', 3.0, [0, 8, 0]); // soft ceiling
    P(10, 7, '#bcd8e4', 1.4, [0, 5, -9]); // sheen for the tilted faces
    P(12, 8, '#9fc4d2', 1.1, [0, 1, 11]); // soft front light
    P(2.2, 12, PALETTE.cyan, 7.0, [-8, 2, -3]); // cyan strip (rim + brushed highlight)
    P(9, 2.6, PALETTE.magenta, 1.5, [7, -3, 4]); // magenta area
    P(0.8, 10, '#ffffff', 6.0, [3, 4, -7]); // narrow white strip
    envRT?.dispose();
    envRT = pmrem.fromScene(es, 0.035);
    es.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    return envRT.texture;
  }

  function init(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    brushed.anisotropy = renderer.capabilities.getMaxAnisotropy();
    scene.environment = buildEnv(renderer);
    scene.fog = new THREE.FogExp2(C(PALETTE.bg).getHex(), 0.045);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  // --- Intro: layers appear staggered — from wire to gloss ---
  const fades: Array<{ mats: Array<[THREE.Material, number]>; delay: number; layer: THREE.Group | null; baseY: number }> = [
    { mats: [[gEdgeMat, 0.12], [gNodeMat, 0.4], [graphPulses.mat, 0.8]], delay: 0.05, layer: null, baseY: 0 },
    { mats: [[wireMat, 0.6], [wireFillMat, 0.045], [wirePulses.mat, 1]], delay: 0.35, layer: wireL, baseY: LAYER_Y[0] },
    {
      mats: [[metalMat, 1], [uiScreen, 1], [uiSoft, 0.5], [uiDim, 0.2], [uiCyan, 0.8], [uiMag, 0.18]],
      delay: 1.05,
      layer: metalL,
      baseY: LAYER_Y[1],
    },
    { mats: [[glassMat, 0.22], [etchMat, 0.34], [rimMat, 0.55]], delay: 1.75, layer: glassL, baseY: LAYER_Y[2] },
    { mats: [[pmat, 0.5]], delay: 2.3, layer: null, baseY: 0 },
  ];

  let yaw = 0.55; // starting angle of the composition
  const fit = { s: 1, x: 0, y: 0 };
  function setViewport(w: number, h: number) {
    const aspect = w / Math.max(h, 1);
    if (aspect < 0.75) {
      // Addition for phones (portrait canvas behind the copy): the source's
      // auto-fit would push the stack off screen, so it sits smaller, top right.
      fit.s = 0.42;
      fit.x = 0.75;
      fit.y = 1.5;
      return;
    }
    // Source auto-fit: composition follows the canvas format, stack to the right.
    const narrow = clamp01((1.25 - aspect) / 0.5);
    fit.s = 0.68 - 0.08 * narrow;
    fit.x = 1.45 + 0.5 * narrow;
    fit.y = 0;
  }

  function tick(t: number, dt: number) {
    dt = Math.min(dt, 0.05);
    root.position.x = fit.x;
    root.position.y = 0.12 + fit.y;
    const spd = reduced ? 0 : SPEED;
    yaw += spd * dt;
    spin.rotation.y = yaw;
    const e0 = reduced ? 1 : easeOut(clamp01((t - 0.1) / 2.4));
    root.scale.setScalar((0.93 + 0.07 * e0) * fit.s);
    floatG.position.y = reduced ? 0 : Math.sin(t * 0.55) * 0.085;
    fades.forEach((f, i) => {
      const k = reduced ? 1 : easeOut(clamp01((t - f.delay) / 1.15));
      f.mats.forEach(([m, target]) => {
        m.opacity = target * k;
      });
      if (f.layer) {
        const bob = reduced ? 0 : Math.sin(t * 0.8 + i * 1.7) * 0.028 * k;
        f.layer.position.y = f.baseY - 0.55 * (1 - k) + bob;
      }
    });
    if (reduced) {
      // Held scene: pulses were seeded once by seedStill(); nothing moves.
      return;
    }
    wirePulses.update(dt);
    graphPulses.update(dt);
    if (points.visible) {
      const arr = pgeo.attributes.position.array as Float32Array;
      for (let i = 0; i < N; i++) {
        arr[i * 3 + 1] += pspd[i] * dt;
        if (arr[i * 3 + 1] > 2.0) arr[i * 3 + 1] = -2.0;
      }
      pgeo.attributes.position.needsUpdate = true;
      points.rotation.y -= 0.02 * dt;
    }
  }

  function seedStill() {
    for (let i = 0; i < 70; i++) {
      wirePulses.update(0.016);
      graphPulses.update(0.016);
    }
  }

  function dispose(scene: THREE.Scene) {
    [panelGeo, segGeo, outlineGeo, fillGeo, pgeo, gNodeGeo, gEdgeGeo, wirePulses.geo, graphPulses.geo, ...uiGeos].forEach(
      (g) => g.dispose(),
    );
    [
      wireMat,
      wireFillMat,
      metalMat,
      glassMat,
      pmat,
      etchMat,
      uiScreen,
      uiSoft,
      uiDim,
      rimMat,
      uiCyan,
      uiMag,
      gNodeMat,
      gEdgeMat,
      wirePulses.mat,
      graphPulses.mat,
    ].forEach((m) => m.dispose());
    brushed.dispose();
    dot.dispose();
    envRT?.dispose();
    pmrem?.dispose();
    scene.environment = null;
    scene.fog = null;
  }

  return { root, init, tick, setViewport, seedStill, dispose };
}

/**
 * Mount the motif into `host` (which must be positioned and sized). Returns a
 * dispose function. Throws if a WebGL renderer cannot be created — the caller
 * falls back to the static gradient wash.
 *
 * The loop pauses while the canvas is off screen or the tab is hidden. With
 * prefers-reduced-motion the scene is rendered once, fully faded in and held,
 * and re-rendered only on resize.
 */
export function mountScene(host: HTMLElement): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_MAX));
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%' });
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
  camera.position.set(...CAMERA.position);
  const built = buildScene(reduced);
  scene.add(built.root);
  built.init(renderer, scene, camera);
  if (reduced) built.seedStill();

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;
  let visible = true;
  let disposed = false;

  const renderOnce = () => {
    built.tick(elapsed, 0);
    renderer.render(scene, camera);
  };

  let lastW = 0,
    lastH = 0;
  const size = () => {
    const w = host.clientWidth || 1,
      h = host.clientHeight || 1;
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    built.setViewport(w, h);
    if (reduced || !raf) renderOnce();
  };

  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    elapsed += Math.min(dt, 0.05);
    built.tick(elapsed, dt);
    renderer.render(scene, camera);
  };
  const start = () => {
    if (reduced || raf || disposed || !visible || document.hidden) return;
    last = performance.now();
    loop();
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  size();
  const ro = new ResizeObserver(size);
  ro.observe(host);

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) start();
    else stop();
  });
  io.observe(host);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  if (reduced) renderOnce();
  else start();

  return () => {
    disposed = true;
    stop();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    built.dispose(scene);
    renderer.dispose();
    canvas.remove();
  };
}
