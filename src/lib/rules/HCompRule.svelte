<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { BASE_POINT, FILL_RESULT, PARTIAL_DATA, hexCss } from '../colors';
  import { createTextSprite } from '../textSprite';
  import katex from 'katex';

  const km = (s: string) => katex.renderToString(s, { throwOnError: false });
  const kt = (s: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(s)}</span>`;

  // ── Colors (one per face, matching the image's intuition) ─────────────────
  const C_BOTTOM  = BASE_POINT;   // yellow-green — a₀
  const C_J0      = 0x4488ff;     // blue   — u(j=0)
  const C_J1      = 0xaa44ff;     // purple — u(j=1)
  const C_I0      = 0xff8844;     // orange — u(i=0)
  const C_I1      = 0x44ffcc;     // teal   — u(i=1)
  const C_TOP     = FILL_RESULT;  // pink   — hcomp result
  const C_EDGE    = 0x556677;

  const hcompRule: RuleDefinition = {
    name: 'Homogeneous Composition — comp with Constant Type',

    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">
          ${kt('\\Gamma \\vdash \\varphi : \\mathbb{F}', 'phi')}
          &ensp;
          ${kt('\\Gamma \\vdash A', 'A')}
          &ensp;
          ${kt('\\Gamma,\\,\\varphi,\\,i:\\mathbb{I} \\vdash u : A', 'u')}
          &ensp;
          ${kt('\\Gamma \\vdash a_0 : A\\,[\\varphi \\mapsto u(i_0)]', 'a0')}
        </div>
        <hr class="nd-line">
        <div class="nd-conclusion">
          ${kt('\\Gamma \\vdash \\mathsf{comp}^i\\,A\\,[\\varphi \\mapsto u]\\,a_0', 'hcomp')}
          ${km('\\;:\\;')}
          ${kt('A\\,[\\varphi \\mapsto u(i_1)]', 'A')}
        </div>
      </div>
      <div style="font-size:0.82em; color:#aaa; margin-top:6px; text-align:center">
        Special case: ${km('A')} does not depend on ${km('i')}, so no transport is needed.
        ${km('\\mathsf{comp}^i\\,A = \\mathsf{hcomp}^i\\,A')} when ${km('A')} is constant.
      </div>
    `,

    description:
      `When the type ${km('A')} does not depend on the composition variable ${km('i')}, ` +
      `the CCHM ${km('\\mathsf{comp}^i')} rule simplifies: no transport is needed, ` +
      `and the result stays in the same type ${km('A')}. ` +
      `This is often called homogeneous composition. ` +
      `Given a base ${km('a_0 : A\\,[\\varphi \\mapsto u(i_0)]')} and a partial tube ` +
      `${km('u')} on faces ${km('\\varphi')} (e.g. ${km('j{=}0,\\,j{=}1,\\,i{=}0,\\,i{=}1')}), ` +
      `${km('\\mathsf{comp}^i\\,A\\,[\\varphi \\mapsto u]\\,a_0 : A\\,[\\varphi \\mapsto u(i_1)]')} ` +
      `fills the missing top face. The boundary is part of the return type (CCHM §4.3).`,

    steps: [
      {
        label: 'Type A (constant)',
        description:
          'A : U is a fixed type — it does not vary over k. ' +
          'This is what makes hcomp homogeneous: no transport needed, every fiber is the same A.',
        timeRange: [0, 0.12],
      },
      {
        label: 'Base a₀ and walls u',
        description:
          'The bottom face is a₀ : A. ' +
          'The four side walls are partial elements u(k) : Partial φ A, ' +
          'defined on faces φ = [j=0, j=1, i=0, i=1]. ' +
          'Each wall must agree with a₀ at k=0.',
        timeRange: [0.12, 0.50],
      },
      {
        label: 'Open box (missing lid)',
        description:
          'We have an open box: bottom and four walls given, top missing. ' +
          'The face formula φ records exactly which faces are active. ' +
          'The Kan condition guarantees the top can be filled.',
        timeRange: [0.50, 0.72],
      },
      {
        label: 'hcomp fills the lid',
        description:
          'hcomp^k A [φ ↦ u] a₀ : A fills the missing top face. ' +
          'Boundary condition: on each active face (where φ holds), ' +
          'the result equals u(1). ' +
          'The type stays A throughout — no coercion needed.',
        timeRange: [0.72, 1.0],
      },
    ],

    setup(scene: THREE.Scene, _camera: THREE.Camera) {
      const group = new THREE.Group();
      const S = 1.0; // half-size of the cube

      // ── Helper to make a planar face mesh ─────────────────────────────
      function makeFaceMesh(color: number, opacity: number): THREE.Mesh {
        const geo = new THREE.PlaneGeometry(S * 2, S * 2);
        const mat = new THREE.MeshBasicMaterial({
          color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false,
        });
        return new THREE.Mesh(geo, mat);
      }

      // ── Bottom face — a₀ : A ──────────────────────────────────────────
      const bottom = makeFaceMesh(C_BOTTOM, 0.35);
      bottom.rotation.x = -Math.PI / 2;
      bottom.position.y = -S;
      group.add(bottom);

      // ── Four side walls — u on φ ───────────────────────────────────────
      // j=0 face (front,  z=+S)
      const wallJ0 = makeFaceMesh(C_J0, 0.22);
      wallJ0.position.z = S;
      group.add(wallJ0);

      // j=1 face (back,   z=-S)
      const wallJ1 = makeFaceMesh(C_J1, 0.22);
      wallJ1.rotation.y = Math.PI;
      wallJ1.position.z = -S;
      group.add(wallJ1);

      // i=0 face (left,   x=-S)
      const wallI0 = makeFaceMesh(C_I0, 0.22);
      wallI0.rotation.y = Math.PI / 2;
      wallI0.position.x = -S;
      group.add(wallI0);

      // i=1 face (right,  x=+S)
      const wallI1 = makeFaceMesh(C_I1, 0.22);
      wallI1.rotation.y = -Math.PI / 2;
      wallI1.position.x = S;
      group.add(wallI1);

      // ── Top lid — hcomp result (initially hidden) ───────────────────────
      const lidGeo = new THREE.PlaneGeometry(S * 2, S * 2, 20, 20);
      const lidMat = new THREE.MeshBasicMaterial({
        color: C_TOP, transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.rotation.x = Math.PI / 2;
      lid.position.y = S;
      lid.visible = false;
      group.add(lid);
      const lidOrigPos = new Float32Array((lidGeo.attributes.position.array as Float32Array));

      // ── Wireframe edges ────────────────────────────────────────────────
      // Bottom edges (yellow)
      const bv = [
        -S,-S,-S,  S,-S,-S,   S,-S,-S,  S,-S, S,
         S,-S, S, -S,-S, S,  -S,-S, S, -S,-S,-S,
      ];
      const bGeo = new THREE.BufferGeometry();
      bGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bv), 3));
      group.add(new THREE.LineSegments(bGeo, new THREE.LineBasicMaterial({ color: C_BOTTOM })));

      // Vertical edges (side wall color dim)
      const vv = [
        -S,-S,-S, -S, S,-S,   S,-S,-S,  S, S,-S,
         S,-S, S,  S, S, S,  -S,-S, S, -S, S, S,
      ];
      const vGeo = new THREE.BufferGeometry();
      vGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vv), 3));
      group.add(new THREE.LineSegments(vGeo, new THREE.LineBasicMaterial({ color: C_EDGE })));

      // Dashed top rim (missing lid)
      const rimPts = [
        new THREE.Vector3(-S, S,-S), new THREE.Vector3( S, S,-S),
        new THREE.Vector3( S, S, S), new THREE.Vector3(-S, S, S),
        new THREE.Vector3(-S, S,-S),
      ];
      const rimGeo = new THREE.BufferGeometry().setFromPoints(rimPts);
      const rimMat = new THREE.LineDashedMaterial({
        color: C_TOP, dashSize: 0.12, gapSize: 0.07, transparent: true, opacity: 1,
      });
      const rimLine = new THREE.Line(rimGeo, rimMat);
      rimLine.computeLineDistances();
      group.add(rimLine);

      // Solid top rim (replaces dashed when filled)
      const solidRimPts = rimPts.slice();
      const solidRimGeo = new THREE.BufferGeometry().setFromPoints(solidRimPts);
      const solidRimMat = new THREE.LineBasicMaterial({ color: C_TOP, transparent: true, opacity: 0 });
      const solidRim = new THREE.Line(solidRimGeo, solidRimMat);
      group.add(solidRim);

      // ── Axis arrows ────────────────────────────────────────────────────
      const arrowLen = S * 1.6;
      group.add(new THREE.ArrowHelper(
        new THREE.Vector3(1,0,0), new THREE.Vector3(-S*1.1,-S*1.3, S*1.1),
        arrowLen, 0x88aacc, 0.13, 0.07));
      group.add(new THREE.ArrowHelper(
        new THREE.Vector3(0,0,-1), new THREE.Vector3(-S*1.1,-S*1.3, S*1.1),
        arrowLen, 0x88aacc, 0.13, 0.07));
      group.add(new THREE.ArrowHelper(
        new THREE.Vector3(0,1,0), new THREE.Vector3(-S*1.1,-S*1.3, S*1.1),
        arrowLen, 0xffcc44, 0.13, 0.07));

      // ── Face labels ────────────────────────────────────────────────────
      function faceLabel(text: string, color: string, x: number, y: number, z: number): THREE.Sprite {
        const s = createTextSprite(text, color, 44);
        s.position.set(x, y, z);
        s.scale.setScalar(0.32);
        return s;
      }

      const lblAxI = faceLabel('i', '#88aacc',  S*1.55, -S*1.3, S*1.1);
      const lblAxJ = faceLabel('j', '#88aacc', -S*1.1, -S*1.3, -S*0.45);
      const lblAxK = faceLabel('k', '#ffcc44', -S*1.1,  S*1.55, S*1.1);
      group.add(lblAxI, lblAxJ, lblAxK);

      const lblBottom = faceLabel('a₀ : A',    hexCss(C_BOTTOM), 0, -S*1.3, 0);
      const lblJ0     = faceLabel('u(j=0)',     hexCss(C_J0),     0,  0,  S*1.35);
      const lblJ1     = faceLabel('u(j=1)',     hexCss(C_J1),     0,  0, -S*1.35);
      const lblI0     = faceLabel('u(i=0)',     hexCss(C_I0),    -S*1.35, 0, 0);
      const lblI1     = faceLabel('u(i=1)',     hexCss(C_I1),     S*1.35, 0, 0);
      group.add(lblBottom, lblJ0, lblJ1, lblI0, lblI1);

      // Top label (appears when lid fills)
      const lblTop = faceLabel('hcomp^k A [φ↦u] a₀ : A', hexCss(C_TOP), 0, S*1.4, 0);
      ;(lblTop.material as THREE.SpriteMaterial).opacity = 0;
      lblTop.scale.setScalar(0.38);
      group.add(lblTop);

      // φ system label
      const lblPhi = createTextSprite('φ = [j=0↦u(j=0), j=1↦u(j=1), i=0↦u(i=0), i=1↦u(i=1)]', '#aaaaaa', 36);
      lblPhi.position.set(0, -S*1.6, 0);
      lblPhi.scale.setScalar(0.55);
      ;(lblPhi.material as THREE.SpriteMaterial).opacity = 0;
      group.add(lblPhi);

      // Boundary condition label
      const lblBound = createTextSprite('φ ⟹ hcomp A [φ↦u] a₀ ≡ u(1)', hexCss(0xffdd44), 36);
      lblBound.position.set(0, -S*1.95, 0);
      lblBound.scale.setScalar(0.50);
      ;(lblBound.material as THREE.SpriteMaterial).opacity = 0;
      group.add(lblBound);

      scene.add(group);

      // ── Store refs ──────────────────────────────────────────────────────
      ;(scene as any)._hcomp = {
        group, S,
        bottom, wallJ0, wallJ1, wallI0, wallI1,
        lid, lidGeo, lidMat, lidOrigPos,
        rimLine, rimMat, solidRim, solidRimMat,
        lblTop, lblPhi, lblBound,
        walls: [wallJ0, wallJ1, wallI0, wallI1],
      };

      // ── Term mappings ────────────────────────────────────────────────────
      hcompRule.termMappings = [
        { termKey: 'A',        objects: [bottom, wallJ0, wallJ1, wallI0, wallI1] },
        { termKey: 'phi',      objects: [wallJ0, wallJ1, wallI0, wallI1] },
        { termKey: 'u',        objects: [wallJ0, wallJ1, wallI0, wallI1] },
        { termKey: 'a0',       objects: [bottom] },
        { termKey: 'hcomp',    objects: [lid] },
        { termKey: 'boundary', objects: [lid, wallJ0, wallJ1, wallI0, wallI1] },
      ];
    },

    update(t: number, elapsed?: number) {
      const scene = (window as any)._currentScene as THREE.Scene;
      if (!scene) return;
      const r = (scene as any)._hcomp;
      if (!r) return;

      const raw = elapsed ?? t;
      const { S, group,
        bottom, walls,
        lid, lidGeo, lidMat, lidOrigPos,
        rimLine, rimMat, solidRim, solidRimMat,
        lblTop, lblPhi, lblBound,
      } = r;

      // Gentle rotation always
      group.rotation.y = raw * 0.15;
      group.rotation.x = 0.22 + Math.sin(raw * 0.09) * 0.07;

      // ── Step 0: type A (t < 0.12) ──────────────────────────────────────
      if (t < 0.12) {
        const p = t / 0.12;
        // Fade in the box frame; walls dim, bottom dim
        ;(bottom.material as THREE.MeshBasicMaterial).opacity = 0.1 + p * 0.25;
        for (const w of walls) (w.material as THREE.MeshBasicMaterial).opacity = 0.05 + p * 0.10;
        rimMat.opacity = 0.3 + p * 0.4;
        lid.visible = false;
        solidRimMat.opacity = 0;
        ;(lblTop.material as THREE.SpriteMaterial).opacity = 0;
        ;(lblPhi.material as THREE.SpriteMaterial).opacity = 0;
        ;(lblBound.material as THREE.SpriteMaterial).opacity = 0;
      }
      // ── Step 1: base + walls (t 0.12..0.50) ────────────────────────────
      else if (t < 0.50) {
        const p = (t - 0.12) / 0.38;
        // bottom brightens first
        ;(bottom.material as THREE.MeshBasicMaterial).opacity = 0.35;
        // walls light up one by one
        walls.forEach((w, idx) => {
          const start = idx * 0.22;
          const wp = Math.max(0, Math.min(1, (p - start) / 0.22));
          ;(w.material as THREE.MeshBasicMaterial).opacity = 0.05 + wp * 0.20;
        });
        rimMat.opacity = 0.7 + 0.3 * Math.sin(raw * 3);
        lid.visible = false;
        solidRimMat.opacity = 0;
        ;(lblTop.material as THREE.SpriteMaterial).opacity = 0;
        ;(lblPhi.material as THREE.SpriteMaterial).opacity = Math.min(1, p * 1.5);
        ;(lblBound.material as THREE.SpriteMaterial).opacity = 0;
      }
      // ── Step 2: open box (t 0.50..0.72) ────────────────────────────────
      else if (t < 0.72) {
        const p = (t - 0.50) / 0.22;
        ;(bottom.material as THREE.MeshBasicMaterial).opacity = 0.35;
        for (const w of walls) (w.material as THREE.MeshBasicMaterial).opacity = 0.22;
        // dashed rim pulses
        rimMat.opacity = 0.5 + 0.5 * Math.abs(Math.sin(raw * 4));
        lid.visible = false;
        solidRimMat.opacity = 0;
        ;(lblTop.material as THREE.SpriteMaterial).opacity = 0;
        ;(lblPhi.material as THREE.SpriteMaterial).opacity = 1 - p * 0.5;
        ;(lblBound.material as THREE.SpriteMaterial).opacity = 0;
      }
      // ── Step 3: fill (t 0.72..1.0) ─────────────────────────────────────
      else {
        const fp = (t - 0.72) / 0.28;

        ;(bottom.material as THREE.MeshBasicMaterial).opacity = 0.35;
        for (const w of walls) (w.material as THREE.MeshBasicMaterial).opacity = 0.22;

        // Dashed rim fades out
        rimMat.opacity = Math.max(0, 1 - fp * 4);

        // Solid rim fades in
        solidRimMat.opacity = Math.min(1, fp * 3);

        // Lid fills from edges inward
        lid.visible = true;
        lidMat.opacity = Math.min(0.6, fp * 0.9);

        // PlaneGeometry rotated PI/2 around X: local axes are X (i+0) and Z (i+2).
        // Displace local Z (= world Y) to make vertices drop down before filling.
        const pos = lidGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < pos.length; i += 3) {
          const lx = lidOrigPos[i];       // local X
          const lz = lidOrigPos[i + 2];   // local Z (world Y direction after rotation)
          const cheb = Math.max(Math.abs(lx), Math.abs(lz)) / S;
          // Edges (cheb≈1) fill first, center (cheb≈0) fills last
          const delay = (1 - cheb) * 0.5;
          const vp = Math.max(0, Math.min(1, (fp - delay) / Math.max(0.01, 1 - delay)));
          const e = vp * vp * (3 - 2 * vp); // smoothstep
          pos[i + 2] = lidOrigPos[i + 2] - (1 - e) * S * 0.5; // pull down, release to plane
        }
        lidGeo.attributes.position.needsUpdate = true;

        // Labels
        ;(lblTop.material as THREE.SpriteMaterial).opacity = Math.min(1, (fp - 0.3) / 0.4);
        ;(lblPhi.material as THREE.SpriteMaterial).opacity = Math.max(0, 0.5 - fp * 2);
        ;(lblBound.material as THREE.SpriteMaterial).opacity = Math.min(1, (fp - 0.5) / 0.3);
      }
    },

    cleanup(scene: THREE.Scene) {
      const r = (scene as any)._hcomp;
      if (r?.group) scene.remove(r.group);
      delete (scene as any)._hcomp;
    },
  };
</script>

<Rule rule={hcompRule} />
