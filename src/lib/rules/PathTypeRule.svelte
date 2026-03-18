<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, RESULT, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  let arcLine: THREE.Line;
  let leftSphere: THREE.Mesh;
  let rightSphere: THREE.Mesh;
  let dot: THREE.Mesh;
  let arcPoints: THREE.Vector3[] = [];

  const pathTypeRule: RuleDefinition = {
    name: "Path Types - Introduction",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash')} ${kt('t', 't')} ${km(': A')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('\\langle i \\rangle\\, t', 'path')} ${km(': \\mathrm{Path}_A')} ${kt('\\,t(i_0)', 't_i0')} ${kt('\\,t(i_1)', 't_i1')}</div>
      </div>
    `,
    description: `A path is a function from the interval 𝕀 to a type A. The interval has two endpoints: ${km('i_0')} (zero) and ${km('i_1')} (one).`,

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      camera.position.set(0, 1.5, 7);
      (camera as THREE.PerspectiveCamera).lookAt(0, 0, 0);

      // Gradient arc from left to right
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(0, 1.2, 0),
        new THREE.Vector3(2, 0, 0),
      );
      arcPoints = curve.getPoints(60);

      const positions = new Float32Array(arcPoints.length * 3);
      const colors = new Float32Array(arcPoints.length * 3);
      const colorA = new THREE.Color(INTERVAL);
      const colorB = new THREE.Color(RESULT);
      for (let i = 0; i < arcPoints.length; i++) {
        positions[i * 3] = arcPoints[i].x;
        positions[i * 3 + 1] = arcPoints[i].y;
        positions[i * 3 + 2] = arcPoints[i].z;
        const c = colorA.clone().lerp(colorB, i / (arcPoints.length - 1));
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      const arcGeo = new THREE.BufferGeometry();
      arcGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      arcGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      arcLine = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ vertexColors: true }));
      scene.add(arcLine);

      // Left endpoint sphere (cyan)
      leftSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 32, 32),
        new THREE.MeshBasicMaterial({ color: INTERVAL }),
      );
      leftSphere.position.set(-2, 0, 0);
      scene.add(leftSphere);

      // Right endpoint sphere (orange)
      rightSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 32, 32),
        new THREE.MeshBasicMaterial({ color: RESULT }),
      );
      rightSphere.position.set(2, 0, 0);
      scene.add(rightSphere);

      // Animated white dot
      dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
      );
      scene.add(dot);

      // Labels
      const labelT = createTextSprite('t', '#FFFFFF');
      labelT.position.set(0, 1.5, 0);
      scene.add(labelT);

      const labelI0 = createTextSprite('t(i₀)', hexCss(INTERVAL));
      labelI0.position.set(-2, -0.5, 0);
      scene.add(labelI0);

      const labelI1 = createTextSprite('t(i₁)', hexCss(RESULT));
      labelI1.position.set(2, -0.5, 0);
      scene.add(labelI1);

      pathTypeRule.termMappings = [
        { termKey: 't', objects: [arcLine] },
        { termKey: 'path', objects: [arcLine] },
        { termKey: 't_i0', objects: [leftSphere] },
        { termKey: 't_i1', objects: [rightSphere] },
      ];
    },

    update: (t: number, _elapsed?: number) => {
      if (arcPoints.length > 0) {
        const frac = t * (arcPoints.length - 1);
        const i0 = Math.min(Math.floor(frac), arcPoints.length - 2);
        const alpha = frac - i0;
        dot.position.lerpVectors(arcPoints[i0], arcPoints[i0 + 1], alpha);
      }
    },

    cleanup: (scene: THREE.Scene) => {
      // Remove all direct children added in setup
      const toRemove: THREE.Object3D[] = [];
      scene.traverse((obj) => { if (obj !== scene) toRemove.push(obj); });
      for (const obj of toRemove) scene.remove(obj);
    },

    steps: [
      {
        label: 'Path body',
        description: 't is a term of type A parameterized by i : 𝕀. It assigns a point in A to each moment along the interval.',
        timeRange: [0, 0.4],
      },
      {
        label: 'Endpoints',
        description: 'The path introduction ⟨i⟩t has left endpoint t(i₀) and right endpoint t(i₁) — definitionally.',
        timeRange: [0.4, 0.7],
      },
      {
        label: 'Path type',
        description: 'Path_A t(i₀) t(i₁) is the type of all paths in A from t(i₀) to t(i₁).',
        timeRange: [0.7, 1.0],
      },
    ],
  };
</script>

<Rule rule={pathTypeRule} />
