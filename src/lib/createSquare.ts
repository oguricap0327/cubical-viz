import * as THREE from 'three';
import { createTextSprite, createEndpoint } from './textSprite';

/**
 * Visualizes the **square** I × I in cubical type theory.
 *
 * The square is the product of two intervals — the fundamental 2-cell.
 * Edges are colored by dimension: i (blue→red) runs left→right,
 * j (green gradient) runs bottom→top. A probe point sweeps the interior
 * to show how both dimensions parameterize the surface.
 */
export function createSquare(): {
  group: THREE.Group;
  animate: (time: number) => void;
} {
  const group = new THREE.Group();
  const S = 1.2; // edge length

  const c00 = new THREE.Vector3(-S / 2, -S / 2, 0);
  const c10 = new THREE.Vector3(S / 2, -S / 2, 0);
  const c01 = new THREE.Vector3(-S / 2, S / 2, 0);
  const c11 = new THREE.Vector3(S / 2, S / 2, 0);

  // --- Filled face with vertex-color gradient ---
  const planeGeo = new THREE.PlaneGeometry(S, S, 40, 40);
  const count = planeGeo.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const x = planeGeo.attributes.position.getX(i) / S + 0.5;
    const y = planeGeo.attributes.position.getY(i) / S + 0.5;
    colors[i * 3] = x;
    colors[i * 3 + 1] = y * 0.4 + 0.1;
    colors[i * 3 + 2] = 1.0 - x;
  }
  planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  group.add(
    new THREE.Mesh(
      planeGeo,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
        roughness: 0.5,
        metalness: 0.2,
      }),
    ),
  );

  // --- Edges colored by dimension ---
  const iEdgeMat = new THREE.LineBasicMaterial({ vertexColors: true });

  function makeHEdge(y: number) {
    const geo = new THREE.BufferGeometry();
    const segs = 60;
    const pos = new Float32Array((segs + 1) * 3);
    const col = new Float32Array((segs + 1) * 3);
    for (let k = 0; k <= segs; k++) {
      const t = k / segs;
      pos[k * 3] = -S / 2 + t * S;
      pos[k * 3 + 1] = y;
      pos[k * 3 + 2] = 0;
      col[k * 3] = 0.2 + t * 0.8;
      col[k * 3 + 1] = 0.4 - t * 0.1;
      col[k * 3 + 2] = 1.0 - t * 0.8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Line(geo, iEdgeMat);
  }
  group.add(makeHEdge(-S / 2));
  group.add(makeHEdge(S / 2));

  function makeVEdge(x: number) {
    const geo = new THREE.BufferGeometry();
    const segs = 60;
    const pos = new Float32Array((segs + 1) * 3);
    const col = new Float32Array((segs + 1) * 3);
    for (let k = 0; k <= segs; k++) {
      const t = k / segs;
      pos[k * 3] = x;
      pos[k * 3 + 1] = -S / 2 + t * S;
      pos[k * 3 + 2] = 0;
      col[k * 3] = 0.1;
      col[k * 3 + 1] = 0.3 + t * 0.7;
      col[k * 3 + 2] = 0.2 + t * 0.3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true }));
  }
  group.add(makeVEdge(-S / 2));
  group.add(makeVEdge(S / 2));

  // --- Corner spheres ---
  const cornerData: [THREE.Vector3, number, number][] = [
    [c00, 0x3344aa, 0x112266],
    [c10, 0xcc3322, 0x881100],
    [c01, 0x44aa44, 0x226622],
    [c11, 0xeeaa22, 0xaa7711],
  ];
  for (const [pos, color, emissive] of cornerData) {
    group.add(createEndpoint(pos, color, emissive, 0.06));
  }

  // --- Corner labels ---
  const labels: [THREE.Vector3, string, string][] = [
    [c00, '(i0,i0)', '#6677cc'],
    [c10, '(i1,i0)', '#ee6655'],
    [c01, '(i0,i1)', '#66cc66'],
    [c11, '(i1,i1)', '#eebb44'],
  ];
  for (const [pos, text, color] of labels) {
    const lbl = createTextSprite(text, color, 42);
    lbl.scale.set(0.5, 0.5, 0.5);
    const ox = pos.x < 0 ? -0.35 : 0.35;
    const oy = pos.y < 0 ? -0.18 : 0.18;
    lbl.position.set(pos.x + ox, pos.y + oy, 0);
    group.add(lbl);
  }

  // --- Dimension labels ---
  const dimI = createTextSprite('i →', '#aaaaff', 50);
  dimI.position.set(0, -S / 2 - 0.35, 0);
  dimI.scale.set(0.35, 0.35, 0.35);
  group.add(dimI);

  const dimJ = createTextSprite('j ↑', '#77dd77', 50);
  dimJ.position.set(-S / 2 - 0.35, 0, 0);
  dimJ.scale.set(0.35, 0.35, 0.35);
  group.add(dimJ);

  // --- Animated slice + probe ---
  const sliceGeo = new THREE.BufferGeometry();
  sliceGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array([0, -S / 2, 0.01, 0, S / 2, 0.01]), 3),
  );
  const sliceLine = new THREE.Line(
    sliceGeo,
    new THREE.LineBasicMaterial({ color: 0xffff66, transparent: true, opacity: 0.8 }),
  );
  group.add(sliceLine);

  const probe = createEndpoint(new THREE.Vector3(0, 0, 0.02), 0xffff00, 0xaaaa00, 0.04);
  group.add(probe);

  function animate(time: number) {
    const ti = (Math.sin(time * 0.6) + 1) / 2;
    const tj = (Math.sin(time * 0.4 + 1) + 1) / 2;
    const x = -S / 2 + ti * S;
    const y = -S / 2 + tj * S;

    const pos = sliceLine.geometry.attributes.position as THREE.BufferAttribute;
    pos.setX(0, x);
    pos.setX(1, x);
    pos.needsUpdate = true;

    probe.position.set(x, y, 0.02);
  }

  return { group, animate };
}
