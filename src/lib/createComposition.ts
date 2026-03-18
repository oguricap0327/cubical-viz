import * as THREE from 'three';
import { createTextSprite, createEndpoint } from './textSprite';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeLine(pts: THREE.Vector3[], color: number, opacity = 1): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
  return new THREE.Line(geo, mat);
}

function makeDashed(pts: THREE.Vector3[], color: number, dash = 0.07, gap = 0.04, opacity = 1): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineDashedMaterial({ color, dashSize: dash, gapSize: gap, transparent: opacity < 1, opacity });
  const l = new THREE.Line(geo, mat);
  l.computeLineDistances();
  return l;
}

function makeFace(
  a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3,
  color: number, opacity: number,
): THREE.Mesh {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    a.x, a.y, a.z,  b.x, b.y, b.z,  c.x, c.y, c.z,
    a.x, a.y, a.z,  c.x, c.y, c.z,  d.x, d.y, d.z,
  ]), 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false,
  }));
}

function setFaceCorners(
  mesh: THREE.Mesh,
  a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3,
) {
  const attr = mesh.geometry.attributes.position as THREE.BufferAttribute;
  const v = [a, b, c, a, c, d];
  for (let i = 0; i < 6; i++) {
    attr.setXYZ(i, v[i].x, v[i].y, v[i].z);
  }
  attr.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

function setLinePoints(line: THREE.Line, pts: THREE.Vector3[]) {
  const attr = line.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pts.length; i++) attr.setXYZ(i, pts[i].x, pts[i].y, pts[i].z);
  attr.needsUpdate = true;
  if (line.material instanceof THREE.LineDashedMaterial) line.computeLineDistances();
}

function label(text: string, color: string, x: number, y: number, z = 0, fs = 64, sc = 0.33): THREE.Sprite {
  const s = createTextSprite(text, color, fs);
  s.position.set(x, y, z);
  s.scale.setScalar(sc);
  return s;
}

function arrow(dir: THREE.Vector3, origin: THREE.Vector3, len: number, color: number) {
  return new THREE.ArrowHelper(dir.normalize(), origin, len, color, 0.14, 0.08);
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene 1 — The Open Box (full comp)
// ─────────────────────────────────────────────────────────────────────────────

function makeScene1(): { group: THREE.Group; animate: (t: number) => void } {
  const g = new THREE.Group();
  const W = 2.2, H = 1.8;
  const HW = W / 2, HH = H / 2;

  const BL = new THREE.Vector3(-HW, -HH, 0);
  const BR = new THREE.Vector3( HW, -HH, 0);
  const TL = new THREE.Vector3(-HW,  HH, 0);
  const TR = new THREE.Vector3( HW,  HH, 0);

  // Filled faces
  const leftFace  = makeFace(BL, TL, TL, BL, 0x4488ff, 0.18);
  const rightFace = makeFace(BR, TR, TR, BR, 0xff8844, 0.18);
  const bottomFace = makeFace(BL, BR, BR, BL, 0x00ff88, 0.12);
  const interiorFace = makeFace(BL, BR, TR, TL, 0x8866ff, 0.0);
  const topFaceMesh = makeFace(TL, TR, TR, TL, 0xff3366, 0.0);
  g.add(leftFace, rightFace, bottomFace, interiorFace, topFaceMesh);

  // Edges
  g.add(makeLine([BL, BR], 0x00ff88));    // bottom (green)
  g.add(makeLine([BL, TL], 0x4488ff));    // left (blue)
  g.add(makeLine([BR, TR], 0xff8844));    // right (orange)
  const topDashed = makeDashed([TL, TR], 0xff3366);
  const topSolid = makeLine([TL, TR], 0xff3366, 0.0);
  const topSolidGeo = topSolid.geometry;
  topSolidGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  g.add(topDashed, topSolid);

  // Sweep line
  const sweepGeo = new THREE.BufferGeometry();
  sweepGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const sweepLine = new THREE.Line(sweepGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
  g.add(sweepLine);

  // Corner dots
  g.add(createEndpoint(BL, 0x00ff88, 0x007744, 0.065));
  g.add(createEndpoint(BR, 0xff8844, 0xaa4400, 0.065));
  g.add(createEndpoint(TL, 0x4488ff, 0x1133aa, 0.065));
  g.add(createEndpoint(TR, 0xff3366, 0xaa0033, 0.065));

  // Axis arrows
  const axisY = -HH - 0.38, axisX = -HW - 0.42;
  g.add(arrow(new THREE.Vector3(1,0,0), new THREE.Vector3(-HW-0.1, axisY, 0), W+0.3, 0xaaaaaa));
  g.add(arrow(new THREE.Vector3(0,1,0), new THREE.Vector3(axisX, -HH-0.1, 0), H+0.3, 0xaaaaaa));

  // Labels
  g.add(label('i', '#bbbbbb',  HW+0.35, axisY, 0, 52, 0.3));
  g.add(label('j', '#bbbbbb',  axisX, HH+0.35, 0, 52, 0.3));
  g.add(label('0', '#888888', -HW, axisY-0.2, 0, 40, 0.25));
  g.add(label('1', '#888888',  HW, axisY-0.2, 0, 40, 0.25));
  g.add(label('0', '#888888',  axisX-0.22, -HH, 0, 40, 0.25));
  g.add(label('1', '#888888',  axisX-0.22,  HH, 0, 40, 0.25));
  g.add(label('a : A(0)', '#00ffaa', 0, -HH-0.24, 0, 50, 0.38));
  g.add(label('u(i=0)',   '#6699ff', -HW-0.62, 0, 0, 50, 0.36));
  g.add(label('u(i=1)',   '#ffaa66',  HW+0.62, 0, 0, 50, 0.36));
  const topLbl = label('comp A φ u a : A(1)', '#ff6688', 0, HH+0.3, 0, 48, 0.5);
  (topLbl.material as THREE.SpriteMaterial).opacity = 0.3;
  g.add(topLbl);
  g.add(label('comp^A φ u a : A(1)', '#ccccff', 0, -HH-0.62, 0, 40, 0.52));

  // Wall travellers
  const travL = createEndpoint(BL.clone(), 0x88aaff, 0x3355aa, 0.05);
  const travR = createEndpoint(BR.clone(), 0xffaa66, 0xaa5500, 0.05);
  g.add(travL, travR);

  const CYCLE = 8.0;
  function animate(time: number) {
    const t = (time % CYCLE) / CYCLE;
    const wt = (Math.sin(time * 1.1) + 1) / 2;
    travL.position.set(-HW, -HH + wt * H, 0.01);
    travR.position.set( HW, -HH + wt * H, 0.01);

    if (t < 0.30) {
      (topDashed.material as THREE.LineDashedMaterial).opacity = 1;
      (topSolid.material as THREE.LineBasicMaterial).opacity = 0;
      (topFaceMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      (interiorFace.material as THREE.MeshBasicMaterial).opacity = 0;
      (sweepLine.material as THREE.LineBasicMaterial).opacity = 0;
      (topLbl.material as THREE.SpriteMaterial).opacity = 0.3;
    } else if (t < 0.72) {
      const fp = (t - 0.30) / 0.42;
      (topDashed.material as THREE.LineDashedMaterial).opacity = Math.max(0, 1 - fp * 2.5);
      (interiorFace.material as THREE.MeshBasicMaterial).opacity = fp * 0.20;
      const sx = -HW + fp * W;
      setLinePoints(sweepLine, [new THREE.Vector3(sx, -HH, 0.02), new THREE.Vector3(sx, HH, 0.02)]);
      (sweepLine.material as THREE.LineBasicMaterial).opacity = 0.75;
      setFaceCorners(topFaceMesh, TL, new THREE.Vector3(sx, HH, 0), new THREE.Vector3(sx, HH, 0), TL);
      (topFaceMesh.material as THREE.MeshBasicMaterial).opacity = fp * 0.22;
      const sa = topSolid.geometry.attributes.position as THREE.BufferAttribute;
      sa.setXYZ(0, -HW, HH, 0.01); sa.setXYZ(1, sx, HH, 0.01); sa.needsUpdate = true;
      (topSolid.material as THREE.LineBasicMaterial).opacity = fp;
      (topLbl.material as THREE.SpriteMaterial).opacity = 0.3 + fp * 0.7;
    } else {
      (topDashed.material as THREE.LineDashedMaterial).opacity = 0;
      (topSolid.material as THREE.LineBasicMaterial).opacity = 1;
      const sa = topSolid.geometry.attributes.position as THREE.BufferAttribute;
      sa.setXYZ(0, -HW, HH, 0.01); sa.setXYZ(1, HW, HH, 0.01); sa.needsUpdate = true;
      setFaceCorners(topFaceMesh, TL, TR, TR, TL);
      (topFaceMesh.material as THREE.MeshBasicMaterial).opacity = 0.18 + 0.06 * Math.sin(time * 3);
      (interiorFace.material as THREE.MeshBasicMaterial).opacity = 0.14;
      (sweepLine.material as THREE.LineBasicMaterial).opacity = 0;
      (topLbl.material as THREE.SpriteMaterial).opacity = 1;
    }
  }
  return { group: g, animate };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene 2 — Path Concatenation (hcomp)
// ─────────────────────────────────────────────────────────────────────────────

function makeScene2(): { group: THREE.Group; animate: (t: number) => void } {
  const g = new THREE.Group();

  // Three points in a base plane (y = -0.9)
  const BY = -0.9;
  const A = new THREE.Vector3(-1.5, BY, 0);
  const B = new THREE.Vector3( 0.0, BY, 0);
  const C = new THREE.Vector3( 1.5, BY, 0);
  const boxH = 1.5; // height of the lifted box

  // Paths p (A→B) and q (B→C) in base plane, curved in Z
  const curveP = new THREE.CatmullRomCurve3([A,
    new THREE.Vector3(-0.9, BY, 0.35),
    new THREE.Vector3(-0.3, BY, 0.25),
    B]);
  const curveQ = new THREE.CatmullRomCurve3([B,
    new THREE.Vector3(0.4,  BY, 0.3),
    new THREE.Vector3(0.9,  BY, 0.2),
    C]);

  // Top: concatenated path p·q at height j=1
  const AH = new THREE.Vector3(-1.5, BY + boxH, 0);
  const CH = new THREE.Vector3( 1.5, BY + boxH, 0);
  const curvePQ = new THREE.CatmullRomCurve3([AH,
    new THREE.Vector3(-0.7, BY + boxH, 0.3),
    new THREE.Vector3( 0.0, BY + boxH, 0.15),
    new THREE.Vector3( 0.7, BY + boxH, 0.2),
    CH]);

  // Left wall: constant path at A, j varies (vertical line)
  const leftWall = [A, new THREE.Vector3(-1.5, BY + boxH, 0)];
  // Right wall: q lifted at j=1 (constant path at C from q's endpoint)
  const rightWall = [C, new THREE.Vector3(1.5, BY + boxH, 0)];

  // Draw base paths
  g.add(makeLine(curveP.getPoints(60), 0x00ff88));
  g.add(makeLine(curveQ.getPoints(60), 0xff8844));

  // Left and right walls (solid)
  g.add(makeLine(leftWall, 0x4488ff));
  g.add(makeLine(rightWall, 0xff8844));

  // Top: concatenated path (dashed initially, becomes solid)
  const topDashed = makeDashed(curvePQ.getPoints(80), 0xffdd44);
  const topSolid  = makeLine(curvePQ.getPoints(80), 0xffdd44, 0.0);
  g.add(topDashed, topSolid);

  // Filler surface (hidden initially): a mesh sweeping between the paths
  // Approximate it as vertical lines (ribs) at sample points
  const RIBS = 18;
  const ribs: THREE.Line[] = [];
  for (let i = 0; i <= RIBS; i++) {
    const t = i / RIBS;
    // bottom rib: lerp along p (first half) and q (second half)
    let bPt: THREE.Vector3;
    if (t < 0.5) bPt = curveP.getPointAt(t * 2);
    else         bPt = curveQ.getPointAt((t - 0.5) * 2);
    const tPt = curvePQ.getPointAt(t);
    const rib = makeLine([bPt, tPt], 0xaa88ff, 0.0);
    ribs.push(rib);
    g.add(rib);
  }

  // Points
  g.add(createEndpoint(A, 0x00ff88, 0x007744, 0.07));
  g.add(createEndpoint(B, 0xffffff, 0x999999, 0.07));
  g.add(createEndpoint(C, 0xff8844, 0xaa4400, 0.07));
  g.add(createEndpoint(AH, 0x4488ff, 0x1133aa, 0.07));
  g.add(createEndpoint(CH, 0xffdd44, 0xaa8800, 0.07));

  g.add(label('a', '#00ff88',   A.x-0.2, A.y-0.2, 0));
  g.add(label('b', '#ffffff',   B.x,     B.y-0.22, 0));
  g.add(label('c', '#ff9955',   C.x+0.2, C.y-0.2, 0));
  g.add(label('p', '#00ff88',  -0.9, BY-0.25, 0.2, 56, 0.3));
  g.add(label('q', '#ff9955',   0.8, BY-0.25, 0.1, 56, 0.3));
  const pqLbl = label('p · q', '#ffdd44', 0, BY+boxH+0.25, 0, 56, 0.38);
  (pqLbl.material as THREE.SpriteMaterial).opacity = 0.25;
  g.add(pqLbl);
  g.add(label('hcomp B φ u a : B', '#ccccff', 0, BY-0.55, 0, 40, 0.50));
  g.add(label('j', '#bbbbbb', -1.9, BY + boxH*0.5, 0, 52, 0.3));
  const fillerLbl = label('filler (interior)', '#aa88ff', 0, BY + boxH*0.5, 0, 42, 0.42);
  (fillerLbl.material as THREE.SpriteMaterial).opacity = 0.0;
  g.add(fillerLbl);

  const CYCLE = 9.0;
  function animate(time: number) {
    const t = (time % CYCLE) / CYCLE;
    if (t < 0.35) {
      // show open box only
      (topDashed.material as THREE.LineDashedMaterial).opacity = 1;
      (topSolid.material as THREE.LineBasicMaterial).opacity = 0;
      ribs.forEach(r => (r.material as THREE.LineBasicMaterial).opacity = 0);
      (pqLbl.material as THREE.SpriteMaterial).opacity = 0.25;
      (fillerLbl.material as THREE.SpriteMaterial).opacity = 0;
    } else if (t < 0.62) {
      const fp = (t - 0.35) / 0.27;
      // fill top
      (topDashed.material as THREE.LineDashedMaterial).opacity = Math.max(0, 1 - fp * 3);
      (topSolid.material as THREE.LineBasicMaterial).opacity = fp;
      ribs.forEach(r => (r.material as THREE.LineBasicMaterial).opacity = 0);
      (pqLbl.material as THREE.SpriteMaterial).opacity = 0.25 + fp * 0.75;
      (fillerLbl.material as THREE.SpriteMaterial).opacity = 0;
    } else {
      // show filler
      const fp2 = Math.min(1, (t - 0.62) / 0.25);
      (topDashed.material as THREE.LineDashedMaterial).opacity = 0;
      (topSolid.material as THREE.LineBasicMaterial).opacity = 1;
      ribs.forEach(r => (r.material as THREE.LineBasicMaterial).opacity = fp2 * 0.45);
      (pqLbl.material as THREE.SpriteMaterial).opacity = 1;
      (fillerLbl.material as THREE.SpriteMaterial).opacity = fp2;
    }
  }
  return { group: g, animate };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene 3 — Transport (degenerate comp: φ = ⊥)
// ─────────────────────────────────────────────────────────────────────────────

function makeScene3(): { group: THREE.Group; animate: (t: number) => void } {
  const g = new THREE.Group();

  const L = new THREE.Vector3(-1.5, 0, 0);
  const R = new THREE.Vector3( 1.5, 0, 0);

  // Tube: ellipses at each cross-section
  const SLICES = 20;
  for (let si = 0; si <= SLICES; si++) {
    const tt = si / SLICES;
    const cx = L.x + tt * (R.x - L.x);
    const ry = 0.25 + 0.18 * Math.sin(tt * Math.PI);
    const rz = 0.15 + 0.10 * Math.sin(tt * Math.PI * 0.7 + 0.5);
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 32; k++) {
      const a = (k / 32) * Math.PI * 2;
      pts.push(new THREE.Vector3(cx, Math.sin(a) * ry, Math.cos(a) * rz));
    }
    const hue = 0.55 - tt * 0.35;
    const col = new THREE.Color().setHSL(hue, 0.7, 0.55);
    const opacity = (si === 0 || si === SLICES) ? 0.85 : 0.18;
    g.add(makeLine(pts, col.getHex(), opacity));
  }

  // No side walls (gray outlines only to show absence)
  const wallMat = new THREE.LineBasicMaterial({ color: 0x333355, transparent: true, opacity: 0.25 });
  const leftWall = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(L.x, -0.45, 0), new THREE.Vector3(L.x, 0.45, 0),
  ]), wallMat.clone());
  const rightWall = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(R.x, -0.45, 0), new THREE.Vector3(R.x, 0.45, 0),
  ]), wallMat.clone());
  g.add(leftWall, rightWall);

  // Spine of the tube (horizontal axis)
  g.add(makeLine([L, R], 0x444466, 0.35));

  // Labels
  g.add(createEndpoint(L, 0x3366ff, 0x1133aa, 0.07));
  g.add(createEndpoint(R, 0xff4433, 0xaa1100, 0.07));
  g.add(label('A(0)', '#6699ff', L.x-0.0, -0.62, 0, 52, 0.36));
  g.add(label('A(1)', '#ff7755', R.x-0.0, -0.62, 0, 52, 0.36));
  g.add(label('i', '#bbbbbb', R.x+0.3, 0, 0, 52, 0.3));
  g.add(label('φ = ⊥  (no side walls)', '#888888', 0, -0.85, 0, 40, 0.48));
  g.add(label('transp A a : A(1)', '#ccccff', 0, 0.85, 0, 44, 0.50));

  // Trail (path of the transported element)
  const trailPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const tt = i / 60;
    trailPts.push(new THREE.Vector3(L.x + tt*(R.x-L.x), 0.0, 0));
  }
  const trailLine = makeDashed(trailPts, 0xffdd44, 0.05, 0.04, 0.6);
  g.add(trailLine);

  // Travelling element
  const elem = createEndpoint(L.clone(), 0xffdd00, 0xbbaa00, 0.07);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.09, 0.12, 32),
    new THREE.MeshBasicMaterial({ color: 0xffee66, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  g.add(elem, ring);

  function animate(time: number) {
    const tt = (Math.sin(time * 0.55) + 1) / 2;
    const x = L.x + tt * (R.x - L.x);
    elem.position.set(x, 0, 0);
    ring.position.set(x, 0, 0.01);
    ring.rotation.z = time * 0.8;
  }
  return { group: g, animate };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene 4 — The Filler as Interior Surface
// ─────────────────────────────────────────────────────────────────────────────

function makeScene4(): { group: THREE.Group; animate: (t: number) => void } {
  const g = new THREE.Group();
  const W = 2.2, H = 1.7;
  const HW = W/2, HH = H/2;

  const BL = new THREE.Vector3(-HW, -HH, 0);
  const BR = new THREE.Vector3( HW, -HH, 0);
  const TL = new THREE.Vector3(-HW,  HH, 0);
  const TR = new THREE.Vector3( HW,  HH, 0);

  // Box edges
  g.add(makeLine([BL, BR], 0x00ff88));   // bottom (a)
  g.add(makeLine([BL, TL], 0x4488ff));   // left
  g.add(makeLine([BR, TR], 0xff8844));   // right
  g.add(makeLine([TL, TR], 0xffdd44));   // top (p·q)

  g.add(createEndpoint(BL, 0x00ff88, 0x007744, 0.065));
  g.add(createEndpoint(BR, 0xff8844, 0xaa4400, 0.065));
  g.add(createEndpoint(TL, 0x4488ff, 0x1133aa, 0.065));
  g.add(createEndpoint(TR, 0xffdd44, 0xaa8800, 0.065));

  // j-slider: vertical slice through the filler
  const sliceGeo = new THREE.BufferGeometry();
  sliceGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const sliceLine = new THREE.Line(sliceGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
  g.add(sliceLine);

  // Filler: horizontal ribs at each j-value
  const RIBS = 22;
  const ribLines: THREE.Line[] = [];
  for (let ri = 0; ri <= RIBS; ri++) {
    const jt = ri / RIBS;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const col = new THREE.Color().setHSL(0.7 - jt * 0.3, 0.7, 0.6);
    const rib = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: col.getHex(), transparent: true, opacity: 0 }));
    ribLines.push(rib);
    g.add(rib);
  }

  // Moving dot showing fill^A φ u a (j)
  const fillDot = createEndpoint(new THREE.Vector3(0, -HH, 0.01), 0xffffff, 0x888888, 0.055);
  g.add(fillDot);

  // Labels
  g.add(label('a : A(0)', '#00ffaa', 0, -HH-0.24, 0, 50, 0.38));
  g.add(label('p · q', '#ffdd44', 0, HH+0.28, 0, 52, 0.38));
  g.add(label('j', '#bbbbbb', -HW-0.4, 0, 0, 52, 0.3));
  g.add(label('fill A φ u a (j)', '#ccccff', 0, -HH-0.56, 0, 40, 0.5));
  const fillerReveal = label('filler surface', '#bb99ff', 0.5, 0.2, 0, 44, 0.42);
  (fillerReveal.material as THREE.SpriteMaterial).opacity = 0.0;
  g.add(fillerReveal);

  // j-slider dot on left edge
  const jDot = createEndpoint(BL.clone(), 0xffffff, 0x888888, 0.05);
  g.add(jDot);
  g.add(label('0', '#888888', -HW-0.22, -HH, 0, 40, 0.25));
  g.add(label('1', '#888888', -HW-0.22,  HH, 0, 40, 0.25));

  const CYCLE = 7.0;
  function animate(time: number) {
    const t = (time % CYCLE) / CYCLE;
    // j oscillates 0→1→0
    const jVal = (Math.sin(time * 0.8) + 1) / 2;
    const jY = -HH + jVal * H;

    // j-dot on left edge
    jDot.position.set(-HW, jY, 0.01);

    // Slice line at current j
    setLinePoints(sliceLine, [new THREE.Vector3(-HW, jY, 0.02), new THREE.Vector3(HW, jY, 0.02)]);

    // fillDot moves left-right along slice (scanning over i)
    const iVal = (Math.sin(time * 1.7 + 1.0) + 1) / 2;
    fillDot.position.set(-HW + iVal * W, jY, 0.02);

    // Reveal ribs progressively in second half of cycle
    const revealStart = 0.4;
    const revealed = t > revealStart ? (t - revealStart) / 0.45 : 0;
    ribLines.forEach((rib, ri) => {
      const jt = ri / RIBS;
      const ribY = -HH + jt * H;
      const ribAttr = rib.geometry.attributes.position as THREE.BufferAttribute;
      ribAttr.setXYZ(0, -HW, ribY, 0.005); ribAttr.setXYZ(1, HW, ribY, 0.005);
      ribAttr.needsUpdate = true;
      (rib.material as THREE.LineBasicMaterial).opacity = revealed * (jt < jVal ? 0.45 : 0.15);
    });
    (fillerReveal.material as THREE.SpriteMaterial).opacity = revealed;
  }
  return { group: g, animate };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene 5 — Higher Composition: 3D box (cube minus one face)
// ─────────────────────────────────────────────────────────────────────────────

function makeScene5(): { group: THREE.Group; animate: (t: number) => void } {
  const g = new THREE.Group();
  const S = 1.0; // half-size

  // 8 corners of a cube
  const corners = [
    new THREE.Vector3(-S,-S,-S), new THREE.Vector3( S,-S,-S),
    new THREE.Vector3( S, S,-S), new THREE.Vector3(-S, S,-S),
    new THREE.Vector3(-S,-S, S), new THREE.Vector3( S,-S, S),
    new THREE.Vector3( S, S, S), new THREE.Vector3(-S, S, S),
  ];
  const [v0,v1,v2,v3,v4,v5,v6,v7] = corners;

  // 12 edges
  const edges = [
    [v0,v1],[v1,v2],[v2,v3],[v3,v0],  // bottom face
    [v4,v5],[v5,v6],[v6,v7],[v7,v4],  // top face
    [v0,v4],[v1,v5],[v2,v6],[v3,v7],  // verticals
  ];
  edges.forEach(([a,b]) => g.add(makeLine([a,b], 0x555577, 0.6)));

  // 5 known faces (colored translucent)
  const faceData: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3, number][] = [
    [v0, v1, v2, v3, 0x00ff88],  // bottom  (j=0)
    [v4, v5, v6, v7, 0x4488ff],  // top     (j=1) — the MISSING face (will fill in)
    [v0, v4, v7, v3, 0xff8844],  // left    (i=0)
    [v1, v5, v6, v2, 0xaa44ff],  // right   (i=1)
    [v0, v1, v5, v4, 0xff4455],  // front   (k=0)
    // back face (k=1) is the missing one we fill
  ];

  const faceMeshes: THREE.Mesh[] = [];
  faceData.forEach(([a,b,c,d,col]) => {
    const m = makeFace(a,b,c,d, col, 0.18);
    faceMeshes.push(m);
    g.add(m);
  });

  // The missing (back) face: dashed wireframe → fills in
  const missingEdges = [
    makeDashed([v3,v7], 0xffdd44), makeDashed([v7,v6], 0xffdd44),
    makeDashed([v6,v2], 0xffdd44), makeDashed([v2,v3], 0xffdd44),
  ];
  missingEdges.forEach(e => g.add(e));
  const missingFace = makeFace(v3,v7,v6,v2, 0xffdd44, 0.0);
  g.add(missingFace);

  // Corner points
  corners.forEach(v => g.add(createEndpoint(v, 0x8888aa, 0x444466, 0.045)));

  // Face labels
  g.add(label('u(i=0)', '#ff9955', -S-0.4, 0, 0, 44, 0.35));
  g.add(label('u(i=1)', '#bb66ff',  S+0.4, 0, 0, 44, 0.35));
  g.add(label('a (j=0)', '#00ff88', 0, -S-0.28, 0, 44, 0.35));
  g.add(label('u(k=0)', '#ff4455', 0, 0, -S-0.4, 44, 0.35));
  const missingLbl = label('comp result (k=1)', '#ffdd44', 0, 0, S+0.42, 44, 0.42);
  (missingLbl.material as THREE.SpriteMaterial).opacity = 0.3;
  g.add(missingLbl);
  g.add(label('3D Kan filling', '#ccccff', 0, -S-0.58, 0, 40, 0.50));

  const CYCLE = 8.0;
  function animate(time: number) {
    // Slowly rotate the cube for 3D perspective
    g.rotation.y = time * 0.22;
    g.rotation.x = 0.25;

    const t = (time % CYCLE) / CYCLE;
    if (t < 0.45) {
      // Open box: show 5 faces, missing face dashed
      missingEdges.forEach(e => (e.material as THREE.LineDashedMaterial).opacity = 1);
      (missingFace.material as THREE.MeshBasicMaterial).opacity = 0;
      (missingLbl.material as THREE.SpriteMaterial).opacity = 0.3;
    } else if (t < 0.75) {
      const fp = (t - 0.45) / 0.30;
      missingEdges.forEach(e => (e.material as THREE.LineDashedMaterial).opacity = Math.max(0, 1 - fp*2));
      (missingFace.material as THREE.MeshBasicMaterial).opacity = fp * 0.28;
      (missingLbl.material as THREE.SpriteMaterial).opacity = 0.3 + fp * 0.7;
    } else {
      missingEdges.forEach(e => (e.material as THREE.LineDashedMaterial).opacity = 0);
      (missingFace.material as THREE.MeshBasicMaterial).opacity = 0.22 + 0.06 * Math.sin(time * 3);
      (missingLbl.material as THREE.SpriteMaterial).opacity = 1;
    }
  }
  return { group: g, animate };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — builds all 5 scenes, switches on demand
// ─────────────────────────────────────────────────────────────────────────────

export function createComposition(): {
  group: THREE.Group;
  animate: (time: number) => void;
} {
  const root = new THREE.Group();

  const scenes = [
    makeScene1(),
    makeScene2(),
    makeScene3(),
    makeScene4(),
    makeScene5(),
  ];

  // Scene titles shown as a floating sprite at top
  const TITLES = [
    'Scene 1: The Open Box  (full comp)',
    'Scene 2: Path Concatenation  (hcomp)',
    'Scene 3: Transport  (φ = ⊥)',
    'Scene 4: The Filler  (fill A φ u a)',
    'Scene 5: 3D Kan Filling  (higher comp)',
  ];

  let activeScene = 0;
  const SCENE_DURATION = 10.0; // seconds per scene before auto-advance

  // Add title sprite
  const titleSprite = createTextSprite(TITLES[0], '#ffffff', 38);
  titleSprite.position.set(0, 1.55, 0);
  titleSprite.scale.setScalar(0.75);
  root.add(titleSprite);

  // Sub-scene indicator dots
  const dots: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.045, 16),
      new THREE.MeshBasicMaterial({ color: i === 0 ? 0xffffff : 0x444466, transparent: true, opacity: 0.8 }),
    );
    dot.position.set(-0.4 + i * 0.2, -1.68, 0);
    root.add(dot);
    dots.push(dot);
  }

  function switchTo(idx: number) {
    root.remove(scenes[activeScene].group);
    activeScene = idx;
    root.add(scenes[activeScene].group);
    // Update title
    const t = createTextSprite(TITLES[activeScene], '#ffffff', 38);
    titleSprite.material.map = t.material.map;
    titleSprite.material.needsUpdate = true;
    // Update dots
    dots.forEach((d, i) =>
      (d.material as THREE.MeshBasicMaterial).color.setHex(i === activeScene ? 0xffffff : 0x444466));
  }

  // Start with scene 0
  root.add(scenes[0].group);

  let sceneStart = 0;
  function animate(time: number) {
    // Auto-advance scenes every SCENE_DURATION seconds
    if (sceneStart === 0) sceneStart = time;
    const elapsed = time - sceneStart;
    const desired = Math.floor(elapsed / SCENE_DURATION) % 5;
    if (desired !== activeScene) switchTo(desired);

    scenes[activeScene].animate(time);
  }

  return { group: root, animate };
}
