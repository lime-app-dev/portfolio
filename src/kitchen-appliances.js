import * as THREE from 'three';
import { createMug } from './coffee.js';

export function addKitchenAppliances(scene, box) {
  const steel = new THREE.MeshStandardMaterial({ color: '#a8afb0', metalness: 0.44, roughness: 0.36 });
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
  metalBox([0.27, 0.16, 0.16], [0, 0.091, 0], toaster, 0.032);
  box('#282a2c', [0.25, 0.019, 0.148], [0, 0.012, 0], toaster, 0.008);
  for (const z of [-0.029, 0.029]) box('#252525', [0.178, 0.006, 0.017], [0, 0.169, z], toaster, 0.004);
  box('#303133', [0.04, 0.018, 0.023], [0.132, 0.104, -0.057], toaster, 0.005);

  const kettle = new THREE.Group();
  kettle.position.set(2.79, 0.944, 3.03);
  scene.add(kettle);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.071, 0.091, 0.155, 32), steel);
  body.position.y = 0.101;
  body.castShadow = true;
  kettle.add(body);
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
  spout.position.set(-0.077, 0.132, 0);
  spout.rotation.z = 0.94;
  kettle.add(spout);

  const rack = new THREE.Group();
  rack.position.set(3.06, 0.946, 2.52);
  scene.add(rack);
  box('#383b3a', [0.36, 0.013, 0.224], [0, 0.006, 0], rack, 0.009);
  for (let i = -2; i <= 2; i += 1) {
    metalBox([0.317, 0.010, 0.009], [0, 0.027, i * 0.041], rack, 0.003);
  }
  for (const x of [-0.16, 0.16]) metalBox([0.012, 0.042, 0.21], [x, 0.032, 0], rack, 0.003);
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
  fridge.position.set(3.10, 0, 1.05);
  fridge.rotation.y = -Math.PI / 2;
  scene.add(fridge);
  const shell = '#778183';
  box(shell, [0.66, 1.72, 0.09], [0, 0.86, -0.233], fridge, 0.016);
  for (const x of [-0.308, 0.308]) box(shell, [0.049, 1.72, 0.53], [x, 0.86, 0.005], fridge, 0.013);
  for (const y of [0.051, 1.679]) box(shell, [0.615, 0.082, 0.53], [0, y, 0.005], fridge, 0.012);
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
  const door = box('#929a9c', [0.662, 1.68, 0.066], [0.331, 0.854, 0.033], hinge, 0.027);
  door.material.metalness = 0.36;
  door.material.roughness = 0.43;
  box('#d5dfdc', [0.601, 1.58, 0.026], [0.331, 0.855, -0.006], hinge, 0.018);
  box('#3c4444', [0.026, 0.36, 0.041], [0.576, 1.12, 0.086], hinge, 0.01);

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
