import * as THREE from 'three';
import { createTextSprite, createEndpoint } from './textSprite';

export function createCube(): {
  group: THREE.Group;
  animate: (time: number) => void;
} {
  const group = new THREE.Group();
  const H = 0.6;

  type Bit = 0 | 1;
  const corners: Record<string, THREE.Vector3> = {};
  const bits: Bit[] = [0, 1];

  for (const i of bits)
    for (const j of bits)
      for (const k of bits) {
        corners[`${i}${j}${k}`] = new THREE.Vector3(
          -H + i * 2 * H,
          -H + j * 2 * H,
          -H + k * 2 * H,
        );
      }

  const iC1 = new THREE.Color(0x3366ff);
  const iC2 = new THREE.Color(0xff4433);
  const jC1 = new THREE.Color(0x22aa44);
  const jC2 = new THREE.Color(0x88ff66);
  const kC1 = new THREE.Color(0x8833cc);
  const kC2 = new THREE.Color(0xdd77ff);

  function addEdge(from: THREE.Vector3, to: THREE.Vector3, c1: THREE.Color, c2: THREE.Color) {
    const geo = new THREE.BufferGeometry();
    const segs = 30;
    const pos = new Float32Array((segs + 1) * 3);
    const col = new Float32Array((segs + 1) * 3);
    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const p = from.clone().lerp(to, t);
      pos[s * 3] = p.x;
      pos[s * 3 + 1] = p.y;
      pos[s * 3 + 2] = p.z;
      const c = c1.clone().lerp(c2, t);
      col[s * 3] = c.r;
      col[s * 3 + 1] = c.g;
      col[s * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    group.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true })));
  }

  for (const j of bits)
    for (const k of bits)
      addEdge(corners[`0${j}${k}`], corners[`1${j}${k}`], iC1, iC2);
  for (const i of bits)
    for (const k of bits)
      addEdge(corners[`${i}0${k}`], corners[`${i}1${k}`], jC1, jC2);
  for (const i of bits)
    for (const j of bits)
      addEdge(corners[`${i}${j}0`], corners[`${i}${j}1`], kC1, kC2);

  const faceMat = new THREE.MeshStandardMaterial({
    color: 0x445577,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    roughness: 0.8,
    depthWrite: false,
  });

  function addFace(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, c.x, c.y, c.z, b.x, b.y, b.z, d.x, d.y, d.z]),
        3,
      ),
    );
    geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo, faceMat));
  }

  addFace(corners['000'], corners['010'], corners['001'], corners['011']);
  addFace(corners['100'], corners['110'], corners['101'], corners['111']);
  addFace(corners['000'], corners['100'], corners['001'], corners['101']);
  addFace(corners['010'], corners['110'], corners['011'], corners['111']);
  addFace(corners['000'], corners['100'], corners['010'], corners['110']);
  addFace(corners['001'], corners['101'], corners['011'], corners['111']);

  const cColors: Record<string, [number, number, string]> = {
    '000': [0x3344aa, 0x112266, '#6677cc'],
    '100': [0xcc3322, 0x881100, '#ee6655'],
    '010': [0x22aa44, 0x116622, '#66cc66'],
    '001': [0x8833cc, 0x551188, '#aa66dd'],
    '110': [0xeeaa22, 0xaa7711, '#eebb44'],
    '101': [0xcc44cc, 0x882288, '#dd77dd'],
    '011': [0x44ccaa, 0x228866, '#66ddbb'],
    '111': [0xeeeeee, 0xaaaaaa, '#eeeeee'],
  };

  for (const [key, pos] of Object.entries(corners)) {
    const [c, e, lc] = cColors[key];
    group.add(createEndpoint(pos, c, e, 0.04));
    const iv = key[0] === '0' ? 'i0' : 'i1';
    const jv = key[1] === '0' ? 'j0' : 'j1';
    const kv = key[2] === '0' ? 'k0' : 'k1';
    const lbl = createTextSprite(`${iv},${jv},${kv}`, lc, 30);
    lbl.scale.set(0.35, 0.35, 0.35);
    const dir = pos.clone().normalize().multiplyScalar(0.25);
    lbl.position.copy(pos).add(dir);
    group.add(lbl);
  }

  for (const [text, color, pos] of [
    ['i →', '#6699ff', new THREE.Vector3(0, -H - 0.35, -H - 0.15)] as const,
    ['j ↑', '#66dd66', new THREE.Vector3(-H - 0.35, 0, -H - 0.15)] as const,
    ['k ↗', '#bb77ee', new THREE.Vector3(-H - 0.35, -H - 0.2, 0)] as const,
  ]) {
    const lbl = createTextSprite(text, color, 50);
    lbl.scale.set(0.32, 0.32, 0.32);
    lbl.position.set(pos.x, pos.y, pos.z);
    group.add(lbl);
  }

  const probe = createEndpoint(new THREE.Vector3(0, 0, 0), 0xffff00, 0xccaa00, 0.04);
  group.add(probe);

  const trailMax = 200;
  const trailPositions = new Float32Array(trailMax * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeo.setDrawRange(0, 0);
  const trail = new THREE.Line(
    trailGeo,
    new THREE.LineBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.5 }),
  );
  group.add(trail);
  let trailIdx = 0;

  function animate(time: number) {
    const ti = (Math.sin(time * 0.5) + 1) / 2;
    const tj = (Math.sin(time * 0.37 + 2) + 1) / 2;
    const tk = (Math.sin(time * 0.28 + 4) + 1) / 2;
    const x = -H + ti * 2 * H;
    const y = -H + tj * 2 * H;
    const z = -H + tk * 2 * H;

    probe.position.set(x, y, z);

    const attr = trail.geometry.attributes.position as THREE.BufferAttribute;
    attr.setXYZ(trailIdx % trailMax, x, y, z);
    attr.needsUpdate = true;
    trailIdx++;
    trail.geometry.setDrawRange(0, Math.min(trailIdx, trailMax));
  }

  return { group, animate };
}
