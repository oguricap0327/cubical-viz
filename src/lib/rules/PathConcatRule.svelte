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

  const DIM_POINT = 0x334455;

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

      // Triangle vertex positions
      const posA = new THREE.Vector3(-2, -1.2, 0);
      const posB = new THREE.Vector3(0, 1.5, 0);
      const posC = new THREE.Vector3(2, -1.2, 0);

      // Point spheres
      const sphereA = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 24, 24),
        new THREE.MeshBasicMaterial({ color: INTERVAL })
      );
      sphereA.position.copy(posA);
      group.add(sphereA);

      const sphereB = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 24, 24),
        new THREE.MeshBasicMaterial({ color: BASE_POINT })
      );
      sphereB.position.copy(posB);
      group.add(sphereB);

      const sphereC = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 24, 24),
        new THREE.MeshBasicMaterial({ color: RESULT })
      );
      sphereC.position.copy(posC);
      group.add(sphereC);

      // Quadratic Bezier curves
      const curveP = new THREE.QuadraticBezierCurve3(
        posA, new THREE.Vector3(-1.5, 0.5, 1.2), posB
      );
      const curveQ = new THREE.QuadraticBezierCurve3(
        posB, new THREE.Vector3(1.5, 0.5, 1.2), posC
      );
      const curvePQ = new THREE.QuadraticBezierCurve3(
        posA, new THREE.Vector3(0, -0.5, 1.8), posC
      );

      // Build a line with vertex-color gradient along a curve
      function createCurveLine(
        curve: THREE.QuadraticBezierCurve3,
        colorA: number, colorB: number, segments = 64
      ): THREE.Line {
        const pts = curve.getPoints(segments);
        const colors: number[] = [];
        const cA = new THREE.Color(colorA);
        const cB = new THREE.Color(colorB);
        const tmp = new THREE.Color();
        for (let i = 0; i <= segments; i++) {
          tmp.copy(cA).lerp(cB, i / segments);
          colors.push(tmp.r, tmp.g, tmp.b);
        }
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        return new THREE.Line(
          geom,
          new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 })
        );
      }

      // Bright paths
      const lineP = createCurveLine(curveP, INTERVAL, BASE_POINT);
      group.add(lineP);

      const lineQ = createCurveLine(curveQ, BASE_POINT, RESULT);
      group.add(lineQ);

      // Faded paths for step 3
      const linePFaded = createCurveLine(curveP, 0x335566, 0x335566);
      linePFaded.visible = false;
      group.add(linePFaded);

      const lineQFaded = createCurveLine(curveQ, 0x553322, 0x553322);
      lineQFaded.visible = false;
      group.add(lineQFaded);

      // Concatenated path p∙q (solid pink)
      const linePQ = createCurveLine(curvePQ, FILL_RESULT, FILL_RESULT);
      linePQ.visible = false;
      group.add(linePQ);

      // Traveling dot spheres (radius 0.12)
      const dotP = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshBasicMaterial({ color: INTERVAL })
      );
      group.add(dotP);

      const dotQ = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshBasicMaterial({ color: RESULT })
      );
      dotQ.visible = false;
      group.add(dotQ);

      const dotPQ = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshBasicMaterial({ color: FILL_RESULT })
      );
      dotPQ.visible = false;
      group.add(dotPQ);

      // Point labels — above each vertex
      const labelA = createTextSprite('a', hexCss(INTERVAL));
      labelA.position.set(posA.x, posA.y + 0.5, posA.z);
      labelA.scale.set(0.3, 0.3, 0.3);
      group.add(labelA);

      const labelB = createTextSprite('b', hexCss(BASE_POINT));
      labelB.position.set(posB.x, posB.y + 0.5, posB.z);
      labelB.scale.set(0.3, 0.3, 0.3);
      group.add(labelB);

      const labelC = createTextSprite('c', hexCss(RESULT));
      labelC.position.set(posC.x, posC.y + 0.5, posC.z);
      labelC.scale.set(0.3, 0.3, 0.3);
      group.add(labelC);

      // Path labels at curve midpoints, offset outward from triangle center
      const midP = curveP.getPoint(0.5);
      const labelP = createTextSprite('p', hexCss(INTERVAL));
      labelP.position.set(midP.x - 0.4, midP.y + 0.3, midP.z);
      labelP.scale.set(0.25, 0.25, 0.25);
      group.add(labelP);

      const midQ = curveQ.getPoint(0.5);
      const labelQ = createTextSprite('q', hexCss(RESULT));
      labelQ.position.set(midQ.x + 0.4, midQ.y + 0.3, midQ.z);
      labelQ.scale.set(0.25, 0.25, 0.25);
      group.add(labelQ);

      const midPQ = curvePQ.getPoint(0.5);
      const labelPQ = createTextSprite('p·q', hexCss(FILL_RESULT));
      labelPQ.position.set(midPQ.x, midPQ.y - 0.5, midPQ.z);
      labelPQ.scale.set(0.25, 0.25, 0.25);
      labelPQ.visible = false;
      group.add(labelPQ);

      scene.add(group);

      // Store refs for the animation loop
      (scene as any)._concatRefs = {
        group, curveP, curveQ, curvePQ,
        sphereA, sphereB, sphereC,
        lineP, lineQ, linePFaded, lineQFaded, linePQ,
        dotP, dotQ, dotPQ,
        labelP, labelQ, labelPQ,
      };

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
      const r = (scene as any)._concatRefs;
      if (!r) return;

      const t = elapsed !== undefined ? time : (Math.sin(time * 0.5) + 1) / 2;
      const rawTime = elapsed ?? time;
      const osc = (Math.sin(rawTime * 1.2) + 1) / 2;

      const isStep1 = t < 0.35;
      const isStep2 = t >= 0.35 && t < 0.65;
      const isStep3 = t >= 0.65;

      // --- Point colors per step ---
      (r.sphereA.material as THREE.MeshBasicMaterial).color.setHex(INTERVAL);
      if (isStep1) {
        (r.sphereB.material as THREE.MeshBasicMaterial).color.setHex(DIM_POINT);
        (r.sphereC.material as THREE.MeshBasicMaterial).color.setHex(DIM_POINT);
      } else {
        (r.sphereB.material as THREE.MeshBasicMaterial).color.setHex(BASE_POINT);
        (r.sphereC.material as THREE.MeshBasicMaterial).color.setHex(RESULT);
      }

      // --- Path visibility ---
      r.lineP.visible = !isStep3;
      r.lineQ.visible = isStep2;
      r.linePFaded.visible = isStep3;
      r.lineQFaded.visible = isStep3;
      r.linePQ.visible = isStep3;

      // --- Traveling dots ---
      if (isStep1) {
        r.dotP.visible = true;
        r.dotP.position.copy(r.curveP.getPoint(osc));
        const c = new THREE.Color(INTERVAL).lerp(new THREE.Color(BASE_POINT), osc);
        (r.dotP.material as THREE.MeshBasicMaterial).color.copy(c);
        r.dotQ.visible = false;
        r.dotPQ.visible = false;
      } else if (isStep2) {
        r.dotP.visible = false;
        r.dotQ.visible = true;
        r.dotQ.position.copy(r.curveQ.getPoint(osc));
        const c = new THREE.Color(BASE_POINT).lerp(new THREE.Color(RESULT), osc);
        (r.dotQ.material as THREE.MeshBasicMaterial).color.copy(c);
        r.dotPQ.visible = false;
      } else {
        r.dotP.visible = false;
        r.dotQ.visible = false;
        r.dotPQ.visible = true;
        r.dotPQ.position.copy(r.curvePQ.getPoint(osc));
      }

      // --- Label visibility ---
      r.labelP.visible = true;
      r.labelQ.visible = !isStep1;
      r.labelPQ.visible = isStep3;
    },

    cleanup: (scene: THREE.Scene) => {
      const r = (scene as any)._concatRefs;
      if (r) scene.remove(r.group);
    },

    steps: [
      {
        label: 'Path p',
        description: 'p : a =_A b is a path from a to b — a continuous map I → A with p(i₀) = a, p(i₁) = b',
        timeRange: [0, 0.35],
      },
      {
        label: 'Path q',
        description: 'q : b =_A c is a path from b to c, sharing endpoint b with p',
        timeRange: [0.35, 0.65],
      },
      {
        label: 'Concatenation p∙q',
        description: 'p ∙ q first traverses p (i ∈ [0, ½]), then q (i ∈ [½, 1]). This is path composition — concatenating witnesses of equality.',
        timeRange: [0.65, 1.0],
      },
    ],
  };
</script>

<Rule rule={pathConcatRule} />
