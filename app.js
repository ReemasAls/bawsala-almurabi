import * as THREE from 'three';
import { OrbitControls } from './vendor/three/OrbitControls.js';

const STATIONS = [
  {
    index: 0, key: '04', title: 'الأمان الرقمي', desc: 'محطة الحماية في العالم الرقمي',
    icon: '🛡️', color: 0xc98a3a, glow: 0xf3b768,
    tagline: 'أمانك الرقمي… مسؤوليتك وحمايتك',
    href: 'aman.html'
  },
  {
    index: 1, key: '03', title: 'هل تستطيع تمييز؟', desc: 'محطة الصور الحقيقية وذكاء الاصطناعي',
    icon: '📷', color: 0x6c5b8f, glow: 0xc3aef0,
    tagline: 'العين تبصر… والبصيرة تميز الحقيقة',
    href: 'tamyeez.html'
  },
  {
    index: 2, key: '02', title: 'تحقق قبل أن تصدق أي معلومة', desc: 'محطة التحقق من الأخبار',
    icon: '🔍', color: 0x3f7a4f, glow: 0x7fe090,
    tagline: 'تحقق خطوة صغيرة.. تحميك من خطأ كبير',
    href: 'verify.html'
  },
  {
    index: 3, key: '01', title: 'فكر لا تنقل أي معلومة', desc: 'محطة التفكير الناقد',
    icon: '💡', color: 0x1f6f6b, glow: 0x5fd6cf,
    tagline: 'لا تكن ناقلاً… كن مفكراً ناقداً تصنع الفرق',
    href: 'naqid.html'
  },
];

const NAVY_950 = '#0a1730';
const NAVY_900 = '#0e2040';
const GOLD = '#e0b25c';
const INK = '#eaf0fb';
const CARD_BG = '#f6f8fc';
const MUTED = '#7c8aa8';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const [, , logoImg] = await Promise.all([
  Promise.all([
    document.fonts.load('900 76px Tajawal'),
    document.fonts.load('800 34px Tajawal'),
    document.fonts.load('700 34px Tajawal'),
    document.fonts.load('600 22px Tajawal'),
    document.fonts.load('500 30px Tajawal'),
  ]),
  document.fonts.ready,
  loadImage('شعار.png'),
]);

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function roundRectTop(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function roundRectBottom(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h - r);
  ctx.arcTo(x, y + h, x + r, y + h, r);
  ctx.lineTo(x + w - r, y + h);
  ctx.arcTo(x + w, y + h, x + w, y + h - r, r);
  ctx.lineTo(x + w, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }

function makeKioskTexture(station) {
  const W = 560, H = 820;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const colorHex = hex(station.color);
  const FOOTER_H = 150;

  // white arch body (top section)
  roundRectTop(ctx, 10, 10, W - 20, H - 20 - FOOTER_H, 70);
  ctx.fillStyle = CARD_BG;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(10,30,60,.08)';
  ctx.stroke();

  // colored footer band (bottom section)
  roundRectBottom(ctx, 10, H - 10 - FOOTER_H, W - 20, FOOTER_H, 40);
  ctx.fillStyle = colorHex;
  ctx.fill();

  // badge circle
  ctx.beginPath();
  ctx.arc(W / 2, 84, 38, 0, Math.PI * 2);
  ctx.fillStyle = NAVY_950;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 34px Tajawal';
  ctx.fillText(station.key, W / 2, 88);

  // icon circle
  ctx.beginPath();
  ctx.arc(W / 2, 190, 56, 0, Math.PI * 2);
  ctx.fillStyle = colorHex;
  ctx.fill();
  ctx.font = '58px "Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(station.icon, W / 2, 194);

  // title
  ctx.fillStyle = NAVY_950;
  ctx.font = '800 44px Tajawal';
  const titleLines = wrapText(ctx, station.title, W - 100);
  let ty = 300;
  titleLines.forEach(line => { ctx.fillText(line, W / 2, ty); ty += 54; });

  // desc
  ctx.fillStyle = MUTED;
  ctx.font = '600 28px Tajawal';
  const descLines = wrapText(ctx, station.desc, W - 100);
  ty += 12;
  descLines.forEach(line => { ctx.fillText(line, W / 2, ty); ty += 34; });
  ty += 26;

  // embedded screen
  const screenY = ty;
  const screenH = 100;
  ctx.fillStyle = '#0d1b34';
  roundRectPath(ctx, 55, screenY, W - 110, screenH, 18);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#dfe4ee';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 34px Tajawal';
  ctx.fillText('ابدأ رحلتك 👆', W / 2, screenY + screenH / 2 + 2);

  // footer tagline (on colored band)
  const footerCenterY = H - 10 - FOOTER_H / 2;
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 29px Tajawal';
  const taglineLines = wrapText(ctx, station.tagline, W - 90);
  let fy = footerCenterY - ((taglineLines.length - 1) * 19);
  taglineLines.forEach(line => { ctx.fillText(line, W / 2, fy); fy += 38; });

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function drawCompassArt(ctx, cx, cy, R) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = 'rgba(224,178,92,.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(224,178,92,.22)';
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.font = `800 ${Math.round(R * 0.24)}px Tajawal`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('N', 0, -R * 0.86);
  ctx.fillText('S', 0, R * 0.86);
  ctx.fillText('E', R * 0.86, 0);
  ctx.fillText('W', -R * 0.86, 0);

  ctx.fillStyle = '#8fd8cf';
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  const spikes = 8, outerR = R * 0.62, innerR = R * 0.2;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / spikes) * i - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function makeBackdropTexture() {
  const W = 1800, H = 2000;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // dark arch panel
  roundRectPath(ctx, 20, 380, W - 40, H - 400, 140);
  const bgGrad = ctx.createRadialGradient(W / 2, 900, 100, W / 2, 900, 1000);
  bgGrad.addColorStop(0, '#152a52');
  bgGrad.addColorStop(1, '#081226');
  ctx.fillStyle = bgGrad;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(224,178,92,.35)';
  ctx.stroke();

  // faint stars
  for (let i = 0; i < 110; i++) {
    const sx = 120 + Math.random() * (W - 240);
    const sy = 460 + Math.random() * (H - 560);
    ctx.globalAlpha = Math.random() * 0.5 + 0.15;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  function drawWrapped(text, startY, font, color, maxWidth, lineHeight) {
    ctx.font = font;
    ctx.fillStyle = color;
    const lines = wrapText(ctx, text, maxWidth);
    let y = startY;
    lines.forEach(l => { ctx.fillText(l, W / 2, y); y += lineHeight; });
    return y;
  }

  let y = 600;
  y = drawWrapped('مرحبًا بك في معرض «مهارات بوصلة المربي»', y, '800 60px Tajawal', '#ffffff', W - 300, 76);
  y += 36;
  y = drawWrapped(
    'معرض تفاعلي يأخذك في رحلة بين مجموعة من المهارات التربوية التي تساعدك على التعامل بوعي مع تحديات التربية في زمن الذكاء الاصطناعي.',
    y, '500 38px Tajawal', '#c9d4e8', W - 380, 56
  );
  y += 60;
  y = drawWrapped('طريقة التجوّل في المعرض:', y, '800 44px Tajawal', GOLD, W - 300, 58);
  y += 16;

  const instructions = [
    '↔️  اسحب يمينًا أو يسارًا للدوران حول المعرض',
    '🔍  مرّر (Scroll) للاقتراب أو الابتعاد',
    '👆  اضغط على أي محطة للدخول إليها وبدء التجربة',
  ];
  instructions.forEach(line => {
    y = drawWrapped(line, y, '600 36px Tajawal', '#eaf0fb', W - 380, 50);
    y += 12;
  });
  y += 44;
  drawWrapped('تجوّل بين المحطات… اكتشف مهاراتك، وانفع بها غيرك.', y, '800 42px Tajawal', '#8fd8cf', W - 340, 54);

  // white pill banner (overlaps top of arch)
  roundRectPath(ctx, 170, 20, W - 340, 420, 130);
  ctx.fillStyle = INK;
  ctx.fill();

  ctx.fillStyle = NAVY_950;
  ctx.font = '700 40px Tajawal';
  ctx.fillText('معرض تفاعلي', W / 2, 130);

  ctx.font = '900 88px Tajawal';
  ctx.fillText('مهارات بوصلة المربي', W / 2, 240);

  ctx.font = '500 34px Tajawal';
  ctx.fillStyle = '#4a5a7a';
  ctx.fillText('مهارات رقمية لبناء جيل واعٍ ومسؤول', W / 2, 320);

  ctx.font = '68px "Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.fillText('💡', 260, 175);
  ctx.fillText('🔒', W - 260, 175);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return { tex, aspect: W / H };
}

function makePodiumTexture(logo) {
  const S = 900;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const grad = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, '#152a52');
  grad.addColorStop(1, NAVY_900);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  const logoSize = 340;
  const logoY = 260;
  ctx.save();
  ctx.beginPath();
  ctx.arc(S / 2, logoY, logoSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#f7f9fd';
  ctx.fill();
  ctx.clip();
  ctx.drawImage(logo, S / 2 - logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
  ctx.restore();
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(224,178,92,.5)';
  ctx.beginPath();
  ctx.arc(S / 2, logoY, logoSize / 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = '600 40px Tajawal';
  const lines = wrapText(ctx, 'لمزيد من الارتقاء بدورك التربوي', 620);
  let ty = 500;
  lines.forEach(line => { ctx.fillText(line, S / 2, ty); ty += 50; });

  ctx.fillStyle = GOLD;
  ctx.font = '800 52px Tajawal';
  ctx.fillText('اكتشف معنا ↖', S / 2, ty + 40);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeFloorTexture() {
  const S = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');
  const cx = S / 2, cy = S / 2;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, S / 2);
  grad.addColorStop(0, '#e7dcc0');
  grad.addColorStop(0.4, '#d3c6a3');
  grad.addColorStop(0.75, '#a99a78');
  grad.addColorStop(1, '#6b6250');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  ctx.strokeStyle = 'rgba(20,40,70,.12)';
  ctx.lineWidth = 2;
  for (let r = 90; r < S / 2; r += 90) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeCompassFloorTexture() {
  const S = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');
  const cx = S / 2, cy = S / 2;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, S / 2);
  grad.addColorStop(0, '#4a76b8');
  grad.addColorStop(1, '#274d84');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, S / 2 - 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(224,178,92,.6)';
  ctx.lineWidth = 8;
  ctx.stroke();

  drawCompassArt(ctx, cx, cy, S * 0.42);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ---------- Scene setup ---------- */
const canvasEl = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2338);
scene.fog = new THREE.Fog(0x1a2338, 11, 30);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
const overviewPos = new THREE.Vector3(0, 3.4, 10.5);
const overviewTarget = new THREE.Vector3(0, 2, 0);
camera.position.copy(overviewPos);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(overviewTarget);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.6;
controls.maxDistance = 16;
controls.minPolarAngle = THREE.MathUtils.degToRad(35);
controls.maxPolarAngle = THREE.MathUtils.degToRad(88);
controls.enablePan = false;
controls.update();

scene.add(new THREE.AmbientLight(0xfff2dc, 0.85));
scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x5b503c, 0.55));
const goldSpot = new THREE.PointLight(0xe0b25c, 2.2, 12, 2);
goldSpot.position.set(0, 4.2, -1);
scene.add(goldSpot);

const floorGeo = new THREE.CircleGeometry(18, 64);
const floorMat = new THREE.MeshBasicMaterial({ map: makeFloorTexture() });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const compassMesh = new THREE.Mesh(
  new THREE.CircleGeometry(18.8, 64),
  new THREE.MeshBasicMaterial({ map: makeCompassFloorTexture(), transparent: true })
);
compassMesh.rotation.x = -Math.PI / 2;
compassMesh.position.set(0, 0.01, -0.6);
scene.add(compassMesh);

const pulseRings = [0, 1, 2].map(i => {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(1, 1.03, 64),
    new THREE.MeshBasicMaterial({ color: 0xe0b25c, transparent: true, opacity: 0, side: THREE.DoubleSide })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.02, -0.6);
  scene.add(mesh);
  return { mesh, offset: i / 3 };
});

const podiumBaseH = 1.0;
const podiumBase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.9, 1.0, podiumBaseH, 32),
  new THREE.MeshStandardMaterial({ color: 0x0e2040, roughness: 0.4 })
);
podiumBase.position.set(0, podiumBaseH / 2, -1.7);
scene.add(podiumBase);

const podiumFace = new THREE.Mesh(
  new THREE.CircleGeometry(0.85, 32),
  new THREE.MeshBasicMaterial({ map: makePodiumTexture(logoImg), side: THREE.DoubleSide })
);
podiumFace.position.set(0, podiumBaseH + 0.85, -1.7);
podiumFace.userData = { isPodium: true };
scene.add(podiumFace);

const podiumFoot = new THREE.Mesh(
  new THREE.CircleGeometry(1.15, 40),
  new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.12 })
);
podiumFoot.rotation.x = -Math.PI / 2;
podiumFoot.position.set(0, 0.02, -1.7);
scene.add(podiumFoot);
const PODIUM_LINK = 'https://compass-journey-hub.base44.app/';

const { tex: backdropTex, aspect: backdropAspect } = makeBackdropTexture();
const backdropH = 9.2;
const backdropMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(backdropH * backdropAspect, backdropH),
  new THREE.MeshBasicMaterial({ map: backdropTex, transparent: true })
);
backdropMesh.position.set(0, 4.85, -6.4);
backdropMesh.userData = { isBackdrop: true };
scene.add(backdropMesh);

const kioskGroups = [];
const xs = [-4.9, -2.15, 2.15, 4.9];
const CARD_ASPECT = 820 / 560;
const CARD_W = 1.7;
const CARD_H = CARD_W * CARD_ASPECT;

STATIONS.forEach((station, i) => {
  const group = new THREE.Group();
  const x = xs[i];
  const z = -Math.abs(x) * 0.35 - 1.2;
  group.position.set(x, 0, z);
  group.rotation.y = -x * 0.09;
  group.userData = station;

  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.1, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xf2f4f8, roughness: 0.5 })
  );
  stand.position.y = 0.55;
  group.add(stand);

  const glowBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.34, 0.06, 0.64),
    new THREE.MeshBasicMaterial({ color: station.color })
  );
  glowBar.position.y = 0.03;
  group.add(glowBar);

  const floorGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 40),
    new THREE.MeshBasicMaterial({ color: station.glow, transparent: true, opacity: 0.1 })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = 0.018;
  group.add(floorGlow);

  const cardCenterY = 1.1 + CARD_H / 2;

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(CARD_W - 0.1, CARD_H, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xeceff5, roughness: 0.55 })
  );
  back.position.set(0, cardCenterY, 0.2);
  group.add(back);

  const tex = makeKioskTexture(station);
  const card = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W, CARD_H),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  card.position.set(0, cardCenterY, 0.32);
  group.add(card);

  const glow = new THREE.PointLight(station.glow, 1.0, 4, 2);
  glow.position.set(0, 1.2, 0.6);
  group.add(glow);

  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, cardCenterY + CARD_H / 2 + 0.2, 1),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = (cardCenterY + CARD_H / 2) / 2;
  hit.userData = station;
  group.add(hit);

  scene.add(group);
  kioskGroups.push({ group, hit, station, floorGlow });
});

/* ---------- Interaction ---------- */
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let pointerDown = null;
let flying = false;
let hoveredEntry = null;
let focusedEntry = null;
let backdropFocused = false;
const backdropFocusPos = new THREE.Vector3(0, 4.7, -1.8);
const backdropFocusTarget = new THREE.Vector3(0, 4.7, -6.4);

function focusPoint(g) { return new THREE.Vector3(g.position.x, 1.7, g.position.z + 2.6); }
function lookPoint(g) { return new THREE.Vector3(g.position.x, 1.55, g.position.z); }

function flyTo(camPos, lookAtPos, onDone) {
  flying = true;
  controls.enabled = false;
  const startCam = camera.position.clone();
  const startTarget = controls.target.clone();
  const dur = 1100;
  const t0 = performance.now();
  function step(now) {
    const t = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(startCam, camPos, e);
    controls.target.lerpVectors(startTarget, lookAtPos, e);
    controls.update();
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      flying = false;
      controls.enabled = true;
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(step);
}

const toast = document.getElementById('toast');
function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

const VISITED_KEY = 'bawsala_visited_stations';
const CERT_SHOWN_KEY = 'bawsala_certificate_shown';

function markVisited(index) {
  let visited = [];
  try { visited = JSON.parse(localStorage.getItem(VISITED_KEY) || '[]'); } catch (e) { visited = []; }
  if (!visited.includes(index)) visited.push(index);
  localStorage.setItem(VISITED_KEY, JSON.stringify(visited));
  return visited.length;
}

const certOverlay = document.getElementById('certOverlay');
const certContinue = document.getElementById('certContinue');
const certDownload = document.getElementById('certDownload');
const certContent = document.querySelector('.cert-content');
const myCertBtn = document.getElementById('myCertBtn');

function showCertificate(onContinue) {
  certOverlay.classList.add('show');
  const handler = () => {
    certOverlay.classList.remove('show');
    certContinue.removeEventListener('click', handler);
    if (onContinue) onContinue();
  };
  certContinue.addEventListener('click', handler);
}

certDownload.addEventListener('click', async () => {
  const originalLabel = certDownload.textContent;
  certDownload.disabled = true;
  certDownload.textContent = 'جارٍ التجهيز…';
  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm'),
      import('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm'),
    ]);
    const canvas = await html2canvas(certContent, { backgroundColor: '#0a1730', scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('شهادة اجتياز - بوصلة المربي.pdf');
  } catch (err) {
    console.error('Certificate PDF generation failed', err);
  } finally {
    certDownload.disabled = false;
    certDownload.textContent = originalLabel;
  }
});

if (localStorage.getItem(CERT_SHOWN_KEY) === '1') {
  myCertBtn.classList.add('show');
}
myCertBtn.addEventListener('click', () => showCertificate());

function proceedStation(station) {
  if (station.href) window.location.href = station.href;
  else showToast();
}

function enterStation(entry) {
  const { station } = entry;
  const visitedCount = markVisited(station.index);
  const alreadyShown = localStorage.getItem(CERT_SHOWN_KEY) === '1';
  if (visitedCount === STATIONS.length && !alreadyShown) {
    localStorage.setItem(CERT_SHOWN_KEY, '1');
    myCertBtn.classList.add('show');
    showCertificate(() => proceedStation(station));
  } else {
    proceedStation(station);
  }
}

const overviewBtn = document.getElementById('overviewBtn');

function selectKiosk(entry) {
  if (flying) return;
  focusedEntry = entry;
  backdropFocused = false;
  overviewBtn.classList.add('show');
  flyTo(focusPoint(entry.group), lookPoint(entry.group), () => enterStation(entry));
}

function selectBackdrop() {
  if (flying) return;
  if (backdropFocused) { backToOverview(); return; }
  focusedEntry = null;
  backdropFocused = true;
  overviewBtn.classList.add('show');
  flyTo(backdropFocusPos, backdropFocusTarget);
}

function backToOverview() {
  if (flying) return;
  focusedEntry = null;
  backdropFocused = false;
  overviewBtn.classList.remove('show');
  flyTo(overviewPos, overviewTarget);
}
overviewBtn.addEventListener('click', backToOverview);

function selectPodium() {
  window.open(PODIUM_LINK, '_blank', 'noopener');
}

function onPointerDown(e) {
  pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() };
}
function onPointerUp(e) {
  if (!pointerDown) return;
  const dx = e.clientX - pointerDown.x;
  const dy = e.clientY - pointerDown.y;
  const dist = Math.hypot(dx, dy);
  const dt = performance.now() - pointerDown.t;
  pointerDown = null;
  if (dist > 14 || dt > 600) return;

  pointerNDC.x = (e.clientX / innerWidth) * 2 - 1;
  pointerNDC.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects([...kioskGroups.map(k => k.hit), backdropMesh, podiumFace]);
  if (hits.length) {
    const obj = hits[0].object;
    if (obj === backdropMesh) { selectBackdrop(); return; }
    if (obj === podiumFace) { selectPodium(); return; }
    const entry = kioskGroups.find(k => k.hit === obj);
    if (entry) selectKiosk(entry);
  }
}
renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointerup', onPointerUp);

function onPointerMove(e) {
  pointerNDC.x = (e.clientX / innerWidth) * 2 - 1;
  pointerNDC.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects([...kioskGroups.map(k => k.hit), backdropMesh, podiumFace]);
  renderer.domElement.style.cursor = hits.length ? 'pointer' : (flying ? 'default' : 'grab');
  hoveredEntry = (hits.length && hits[0].object !== backdropMesh && hits[0].object !== podiumFace)
    ? kioskGroups.find(k => k.hit === hits[0].object)
    : null;
}
renderer.domElement.addEventListener('pointermove', onPointerMove);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

document.getElementById('loading').classList.add('hide');

const RING_CYCLE = 4500;
const RING_MAX_R = 9.5;

function animate() {
  requestAnimationFrame(animate);
  if (!flying) controls.update();

  const now = performance.now();
  pulseRings.forEach(({ mesh, offset }) => {
    const t = ((now / RING_CYCLE) + offset) % 1;
    const r = 0.3 + t * RING_MAX_R;
    mesh.scale.setScalar(r);
    mesh.material.opacity = (1 - t) * 0.35;
  });

  kioskGroups.forEach(entry => {
    const active = entry === hoveredEntry || entry === focusedEntry;
    const targetOpacity = active ? 0.4 : 0.1;
    const targetScale = active ? 1.15 : 1;
    entry.floorGlow.material.opacity += (targetOpacity - entry.floorGlow.material.opacity) * 0.12;
    const s = entry.floorGlow.scale.x + (targetScale - entry.floorGlow.scale.x) * 0.12;
    entry.floorGlow.scale.setScalar(s);
  });

  renderer.render(scene, camera);
}
animate();
