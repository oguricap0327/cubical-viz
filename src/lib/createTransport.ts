import * as THREE from 'three';
import { createTextSprite, createEndpoint } from './textSprite';

export function createTransport(): {
  group: THREE.Group;
  animate: (time: number) => void;
} {
  const group = new THREE.Group();

  const baseLeft = new THREE.Vector3(-1.3, -0.5, 0);
  const baseRight = new THREE.Vector3(1.3, -0.5, 0);

  const baseCurve = new THREE.CatmullRomCurve3([
    baseLeft,
    new THREE.Vector3(-0.6, -0.3, 0.2),
    new THREE.Vector3(0.0, -0.4, 0.0),
    new THREE.Vector3(0.6, -0.3, -0.15),
    baseRight,
  ]);

  const basePts = baseCurve.getPoints(100);
  const baseGeo = new THREE.BufferGeometry().setFromPoints(basePts);
  const baseCol = new Float32Array(basePts.length * 3);
  for (let i = 0; i < basePts.length; i++) {
    const t = i / (basePts.length - 1);
    baseCol[i * 3] = 0.2 + t * 0.8;
    baseCol[i * 3 + 1] = 0.4;
    baseCol[i * 3 + 2] = 1.0 - t * 0.7;
  }
  baseGeo.setAttribute('color', new THREE.BufferAttribute(baseCol, 3));
  group.add(new THREE.Line(baseGeo, new THREE.LineBasicMaterial({ vertexColors: true })));

  group.add(createEndpoint(baseLeft, 0x3366ff, 0x1133aa, 0.07));
  group.add(createEndpoint(baseRight, 0xff4433, 0xaa1100, 0.07));

  for (const [text, color, pos] of [
    ['x', '#6699ff', [baseLeft.x - .22, baseLeft.y - .15, 0]],
    ['y', '#ff6655', [baseRight.x + .22, baseRight.y - .15, 0]],
    ['p', '#aaaaff', [0, -.75, 0]],
  ] as const) {
    const l = createTextSprite(text, color, text === 'p' ? 55 : 65);
    l.position.set(pos[0], pos[1], pos[2]);
    l.scale.set(0.32, 0.32, 0.32);
    group.add(l);
  }

  const fiberCount = 9;
  const fiberHeight = 1.2;
  const fiberCurves: THREE.CatmullRomCurve3[] = [];

  for (let fi = 0; fi < fiberCount; fi++) {
    const t = fi / (fiberCount - 1);
    const base = baseCurve.getPointAt(t);
    const width = 0.15 + 0.1 * Math.sin(t * Math.PI);
    const h = fiberHeight * (0.8 + 0.4 * Math.sin(t * Math.PI * 0.7 + 0.5));

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(base.x - width, base.y, base.z),
      new THREE.Vector3(base.x - width * 0.5, base.y + h * 0.6, base.z),
      new THREE.Vector3(base.x, base.y + h, base.z),
      new THREE.Vector3(base.x + width * 0.5, base.y + h * 0.6, base.z),
      new THREE.Vector3(base.x + width, base.y, base.z),
    ]);
    fiberCurves.push(curve);

    const hue = 0.55 - t * 0.35;
    const col = new THREE.Color().setHSL(hue, 0.7, 0.55);
    const opacity = fi === 0 || fi === fiberCount - 1 ? 0.9 : 0.3;
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),
      new THREE.LineBasicMaterial({ color: col, transparent: true, opacity }),
    ));
  }

  const bxL = createTextSprite('B(x)', '#55ccdd', 45);
  bxL.position.set(baseLeft.x, baseLeft.y + fiberHeight + 0.2, 0);
  bxL.scale.set(0.35, 0.35, 0.35);
  group.add(bxL);

  const byL = createTextSprite('B(y)', '#ee9944', 45);
  byL.position.set(baseRight.x, baseRight.y + fiberHeight * 0.9 + 0.2, 0);
  byL.scale.set(0.35, 0.35, 0.35);
  group.add(byL);

  const liftPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const fi = t * (fiberCount - 1);
    const lo = Math.floor(fi);
    const hi = Math.min(lo + 1, fiberCount - 1);
    const f = fi - lo;
    liftPts.push(fiberCurves[lo].getPointAt(0.5).clone().lerp(fiberCurves[hi].getPointAt(0.5), f));
  }
  const liftGeo = new THREE.BufferGeometry().setFromPoints(liftPts);
  const liftCol = new Float32Array(liftPts.length * 3);
  for (let i = 0; i < liftPts.length; i++) {
    const t = i / (liftPts.length - 1);
    liftCol[i * 3] = 1.0;
    liftCol[i * 3 + 1] = 0.85 - t * 0.3;
    liftCol[i * 3 + 2] = 0.2 + t * 0.3;
  }
  liftGeo.setAttribute('color', new THREE.BufferAttribute(liftCol, 3));
  const liftLine = new THREE.Line(
    liftGeo,
    new THREE.LineDashedMaterial({ vertexColors: true, dashSize: 0.06, gapSize: 0.03 }),
  );
  liftLine.computeLineDistances();
  group.add(liftLine);

  const tLabel = createTextSprite('transport', '#ffdd44', 38);
  tLabel.position.set(0, fiberHeight * 0.5 + 0.15, 0);
  tLabel.scale.set(0.45, 0.45, 0.45);
  group.add(tLabel);

  const element = createEndpoint(new THREE.Vector3(0, 0, 0), 0xffdd00, 0xbbaa00, 0.06);
  group.add(element);

  const ringGeo = new THREE.RingGeometry(0.08, 0.11, 32);
  const ring = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({ color: 0xffee66, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  );
  group.add(ring);

  const baseMarker = createEndpoint(new THREE.Vector3(0, 0, 0), 0xffcc00, 0xaa8800, 0.04);
  group.add(baseMarker);

  const connGeo = new THREE.BufferGeometry();
  connGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const connLine = new THREE.Line(
    connGeo,
    new THREE.LineDashedMaterial({ color: 0x888888, dashSize: 0.05, gapSize: 0.04 }),
  );
  group.add(connLine);

  function animate(time: number) {
    const t = (Math.sin(time * 0.5) + 1) / 2;
    const basePos = baseCurve.getPointAt(t);
    baseMarker.position.copy(basePos);

    const fi = t * (fiberCount - 1);
    const lo = Math.floor(fi);
    const hi = Math.min(lo + 1, fiberCount - 1);
    const f = fi - lo;
    const elemPos = fiberCurves[lo].getPointAt(0.5).clone().lerp(fiberCurves[hi].getPointAt(0.5), f);

    element.position.copy(elemPos);
    ring.position.copy(elemPos);
    ring.rotation.z = time * 0.5;

    const attr = connLine.geometry.attributes.position as THREE.BufferAttribute;
    attr.setXYZ(0, basePos.x, basePos.y, basePos.z);
    attr.setXYZ(1, elemPos.x, elemPos.y, elemPos.z);
    attr.needsUpdate = true;
    connLine.computeLineDistances();
  }

  return { group, animate };
}
