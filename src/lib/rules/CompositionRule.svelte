<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { createAxes } from '../three/axes';
  import { BASE_POINT, PARTIAL_DATA, FILL_RESULT, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  const SQ = 1.4; // unit square side length
  const HALF = SQ / 2;

  // Square corners (XY plane, centered at origin)
  const BL = new THREE.Vector3(-HALF, -HALF, 0); // bottom-left
  const BR = new THREE.Vector3( HALF, -HALF, 0); // bottom-right
  const TL = new THREE.Vector3(-HALF,  HALF, 0); // top-left
  const TR = new THREE.Vector3( HALF,  HALF, 0); // top-right

  function makeEdge(a: THREE.Vector3, b: THREE.Vector3, color: number): THREE.Line {
    const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 3 });
    return new THREE.Line(geo, mat);
  }

  const compositionRule: RuleDefinition = {
    name: "Composition - The Heart of Cubical",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash A \\quad \\Gamma \\vdash \\varphi : \\mathbb{F} \\quad \\Gamma,\\, \\varphi,\\, i : \\mathbb{I} \\vdash')} ${kt('u', 'u')} ${km(': A \\quad \\Gamma \\vdash')} ${kt('a_0', 'a0')} ${km(': A(i_0)[\\varphi \\mapsto u(i_0)]')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('\\mathrm{comp}^i\\, A\\, [\\varphi \\mapsto u]\\, a_0', 'comp')} ${km(': A(i_1)[\\varphi \\mapsto u(i_1)]')}</div>
      </div>
    `,
    description: `Being extensible is preserved along paths: if a partial path is extensible at ${km('i=0')}, then it is extensible at ${km('i=1')}.`,

    setup: (scene: THREE.Scene, _camera: THREE.Camera) => {
      const group = new THREE.Group();

      // --- Static edges (given data) ---
      const bottomEdge = makeEdge(BL, BR, PARTIAL_DATA);  // a₀ base path
      const leftEdge   = makeEdge(BL, TL, BASE_POINT);    // u₀ (i=0 face)
      const rightEdge  = makeEdge(BR, TR, FILL_RESULT);   // u₁ (i=1 face)
      group.add(bottomEdge, leftEdge, rightEdge);

      // --- Animated top edge (composition result) ---
      const topSegments = 64;
      const topPositions = new Float32Array((topSegments + 1) * 3);
      const topColors    = new Float32Array((topSegments + 1) * 3);
      const baseColor   = new THREE.Color(BASE_POINT);
      const resultColor = new THREE.Color(FILL_RESULT);
      const tmpColor    = new THREE.Color();

      for (let i = 0; i <= topSegments; i++) {
        const frac = i / topSegments;
        // positions initialised to top-left (will be updated in animate)
        topPositions[i * 3]     = TL.x + frac * (TR.x - TL.x);
        topPositions[i * 3 + 1] = TL.y;
        topPositions[i * 3 + 2] = 0;
        // gradient colour
        tmpColor.copy(baseColor).lerp(resultColor, frac);
        topColors[i * 3]     = tmpColor.r;
        topColors[i * 3 + 1] = tmpColor.g;
        topColors[i * 3 + 2] = tmpColor.b;
      }

      const topGeo = new THREE.BufferGeometry();
      topGeo.setAttribute('position', new THREE.BufferAttribute(topPositions, 3));
      topGeo.setAttribute('color',    new THREE.BufferAttribute(topColors, 3));
      const topMat = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 3 });
      const topEdge = new THREE.Line(topGeo, topMat);
      group.add(topEdge);

      // Moving dot that traces the top edge
      const dotGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const dotMat = new THREE.MeshStandardMaterial({
        color: FILL_RESULT,
        emissive: 0xcc2288,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(TL);
      group.add(dot);

      // --- Labels ---
      const labelA0 = createTextSprite('a₀', hexCss(PARTIAL_DATA));
      labelA0.position.set(BL.x - 0.15, BL.y - 0.2, 0);
      labelA0.scale.set(0.25, 0.25, 0.25);
      group.add(labelA0);

      const labelComp = createTextSprite('comp', hexCss(FILL_RESULT));
      labelComp.position.set(TR.x + 0.2, TR.y + 0.15, 0);
      labelComp.scale.set(0.25, 0.25, 0.25);
      group.add(labelComp);

      const axes = createAxes(scene);

      scene.add(group);

      // Store references for animation
      (scene as any)._compositionGroup = group;
      (scene as any)._axes = axes;
      (scene as any)._topEdge = topEdge;
      (scene as any)._dot = dot;

      // Term mappings for hover highlighting
      compositionRule.termMappings = [
        { termKey: 'a0',   objects: [bottomEdge] },
        { termKey: 'u',    objects: [leftEdge, rightEdge] },
        { termKey: 'comp', objects: [topEdge, dot] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;

      const topEdge = (scene as any)._topEdge as THREE.Line | undefined;
      const dot     = (scene as any)._dot as THREE.Mesh | undefined;
      if (!topEdge || !dot) return;

      // When elapsed is provided, time is already a normalized t in [0,1]
      const t = elapsed !== undefined ? time : (Math.sin(time * 0.5) + 1) / 2;

      // Update the top edge draw range so only the portion 0..t is visible
      const posAttr = topEdge.geometry.getAttribute('position') as THREE.BufferAttribute;
      const segments = posAttr.count - 1;
      const drawCount = Math.max(2, Math.floor(t * segments) + 1);
      topEdge.geometry.setDrawRange(0, drawCount);

      // Move the dot to the leading point of the top edge
      const dx = TR.x - TL.x;
      dot.position.set(TL.x + t * dx, TL.y, 0);
    },

    cleanup: (scene: THREE.Scene) => {
      const group = (scene as any)._compositionGroup;
      if (group) scene.remove(group);
      const axes = (scene as any)._axes;
      if (axes) scene.remove(axes);
    },

    steps: [
      {
        label: 'Given edges',
        description: 'Three edges of the square are given: the base path a₀ and two partial paths u.',
        timeRange: [0, 0.05],
      },
      {
        label: 'Filling',
        description: 'The composition fills the missing top edge, sweeping from left to right.',
        timeRange: [0.05, 0.95],
      },
      {
        label: 'Result',
        description: 'compⁱ A [φ ↦ u] a₀ : A(i₁) — the composed path lives in the fiber at i=1.',
        timeRange: [0.95, 1.0],
      },
    ],
  };

</script>

<Rule rule={compositionRule} />
