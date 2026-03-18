<script lang="ts">
  import Rule from '../rules/Rule.svelte';
  import type { RuleDefinition } from '../rules/types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import katex from 'katex';

  let { onComplete }: { onComplete: () => void } = $props();
  let activeStep = $state(0);

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  // Scene objects (assigned in setup, read in update/cleanup)
  let sphereA: THREE.Mesh;
  let sphereB: THREE.Mesh;
  let arcLine: THREE.Line;
  let dot: THREE.Mesh;
  let labelA: THREE.Sprite;
  let labelB: THREE.Sprite;
  let labelE: THREE.Sprite;
  let labelI: THREE.Sprite;
  let dashedLine: THREE.Line;
  let arcPoints: THREE.Vector3[] = [];

  const rule: RuleDefinition = {
    name: 'Setup: Given e : A ≃ B',
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma \\vdash')} ${kt('A', 'A')} ${km(': \\mathcal{U} \\quad \\Gamma \\vdash')} ${kt('B', 'B')} ${km(': \\mathcal{U} \\quad \\Gamma \\vdash')} ${kt('e', 'e')} ${km(': A \\simeq B')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash \\mathrm{ua}(')}${kt('e', 'e')}${km(') :')} ${kt('A', 'A')} ${km('=_{\\mathcal{U}}')} ${kt('B', 'B')}</div>
      </div>
    `,
    description: 'Starting with an equivalence <i>e</i> : A ≃ B, we construct a path ua(<i>e</i>) : A =<sub>𝒰</sub> B in the universe.',

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      camera.position.set(0, 1, 7);

      // Sphere A (cyan)
      sphereA = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x44DDFF }),
      );
      sphereA.position.set(-2, 0, 0);
      scene.add(sphereA);

      // Sphere B (orange)
      sphereB = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xFF8844 }),
      );
      sphereB.position.set(2, 0, 0);
      scene.add(sphereB);

      // Arc from A to B with vertex-color gradient (cyan → orange)
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(0, 2, 1),
        new THREE.Vector3(2, 0, 0),
      );
      arcPoints = curve.getPoints(50);

      const positions = new Float32Array(arcPoints.length * 3);
      const colors = new Float32Array(arcPoints.length * 3);
      const colorA = new THREE.Color(0x44DDFF);
      const colorB = new THREE.Color(0xFF8844);
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
      arcLine.visible = false;
      scene.add(arcLine);

      // Animated dot on arc
      dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
      );
      dot.visible = false;
      scene.add(dot);

      // Dashed line from A to B
      const dashedGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(2, 0, 0),
      ]);
      const dashedMat = new THREE.LineDashedMaterial({
        color: 0x444466,
        dashSize: 0.3,
        gapSize: 0.15,
      });
      dashedLine = new THREE.Line(dashedGeo, dashedMat);
      dashedLine.computeLineDistances();
      dashedLine.visible = false;
      scene.add(dashedLine);

      // Labels
      labelA = createTextSprite('A', '#44DDFF');
      labelA.position.set(-2, 0.9, 0);
      scene.add(labelA);

      labelB = createTextSprite('B', '#FF8844');
      labelB.position.set(2, 0.9, 0);
      scene.add(labelB);

      labelE = createTextSprite('e', '#FFFFFF');
      labelE.position.set(0, 1.8, 0.5);
      labelE.visible = false;
      scene.add(labelE);

      labelI = createTextSprite('i ∈ [0,1]', '#888888');
      labelI.position.set(0, -0.6, 0);
      labelI.visible = false;
      scene.add(labelI);

      rule.termMappings = [
        { termKey: 'A', objects: [sphereA] },
        { termKey: 'B', objects: [sphereB] },
        { termKey: 'e', objects: [arcLine] },
      ];
    },

    update: (t: number, elapsed?: number) => {
      // Derive step from t (timeRanges: [0,0.4], [0.4,0.7], [0.7,1.0])
      const step = t < 0.4 ? 0 : t < 0.7 ? 1 : 2;

      // Step 1: spheres + labels always visible
      sphereA.visible = true;
      sphereB.visible = true;
      labelA.visible = true;
      labelB.visible = true;

      // Step 2+: arc and animated dot
      arcLine.visible = step >= 1;
      dot.visible = step >= 1;
      labelE.visible = step >= 1;

      // Step 3: dashed line
      dashedLine.visible = step >= 2;
      labelI.visible = step >= 2;

      // Animate dot along arc (smooth sub-point interpolation)
      if (step >= 1 && arcPoints.length > 0) {
        const frac = t * (arcPoints.length - 1);
        const i0 = Math.min(Math.floor(frac), arcPoints.length - 2);
        const alpha = frac - i0;
        dot.position.lerpVectors(arcPoints[i0], arcPoints[i0 + 1], alpha);
      }
    },

    cleanup: (scene: THREE.Scene) => {
      scene.remove(sphereA, sphereB, arcLine, dot, labelA, labelB, labelE, labelI, dashedLine);
    },

    steps: [
      {
        label: 'Two types',
        description: 'A and B are types in the universe 𝒰. In the univalence proof, we start with an equivalence e : A ≃ B.',
        timeRange: [0, 0.4],
      },
      {
        label: 'Equivalence',
        description: 'An equivalence e : A ≃ B is a function with a homotopy inverse — it witnesses that A and B have the same structure.',
        timeRange: [0.4, 0.7],
      },
      {
        label: 'Goal',
        description: 'We want to produce a path ua(e) : A =_𝒰 B. In MLTT this requires an axiom. In cubical TT, we construct it explicitly using Glue types.',
        timeRange: [0.7, 1.0],
      },
    ],
  };
</script>

<div class="stage-wrapper">
  <Rule {rule} bind:activeStep onStep={(step) => { activeStep = step; }} />
  {#if activeStep === 2}
    <div class="continue-wrapper">
      <button class="continue-btn" onclick={onComplete}>
        Continue to Glue Line →
      </button>
    </div>
  {/if}
</div>

<style>
  .stage-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .continue-wrapper {
    display: flex;
    justify-content: center;
    padding: 14px;
    background: rgba(0, 0, 0, 0.85);
    border-top: 1px solid #4a4a6a;
  }

  .continue-btn {
    padding: 10px 28px;
    background: #44FF88;
    color: #000;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: filter 0.2s;
  }

  .continue-btn:hover {
    filter: brightness(1.15);
  }
</style>
