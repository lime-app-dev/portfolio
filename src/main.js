import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import './style.css';
import { playChair, playCoffeeBrew, playFootstep, playFridgeDoor } from './audio.js';
import { resetDesktop } from './desktop.js';
import { drawCodeEditor } from './code-editor-display.js';
import { createCoffeeStation, createMug } from './coffee.js';
import { addKitchenAppliances, createFridge } from './kitchen-appliances.js';

const sceneElement = document.querySelector('#scene');
const hint = document.querySelector('#hint');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch {
  hint.textContent = 'This browser needs WebGL to open the studio.';
  document.querySelector('#instruction').hidden = true;
  throw new Error('WebGL is unavailable');
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
sceneElement.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#84909e');
const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 70);
camera.rotation.order = 'YXZ';

function box(color, size, position, parent = scene, radius = 0) {
  const object = new THREE.Mesh(radius ? new RoundedBoxGeometry(...size, 3, radius) : new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color }));
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

scene.add(new THREE.HemisphereLight('#f8f8f8', '#727272', 1.4));
const sun = new THREE.DirectionalLight('#e1e9ff', 1.65);
sun.position.set(-1, 4, -2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.normalBias = 0.035;
scene.add(sun);

const interiorFill = new THREE.DirectionalLight('#fafafa', 0.95);
interiorFill.position.set(-2, 2.1, 3.2);
scene.add(interiorFill);

const bouncedLight = new THREE.DirectionalLight('#fafafa', 1.05);
bouncedLight.position.set(0, -3, 0);
scene.add(bouncedLight);

const textureLoader = new THREE.TextureLoader();
const timber = textureLoader.load(import.meta.env.BASE_URL + 'dark-walnut.jpg');
timber.colorSpace = THREE.SRGBColorSpace;
timber.anisotropy = renderer.capabilities.getMaxAnisotropy();

function wood(tint, size, position) {
  const board = box(tint, size, position);
  board.material.map = timber;
  board.material.roughness = 0.82;
  board.material.bumpMap = timber;
  board.material.bumpScale = 0.018;
  return board;
}

for (let index = 0; index < 25; index += 1) {
  const x = -3.36 + index * 0.28;
  wood(index % 3 === 0 ? '#e3cbb5' : '#fff0df', [0.277, 0.10, 7], [x, -0.055, 0]);
}

const wallConcrete = '#626262';
box(wallConcrete, [7, 3.3, 0.12], [0, 1.65, 3.5]);
for (const x of [-3.5, 3.5]) {
  box(wallConcrete, [0.12, 3.3, 7], [x, 1.65, 0]);
}
box(wallConcrete, [7, 0.12, 7], [0, 3.35, 0]);

const entry = wood('#c1a58d', [0.98, 2.22, 0.082], [0.27, 1.11, 3.405]);
entry.material.roughness = 0.67;
for (const x of [-0.255, 0.795]) {
  wood('#8c7460', [0.075, 2.30, 0.115], [x, 1.15, 3.39]);
}
wood('#8c7460', [1.125, 0.075, 0.115], [0.27, 2.285, 3.39]);
for (const y of [0.63, 1.62]) {
  wood('#b09a84', [0.70, 0.72, 0.024], [0.27, y, 3.36]);
}
const latch = box('#414347', [0.047, 0.115, 0.025], [0.62, 1.02, 3.338], scene, 0.009);
latch.material.metalness = 0.62;
box('#8e8983', [0.115, 0.021, 0.035], [0.575, 1.02, 3.313], scene, 0.009);

const plant = new THREE.Group();
plant.position.set(-2.87, 0, 2.68);
scene.add(plant);
const pot = new THREE.Mesh(
  new THREE.CylinderGeometry(0.25, 0.18, 0.38, 48),
  new THREE.MeshStandardMaterial({ color: '#a28c78', roughness: 0.88 })
);
pot.position.y = 0.19;
pot.castShadow = true;
pot.receiveShadow = true;
plant.add(pot);
const soil = new THREE.Mesh(
  new THREE.CylinderGeometry(0.232, 0.232, 0.02, 48),
  new THREE.MeshStandardMaterial({ color: '#342a22', roughness: 1 })
);
soil.position.y = 0.378;
plant.add(soil);

const stemMaterial = new THREE.MeshStandardMaterial({ color: '#5d6644', roughness: 0.86 });
const leafMaterials = ['#36573d', '#416746', '#55794d'].map(color => new THREE.MeshStandardMaterial({
  color, roughness: 0.67, side: THREE.DoubleSide
}));
for (let index = 0; index < 11; index += 1) {
  const angle = index * 2.39996;
  const height = 0.82 + (index * 7 % 11) * 0.108;
  const reach = 0.19 + 0.11 * (index % 3);
  const stemTip = new THREE.Vector3(Math.cos(angle) * reach, height, Math.sin(angle) * reach);
  const stemPath = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(Math.cos(angle) * 0.08, 0.38, Math.sin(angle) * 0.08),
    new THREE.Vector3(stemTip.x * 0.17, height * 0.81, stemTip.z * 0.17),
    stemTip
  );
  const stem = new THREE.Mesh(new THREE.TubeGeometry(stemPath, 12, 0.007, 6), stemMaterial);
  stem.castShadow = true;
  plant.add(stem);

  const blade = new THREE.PlaneGeometry(1, 1, 10, 16);
  const points = blade.attributes.position;
  for (let i = 0; i < points.count; i += 1) {
    const across = points.getX(i) * 2;
    const along = points.getY(i) + 0.5;
    const width = 0.105 * Math.pow(Math.sin(along * Math.PI), 0.8);
    points.setXYZ(i, width * across, along * (0.30 + 0.04 * (index % 4)),
      0.17 * along * along - Math.abs(across) * 0.045 * Math.sin(along * Math.PI));
  }
  blade.computeVertexNormals();
  const leaf = new THREE.Mesh(blade, leafMaterials[index % leafMaterials.length]);
  leaf.position.copy(stemTip);
  leaf.rotation.order = 'YXZ';
  leaf.rotation.set(0.52 + 0.13 * (index % 4), Math.PI / 2 - angle, 0);
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  plant.add(leaf);
}

for (const x of [-2.1, 0, 2.1]) {
  for (const z of [-2.05, 0.28, 2.12]) {
    const trim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078, 0.078, 0.012, 32),
      new THREE.MeshStandardMaterial({ color: '#eee5d6', roughness: 0.73 })
    );
    const diffuser = new THREE.Mesh(
      new THREE.CircleGeometry(0.051, 32),
      new THREE.MeshBasicMaterial({ color: '#fff0d5', toneMapped: false })
    );
    trim.position.set(x, 3.285, z);
    diffuser.position.set(x, 3.278, z);
    diffuser.rotation.x = Math.PI / 2;
    scene.add(trim, diffuser);
    const downlight = new THREE.SpotLight('#f8f7f2', 15, 6, Math.PI / 3, 0.78, 2);
    downlight.position.set(x, 3.23, z);
    downlight.target.position.set(x, 0, z);
    scene.add(downlight, downlight.target);
  }
}

const landscape = textureLoader.load(import.meta.env.BASE_URL + 'mountain-valley.jpg');
landscape.colorSpace = THREE.SRGBColorSpace;
landscape.wrapS = landscape.wrapT = THREE.MirroredRepeatWrapping;
landscape.repeat.set(2, 2);
landscape.offset.set(-0.5, -0.5);
const view = new THREE.Mesh(
  new THREE.PlaneGeometry(98, 65.34),
  new THREE.MeshBasicMaterial({ map: landscape, color: '#f1f4ff', toneMapped: false })
);
view.position.set(0, 2.9, -22);
scene.add(view);
const windowZ = -3.48;
const aluminum = new THREE.MeshStandardMaterial({
  color: '#191b20', metalness: 0.38, roughness: 0.4
});
function windowFrame(size, position) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(...size), aluminum);
  frame.position.set(...position);
  frame.castShadow = true;
  frame.receiveShadow = true;
  scene.add(frame);
}
for (const x of [-3.46, -1.74, 0, 1.74, 3.46]) {
  windowFrame([0.043, 3.29, 0.09], [x, 1.645, windowZ]);
}
for (const y of [0.023, 3.267]) {
  windowFrame([6.96, 0.046, 0.11], [0, y, windowZ]);
}
for (let index = 0; index < 25; index += 1) {
  wood('#d2baaa', [0.273, 0.13, 2.48], [-3.36 + index * 0.28, -0.08, -4.76]);
}
for (const x of [-3.45, -1.73, 0, 1.73, 3.45]) {
  wood('#aa9583', [0.09, 0.89, 0.09], [x, 0.41, -5.95]);
}
wood('#b4a18d', [6.98, 0.075, 0.12], [0, 0.85, -5.95]);
for (const y of [0.24, 0.49, 0.72]) {
  box('#716c68', [6.92, 0.012, 0.012], [0, y, -5.95]);
}
for (const x of [-3.45, 3.45]) {
  wood('#aa9583', [0.09, 0.89, 0.09], [x, 0.41, -4.33]);
  wood('#b4a18d', [0.12, 0.075, 2.4], [x, 0.85, -4.75]);
}
const glazing = new THREE.Mesh(
  new THREE.PlaneGeometry(6.92, 3.29),
  new THREE.MeshBasicMaterial({ color: '#b2d1ef', transparent: true, opacity: 0.06, depthWrite: false })
);
glazing.position.set(0, 1.645, windowZ);
scene.add(glazing);

const streakCount = 1050;
const drops = new Float32Array(streakCount * 6);
const heights = Array.from({ length: streakCount }, () => 0.29 + Math.random() * 3.1);
for (let i = 0; i < streakCount; i += 1) {
  const n = i * 6;
  drops[n] = (Math.random() - 0.5) * 7.4;
  drops[n + 2] = -3.62 - Math.random() * 4.7;
  drops[n + 3] = drops[n] + 0.02;
  drops[n + 5] = drops[n + 2];
}
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new THREE.BufferAttribute(drops, 3).setUsage(THREE.DynamicDrawUsage);
rainGeometry.setAttribute('position', rainPositions);
const rain = new THREE.LineSegments(rainGeometry, new THREE.LineBasicMaterial({
  color: '#dae7f4', transparent: true, opacity: 0.23, depthWrite: false
}));
rain.frustumCulled = false;
scene.add(rain);

function fabricTexture(name, repeat = 1) {
  const texture = textureLoader.load(import.meta.env.BASE_URL + 'fabric-' + name + '.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.setScalar(repeat);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const upholstery = fabricTexture('upholstery', 2);
const pillowWeave = fabricTexture('pillow');
const rugWeave = fabricTexture('rug', 5);
function fabric(color, size, position, parent = scene, radius = 0.08, texture = upholstery) {
  const mesh = box(color, size, position, parent, radius);
  mesh.material.map = texture;
  mesh.material.bumpMap = texture;
  mesh.material.bumpScale = 0.008;
  mesh.material.roughness = 0.98;
  return mesh;
}

const rug = fabric('#fafafa', [3.05, 0.037, 2.45], [-1.56, 0.022, -0.85], scene, 0.017, rugWeave);
rug.material.map = null;

const pileCount = 18000;
const pile = new THREE.InstancedMesh(
  new THREE.ConeGeometry(0.008, 0.041, 3),
  new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }),
  pileCount
);
const tuft = new THREE.Object3D();
const fiberColor = new THREE.Color();
for (let index = 0; index < pileCount; index += 1) {
  tuft.position.set(
    rug.position.x + (Math.random() - 0.5) * 3.06,
    0.043 + Math.random() * 0.009,
    rug.position.z + (Math.random() - 0.5) * 2.46
  );
  tuft.rotation.set((Math.random() - 0.5) * 1.55, Math.random() * Math.PI, (Math.random() - 0.5) * 1.55);
  tuft.scale.set(1, 0.65 + Math.random() * 0.75, 1);
  tuft.updateMatrix();
  pile.setMatrixAt(index, tuft.matrix);
  fiberColor.setScalar(0.78 + Math.random() * 0.22);
  pile.setColorAt(index, fiberColor);
}
pile.receiveShadow = true;
scene.add(pile);

const couch = new THREE.Group();
couch.position.set(-2.92, 0, -0.96);
couch.rotation.y = Math.PI / 2;
scene.add(couch);
fabric('#e2e2e2', [2.47, 0.31, 0.99], [0, 0.32, 0], couch, 0.13);
fabric('#e2e2e2', [2.36, 0.66, 0.21], [0, 0.69, -0.38], couch, 0.1);
for (const x of [-1.12, 1.12]) {
  fabric('#e2e2e2', [0.25, 0.41, 0.99], [x, 0.58, 0.025], couch, 0.11);
  for (const z of [-0.35, 0.34]) box('#493127', [0.09, 0.17, 0.09], [x, 0.095, z], couch, 0.014);
}
for (const x of [-0.49, 0.49]) {
  fabric('#e2e2e2', [0.97, 0.19, 0.68], [x, 0.51, 0.12], couch);
  const backrest = fabric('#e2e2e2', [0.99, 0.45, 0.2], [x, 0.79, -0.24], couch, 0.093);
  backrest.rotation.x = -0.16;
}
const artwork = new THREE.Group();
artwork.position.set(-3.411, 1.82, couch.position.z);
artwork.rotation.y = Math.PI / 2;
scene.add(artwork);
box('#212021', [1.86, 0.955, 0.047], [0, 0, 0], artwork, 0.009);

const paintingTexture = textureLoader.load(import.meta.env.BASE_URL + 'abstract-painting.jpg');
paintingTexture.colorSpace = THREE.SRGBColorSpace;
paintingTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
const painting = new THREE.Mesh(
  new THREE.PlaneGeometry(1.79, 0.895),
  new THREE.MeshStandardMaterial({ map: paintingTexture, roughness: 0.91 })
);
painting.position.z = 0.025;
painting.receiveShadow = true;
artwork.add(painting);

function pillowOutline(angle) {
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  return new THREE.Vector2(Math.sign(x) * Math.pow(Math.abs(x), 0.59), Math.sign(y) * Math.pow(Math.abs(y), 0.59));
}

const pillowGeometry = new THREE.SphereGeometry(1, 48, 32);
const pillowPositions = pillowGeometry.attributes.position;
for (let i = 0; i < pillowPositions.count; i += 1) {
  const x = pillowPositions.getX(i);
  const y = pillowPositions.getY(i);
  const z = pillowPositions.getZ(i);
  const angle = Math.atan2(y, x);
  const outline = pillowOutline(angle);
  const radius = Math.hypot(x, y);
  const pinch = 1 - 0.16 * Math.pow(Math.abs(Math.sin(2 * angle)), 4) * radius;
  pillowPositions.setXYZ(i, 0.194 * radius * outline.x, 0.194 * radius * outline.y, 0.081 * z * pinch);
}
pillowGeometry.computeVertexNormals();
const seamPoints = Array.from({ length: 64 }, (_, i) => {
  const outline = pillowOutline(i * Math.PI / 32);
  return new THREE.Vector3(0.193 * outline.x, 0.193 * outline.y, 0);
});
const seam = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints, true), 80, 0.003, 6, true);

for (const [x, tint, tilt] of [[-0.79, '#239294', -0.23], [-0.38, '#39a6a3', 0.21], [0.81, '#238485', 0.28]]) {
  const cushion = new THREE.Mesh(pillowGeometry, new THREE.MeshPhysicalMaterial({
    color: tint, bumpMap: pillowWeave, bumpScale: 0.004, roughness: 0.96,
    sheen: 0.42, sheenColor: '#81c9c4'
  }));
  cushion.position.set(x, 0.785, -0.067);
  cushion.rotation.set(-0.22, 0, tilt);
  cushion.castShadow = true;
  cushion.receiveShadow = true;
  cushion.add(new THREE.Mesh(seam, new THREE.MeshStandardMaterial({ color: new THREE.Color(tint).multiplyScalar(0.69) })));
  couch.add(cushion);
}

const fleeceCanvas = document.createElement('canvas');
fleeceCanvas.width = fleeceCanvas.height = 192;
const fleeceContext = fleeceCanvas.getContext('2d');
fleeceContext.fillStyle = '#aaa';
fleeceContext.fillRect(0, 0, 192, 192);
for (let i = 0; i < 8200; i += 1) {
  fleeceContext.fillStyle = i % 3 === 0 ? '#4444' : '#fff7';
  fleeceContext.beginPath();
  fleeceContext.ellipse(Math.random() * 192, Math.random() * 192, 0.45 + Math.random() * 0.8, 1.1 + Math.random() * 1.2, Math.random() * Math.PI, 0, Math.PI * 2);
  fleeceContext.fill();
}
const fleeceNap = new THREE.CanvasTexture(fleeceCanvas);
fleeceNap.wrapS = fleeceNap.wrapT = THREE.RepeatWrapping;
fleeceNap.repeat.set(2, 3);

function drapePoint(x, along) {
  const drop = Math.max(0, along - 0.455);
  const fold = Math.sin(x * 29 + along * 6) + 0.5 * Math.sin(x * 51 - along * 9);
  const height = 0.62 - drop * 0.79 + fold * (0.006 + drop * 0.035);
  const front = 0.012 + Math.min(along, 0.455) + 0.092 * (1 - Math.exp(-drop * 13));
  return new THREE.Vector3(0.59 + x + 0.024 * Math.sin(along * 5), height, front);
}

const throwGeometry = new THREE.PlaneGeometry(0.62, 0.9, 36, 48);
const throwPositions = throwGeometry.attributes.position;
for (let i = 0; i < throwPositions.count; i += 1) {
  const point = drapePoint(throwPositions.getX(i), 0.45 - throwPositions.getY(i));
  throwPositions.setXYZ(i, point.x, point.y, point.z);
}
throwGeometry.computeVertexNormals();
const fleece = new THREE.MeshPhysicalMaterial({
  color: '#f2e7d0', bumpMap: fleeceNap, bumpScale: 0.006, side: THREE.DoubleSide,
  roughness: 1, sheen: 0.85, sheenColor: '#f5eee1', sheenRoughness: 0.9
});
const throwMesh = new THREE.Mesh(throwGeometry, fleece);
throwMesh.castShadow = true;
throwMesh.receiveShadow = true;
const hem = Array.from({ length: 29 }, (_, i) => drapePoint(-0.31 + i * 0.62 / 28, 0.9));
throwMesh.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hem), 36, 0.0045, 6), fleece));
couch.add(throwMesh);

const coffeeStation = createCoffeeStation(scene, box, textureLoader);
addKitchenAppliances(scene, box);
const fridge = createFridge(scene, box);

const workstationStart = scene.children.length;
const desk = '#222224';
box(desk, [2.76, 0.085, 0.91], [-0.09, 0.88, -2.63], scene, 0.03);
box(desk, [0.71, 0.085, 1.35], [0.93, 0.88, -1.55], scene, 0.03);
for (const [x, z] of [[-1.32, -2.98], [-1.32, -2.28], [1.15, -2.98], [1.15, -0.94], [0.71, -0.94]]) {
  box('#292a2c', [0.065, 0.85, 0.065], [x, 0.425, z], scene, 0.008);
}
box('#353137', [1.15, 0.014, 0.36], [-0.26, 0.928, -2.39], scene, 0.007);

function display(x, angle, secondary) {
  const monitor = new THREE.Group();
  monitor.position.set(x, 1.38, -2.86);
  monitor.rotation.y = angle;
  scene.add(monitor);
  box('#171719', [0.92, 0.53, 0.043], [0, 0, 0], monitor, 0.015);
  box('#303035', [0.047, 0.27, 0.046], [0, -0.31, -0.045], monitor, 0.01);
  box('#242426', [0.29, 0.022, 0.24], [0, -0.45, -0.03], monitor, 0.01);

  if (secondary) {
    box('#242428', [0.039, 0.028, 0.037], [0, 0.271, -0.004], monitor, 0.006);
    box('#1b1c21', [0.123, 0.046, 0.041], [0, 0.302, -0.002], monitor, 0.012);
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.014, 24),
      new THREE.MeshStandardMaterial({ color: '#394853', metalness: 0.22, roughness: 0.19 })
    );
    lens.position.set(0, 0.302, 0.019);
    monitor.add(lens);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 412;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const wallpaper = new Image();
  function drawDesktop() {
    ctx.fillStyle = '#182c33';
    ctx.fillRect(0, 0, 720, 412);
    if (wallpaper.complete && wallpaper.naturalWidth) {
      const scale = Math.max(720 / wallpaper.naturalWidth, 412 / wallpaper.naturalHeight);
      const width = wallpaper.naturalWidth * scale;
      const height = wallpaper.naturalHeight * scale;
      ctx.drawImage(wallpaper, (720 - width) / 2, (412 - height) / 2, width, height);
    }
    ctx.fillStyle = '#20232acc';
    ctx.fillRect(0, 0, 720, 23);
    ctx.fillStyle = '#f1f1f1';
    ctx.font = '12px system-ui';
    ctx.fillText('Finder    File    Edit    View    Go    Window    Help', 16, 15);
    ctx.fillText('10:42 AM', 652, 15);
    for (const [label, y] of [['Projects', 52], ['Work experience', 120]]) {
      ctx.fillStyle = '#91cbff';
      ctx.beginPath();
      ctx.roundRect(35, y - 4, 16, 10, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(34, y, 38, 26, 5);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(label, 53, y + 43);
    }
    ctx.fillStyle = '#bde8ff';
    ctx.beginPath();
    ctx.arc(53, 195, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f6591';
    ctx.beginPath();
    ctx.moveTo(60, 188);
    ctx.lineTo(55, 198);
    ctx.lineTo(47, 203);
    ctx.lineTo(51, 194);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('LinkedIn', 53, 221);
    ctx.textAlign = 'start';
    ctx.fillStyle = '#27262ba8';
    ctx.beginPath();
    ctx.roundRect(259, 365, 202, 39, 10);
    ctx.fill();
    ['#8ac4f7', '#ded5c6', '#a08dd4', '#adbca9', '#7992db', '#c4a099'].forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(267 + index * 32, 372, 24, 24, 6);
      ctx.fill();
    });
    texture.needsUpdate = true;
  }
  if (secondary) {
    drawCodeEditor(ctx);
  } else {
    wallpaper.addEventListener('load', drawDesktop);
    wallpaper.src = import.meta.env.BASE_URL + 'abstract-desktop.jpg';
    drawDesktop();
  }
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.889, 0.503), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  screen.position.z = 0.024;
  monitor.add(screen);
  const glow = new THREE.PointLight(secondary ? '#8069ff' : '#d276ff', 5, 2.4);
  glow.position.set(x, 1.34, -3.29);
  scene.add(glow);

  if (secondary) {
    return (elapsed, reduced) => {
      drawCodeEditor(ctx, elapsed, reduced);
      texture.needsUpdate = true;
    };
  }
}
const mainDisplay = { x: -0.47, y: 1.38, z: -2.86, angle: 0.13 };
display(mainDisplay.x, mainDisplay.angle, false);
const updateSecondaryDisplay = display(0.5, -0.31, true);

box('#1b1b20', [0.63, 0.037, 0.215], [-0.42, 0.95, -2.4], scene, 0.015);
for (let row = 0; row < 4; row += 1) {
  for (let col = 0; col < 13; col += 1) {
    const purple = col === 0 || col > 10 || row === 0;
    box(purple ? '#8854c0' : '#302938', [0.04, 0.015, 0.036], [-0.70 + col * 0.046, 0.977, -2.47 + row * 0.046], scene, 0.006);
  }
}
const mouse = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 16),
  new THREE.MeshStandardMaterial({ color: '#222027', roughness: 0.46 })
);
mouse.position.set(0.18, 0.956, -2.42);
mouse.scale.set(0.061, 0.043, 0.093);
mouse.castShadow = true;
scene.add(mouse);
box('#8059aa', [0.013, 0.014, 0.024], [0.18, 0.996, -2.45], scene, 0.005);

const chair = new THREE.Group();
chair.position.set(0, 0, -1.54);
scene.add(chair);
box('#222327', [0.61, 0.125, 0.58], [0, 0.51, 0], chair, 0.059);
const back = box('#2a2a30', [0.54, 0.66, 0.12], [0, 0.93, 0.26], chair, 0.058);
back.rotation.x = 0.12;
box('#343238', [0.44, 0.21, 0.075], [0, 0.78, 0.207], chair, 0.035);
box('#26262c', [0.35, 0.15, 0.104], [0, 1.33, 0.32], chair, 0.05);
box('#424247', [0.075, 0.43, 0.075], [0, 0.26, 0], chair, 0.03);
for (const x of [-0.32, 0.32]) {
  box('#29292e', [0.051, 0.23, 0.065], [x, 0.59, 0.02], chair, 0.015);
  box('#343339', [0.095, 0.058, 0.29], [x, 0.71, -0.002], chair, 0.026);
}
for (let index = 0; index < 5; index += 1) {
  const angle = index * Math.PI * 0.4;
  const leg = new THREE.Group();
  leg.rotation.y = angle;
  chair.add(leg);
  box('#35363a', [0.052, 0.048, 0.32], [0, 0.116, 0.15], leg, 0.012);
  box('#19191d', [0.08, 0.09, 0.075], [0, 0.05, 0.3], leg, 0.028);
}

const computerBody = box('#b8b9ba', [0.225, 0.055, 0.225], [1.11, 0.954, -2.56], scene, 0.025);
computerBody.material.metalness = 0.53;
computerBody.material.roughness = 0.33;
box('#25252a', [0.205, 0.014, 0.205], [1.11, 0.931, -2.56], scene, 0.007);
box('#ece5d6', [0.007, 0.005, 0.002], [1.182, 0.955, -2.446], scene, 0.001);

const airPods = new THREE.Group();
airPods.position.set(-0.87, 0.94, -2.41);
scene.add(airPods);
const airPodPlastic = new THREE.MeshStandardMaterial({ color: '#f7f7f5', roughness: 0.25 });
for (const side of [-1, 1]) {
  const earbud = new THREE.Group();
  earbud.position.set(side * 0.023, 0, side * 0.009);
  earbud.rotation.y = side * 0.42;
  airPods.add(earbud);

  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), airPodPlastic);
  body.scale.set(0.011, 0.008, 0.009);
  body.castShadow = true;
  earbud.add(body);

  const stem = new THREE.Mesh(new RoundedBoxGeometry(0.009, 0.010, 0.027, 3, 0.004), airPodPlastic);
  stem.position.set(-side * 0.003, -0.001, 0.015);
  stem.castShadow = true;
  earbud.add(stem);
  box('#28282a', [0.008, 0.002, 0.005], [0, 0.007, -0.004], earbud, 0.001);
}

const chargingCase = new THREE.Group();
chargingCase.position.set(-0.071, -0.004, -0.014);
chargingCase.rotation.y = 0.18;
airPods.add(chargingCase);
const caseShell = box('#f3f3ef', [0.063, 0.026, 0.047], [0, 0, 0], chargingCase, 0.012);
caseShell.material.roughness = 0.27;
box('#b6b6b3', [0.051, 0.0015, 0.0017], [0, 0.006, 0.0231], chargingCase, 0.0006);
box('#bdc9b8', [0.0024, 0.0024, 0.0012], [0, 0.0005, 0.0236], chargingCase, 0.0005);

const shopifyLogo = textureLoader.load(import.meta.env.BASE_URL + 'icons/shopify.svg');
shopifyLogo.colorSpace = THREE.SRGBColorSpace;
const { mug: deskMug } = createMug('#95bf47', shopifyLogo);
deskMug.position.set(-1.14, 0.926, -2.43);
deskMug.rotation.y = 0.42;
scene.add(deskMug);

const deskCenter = 1.63;
for (const object of scene.children.slice(workstationStart)) object.position.x += deskCenter;

const controls = document.querySelector('#controls');
const sit = document.querySelector('#sit');
const fridgeButton = document.querySelector('#fridge-door');
const fridgeLabel = document.querySelector('#fridge-label');
const brewButton = document.querySelector('#brew-coffee');
const brewLabel = document.querySelector('#brew-label');
const coffeeStatus = document.querySelector('#coffee-status');
const openComputer = document.querySelector('#open-computer');
const standLabel = document.querySelector('#stand-label');
const aim = document.querySelector('#aim');
const computer = document.querySelector('#computer');
const openProjects = document.querySelector('#open-projects');
const stand = document.querySelector('#stand');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const touchLayout = matchMedia('(pointer: coarse), (max-width: 640px)');
const joystick = document.querySelector('#joystick');
const thumb = joystick.firstElementChild;
let joystickPointer;
let joystickX = 0;
let joystickY = 0;
const keys = new Set();
const doorway = new THREE.Vector3(0.27, 1.64, 2.91);
const seated = new THREE.Vector3(deskCenter, 1.42, -1.57);
const screenWidth = 0.889;
const screenHeight = 0.503;
function monitorDistance() {
  const verticalSpan = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  return Math.max(screenWidth / camera.aspect, screenHeight) / (verticalSpan * 0.64);
}

function monitorView(distance) {
  const offset = distance + 0.024;
  return new THREE.Vector3(
    deskCenter + mainDisplay.x + Math.sin(mainDisplay.angle) * offset,
    mainDisplay.y,
    mainDisplay.z + Math.cos(mainDisplay.angle) * offset
  );
}

function revealDesktop(distance) {
  computer.hidden = false;
  if (distance && !reduceMotion.matches && !touchLayout.matches) {
    const height = screenHeight / (distance * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    const width = height * screenWidth / (screenHeight * camera.aspect);
    computer.animate([
      { transform: `translate(${(1 - width) * 50}%, ${(1 - height) * 50}%) scale(${width}, ${height})`, opacity: 0.65 },
      { transform: 'none', opacity: 1 }
    ], { duration: 460, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' });
  }
  openProjects.focus();
}
const standing = new THREE.Vector3();
let mode = 'walking';
let yaw = -0.20;
let pitch = -0.085;
let drag;
let transition;
let standingYaw;
let standingPitch;
const strideLength = 0.94;
let strideDistance = strideLength / 2;

camera.position.copy(doorway);

function nearChair() {
  return Math.hypot(camera.position.x - deskCenter, camera.position.z + 1.54) < 1.12;
}

function kitchenDistance(object) {
  return Math.hypot(camera.position.x - object.position.x, camera.position.z - object.position.z);
}

function kitchenInteraction() {
  const coffeeDistance = kitchenDistance(coffeeStation.station);
  const fridgeDistance = kitchenDistance(fridge.fridge);
  if (fridgeDistance < 1.35 && fridgeDistance < coffeeDistance) return 'fridge';
  if (coffeeDistance < 1.5) return 'coffee';
}

function toggleFridge() {
  if (mode !== 'walking' || kitchenDistance(fridge.fridge) >= 1.35) return;
  fridge.toggle();
  playFridgeDoor(fridge.open);
  fridgeLabel.textContent = fridge.open ? 'Close fridge' : 'Open fridge';
}

function brewCoffee() {
  if (mode !== 'walking' || kitchenDistance(coffeeStation.station) >= 1.5 || coffeeStation.brewing) return;
  coffeeStation.start(performance.now());
  playCoffeeBrew();
}

function sitDown() {
  if (mode !== 'walking' || !nearChair()) return;
  standing.copy(camera.position);
  standingYaw = yaw;
  standingPitch = pitch;
  const distance = monitorDistance();
  enterComputer('sitting');
  playChair(false);
  transition = {
    start: performance.now(),
    path: new THREE.QuadraticBezierCurve3(camera.position.clone(), seated, monitorView(distance)),
    distance,
    yaw,
    pitch
  };
}

function enterComputer(nextMode) {
  mode = nextMode;
  keys.clear();
  updateKeycaps();
  resetJoystick();
  drag = undefined;
  controls.hidden = true;
  aim.hidden = true;
  standLabel.textContent = mode === 'sitting' ? 'Stand up' : 'Back to cabin';
  resetDesktop();
}

function standUp() {
  if (mode === 'walking') return;
  const wasSitting = mode === 'sitting';
  if (wasSitting) {
    playChair(true);
    camera.position.copy(standing);
    yaw = standingYaw;
    pitch = standingPitch;
  }
  strideDistance = strideLength / 2;
  transition = null;
  mode = 'walking';
  computer.getAnimations().forEach(animation => animation.cancel());
  computer.hidden = true;
  controls.hidden = false;
  aim.hidden = false;
  if (wasSitting) sit.focus();
  else openComputer.focus();
}

sit.addEventListener('click', sitDown);
brewButton.addEventListener('click', brewCoffee);
fridgeButton.addEventListener('click', toggleFridge);
openComputer.addEventListener('click', () => {
  if (mode !== 'walking') return;
  enterComputer('browsing');
  revealDesktop();
});
stand.addEventListener('click', standUp);
const movementKeycaps = [...document.querySelectorAll('[data-keys]')].map(cap => ({
  cap,
  bindings: cap.dataset.keys.split(' ')
}));
const movementKeys = movementKeycaps.flatMap(({ bindings }) => bindings);

function updateKeycaps() {
  for (const { cap, bindings } of movementKeycaps) {
    cap.classList.toggle('is-pressed', bindings.some(key => keys.has(key)));
  }
}
window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (key === 'escape') standUp();
  if (key === 'e' && !event.repeat) {
    const action = kitchenInteraction();
    if (action === 'fridge') toggleFridge();
    else if (action === 'coffee') brewCoffee();
    else sitDown();
  }
  if (mode === 'walking' && movementKeys.includes(key)) {
    event.preventDefault();
    keys.add(key);
    updateKeycaps();
  }
});
window.addEventListener('keyup', event => {
  if (keys.delete(event.key.toLowerCase())) updateKeycaps();
});
window.addEventListener('blur', () => {
  keys.clear();
  updateKeycaps();
  resetJoystick();
  drag = undefined;
});
function resetJoystick() {
  joystickPointer = undefined;
  joystickX = 0;
  joystickY = 0;
  thumb.style.transform = '';
  joystick.classList.remove('is-held');
}

function updateJoystick(event) {
  const bounds = joystick.getBoundingClientRect();
  const travel = (bounds.width - thumb.offsetWidth) / 2 - 5;
  const x = event.clientX - (bounds.left + bounds.width / 2);
  const y = event.clientY - (bounds.top + bounds.height / 2);
  const scale = Math.max(travel, Math.hypot(x, y));
  joystickX = x / scale;
  joystickY = y / scale;
  thumb.style.transform = `translate(${joystickX * travel}px, ${joystickY * travel}px)`;
}

joystick.addEventListener('pointerdown', event => {
  if (mode !== 'walking' || joystickPointer !== undefined || event.button !== 0) return;
  joystickPointer = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  joystick.classList.add('is-held');
  updateJoystick(event);
});
joystick.addEventListener('pointermove', event => {
  if (event.pointerId === joystickPointer) updateJoystick(event);
});
joystick.addEventListener('lostpointercapture', event => {
  if (event.pointerId === joystickPointer) resetJoystick();
});

const ray = new THREE.Raycaster();
renderer.domElement.addEventListener('pointerdown', event => {
  if (mode !== 'walking' || drag || event.button !== 0) return;
  renderer.domElement.setPointerCapture(event.pointerId);
  drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
});
renderer.domElement.addEventListener('pointermove', event => {
  if (drag?.pointerId !== event.pointerId || mode !== 'walking') return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  drag.x = event.clientX;
  drag.y = event.clientY;
  drag.distance += Math.hypot(dx, dy);
  yaw -= dx * 0.004;
  pitch = THREE.MathUtils.clamp(pitch - dy * 0.004, -1.1, 1.1);
});
renderer.domElement.addEventListener('pointerup', event => {
  if (drag?.pointerId !== event.pointerId) return;
  if (drag.distance < 7 && mode === 'walking') {
    const bounds = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera({
      x: (event.clientX - bounds.left) / bounds.width * 2 - 1,
      y: 1 - (event.clientY - bounds.top) / bounds.height * 2
    }, camera);
    if (kitchenDistance(fridge.fridge) < 1.35 && ray.intersectObject(fridge.fridge, true).length) toggleFridge();
    else if (kitchenDistance(coffeeStation.station) < 1.5 && ray.intersectObject(coffeeStation.station, true).length) brewCoffee();
    else if (nearChair() && ray.intersectObject(chair, true).length) sitDown();
  }
  drag = undefined;
});
renderer.domElement.addEventListener('lostpointercapture', event => {
  if (drag?.pointerId === event.pointerId) drag = undefined;
});

function resize() {
  const { clientWidth: width, clientHeight: height } = sceneElement;
  if (!width || !height) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, touchLayout.matches ? 1.25 : 1.75));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  const verticalFov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(37)) / camera.aspect));
  camera.fov = THREE.MathUtils.clamp(verticalFov, 58, 100);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(sceneElement);
resize();

const obstacles = [
  [deskCenter - 1.64, deskCenter + 1.46, -3.2, -2.01],
  [deskCenter + 0.43, deskCenter + 1.46, -2.03, -0.75],
  [deskCenter - 0.46, deskCenter + 0.46, -1.9, -1.12],
  [-3.54, -2.23, -2.4, 0.48],
  [-3.24, -2.55, 2.36, 3.0],
  [1.08, 3.24, 2.49, 3.24],
  [2.54, 3.24, 1.55, 2.65],
  [2.61, 3.24, 0.56, 1.54]
];
function walkable(x, z) {
  return Math.abs(x) < 3.24 && Math.abs(z) < 3.24
    && obstacles.every(([left, right, back, front]) => x < left || x > right || z < back || z > front);
}
function move(dt) {
  const stickActive = Math.hypot(joystickX, joystickY) > 0.14;
  const forward = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'))
    - (stickActive ? joystickY : 0);
  const side = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
    + (stickActive ? joystickX : 0);
  if (!forward && !side) return;
  const distance = 2.25 * dt / Math.max(1, Math.hypot(forward, side));
  const startX = camera.position.x;
  const startZ = camera.position.z;
  const x = startX + (side * Math.cos(yaw) - forward * Math.sin(yaw)) * distance;
  const z = startZ + (-side * Math.sin(yaw) - forward * Math.cos(yaw)) * distance;
  if (walkable(x, startZ)) camera.position.x = x;
  if (walkable(camera.position.x, z)) camera.position.z = z;
  strideDistance += Math.hypot(camera.position.x - startX, camera.position.z - startZ);
  if (strideDistance >= strideLength) {
    strideDistance -= strideLength;
    const onRug = Math.abs(camera.position.x - rug.position.x) < 1.525
      && Math.abs(camera.position.z - rug.position.z) < 1.225;
    playFootstep(onRug);
  }
}

let lastFrame = performance.now();
let codeElapsed = 0;
let nextCodeFrame = 0;
let codeReduced = false;
renderer.setAnimationLoop(now => {
  const dt = Math.min(Math.max(0, now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  if (mode === 'walking') {
    coffeeStation.update(now, reduceMotion.matches);
    fridge.update(dt, reduceMotion.matches);
    move(dt);
    const chairNearby = nearChair();
    sit.hidden = !chairNearby;
    const action = kitchenInteraction();
    const coffeeNearby = action === 'coffee';
    fridgeButton.hidden = action !== 'fridge';
    brewButton.hidden = !coffeeNearby;
    const brewing = coffeeStation.brewing;
    const label = brewing ? 'Brewing…' : coffeeStation.finished ? 'Brew again' : 'Make coffee';
    if (brewLabel.textContent !== label) brewLabel.textContent = label;
    brewButton.toggleAttribute('disabled', brewing);
    coffeeStatus.hidden = !coffeeNearby || !coffeeStation.finished;
    const status = coffeeStatus.hidden ? '' : 'Coffee ready';
    if (coffeeStatus.textContent !== status) coffeeStatus.textContent = status;
    hint.hidden = chairNearby || Boolean(action);
  }
  if (!computer.hidden) return;
  if (transition) {
    const progress = reduceMotion.matches ? 1 : Math.min(1, Math.max(0, (now - transition.start) / 1140));
    const eased = THREE.MathUtils.smoothstep(progress, 0, 1);
    transition.path.getPoint(eased, camera.position);
    const offset = transition.yaw - mainDisplay.angle;
    const shortestYaw = mainDisplay.angle + Math.atan2(Math.sin(offset), Math.cos(offset));
    yaw = THREE.MathUtils.lerp(shortestYaw, mainDisplay.angle, eased);
    pitch = THREE.MathUtils.lerp(transition.pitch, 0, eased);
    if (progress === 1) {
      revealDesktop(transition.distance);
      transition = null;
    }
  }
  if (reduceMotion.matches !== codeReduced || (!reduceMotion.matches && codeElapsed >= nextCodeFrame)) {
    codeReduced = reduceMotion.matches;
    updateSecondaryDisplay(codeElapsed, codeReduced);
    nextCodeFrame = codeElapsed + 110;
  }
  if (!reduceMotion.matches) codeElapsed += dt * 1000;
  for (let index = 0; index < streakCount; index += 1) {
    if (heights[index] < 0.12) heights[index] += 3.3;
    if (!reduceMotion.matches) heights[index] -= dt * (1.4 + index % 7 * 0.11);
    drops[index * 6 + 1] = heights[index];
    drops[index * 6 + 4] = heights[index] + 0.045 + index % 5 * 0.012;
  }
  rainPositions.needsUpdate = true;
  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
});
