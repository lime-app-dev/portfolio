import * as THREE from 'three';
import { createMug } from './coffee.js';

function brushedMetal(color, roughness) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < canvas.height; y += 1) {
    const noise = 218 + Math.round(18 * Math.sin(y * 17.6) + 8 * Math.cos(y * 3.83));
    ctx.fillStyle = `rgb(${noise},${noise},${noise})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }
  const finish = new THREE.CanvasTexture(canvas);
  finish.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    color, map: finish, roughnessMap: finish, metalness: 0.26, roughness
  });
}

export function addKitchenAppliances(scene, box) {
  const steel = brushedMetal('#d3d8dc', 0.44);
  const black = new THREE.MeshStandardMaterial({ color: '#26282a', roughness: 0.48 });
  function metalBox(size, position, parent, radius) {
    const mesh = box('#a8afb0', size, position, parent, radius);
    mesh.material.dispose();
    mesh.material = steel;
    return mesh;
  }

  const toaster = new THREE.Group();
  toaster.position.set(1.58, 0.946, 2.92);
  scene.add(toaster);
  box('#242527', [0.282, 0.130, 0.17], [0, 0.080, 0], toaster, 0.029);
  metalBox([0.224, 0.132, 0.174], [0, 0.086, 0], toaster, 0.016);
  for (const x of [-0.126, 0.126]) {
    box('#1b1c20', [0.041, 0.147, 0.178], [x, 0.092, 0], toaster, 0.018);
    box('#151619', [0.037, 0.018, 0.151], [x, 0.011, 0], toaster, 0.006);
  }
  for (const z of [-0.029, 0.029]) {
    box('#141517', [0.180, 0.005, 0.031], [0, 0.154, z], toaster, 0.006);
    for (const edge of [-1, 1]) metalBox([0.174, 0.007, 0.006], [0, 0.158, z + edge * 0.017], toaster, 0.002);
    for (const x of [-0.05, 0, 0.05]) metalBox([0.004, 0.004, 0.024], [x, 0.157, z], toaster, 0.001);
  }
  box('#111217', [0.006, 0.064, 0.016], [0.147, 0.103, -0.026], toaster, 0.004);
  box('#38393c', [0.028, 0.013, 0.032], [0.156, 0.124, -0.026], toaster, 0.005);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.011, 24), black);
  dial.rotation.z = Math.PI / 2;
  dial.position.set(0.147, 0.048, 0.018);
  toaster.add(dial);

  const kettle = new THREE.Group();
  kettle.position.set(2.79, 0.944, 3.03);
  scene.add(kettle);
  const kettleProfile = [[0, 0.021], [0.074, 0.021], [0.091, 0.030], [0.094, 0.045], [0.091, 0.098],
    [0.082, 0.158], [0.074, 0.183], [0.058, 0.188], [0, 0.188]];
  const body = new THREE.Mesh(new THREE.LatheGeometry(kettleProfile.map(point => new THREE.Vector2(...point)), 40), black);
  body.castShadow = true;
  kettle.add(body);
  const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.093, 0.089, 0.02, 40), steel);
  trim.position.y = 0.037;
  kettle.add(trim);
  const gauge = box('#3a464b', [0.018, 0.069, 0.01], [0.013, 0.105, -0.087], kettle, 0.004);
  gauge.rotation.x = -0.13;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.094, 0.095, 0.021, 32), black);
  base.position.y = 0.011;
  kettle.add(base);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), black);
  lid.scale.set(0.069, 0.017, 0.069);
  lid.position.y = 0.18;
  kettle.add(lid);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.057, 0.009, 8, 24), black);
  handle.position.set(0.074, 0.107, 0);
  kettle.add(handle);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.030, 0.086, 16), steel);
  spout.material = black;
  spout.position.set(-0.077, 0.145, 0);
  spout.rotation.z = 0.94;
  kettle.add(spout);

  const rack = new THREE.Group();
  rack.position.set(3.06, 0.946, 2.52);
  scene.add(rack);
  box('#383b3a', [0.36, 0.013, 0.224], [0, 0.006, 0], rack, 0.009);
  for (let i = -2; i <= 2; i += 1) {
    metalBox([0.317, 0.010, 0.009], [0, 0.027, i * 0.041], rack, 0.003);
  }
  for (const x of [-0.171, 0.171]) box('#292b2b', [0.014, 0.049, 0.221], [x, 0.036, 0], rack, 0.004);
  for (const z of [-0.104, 0.104]) box('#292b2b', [0.354, 0.049, 0.014], [0, 0.036, z], rack, 0.004);
  for (const x of [-0.108, -0.05, 0.01, 0.069, 0.128]) {
    box('#333636', [0.006, 0.034, 0.08], [x, 0.046, 0.064], rack, 0.002);
  }
  for (const [x, color] of [[-0.104, '#e6ded1'], [0.004, '#adcec0'], [0.113, '#d8c4b2']]) {
    const { mug, coffee } = createMug(color);
    coffee.visible = false;
    mug.scale.setScalar(0.78);
    mug.position.set(x, 0.034, -0.044);
    mug.rotation.y = Math.PI * 0.8;
    rack.add(mug);
  }
  const porcelain = new THREE.MeshStandardMaterial({ color: '#e9e4da', roughness: 0.42 });
  for (const x of [-0.076, 0.071]) {
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.054, 0.009, 28), porcelain);
    saucer.position.set(x, 0.09, 0.065);
    saucer.rotation.x = Math.PI * 0.43;
    saucer.castShadow = true;
    rack.add(saucer);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.003, 7, 28), porcelain);
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.004;
    saucer.add(rim);
  }
}

export function createFridge(scene, box) {
  const fridge = new THREE.Group();
  fridge.position.set(3.125, 0, 1.32);
  fridge.scale.set(1.18, 1.16, 1.12);
  fridge.rotation.y = -Math.PI / 2;
  scene.add(fridge);
  const silver = new THREE.MeshStandardMaterial({ color: '#c5cbd1', metalness: 0.43, roughness: 0.29 });
  function metalPanel(size, position, parent, radius = 0.012) {
    const panel = box('#ffffff', size, position, parent, radius);
    panel.material.dispose();
    panel.material = silver;
  }
  metalPanel([0.66, 1.72, 0.09], [0, 0.86, -0.233], fridge);
  for (const x of [-0.308, 0.308]) metalPanel([0.049, 1.72, 0.53], [x, 0.86, 0.005], fridge);
  for (const y of [0.051, 1.679]) metalPanel([0.615, 0.082, 0.53], [0, y, 0.005], fridge);
  box('#d9e0de', [0.568, 1.53, 0.015], [0, 0.863, -0.182], fridge);
  for (const y of [0.27, 0.69, 1.08, 1.43]) box('#d4e1df', [0.568, 0.025, 0.405], [0, y, 0.016], fridge, 0.006);
  box('#c9d7d2', [0.47, 0.104, 0.32], [0, 0.33, 0.034], fridge, 0.018);

  for (const [x, y, color] of [[-0.15, 0.70, '#778d65'], [0, 0.70, '#9d6b4a'], [0.14, 1.09, '#8eb2b1']]) {
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.039, 0.18, 24), new THREE.MeshStandardMaterial({ color, roughness: 0.38 }));
    bottle.position.set(x, y + 0.10, -0.015);
    fridge.add(bottle);
    box('#e6dfcc', [0.060, 0.06, 0.01], [x, y + 0.09, 0.021], fridge, 0.006);
    box('#c6bbb1', [0.048, 0.035, 0.048], [x, y + 0.20, -0.015], fridge, 0.01);
  }
  box('#d0b5a2', [0.19, 0.09, 0.149], [-0.14, 1.137, 0.024], fridge, 0.014);
  const light = new THREE.PointLight('#e1f1ff', 0, 1.22, 2);
  light.position.set(0, 1.52, 0.12);
  fridge.add(light);

  const hinge = new THREE.Group();
  hinge.position.set(-0.331, 0, 0.27);
  fridge.add(hinge);
  box('#26282d', [0.651, 0.023, 0.069], [0, 0.611, 0.295], fridge, 0.006);
  metalPanel([0.662, 0.567, 0.069], [0, 0.306, 0.304], fridge);

  // Cut the dispenser opening into the silver door skin.
  const doorSkin = new THREE.Shape();
  doorSkin.moveTo(0, 0.638);
  doorSkin.lineTo(0.662, 0.638);
  doorSkin.lineTo(0.662, 1.708);
  doorSkin.lineTo(0, 1.708);
  doorSkin.closePath();
  const dispenserOpening = new THREE.Path();
  dispenserOpening.moveTo(0.202, 0.985);
  dispenserOpening.lineTo(0.202, 1.35);
  dispenserOpening.lineTo(0.46, 1.35);
  dispenserOpening.lineTo(0.46, 0.985);
  dispenserOpening.closePath();
  doorSkin.holes.push(dispenserOpening);
  const skin = new THREE.Mesh(
    new THREE.ExtrudeGeometry(doorSkin, { depth: 0.06, bevelEnabled: false }),
    silver
  );
  skin.castShadow = true;
  skin.receiveShadow = true;
  hinge.add(skin);

  const dispenser = new THREE.Group();
  dispenser.position.set(0.331, 1.1675, 0);
  hinge.add(dispenser);
  box('#252932', [0.268, 0.375, 0.024], [0, 0, 0.006], dispenser, 0.006);
  for (const x of [-0.121, 0.121]) box('#303640', [0.019, 0.359, 0.051], [x, 0, 0.034], dispenser, 0.004);
  box('#313640', [0.245, 0.073, 0.057], [0, 0.142, 0.035], dispenser, 0.005);
  box('#151c26', [0.102, 0.029, 0.003], [0, 0.145, 0.065], dispenser, 0.004);
  box('#91cdf1', [0.038, 0.005, 0.002], [0, 0.145, 0.067], dispenser);
  metalPanel([0.038, 0.027, 0.027], [0, 0.087, 0.043], dispenser, 0.004);
  box('#3f464e', [0.066, 0.117, 0.015], [0, -0.019, 0.024], dispenser, 0.007);
  metalPanel([0.24, 0.023, 0.055], [0, -0.16, 0.034], dispenser, 0.005);
  for (const x of [-0.08, -0.04, 0, 0.04, 0.08]) {
    box('#222832', [0.016, 0.002, 0.031], [x, -0.147, 0.035], dispenser);
  }
  box('#24262b', [0.64, 0.026, 0.061], [0.331, 0.641, 0.031], hinge, 0.005);
  box('#d5dfdc', [0.601, 1.017, 0.026], [0.331, 1.169, -0.006], hinge, 0.013);
  for (const y of [0.82, 1.18]) {
    box('#aabdbb', [0.49, 0.059, 0.019], [0.331, y, -0.071], hinge, 0.007);
    box('#d6dfdd', [0.49, 0.016, 0.052], [0.331, y - 0.033, -0.046], hinge, 0.005);
  }

  let open = false;
  const targetAngle = -Math.PI * 0.56;
  return {
    fridge,
    get open() { return open; },
    toggle() { open = !open; },
    update(dt, reducedMotion) {
      const target = open ? targetAngle : 0;
      hinge.rotation.y = reducedMotion ? target : THREE.MathUtils.damp(hinge.rotation.y, target, 10, dt);
      light.intensity = Math.abs(hinge.rotation.y / targetAngle) * 0.29;
    }
  };
}
