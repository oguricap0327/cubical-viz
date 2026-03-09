import * as THREE from 'three';
import { createTextSprite, createEndpoint } from './textSprite';

export function createComposition(): {
  group: THREE.Group;
  animate: (time: number) => void;
} {
  const group = new THREE.Group();

  const A = new THREE.Vector3(-1.4, 0, 0);
  const B = new THREE.Vector3(0, 0, 0);
  const C = new THREE.Vector3(1.4, 0, 0);

  const curveP = new THREE.CatmullRomCurve3([
    A,
    new THREE.Vector3(-1.0, 0.7, 0.2),
    new THREE.Vector3(-0.5, 0.9, 0.0),
    new THREE.Vector3(-0.2, 0.5, -0.1),
    B,
  ]);

  const curveQ = new THREE.CatmullRomCurve3([
    B,
    new THREE.Vector3(0.2, 0.6, 0.15),
    new THREE.Vector3(0.6, 1.0, 0.0),
    new THREE.Vector3(1.0, 0.5, -0.1),
    C,
  ]);

  const curveComposed = new THREE.CatmullRomCurve3([
    A,
    new THREE.Vector3(-0.8, -0.5, 0.15),
    new THREE.Vector3(-0.2, -0.8, 0.0),
    new THREE.Vector3(0.3, -0.7, -0.1),
    new THREE.Vector3(0.9, -0.4, 0.1),
    C,
  ]);

  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curveP.getPoints(80)),
    new THREE.LineBasicMaterial({ color: 0x00ddaa }),
  ));
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curveQ.getPoints(80)),
    new THREE.LineBasicMaterial({ color: 0xdd44aa }),
  ));

  const composedLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curveComposed.getPoints(120)),
    new THREE.LineDashedMaterial({ color: 0xffcc33, dashSize: 0.08, gapSize: 0.04 }),
  );
  composedLine.computeLineDistances();
  group.add(composedLine);

  for (const [text, color, pos] of [
    ['p', '#00eebb', [-.7, 1.1, 0]],
    ['q', '#ff66bb', [.7, 1.1, 0]],
    ['p∙q', '#ffcc33', [0, -1.1, 0]],
  ] as const) {
    const l = createTextSprite(text, color, 60);
    l.position.set(pos[0], pos[1], pos[2]);
    l.scale.set(0.38, 0.38, 0.38);
    group.add(l);
  }

  group.add(createEndpoint(A, 0x3366ff, 0x1133aa, 0.08));
  group.add(createEndpoint(B, 0x44cc88, 0x228855, 0.08));
  group.add(createEndpoint(C, 0xff4433, 0xaa1100, 0.08));

  for (const [text, color, v] of [
    ['A', '#6699ff', [A.x - .22, A.y - .22, 0]],
    ['B', '#66ddaa', [B.x, B.y + .28, 0]],
    ['C', '#ff6655', [C.x + .22, C.y - .22, 0]],
  ] as const) {
    const l = createTextSprite(text, color);
    l.position.set(v[0], v[1], v[2]);
    group.add(l);
  }

  const domainY = -1.5;
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([A.x, domainY, 0, C.x, domainY, 0]), 3));
  dGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array([0.2, 0.4, 1.0, 1.0, 0.3, 0.2]), 3));
  group.add(new THREE.Line(dGeo, new THREE.LineBasicMaterial({ vertexColors: true })));

  group.add(createEndpoint(new THREE.Vector3(A.x, domainY, 0), 0x3366ff, 0x1133aa, 0.035));
  group.add(createEndpoint(new THREE.Vector3(B.x, domainY, 0), 0x44cc88, 0x228855, 0.035));
  group.add(createEndpoint(new THREE.Vector3(C.x, domainY, 0), 0xff4433, 0xaa1100, 0.035));

  const halfLabel = createTextSprite('½', '#aaaacc', 45);
  halfLabel.position.set(B.x, domainY - 0.22, 0);
  halfLabel.scale.set(0.28, 0.28, 0.28);
  group.add(halfLabel);

  const moverUpper = createEndpoint(new THREE.Vector3(0, 0, 0), 0xffff00, 0xbbaa00, 0.055);
  group.add(moverUpper);
  const moverLower = createEndpoint(new THREE.Vector3(0, 0, 0), 0xffcc33, 0xaa8822, 0.055);
  group.add(moverLower);
  const domainMarker = createEndpoint(new THREE.Vector3(0, domainY, 0), 0xffcc00, 0xaa8800, 0.035);
  group.add(domainMarker);

  function animate(time: number) {
    const t = (Math.sin(time * 0.6) + 1) / 2;
    moverUpper.position.copy(t < 0.5 ? curveP.getPointAt(t * 2) : curveQ.getPointAt((t - 0.5) * 2));
    moverLower.position.copy(curveComposed.getPointAt(t));
    domainMarker.position.set(A.x + t * (C.x - A.x), domainY, 0);
  }

  return { group, animate };
}
