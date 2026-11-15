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

export function createCoffeeStation(scene, box, textureLoader) {
  function finish(file, roughness, bumpScale) {
    const texture = textureLoader.load(import.meta.env.BASE_URL + 'kitchen/' + file);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return new THREE.MeshStandardMaterial({ map: texture, bumpMap: texture, roughness, bumpScale });
  }
  const charcoal = finish('charcoal-oak.jpg', 0.76, 0.006);
  const quartz = finish('white-quartz.jpg', 0.34, 0.002);
  const brass = new THREE.MeshStandardMaterial({ color: '#99805a', metalness: 0.55, roughness: 0.42 });

  function finishedBox(material, size, position, parent, radius) {
    const mesh = box('#ffffff', size, position, parent, radius);
    mesh.material.dispose();
    mesh.material = material;
    const { position: points, normal, uv } = mesh.geometry.attributes;
    for (let i = 0; i < points.count; i += 1) {
      const top = Math.abs(normal.getY(i)) > 0.6;
      const side = Math.abs(normal.getX(i)) > 0.6;
      const x = points.getX(i) + position[0];
      const y = points.getY(i) + position[1];
      const z = points.getZ(i) + position[2];
      uv.setXY(i, (side && !top ? z : x) * 0.83, (top ? z : y) * 0.83);
    }
    return mesh;
  }

  finishedBox(charcoal, [2.15, 0.89, 0.60], [2.28, 0.445, 3.00], scene, 0.02);
  finishedBox(quartz, [2.27, 0.065, 0.78], [2.305, 0.91, 3.05], scene, 0.009);
  finishedBox(charcoal, [0.58, 0.89, 1.04], [3.06, 0.445, 2.23], scene, 0.02);
  finishedBox(quartz, [0.70, 0.065, 0.95], [3.09, 0.91, 2.185], scene, 0.009);
  finishedBox(quartz, [2.25, 0.20, 0.021], [2.295, 1.037, 3.427], scene, 0.004);
  finishedBox(quartz, [0.021, 0.20, 1.71], [3.427, 1.037, 2.56], scene, 0.004);

  function cupboard(x, z, angle, width) {
    const door = new THREE.Group();
    door.position.set(x, 0.465, z);
    door.rotation.y = angle;
    scene.add(door);

    finishedBox(charcoal, [width, 0.71, 0.021], [0, 0, 0], door, 0.006);
    for (const edge of [-1, 1]) {
      finishedBox(charcoal, [0.051, 0.71, 0.016], [edge * (width / 2 - 0.026), 0, 0.013], door, 0.004);
      finishedBox(charcoal, [width - 0.102, 0.054, 0.016], [0, edge * 0.328, 0.013], door, 0.004);
    }
    finishedBox(brass, [0.14, 0.017, 0.023], [0, 0.255, 0.027], door, 0.006);
  }
  for (const x of [1.57, 2.12, 2.67]) cupboard(x, 2.686, Math.PI, 0.52);
  for (const z of [1.97, 2.43]) cupboard(2.750, z, -Math.PI / 2, 0.42);
  box('#33393a', [0.38, 0.025, 0.40], [3.05, 0.953, 2.18], scene, 0.018);
  box('#212629', [0.31, 0.012, 0.33], [3.05, 0.967, 2.18], scene, 0.015);
  const faucetPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.22, 0.95, 2.20), new THREE.Vector3(3.22, 1.15, 2.20),
    new THREE.Vector3(3.14, 1.20, 2.20), new THREE.Vector3(3.07, 1.15, 2.20)
  ]);
  const faucet = new THREE.Mesh(
    new THREE.TubeGeometry(faucetPath, 20, 0.013, 8),
    new THREE.MeshStandardMaterial({ color: '#ad9167', metalness: 0.62, roughness: 0.3 })
  );
  faucet.castShadow = true;
  scene.add(faucet);

  const station = new THREE.Group();
  station.position.set(2.26, 0.945, 2.97);
  station.rotation.y = Math.PI;
  scene.add(station);
  box('#23262a', [0.44, 0.41, 0.22], [0, 0.205, -0.102], station, 0.027);
  box('#33363a', [0.43, 0.105, 0.30], [0, 0.36, 0.022], station, 0.022);
  const fascia = box('#b6bdbe', [0.42, 0.096, 0.014], [0, 0.359, 0.174], station, 0.018);
  fascia.material.metalness = 0.38;
  fascia.material.roughness = 0.28;
  const glass = box('#171a1e', [0.411, 0.088, 0.012], [0, 0.359, 0.182], station, 0.015);
  glass.material.roughness = 0.19;
  box('#303941', [0.15, 0.056, 0.008], [-0.029, 0.36, 0.19], station, 0.006);
  for (const x of [-0.068, 0.008]) {
    for (const y of [0.347, 0.368]) box('#647674', [0.064, 0.014, 0.005], [x, y, 0.194], station, 0.003);
  }
  box('#39342f', [0.236, 0.046, 0.138], [0, 0.417, -0.063], station, 0.012);
  box('#242527', [0.245, 0.013, 0.143], [0, 0.447, -0.063], station, 0.005);
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

  const steamCanvas = document.createElement('canvas');
  steamCanvas.width = steamCanvas.height = 64;
  const ctx = steamCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, '#fff9ed');
  gradient.addColorStop(0.38, 'rgba(255, 249, 237, 0.48)');
  gradient.addColorStop(1, 'rgba(255, 249, 237, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const steamTexture = new THREE.CanvasTexture(steamCanvas);
  steamTexture.colorSpace = THREE.SRGBColorSpace;
  const vapor = Array.from({ length: 7 }, () => {
    const puff = new THREE.Sprite(new THREE.SpriteMaterial({
      map: steamTexture, transparent: true, opacity: 0, depthWrite: false
    }));
    puff.visible = false;
    station.add(puff);
    return puff;
  });

  let started = null;
  let finishedAt = null;
  const duration = 2700;
  return {
    station,
    get brewing() { return started !== null; },
    get finished() { return finishedAt !== null; },
    start(now) {
      if (started !== null) return;
      started = now;
      finishedAt = null;
      coffee.visible = false;
    },
    update(now, reduceMotion) {
      if (started !== null) {
        const progress = Math.min(1, (now - started) / duration);
        stream.visible = !reduceMotion && progress > 0.12 && progress < 0.92;
        coffee.visible = progress > 0.25;
        coffee.position.y = 0.023 + 0.063 * progress;
        indicator.material.emissiveIntensity = progress === 1 ? 0.25 : 1.45;
        if (progress === 1) {
          finishedAt = started + duration;
          started = null;
        }
      }
      const steamAge = finishedAt === null ? 0 : (now - finishedAt) / 1000;
      for (const [index, puff] of vapor.entries()) {
        const elapsed = steamAge - index * 0.26;
        puff.visible = !reduceMotion && elapsed > 0 && steamAge < 16;
        if (!puff.visible) continue;
        const phase = (elapsed / 2.05) % 1;
        const remainingHeat = Math.min(1, (16 - steamAge) / 5);
        const drift = Math.sin(elapsed * 2.2 + index * 0.72) * phase * 0.027;
        puff.position.set(drift, 0.14 + phase * 0.23, 0.127 + phase * 0.084);
        puff.scale.set(0.029 + phase * 0.051, 0.043 + phase * 0.085, 1);
        puff.material.opacity = Math.sin(phase * Math.PI) * remainingHeat * 0.33;
      }
    }
  };
}
