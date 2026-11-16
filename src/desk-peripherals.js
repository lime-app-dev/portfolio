import * as THREE from 'three';

export function addDeskPeripherals(scene, box) {
  const keyboard = new THREE.Group();
  keyboard.position.set(-0.42, 0.924, -2.4);
  scene.add(keyboard);
  box('#212225', [0.72, 0.018, 0.219], [0, 0.009, 0], keyboard, 0.008);

  const legends = document.createElement('canvas');
  legends.width = 1440;
  legends.height = 438;
  const ink = legends.getContext('2d');
  ink.textAlign = 'center';
  ink.textBaseline = 'middle';
  const colors = ['#e6e4e9', '#e5dfeb', '#c5b5d8', '#9d84b7', '#6e518c', '#49335f'];
  const pitch = 0.0318;
  function key(label, column, row, width = 1, height = 1) {
    const x = -0.344 + (column + width / 2) * pitch;
    const z = -0.103 + (row + height / 2) * pitch;
    box(colors[Math.min(5, Math.floor(row))], [width * pitch - 0.003, 0.009, height * pitch - 0.004], [x, 0.0224, z], keyboard, 0.003);
    ink.fillStyle = row < 2 ? '#433c4c' : '#fffbff';
    ink.font = label.length > 2 ? '13px system-ui' : '19px system-ui';
    ink.fillText(label, (x + 0.36) * 2000, (z + 0.1095) * 2000, (width * pitch - 0.007) * 2000);
  }

  const rows = [
    ['Esc', ...Array.from({ length: 12 }, (_, i) => 'F' + (i + 1))],
    [...'`1234567890-=', ['Backspace', 2]],
    [['Tab', 1.5], ...'QWERTYUIOP[]', ['\\', 1.5]],
    [['Caps', 1.75], ...'ASDFGHJKL;\'', ['Enter', 2.25]],
    [['Shift', 2.25], ...'ZXCVBNM,./', ['Shift', 2.75]],
    [['Ctrl', 1.25], ['Win', 1.25], ['Alt', 1.25], ['', 6.25], ['Alt', 1.25], ['Fn', 1.25], ['Menu', 1.25], ['Ctrl', 1.25]]
  ];
  rows.forEach((row, index) => {
    let column = 0;
    for (const item of row) {
      const [label, width] = Array.isArray(item) ? item : [item, 1];
      key(label, column, index, width);
      column += width;
    }
  });
  [['Prt', 'Scr', 'Pause'], ['Ins', 'Home', 'PgUp'], ['Del', 'End', 'PgDn']].forEach((row, r) => {
    row.forEach((label, c) => key(label, 15.25 + c, r));
  });
  key('↑', 16.25, 4);
  ['←', '↓', '→'].forEach((label, c) => key(label, 15.25 + c, 5));
  [['Num', '/', '*', '−'], ['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3']].forEach((row, r) => {
    row.forEach((label, c) => key(label, 18.68 + c * 0.82, r + 1, 0.82));
  });
  key('+', 21.14, 2, 0.82, 2);
  key('Enter', 21.14, 4, 0.82, 2);
  key('0', 18.68, 5, 1.64);
  key('.', 20.32, 5, 0.82);
  const labelTexture = new THREE.CanvasTexture(legends);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  labelTexture.anisotropy = 4;
  const labelLayer = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.219),
    new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false })
  );
  labelLayer.rotation.x = -Math.PI / 2;
  labelLayer.position.y = 0.027;
  keyboard.add(labelLayer);

  const mouse = new THREE.Group();
  mouse.position.set(0.18, 0.924, -2.42);
  scene.add(mouse);
  const shell = new THREE.MeshStandardMaterial({ color: '#303135', roughness: 0.73 });
  const shape = new THREE.SphereGeometry(1, 40, 24);
  const points = shape.attributes.position;
  for (let i = 0; i < points.count; i += 1) {
    const x = points.getX(i);
    const y = points.getY(i);
    const z = points.getZ(i);
    points.setXYZ(i, x * 0.050 * (1 + z * 0.12) + 0.01,
      0.012 + Math.max(-0.18, y) * (0.058 + z * 0.014 - x * 0.009),
      z * 0.089);
  }
  shape.computeVertexNormals();
  const body = new THREE.Mesh(shape, shell);
  body.castShadow = true;
  body.receiveShadow = true;
  mouse.add(body);
  const thumb = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), shell);
  thumb.scale.set(0.028, 0.012, 0.062);
  thumb.position.set(-0.033, 0.014, 0.009);
  thumb.castShadow = true;
  mouse.add(thumb);
  box('#161719', [0.015, 0.009, 0.029], [0.009, 0.052, -0.044], mouse, 0.004);
  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.009, 16),
    new THREE.MeshStandardMaterial({ color: '#242529', roughness: 0.95, flatShading: true })
  );
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(0.009, 0.055, -0.045);
  mouse.add(wheel);
  const seam = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.009, 0.021, -0.088),
    new THREE.Vector3(0.009, 0.042, -0.073),
    new THREE.Vector3(0.009, 0.053, -0.058)
  ]);
  mouse.add(new THREE.Mesh(new THREE.TubeGeometry(seam, 12, 0.0008, 5), new THREE.MeshBasicMaterial({ color: '#18191b' })));
}
