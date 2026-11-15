import * as THREE from 'three';

export function createMug(color, logo = null) {
  const mug = new THREE.Group();
  const ceramic = new THREE.MeshStandardMaterial({ color, roughness: 0.33 });
  const inner = new THREE.MeshStandardMaterial({ color, side: THREE.BackSide, roughness: 0.42 });
  const addMesh = (geometry, material, x, y, z) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mug.add(mesh);
    return mesh;
  };
  addMesh(new THREE.CylinderGeometry(0.048, 0.043, 0.098, 32, 1, true), ceramic, 0, 0.051, 0);
  addMesh(new THREE.CylinderGeometry(0.043, 0.038, 0.087, 32, 1, true), inner, 0, 0.055, 0);
  addMesh(new THREE.CylinderGeometry(0.043, 0.041, 0.012, 32), ceramic, 0, 0.008, 0);
  addMesh(new THREE.TorusGeometry(0.0455, 0.0027, 8, 32), ceramic, 0, 0.1, 0).rotation.x = Math.PI / 2;
  addMesh(new THREE.TorusGeometry(0.031, 0.0065, 9, 28), ceramic, 0.054, 0.055, 0);
  const coffee = addMesh(new THREE.CircleGeometry(0.0415, 32), new THREE.MeshStandardMaterial({
    color: '#39241c', roughness: 0.4
  }), 0, 0.086, 0);
  coffee.rotation.x = -Math.PI / 2;
  if (logo) {
    const badge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.046, 0.049, 24, 1, true, -0.55, 1.1),
      new THREE.MeshStandardMaterial({ map: logo, transparent: true, depthWrite: false, roughness: 0.55 })
    );
    badge.position.set(0, 0.056, 0.0018);
    mug.add(badge);
  }
  return { mug, coffee };
}

export function createCoffeeStation(scene, box) {
  const cabinet = '#323432';
  const worktop = '#a69a85';
  box(cabinet, [2.15, 0.89, 0.60], [2.28, 0.445, 3.00], scene, 0.02);
  box(worktop, [2.22, 0.065, 0.66], [2.28, 0.91, 2.99], scene, 0.019);
  box(cabinet, [0.58, 0.89, 1.04], [3.06, 0.445, 2.23], scene, 0.02);
  box(worktop, [0.64, 0.065, 1.05], [3.06, 0.91, 2.23], scene, 0.018);
  box('#3e4240', [2.16, 0.32, 0.04], [2.27, 1.1, 3.41], scene, 0.009);
  for (const x of [1.58, 2.22, 2.86]) {
    box('#4c504c', [0.58, 0.71, 0.032], [x, 0.45, 2.689], scene, 0.009);
    box('#a5a598', [0.15, 0.017, 0.029], [x, 0.73, 2.661], scene, 0.006);
  }
  for (const z of [1.99, 2.44]) {
    box('#4c504c', [0.032, 0.71, 0.40], [2.759, 0.45, z], scene, 0.009);
    box('#a5a598', [0.029, 0.017, 0.13], [2.735, 0.73, z], scene, 0.006);
  }
  box('#33393a', [0.38, 0.025, 0.40], [3.05, 0.953, 2.18], scene, 0.018);
  box('#212629', [0.31, 0.012, 0.33], [3.05, 0.967, 2.18], scene, 0.015);
  const faucetPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.22, 0.95, 2.20), new THREE.Vector3(3.22, 1.15, 2.20),
    new THREE.Vector3(3.14, 1.20, 2.20), new THREE.Vector3(3.07, 1.15, 2.20)
  ]);
  const faucet = new THREE.Mesh(
    new THREE.TubeGeometry(faucetPath, 20, 0.013, 8),
    new THREE.MeshStandardMaterial({ color: '#787e80', metalness: 0.68, roughness: 0.32 })
  );
  faucet.castShadow = true;
  scene.add(faucet);

  const station = new THREE.Group();
  station.position.set(2.26, 0.945, 2.97);
  station.rotation.y = Math.PI;
  scene.add(station);
  box('#23262a', [0.44, 0.41, 0.22], [0, 0.205, -0.102], station, 0.027);
  box('#33363a', [0.43, 0.105, 0.30], [0, 0.36, 0.022], station, 0.022);
  box('#a3abac', [0.37, 0.055, 0.012], [0, 0.359, 0.175], station, 0.006);
  box('#4c5355', [0.44, 0.032, 0.31], [0, 0.017, 0.028], station, 0.009);
  for (let index = 0; index < 8; index += 1) {
    box('#a1a6a5', [0.31, 0.005, 0.008], [0, 0.035, 0.05 + index * 0.014], station);
  }
  box('#2a2b29', [0.068, 0.052, 0.084], [0, 0.285, 0.099], station, 0.011);
  const indicator = box('#7c5b3b', [0.027, 0.015, 0.012], [0.133, 0.359, 0.184], station, 0.004);
  indicator.material.emissive.set('#a96f35');
  indicator.material.emissiveIntensity = 0.25;

  const { mug, coffee } = createMug('#e4d7c3');
  mug.position.set(0, 0.038, 0.122);
  station.add(mug);
  coffee.visible = false;
  const stream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.002, 0.003, 0.145, 8),
    new THREE.MeshBasicMaterial({ color: '#8d5632' })
  );
  stream.position.set(0, 0.198, 0.112);
  stream.visible = false;
  station.add(stream);

  let started = null;
  let finished = false;
  const duration = 2700;
  return {
    station,
    get brewing() { return started !== null; },
    get finished() { return finished; },
    start(now) {
      if (started !== null) return;
      started = now;
      finished = false;
      coffee.visible = false;
    },
    update(now, reduceMotion) {
      if (started === null) return;
      const progress = Math.min(1, (now - started) / duration);
      stream.visible = !reduceMotion && progress > 0.12 && progress < 0.92;
      coffee.visible = progress > 0.25;
      coffee.position.y = 0.023 + 0.063 * progress;
      indicator.material.emissiveIntensity = progress === 1 ? 0.25 : 1.45;
      if (progress === 1) {
        started = null;
        finished = true;
      }
    }
  };
}
