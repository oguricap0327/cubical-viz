import * as THREE from 'three';
import { createTextSprite, createEndpoint } from './textSprite';

/**
 * Visualizes a **path type** in cubical type theory.
 *
 * A path  p : A ≡ B  is a function  I → Type  where p(i0) = A and p(i1) = B.
 * Two distinct paths between the same endpoints show that a path type can
 * have many inhabitants. A moving point on each curve demonstrates the
 * parameterization by the interval I.
 */
export function createPath(): {
  group: THREE.Group;
  animate: (time: number) => void;
} {
  const group = new THREE.Group();

  const A = new THREE.Vector3(-1.0, 0, 0);
  const B = new THREE.Vector3(1.0, 0, 0);

  // --- Two curved paths between A and B ---
  const curve1 = new THREE.CatmullRomCurve3([
    A,
    new THREE.Vector3(-0.5, 0.9, 0.3),
    new THREE.Vector3(0.0, 1.1, 0.0),
    new THREE.Vector3(0.5, 0.7, -0.2),
    B,
  ]);
  const curve2 = new THREE.CatmullRomCurve3([
    A,
    new THREE.Vector3(-0.3, -0.6, 0.4),
    new THREE.Vector3(0.2, -0.9, 0.0),
    new THREE.Vector3(0.6, -0.4, -0.3),
    B,
  ]);

  // Draw path 1 (green-cyan gradient)
  const pts1 = curve1.getPoints(120);
  const geom1 = new THREE.BufferGeometry().setFromPoints(pts1);
  const colors1 = new Float32Array(pts1.length * 3);
  for (let i = 0; i < pts1.length; i++) {
    const t = i / (pts1.length - 1);
    colors1[i * 3] = t * 0.2;
    colors1[i * 3 + 1] = 0.9 - t * 0.3;
    colors1[i * 3 + 2] = 0.7 + t * 0.3;
  }
  geom1.setAttribute('color', new THREE.BufferAttribute(colors1, 3));
  group.add(new THREE.Line(geom1, new THREE.LineBasicMaterial({ vertexColors: true })));

  // Draw path 2 (magenta-pink gradient)
  const pts2 = curve2.getPoints(120);
  const geom2 = new THREE.BufferGeometry().setFromPoints(pts2);
  const colors2 = new Float32Array(pts2.length * 3);
  for (let i = 0; i < pts2.length; i++) {
    const t = i / (pts2.length - 1);
    colors2[i * 3] = 0.9 + t * 0.1;
    colors2[i * 3 + 1] = 0.3 - t * 0.1;
    colors2[i * 3 + 2] = 0.6 + t * 0.2;
  }
  geom2.setAttribute('color', new THREE.BufferAttribute(colors2, 3));
  group.add(new THREE.Line(geom2, new THREE.LineBasicMaterial({ vertexColors: true })));

  // Path labels
  const p1Label = createTextSprite('p', '#00eebb', 60);
  p1Label.position.set(0, 1.3, 0);
  p1Label.scale.set(0.35, 0.35, 0.35);
  group.add(p1Label);

  const p2Label = createTextSprite('q', '#ff66aa', 60);
  p2Label.position.set(0.2, -1.1, 0);
  p2Label.scale.set(0.35, 0.35, 0.35);
  group.add(p2Label);

  // --- Endpoint spheres and labels ---
  group.add(createEndpoint(A, 0x3366ff, 0x1133aa, 0.08));
  group.add(createEndpoint(B, 0xff4433, 0xaa1100, 0.08));

  const labelA = createTextSprite('A', '#6699ff');
  labelA.position.set(A.x - 0.2, A.y, A.z);
  group.add(labelA);

  const labelB = createTextSprite('B', '#ff6655');
  labelB.position.set(B.x + 0.2, B.y, B.z);
  group.add(labelB);

  // --- Domain interval I (shown below the paths) ---
  const domainY = -1.6;
  const domainGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array([A.x, domainY, 0, B.x, domainY, 0]);
  const dCol = new Float32Array([0.2, 0.4, 1.0, 1.0, 0.3, 0.2]);
  domainGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  domainGeo.setAttribute('color', new THREE.BufferAttribute(dCol, 3));
  group.add(new THREE.Line(domainGeo, new THREE.LineBasicMaterial({ vertexColors: true })));

  group.add(createEndpoint(new THREE.Vector3(A.x, domainY, 0), 0x3366ff, 0x1133aa, 0.04));
  group.add(createEndpoint(new THREE.Vector3(B.x, domainY, 0), 0xff4433, 0xaa1100, 0.04));

  const i0Label = createTextSprite('i0', '#6699ff', 50);
  i0Label.position.set(A.x, domainY - 0.22, 0);
  i0Label.scale.set(0.3, 0.3, 0.3);
  group.add(i0Label);

  const i1Label = createTextSprite('i1', '#ff6655', 50);
  i1Label.position.set(B.x, domainY - 0.22, 0);
  i1Label.scale.set(0.3, 0.3, 0.3);
  group.add(i1Label);

  const iLabel = createTextSprite('I', '#8888cc', 70);
  iLabel.position.set(0, domainY - 0.28, 0);
  iLabel.scale.set(0.35, 0.35, 0.35);
  group.add(iLabel);

  // --- Animated elements ---
  const movingGeo = new THREE.SphereGeometry(0.055, 32, 32);

  const mover1 = new THREE.Mesh(
    movingGeo,
    new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00aa88, roughness: 0.2, metalness: 0.8 }),
  );
  group.add(mover1);

  const mover2 = new THREE.Mesh(
    movingGeo,
    new THREE.MeshStandardMaterial({ color: 0xff77bb, emissive: 0xaa4477, roughness: 0.2, metalness: 0.8 }),
  );
  group.add(mover2);

  const domainMarker = createEndpoint(new THREE.Vector3(0, domainY, 0), 0xffcc00, 0xaa8800, 0.04);
  group.add(domainMarker);

  // Dashed connector from domain to path
  const dashGeo = new THREE.BufferGeometry();
  dashGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const dashLine = new THREE.Line(
    dashGeo,
    new THREE.LineDashedMaterial({ color: 0x666688, dashSize: 0.06, gapSize: 0.04 }),
  );
  group.add(dashLine);

  function animate(time: number) {
    const t = (Math.sin(time * 0.7) + 1) / 2;

    mover1.position.copy(curve1.getPointAt(t));
    mover2.position.copy(curve2.getPointAt(t));

    const dx = A.x + t * (B.x - A.x);
    domainMarker.position.set(dx, domainY, 0);

    const attr = dashLine.geometry.attributes.position as THREE.BufferAttribute;
    attr.setXYZ(0, dx, domainY, 0);
    const pos1 = curve1.getPointAt(t);
    attr.setXYZ(1, pos1.x, pos1.y, pos1.z);
    attr.needsUpdate = true;
    dashLine.computeLineDistances();
  }

  return { group, animate };
}
