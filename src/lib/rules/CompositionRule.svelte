<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite, createEndpoint } from '../textSprite';
  import { hexCss } from '../colors';
  import katex from 'katex';

  const km = (s: string) => katex.renderToString(s, { throwOnError: false });
  const kt = (s: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(s)}</span>`;

  // ── Layout ────────────────────────────────────────────────────────────────
  // The open box lives in (i, j):
  //   i ∈ [0,1]  horizontal  (left = i=0, right = i=1)
  //   j ∈ [0,1]  vertical    (bottom = j=0, top = j=1)

  const W = 2.0, H = 1.6;
  const HW = W / 2, HH = H / 2;

  const BL = new THREE.Vector3(-HW, -HH, 0); // i=0, j=0
  const BR = new THREE.Vector3( HW, -HH, 0); // i=1, j=0
  const TL = new THREE.Vector3(-HW,  HH, 0); // i=0, j=1
  const TR = new THREE.Vector3( HW,  HH, 0); // i=1, j=1

  // ── Colors ────────────────────────────────────────────────────────────────
  const C_BOTTOM  = 0x44ff88;  // green  — a (base)
  const C_LEFT    = 0x4488ff;  // blue   — u(i=0)
  const C_RIGHT   = 0xff8844;  // orange — u(i=1)
  const C_TOP     = 0xff3377;  // pink   — comp result
  const C_PHI     = 0xffdd44;  // yellow — φ face highlights
  const C_AXIS    = 0x888899;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function edge(a: THREE.Vector3, b: THREE.Vector3, color: number, opacity = 1): THREE.Line {
    const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
    return new THREE.Line(geo, mat);
  }

  function dashedEdge(a: THREE.Vector3, b: THREE.Vector3, color: number): THREE.Line {
    const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
    const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.07, gapSize: 0.04 });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    return l;
  }

  function face(
    a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3,
    color: number, opacity: number
  ): THREE.Mesh {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      a.x,a.y,a.z, b.x,b.y,b.z, c.x,c.y,c.z,
      a.x,a.y,a.z, c.x,c.y,c.z, d.x,d.y,d.z,
    ]), 3));
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false,
    }));
  }

  function setFace(
    m: THREE.Mesh,
    a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3
  ) {
    const attr = m.geometry.attributes.position as THREE.BufferAttribute;
    [a,b,c,a,c,d].forEach((v,i) => attr.setXYZ(i, v.x, v.y, v.z));
    attr.needsUpdate = true;
  }

  function lbl(
    text: string, color: string,
    x: number, y: number, z = 0,
    fs = 52, sc = 0.30
  ): THREE.Sprite {
    const s = createTextSprite(text, color, fs);
    s.position.set(x, y, z);
    s.scale.setScalar(sc);
    return s;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Rule definition
  // ─────────────────────────────────────────────────────────────────────────

  const compositionRule: RuleDefinition = {
    name: 'Composition — Kan Filling of an Open Box',

    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">
          ${kt('\\Gamma \\vdash \\varphi : \\mathbb{F}', 'phi')}
          &ensp;
          ${kt('\\Gamma,\\, i:\\mathbb{I} \\vdash A', 'A')}
          &ensp;
          ${kt('\\Gamma,\\, \\varphi,\\, i:\\mathbb{I} \\vdash u : A', 'u')}
          &ensp;
          ${kt('\\Gamma \\vdash a_0 : A(i_0)\\,[\\varphi \\mapsto u(i_0)]', 'a')}
        </div>
        <hr class="nd-line">
        <div class="nd-conclusion">
          ${kt('\\Gamma \\vdash \\mathsf{comp}^i\\,A\\,[\\varphi \\mapsto u]\\,a_0', 'comp')}
          ${km('\\;:\\;')}
          ${kt('A(i_1)\\,[\\varphi \\mapsto u(i_1)]', 'boundary')}
        </div>
      </div>
    `,

    description:
      `The composition operation (Section 4.3, CCHM) expresses that being extensible is preserved along paths. ` +
      `Given a type line ${km('A')} in context ${km('\\Gamma, i:\\mathbb{I}')}, a face formula ` +
      `${km('\\varphi : \\mathbb{F}')} with a partial element ${km('u : A')} living on ${km('\\varphi')}, ` +
      `and a base ${km('a_0 : A(i_0)\\,[\\varphi \\mapsto u(i_0)]')} at ${km('i_0')}, ` +
      `the composition ${km('\\mathsf{comp}^i\\,A\\,[\\varphi \\mapsto u]\\,a_0')} produces an element of ` +
      `${km('A(i_1)\\,[\\varphi \\mapsto u(i_1)]')} — the boundary condition is built into the return type. ` +
      `Note: ${km('\\mathsf{comp}^i')} binds ${km('i')} in both ${km('A')} and ${km('u')}.`,

    steps: [
      {
        label: 'Given data',
        description:
          'The three known sides of the box: ' +
          'base a : A(0) (bottom, green), ' +
          'partial filler u(i=0) (left wall, blue), ' +
          'partial filler u(i=1) (right wall, orange). ' +
          'The top edge is unknown — shown dashed.',
        timeRange: [0, 0.01],
      },
      {
        label: 'Open box',
        description:
          'This is the "open box": three sides given, one missing. ' +
          'The face formula φ specifies which walls are active. ' +
          'Composition will fill the missing top.',
        timeRange: [0.01, 0.30],
      },
      {
        label: 'Filling (comp)',
        description:
          'comp A φ u a sweeps left→right, filling the top edge. ' +
          'The interior materialises: at each intermediate j the element lives in A(j). ' +
          'The sweep front shows the computation in progress.',
        timeRange: [0.30, 0.85],
      },
      {
        label: 'Result & boundary',
        description:
          'The top edge is now fully solid: comp A φ u a : A(1). ' +
          'Boundary condition: on the face φ the result equals u(1) — ' +
          'i.e. the filled top agrees with the side walls at j=1.',
        timeRange: [0.85, 1.0],
      },
    ],

    setup(scene: THREE.Scene, _camera: THREE.Camera) {
      const group = new THREE.Group();

      // ── Face fills (behind edges) ───────────────────────────────────────
      const leftFaceMesh   = face(BL, TL, TL, BL, C_LEFT,   0.18);
      const rightFaceMesh  = face(BR, TR, TR, BR, C_RIGHT,  0.18);
      const bottomFaceMesh = face(BL, BR, BR, BL, C_BOTTOM, 0.12);
      const interiorMesh   = face(BL, BR, TR, TL, 0x8866ff, 0.0);
      const topFaceMesh    = face(TL, TR, TR, TL, C_TOP,    0.0);
      group.add(leftFaceMesh, rightFaceMesh, bottomFaceMesh, interiorMesh, topFaceMesh);

      // ── Edges ───────────────────────────────────────────────────────────
      const bottomEdge = edge(BL, BR, C_BOTTOM);
      const leftEdge   = edge(BL, TL, C_LEFT);
      const rightEdge  = edge(BR, TR, C_RIGHT);
      const topDashed  = dashedEdge(TL, TR, C_TOP);

      // Solid top edge (grows during fill)
      const topSolidGeo = new THREE.BufferGeometry();
      topSolidGeo.setAttribute('position',
        new THREE.BufferAttribute(new Float32Array(6), 3));
      const topSolid = new THREE.Line(topSolidGeo,
        new THREE.LineBasicMaterial({ color: C_TOP, transparent: true, opacity: 0 }));

      group.add(bottomEdge, leftEdge, rightEdge, topDashed, topSolid);

      // ── Sweep line (fill front) ─────────────────────────────────────────
      const sweepGeo = new THREE.BufferGeometry();
      sweepGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const sweepLine = new THREE.Line(sweepGeo,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
      group.add(sweepLine);

      // ── Corner dots ─────────────────────────────────────────────────────
      const dotBL = createEndpoint(BL, C_BOTTOM, 0x007733, 0.065);
      const dotBR = createEndpoint(BR, C_RIGHT,  0xaa4400, 0.065);
      const dotTL = createEndpoint(TL, C_LEFT,   0x1133aa, 0.065);
      const dotTR = createEndpoint(TR, C_TOP,    0xaa0033, 0.065);
      group.add(dotBL, dotBR, dotTL, dotTR);

      // ── Wall travellers (show partial elements animating along j) ───────
      const travL = createEndpoint(BL.clone(), 0x88aaff, 0x3355aa, 0.05);
      const travR = createEndpoint(BR.clone(), 0xffaa66, 0xaa5500, 0.05);
      group.add(travL, travR);

      // ── Axis arrows ─────────────────────────────────────────────────────
      const axisY = -HH - 0.38, axisX = -HW - 0.42;
      group.add(new THREE.ArrowHelper(
        new THREE.Vector3(1,0,0),
        new THREE.Vector3(-HW-0.1, axisY, 0), W+0.3, C_AXIS, 0.13, 0.07));
      group.add(new THREE.ArrowHelper(
        new THREE.Vector3(0,1,0),
        new THREE.Vector3(axisX, -HH-0.1, 0), H+0.3, C_AXIS, 0.13, 0.07));

      // ── Static labels ───────────────────────────────────────────────────
      group.add(lbl('i', '#aaaaaa',  HW+0.3, axisY,   0, 48, 0.28));
      group.add(lbl('j', '#aaaaaa',  axisX,  HH+0.3,  0, 48, 0.28));
      group.add(lbl('0', '#777777', -HW, axisY-0.18,  0, 38, 0.22));
      group.add(lbl('1', '#777777',  HW, axisY-0.18,  0, 38, 0.22));
      group.add(lbl('0', '#777777',  axisX-0.2, -HH,  0, 38, 0.22));
      group.add(lbl('1', '#777777',  axisX-0.2,  HH,  0, 38, 0.22));

      // Edge labels
      const lblBottom = lbl('a : A(0)',  hexCss(C_BOTTOM), 0, -HH-0.25, 0, 50, 0.38);
      const lblLeft   = lbl('u(i=0)',    hexCss(C_LEFT),  -HW-0.58, 0, 0, 50, 0.34);
      const lblRight  = lbl('u(i=1)',    hexCss(C_RIGHT),  HW+0.58, 0, 0, 50, 0.34);
      const lblTop    = lbl('comp A φ u a : A(1)', hexCss(C_TOP), 0, HH+0.28, 0, 48, 0.50);
      const lblBound  = lbl('φ ⟹ comp A φ u a ≡ u(1)', '#ffdd44', 0, -HH-0.60, 0, 38, 0.52);
      const lblTyping = lbl('comp A φ u a : A(1)', '#ccccff', 0, -HH-0.88, 0, 38, 0.50);

      // Start with top label dim
      (lblTop.material as THREE.SpriteMaterial).opacity = 0.25;
      (lblBound.material as THREE.SpriteMaterial).opacity = 0;
      group.add(lblBottom, lblLeft, lblRight, lblTop, lblBound, lblTyping);

      // φ label inside box
      const lblPhi = lbl('φ active on walls', '#888888', 0, 0.08, 0, 36, 0.40);
      group.add(lblPhi);

      scene.add(group);

      // ── Store refs ──────────────────────────────────────────────────────
      const refs = {
        group,
        leftFaceMesh, rightFaceMesh, bottomFaceMesh, interiorMesh, topFaceMesh,
        bottomEdge, leftEdge, rightEdge, topDashed, topSolid,
        sweepLine, travL, travR,
        lblTop, lblBound, lblPhi,
      };
      (scene as any)._compRefs = refs;

      // ── Term mappings for hover ─────────────────────────────────────────
      compositionRule.termMappings = [
        { termKey: 'A',        objects: [leftFaceMesh, rightFaceMesh, bottomFaceMesh, dotBL, dotBR, dotTL, dotTR] },
        { termKey: 'phi',      objects: [leftEdge, rightEdge, leftFaceMesh, rightFaceMesh] },
        { termKey: 'u',        objects: [leftEdge, rightEdge, travL, travR] },
        { termKey: 'a',        objects: [bottomEdge, bottomFaceMesh, dotBL] },
        { termKey: 'comp',     objects: [topSolid, topFaceMesh, dotTR] },
        { termKey: 'boundary', objects: [topSolid, rightEdge, dotTR, dotBR] },
      ];
    },

    update(t: number, _elapsed?: number) {
      const scene = (window as any)._currentScene as THREE.Scene;
      if (!scene) return;
      const r = (scene as any)._compRefs;
      if (!r) return;

      const {
        interiorMesh, topFaceMesh,
        topDashed, topSolid,
        sweepLine, travL, travR,
        lblTop, lblBound, lblPhi,
      } = r;

      // Wall travellers always animate
      const elapsed = (_elapsed ?? t);
      const wt = (Math.sin(elapsed * 1.1) + 1) / 2;
      travL.position.set(-HW, -HH + wt * H, 0.01);
      travR.position.set( HW, -HH + wt * H, 0.01);

      if (t < 0.30) {
        // ── Steps 0-1: open box ──────────────────────────────────────────
        const opacity = t < 0.01 ? t / 0.01 : 1;  // fade in on step 0
        ;(topDashed.material as THREE.LineDashedMaterial).opacity = opacity;
        ;(topSolid.material  as THREE.LineBasicMaterial).opacity = 0;
        ;(topFaceMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        ;(interiorMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        ;(sweepLine.material as THREE.LineBasicMaterial).opacity = 0;
        ;(lblTop.material as THREE.SpriteMaterial).opacity = 0.25;
        ;(lblBound.material as THREE.SpriteMaterial).opacity = 0;
        lblPhi.visible = true;

      } else if (t < 0.85) {
        // ── Step 2: filling ──────────────────────────────────────────────
        const fp = (t - 0.30) / 0.55;
        ;(topDashed.material as THREE.LineDashedMaterial).opacity = Math.max(0, 1 - fp * 2.5);

        // Interior fills
        ;(interiorMesh.material as THREE.MeshBasicMaterial).opacity = fp * 0.18;

        // Sweep front
        const sx = -HW + fp * W;
        const sa = sweepLine.geometry.attributes.position as THREE.BufferAttribute;
        sa.setXYZ(0, sx, -HH, 0.02); sa.setXYZ(1, sx, HH, 0.02); sa.needsUpdate = true;
        sweepLine.computeLineDistances();
        ;(sweepLine.material as THREE.LineBasicMaterial).opacity = 0.75;

        // Partial top face (filled region only)
        setFace(topFaceMesh,
          TL, new THREE.Vector3(sx, HH, 0),
          new THREE.Vector3(sx, HH, 0), TL);
        ;(topFaceMesh.material as THREE.MeshBasicMaterial).opacity = fp * 0.22;

        // Growing solid top edge
        const ta = topSolid.geometry.attributes.position as THREE.BufferAttribute;
        ta.setXYZ(0, -HW, HH, 0.01); ta.setXYZ(1, sx, HH, 0.01); ta.needsUpdate = true;
        ;(topSolid.material as THREE.LineBasicMaterial).opacity = fp;

        ;(lblTop.material as THREE.SpriteMaterial).opacity = 0.25 + fp * 0.75;
        ;(lblBound.material as THREE.SpriteMaterial).opacity = 0;
        lblPhi.visible = fp < 0.4;

      } else {
        // ── Step 3: result ───────────────────────────────────────────────
        ;(topDashed.material as THREE.LineDashedMaterial).opacity = 0;
        ;(topSolid.material  as THREE.LineBasicMaterial).opacity = 1;

        // Full top edge
        const ta = topSolid.geometry.attributes.position as THREE.BufferAttribute;
        ta.setXYZ(0, -HW, HH, 0.01); ta.setXYZ(1, HW, HH, 0.01); ta.needsUpdate = true;

        // Full top face with gentle glow
        setFace(topFaceMesh, TL, TR, TR, TL);
        const glow = 0.18 + 0.06 * Math.sin((elapsed ?? t) * 3);
        ;(topFaceMesh.material as THREE.MeshBasicMaterial).opacity = glow;
        ;(interiorMesh.material as THREE.MeshBasicMaterial).opacity = 0.12;

        ;(sweepLine.material as THREE.LineBasicMaterial).opacity = 0;
        ;(lblTop.material as THREE.SpriteMaterial).opacity = 1;

        // Fade in boundary condition
        const bp = Math.min(1, (t - 0.85) / 0.15);
        ;(lblBound.material as THREE.SpriteMaterial).opacity = bp;
        lblPhi.visible = false;
      }
    },

    cleanup(scene: THREE.Scene) {
      const r = (scene as any)._compRefs;
      if (r?.group) scene.remove(r.group);
      delete (scene as any)._compRefs;
    },
  };
</script>

<Rule rule={compositionRule} />
