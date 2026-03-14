<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, BASE_POINT, RESULT, FILL_RESULT, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  const pathConcatRule: RuleDefinition = {
    name: "Path Concatenation",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma \\vdash')} ${kt('p', 'p')} ${km(': ')} ${kt('a', 'a')} ${km('=_A')} ${kt('b', 'b')} ${km('\\quad \\Gamma \\vdash')} ${kt('q', 'q')} ${km(': ')} ${kt('b', 'b')} ${km('=_A')} ${kt('c', 'c')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('p \\cdot q', 'pq')} ${km(': ')} ${kt('a', 'a')} ${km('=_A')} ${kt('c', 'c')}</div>
      </div>
    `,
    description: "Path concatenation joins two paths end-to-end: first traverse p, then q. This witnesses transitivity of path equality.",

    setup: (scene: THREE.Scene, _camera: THREE.Camera) => {
      const group = new THREE.Group();

      // Three point spheres: a, b, c
      const sphereA = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 24, 24),
        new THREE.MeshBasicMaterial({ color: INTERVAL })
      );
      sphereA.position.set(-2, 0, 0);
      group.add(sphereA);

      const sphereB = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 24, 24),
        new THREE.MeshBasicMaterial({ color: BASE_POINT })
      );
      sphereB.position.set(0, 0, 0);
      group.add(sphereB);

      const sphereC = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 24, 24),
        new THREE.MeshBasicMaterial({ color: RESULT })
      );
      sphereC.position.set(2, 0, 0);
      group.add(sphereC);

      // Helper: create gradient line between two points
      function createGradientLine(
        from: THREE.Vector3, to: THREE.Vector3,
        colorA: number, colorB: number, segments = 40
      ): THREE.Line {
        const points: THREE.Vector3[] = [];
        const colors: number[] = [];
        const cA = new THREE.Color(colorA);
        const cB = new THREE.Color(colorB);
        const tmp = new THREE.Color();
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          points.push(new THREE.Vector3().lerpVectors(from, to, t));
          tmp.copy(cA).lerp(cB, t);
          colors.push(tmp.r, tmp.g, tmp.b);
        }
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        return new THREE.Line(geom, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 }));
      }

      // Path p: a → b (cyan → yellow)
      const posA = new THREE.Vector3(-2, 0, 0);
      const posB = new THREE.Vector3(0, 0, 0);
      const posC = new THREE.Vector3(2, 0, 0);

      const lineP = createGradientLine(posA, posB, INTERVAL, BASE_POINT);
      group.add(lineP);

      // Path q: b → c (yellow → orange)
      const lineQ = createGradientLine(posB, posC, BASE_POINT, RESULT);
      group.add(lineQ);

      // Concatenated path p∙q: a → c (pink, initially hidden)
      const linePQ = createGradientLine(
        new THREE.Vector3(-2, 0.4, 0),
        new THREE.Vector3(2, 0.4, 0),
        FILL_RESULT, FILL_RESULT
      );
      linePQ.visible = false;
      group.add(linePQ);

      // Traveling dots
      const dotP = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: INTERVAL })
      );
      group.add(dotP);

      const dotQ = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: RESULT })
      );
      group.add(dotQ);

      const dotPQ = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: FILL_RESULT })
      );
      dotPQ.visible = false;
      group.add(dotPQ);

      // Labels
      const labelA = createTextSprite('a', hexCss(INTERVAL));
      labelA.position.set(-2, -0.6, 0);
      labelA.scale.set(0.3, 0.3, 0.3);
      group.add(labelA);

      const labelB = createTextSprite('b', hexCss(BASE_POINT));
      labelB.position.set(0, -0.6, 0);
      labelB.scale.set(0.3, 0.3, 0.3);
      group.add(labelB);

      const labelC = createTextSprite('c', hexCss(RESULT));
      labelC.position.set(2, -0.6, 0);
      labelC.scale.set(0.3, 0.3, 0.3);
      group.add(labelC);

      const labelP = createTextSprite('p', hexCss(INTERVAL));
      labelP.position.set(-1, 0.4, 0);
      labelP.scale.set(0.25, 0.25, 0.25);
      group.add(labelP);

      const labelQ = createTextSprite('q', hexCss(RESULT));
      labelQ.position.set(1, 0.4, 0);
      labelQ.scale.set(0.25, 0.25, 0.25);
      group.add(labelQ);

      const labelPQ = createTextSprite('p∙q', hexCss(FILL_RESULT));
      labelPQ.position.set(0, 0.9, 0);
      labelPQ.scale.set(0.25, 0.25, 0.25);
      labelPQ.visible = false;
      group.add(labelPQ);

      scene.add(group);

      // Store references for animation
      (scene as any)._concatGroup = group;
      (scene as any)._concatDotP = dotP;
      (scene as any)._concatDotQ = dotQ;
      (scene as any)._concatDotPQ = dotPQ;
      (scene as any)._concatLinePQ = linePQ;
      (scene as any)._concatLabelPQ = labelPQ;
      (scene as any)._concatLineP = lineP;
      (scene as any)._concatLineQ = lineQ;
      (scene as any)._concatLabelP = labelP;
      (scene as any)._concatLabelQ = labelQ;

      pathConcatRule.termMappings = [
        { termKey: 'a', objects: [sphereA] },
        { termKey: 'b', objects: [sphereB] },
        { termKey: 'c', objects: [sphereC] },
        { termKey: 'p', objects: [lineP] },
        { termKey: 'q', objects: [lineQ] },
        { termKey: 'pq', objects: [linePQ] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;

      const dotP = (scene as any)._concatDotP as THREE.Mesh | undefined;
      const dotQ = (scene as any)._concatDotQ as THREE.Mesh | undefined;
      const dotPQ = (scene as any)._concatDotPQ as THREE.Mesh | undefined;
      const linePQ = (scene as any)._concatLinePQ as THREE.Line | undefined;
      const labelPQ = (scene as any)._concatLabelPQ as THREE.Sprite | undefined;
      const lineP = (scene as any)._concatLineP as THREE.Line | undefined;
      const lineQ = (scene as any)._concatLineQ as THREE.Line | undefined;
      const labelP = (scene as any)._concatLabelP as THREE.Sprite | undefined;
      const labelQ = (scene as any)._concatLabelQ as THREE.Sprite | undefined;

      if (!dotP || !dotQ || !dotPQ || !linePQ || !labelPQ) return;

      const t = elapsed !== undefined ? time : (Math.sin(time * 0.5) + 1) / 2;
      const rawTime = elapsed ?? time;
      const osc = (Math.sin(rawTime * 1.5) + 1) / 2;

      const posA = new THREE.Vector3(-2, 0, 0);
      const posB = new THREE.Vector3(0, 0, 0);
      const posC = new THREE.Vector3(2, 0, 0);

      // Step 1: t in [0, 0.3] — show path p
      // Step 2: t in [0.3, 0.6] — show path q
      // Step 3: t in [0.6, 1.0] — show concatenation p∙q
      const isStep3 = t >= 0.6;

      // Traveling dot on p
      dotP.position.lerpVectors(posA, posB, osc);
      dotP.visible = !isStep3;

      // Traveling dot on q
      dotQ.position.lerpVectors(posB, posC, osc);
      dotQ.visible = !isStep3;

      // Show/hide p∙q elements
      linePQ.visible = isStep3;
      labelPQ.visible = isStep3;
      dotPQ.visible = isStep3;

      if (isStep3) {
        // Dot traverses the combined path a → c along the upper arc
        const pqA = new THREE.Vector3(-2, 0.4, 0);
        const pqC = new THREE.Vector3(2, 0.4, 0);
        dotPQ.position.lerpVectors(pqA, pqC, osc);

        // Fade p and q lines slightly
        if (lineP) {
          (lineP.material as THREE.LineBasicMaterial).opacity = 0.35;
          (lineP.material as THREE.LineBasicMaterial).transparent = true;
        }
        if (lineQ) {
          (lineQ.material as THREE.LineBasicMaterial).opacity = 0.35;
          (lineQ.material as THREE.LineBasicMaterial).transparent = true;
        }
        if (labelP) labelP.material.opacity = 0.35;
        if (labelQ) labelQ.material.opacity = 0.35;
      } else {
        if (lineP) {
          (lineP.material as THREE.LineBasicMaterial).opacity = 1;
          (lineP.material as THREE.LineBasicMaterial).transparent = false;
        }
        if (lineQ) {
          (lineQ.material as THREE.LineBasicMaterial).opacity = 1;
          (lineQ.material as THREE.LineBasicMaterial).transparent = false;
        }
        if (labelP) labelP.material.opacity = 1;
        if (labelQ) labelQ.material.opacity = 1;
      }
    },

    cleanup: (scene: THREE.Scene) => {
      const group = (scene as any)._concatGroup;
      if (group) scene.remove(group);
    },

    steps: [
      {
        label: 'Path p',
        description: 'p : a =_A b is a path from a to b — a continuous map I → A with p(i₀) = a, p(i₁) = b',
        timeRange: [0, 0.3],
      },
      {
        label: 'Path q',
        description: 'q : b =_A c is a path from b to c, sharing endpoint b with p',
        timeRange: [0.3, 0.6],
      },
      {
        label: 'Concatenation p∙q',
        description: 'p ∙ q first traverses p (i ∈ [0, ½]), then q (i ∈ [½, 1]). This is path composition — concatenating witnesses of equality.',
        timeRange: [0.6, 1.0],
      },
    ],
  };
</script>

<Rule rule={pathConcatRule} />
