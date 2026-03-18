<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { BASE_POINT, PARTIAL_DATA, FILL_RESULT } from '../colors';
  import { createTextSprite } from '../textSprite';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  const kanFillingRule: RuleDefinition = {
    name: "Kan Filling - Completing the Box",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash A \\quad \\Gamma \\vdash \\varphi : \\mathbb{F} \\quad \\Gamma,\\, i : \\mathbb{I} \\vdash')} ${kt('u', 'u')} ${km(': \\mathrm{Partial}\\,\\varphi\\, A(i) \\quad \\Gamma \\vdash')} ${kt('a_0', 'a_0')} ${km(': A(i_0)[\\varphi \\mapsto u(i_0)]')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash')} ${kt('\\mathrm{fill}^i\\, A\\, [\\varphi \\mapsto u]\\, a_0', 'fill')} ${km(': A(i)\\quad [\\varphi \\mapsto u(i),\\; i_0 \\mapsto a_0]')}</div>
      </div>
    `,
    description: "Given an open box (5 faces), construct the missing lid. The fill operation gives us a path from the base to the composition.",

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      const boxSize = 2;
      const h = boxSize / 2;

      // ── Face meshes (semi-transparent, for hover interaction) ────────────

      // Bottom face (a₀ — base point)
      const bottomGeo = new THREE.PlaneGeometry(boxSize, boxSize);
      const bottomMat = new THREE.MeshBasicMaterial({
        color: BASE_POINT, side: THREE.DoubleSide,
        transparent: true, opacity: 0.3,
      });
      const bottom = new THREE.Mesh(bottomGeo, bottomMat);
      bottom.position.y = -h;
      bottom.rotation.x = -Math.PI / 2;
      group.add(bottom);

      // 4 side faces (u — partial data)
      const sideDefs = [
        { px: 0, py: 0, pz: h,  ry: 0 },
        { px: 0, py: 0, pz: -h, ry: Math.PI },
        { px: -h, py: 0, pz: 0, ry: Math.PI / 2 },
        { px: h, py: 0, pz: 0,  ry: -Math.PI / 2 },
      ];
      const sides: THREE.Mesh[] = [];
      const sideMats: THREE.MeshBasicMaterial[] = [];
      for (const def of sideDefs) {
        const mat = new THREE.MeshBasicMaterial({
          color: PARTIAL_DATA, side: THREE.DoubleSide,
          transparent: true, opacity: 0.2,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(boxSize, boxSize), mat);
        mesh.position.set(def.px, def.py, def.pz);
        mesh.rotation.y = def.ry;
        group.add(mesh);
        sides.push(mesh);
        sideMats.push(mat);
      }

      // ── Wireframe edges ─────────────────────────────────────────────────

      // Bottom face edges (BASE_POINT yellow)
      const bEdge = new Float32Array([
        -h,-h,-h,  h,-h,-h,   h,-h,-h,  h,-h, h,
         h,-h, h, -h,-h, h,  -h,-h, h, -h,-h,-h,
      ]);
      const bEdgeGeo = new THREE.BufferGeometry();
      bEdgeGeo.setAttribute('position', new THREE.BufferAttribute(bEdge, 3));
      group.add(new THREE.LineSegments(bEdgeGeo,
        new THREE.LineBasicMaterial({ color: BASE_POINT })));

      // Vertical edges (PARTIAL_DATA green)
      const vEdge = new Float32Array([
        -h,-h,-h, -h, h,-h,   h,-h,-h,  h, h,-h,
         h,-h, h,  h, h, h,  -h,-h, h, -h, h, h,
      ]);
      const vEdgeGeo = new THREE.BufferGeometry();
      vEdgeGeo.setAttribute('position', new THREE.BufferAttribute(vEdge, 3));
      group.add(new THREE.LineSegments(vEdgeGeo,
        new THREE.LineBasicMaterial({ color: PARTIAL_DATA })));

      // ── Dashed rim (missing top face outline) ───────────────────────────

      const rimPts = [
        new THREE.Vector3(-h, h, -h), new THREE.Vector3( h, h, -h),
        new THREE.Vector3( h, h,  h), new THREE.Vector3(-h, h,  h),
        new THREE.Vector3(-h, h, -h),
      ];
      const rimGeo = new THREE.BufferGeometry().setFromPoints(rimPts);
      const rimMat = new THREE.LineDashedMaterial({
        color: 0x666666, dashSize: 0.15, gapSize: 0.1,
        transparent: true, opacity: 1,
      });
      const rimLine = new THREE.Line(rimGeo, rimMat);
      rimLine.computeLineDistances();
      group.add(rimLine);

      // "open" label above the missing top
      const openLabel = createTextSprite('open', '#888888');
      openLabel.position.set(0, h + 0.4, 0);
      openLabel.scale.set(0.3, 0.3, 0.3);
      group.add(openLabel);

      // ── Face-formula labels (visible during phase 2+) ───────────────────
      const faceJ0 = createTextSprite('j=0', '#aaaaaa');
      faceJ0.position.set(0, -h - 0.35, 0);
      faceJ0.scale.set(0.25, 0.25, 0.25);
      faceJ0.visible = false;
      group.add(faceJ0);

      const faceI0 = createTextSprite('i=0', '#aaaaaa');
      faceI0.position.set(0, 0, h + 0.35);
      faceI0.scale.set(0.25, 0.25, 0.25);
      faceI0.visible = false;
      group.add(faceI0);

      const faceI1 = createTextSprite('i=1', '#aaaaaa');
      faceI1.position.set(0, 0, -h - 0.35);
      faceI1.scale.set(0.25, 0.25, 0.25);
      faceI1.visible = false;
      group.add(faceI1);

      const faceJ0L = createTextSprite('j=0', '#aaaaaa');
      faceJ0L.position.set(-h - 0.35, 0, 0);
      faceJ0L.scale.set(0.25, 0.25, 0.25);
      faceJ0L.visible = false;
      group.add(faceJ0L);

      const faceJ1 = createTextSprite('j=1', '#aaaaaa');
      faceJ1.position.set(h + 0.35, 0, 0);
      faceJ1.scale.set(0.25, 0.25, 0.25);
      faceJ1.visible = false;
      group.add(faceJ1);

      // ── Lid mesh (FILL_RESULT, initially hidden) ────────────────────────

      const lidGeo = new THREE.PlaneGeometry(boxSize, boxSize, 20, 20);
      const lidMat = new THREE.MeshBasicMaterial({
        color: FILL_RESULT, side: THREE.DoubleSide,
        transparent: true, opacity: 0,
      });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.y = h;
      lid.rotation.x = Math.PI / 2;
      lid.visible = false;
      group.add(lid);

      const lidPositions = lidGeo.attributes.position.array as Float32Array;
      const lidOriginal = new Float32Array(lidPositions);

      // Solid lid-rim edges (FILL_RESULT, appear during fill)
      const lEdge = new Float32Array([
        -h, h,-h,  h, h,-h,   h, h,-h,  h, h, h,
         h, h, h, -h, h, h,  -h, h, h, -h, h,-h,
      ]);
      const lEdgeGeo = new THREE.BufferGeometry();
      lEdgeGeo.setAttribute('position', new THREE.BufferAttribute(lEdge, 3));
      const lidEdgeMat = new THREE.LineBasicMaterial({
        color: FILL_RESULT, transparent: true, opacity: 0,
      });
      const lidEdgeLines = new THREE.LineSegments(lEdgeGeo, lidEdgeMat);
      lidEdgeLines.visible = false;
      group.add(lidEdgeLines);

      scene.add(group);

      (scene as any)._kan = {
        group, boxSize, h,
        bottomMat, sideMats,
        rimLine, rimMat, openLabel,
        lid, lidMat, lidGeo, lidPositions, lidOriginal,
        lidEdgeLines, lidEdgeMat,
        faceLabels: [faceJ0, faceI0, faceI1, faceJ0L, faceJ1],
      };

      kanFillingRule.termMappings = [
        { termKey: 'a_0', objects: [bottom] },
        { termKey: 'u', objects: sides },
        { termKey: 'fill', objects: [lid] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      const k = (scene as any)._kan;
      if (!k) return;

      const t = elapsed !== undefined ? time : (Math.sin(time * 0.5) + 1) / 2;
      const raw = elapsed ?? time;

      // ── Phase 1: Open box (t ∈ [0, 0.15)) ──────────────────────────────
      if (t < 0.15) {
        const pulse = 0.5 + 0.5 * Math.sin(raw * 3);

        k.rimLine.visible = true;
        k.rimMat.opacity = 0.5 + 0.5 * pulse;
        k.openLabel.visible = true;
        (k.openLabel.material as THREE.SpriteMaterial).opacity = 0.5 + 0.5 * pulse;

        k.bottomMat.opacity = 0.3;
        for (const m of k.sideMats) m.opacity = 0.2;

        for (const fl of k.faceLabels) fl.visible = false;

        k.lid.visible = false;
        k.lidEdgeLines.visible = false;
      }
      // ── Phase 2: Face formula φ (t ∈ [0.15, 0.5)) ──────────────────────
      else if (t < 0.5) {
        k.rimLine.visible = true;
        k.rimMat.opacity = 0.8;
        k.openLabel.visible = true;
        (k.openLabel.material as THREE.SpriteMaterial).opacity = 0.7;

        for (const fl of k.faceLabels) fl.visible = true;

        // Sequential face highlighting (bottom a₀ then 4 sides u)
        const totalFaces = 5;
        const cyclePos = (raw * 1.2) % totalFaces;
        const idx = Math.floor(cyclePos);
        const flash = Math.pow(Math.max(0, 1 - (cyclePos - idx) * 2.5), 2);

        k.bottomMat.opacity = 0.15;
        for (const m of k.sideMats) m.opacity = 0.1;

        if (idx === 0) {
          k.bottomMat.opacity = 0.15 + 0.55 * flash;
        } else {
          k.sideMats[idx - 1].opacity = 0.1 + 0.6 * flash;
        }

        k.lid.visible = false;
        k.lidEdgeLines.visible = false;
      }
      // ── Phase 3: Filling (t ∈ [0.5, 1.0]) ──────────────────────────────
      else {
        const fp = (t - 0.5) / 0.5; // fill progress 0 → 1

        // Fade out dashed rim & "open" label quickly
        const fade = Math.max(0, 1 - fp * 4);
        k.rimLine.visible = fade > 0.01;
        k.rimMat.opacity = fade;
        k.openLabel.visible = fade > 0.01;
        (k.openLabel.material as THREE.SpriteMaterial).opacity = fade;

        // Fade out face labels
        for (const fl of k.faceLabels) {
          fl.visible = fade > 0.01;
          (fl.material as THREE.SpriteMaterial).opacity = fade;
        }

        k.bottomMat.opacity = 0.3;
        for (const m of k.sideMats) m.opacity = 0.2;

        // Lid rim edges appear first
        k.lidEdgeLines.visible = true;
        k.lidEdgeMat.opacity = Math.min(1, fp * 3);

        // Lid mesh fills from edges inward via vertex displacement
        k.lid.visible = true;
        const lf = Math.max(0, (fp - 0.1) / 0.9);
        k.lidMat.opacity = 0.7 * Math.min(1, lf * 1.5);

        const pos = k.lidPositions as Float32Array;
        const orig = k.lidOriginal as Float32Array;
        const hh = k.h as number;
        const bs = k.boxSize as number;

        for (let i = 0; i < pos.length; i += 3) {
          const lx = orig[i];
          const ly = orig[i + 1];
          // Chebyshev distance: 0 at center, 1 at edges
          const cheb = Math.max(Math.abs(lx), Math.abs(ly)) / hh;
          // Edges fill first, center fills last
          const delay = (1 - cheb) * 0.5;
          const vp = Math.max(0, Math.min(1, (lf - delay) / Math.max(0.01, 1 - delay)));
          const eased = vp * vp * (3 - 2 * vp); // smoothstep
          // Displace unfilled vertices below the lid plane
          pos[i + 2] = (1 - eased) * bs * 0.4;
        }
        k.lidGeo.attributes.position.needsUpdate = true;
      }

      // Gentle rotation
      k.group.rotation.y = raw * 0.12;
      k.group.rotation.x = 0.2 + Math.sin(raw * 0.08) * 0.08;
    },

    cleanup: (scene: THREE.Scene) => {
      const k = (scene as any)._kan;
      if (k) scene.remove(k.group);
    },

    steps: [
      {
        label: 'Open box',
        description: 'Kan filling starts with an open box: 5 faces are given by the partial element u under face formula φ. The top lid is missing.',
        timeRange: [0, 0.15],
      },
      {
        label: 'Given data φ',
        description: 'The face formula φ = [i=0 ↦ u₀, i=1 ↦ u₁, j=0 ↦ a₀] specifies exactly which faces are provided.',
        timeRange: [0.15, 0.5],
      },
      {
        label: 'Filling',
        description: 'The Kan condition guarantees a unique filler exists. The missing lid comp^i A [φ ↦ u] a₀ is computed from the boundary data.',
        timeRange: [0.5, 1.0],
      },
    ],
  };
</script>

<Rule rule={kanFillingRule} />
