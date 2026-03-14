<script lang="ts">
  import Rule from '../rules/Rule.svelte';
  import type { RuleDefinition } from '../rules/types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import katex from 'katex';

  let { onComplete }: { onComplete: () => void } = $props();
  let activeStep = $state(0);

  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });

  // Scene objects (assigned in setup, read in update/cleanup)
  let sphereA: THREE.Mesh;
  let sphereB: THREE.Mesh;
  let cylinder: THREE.Mesh;
  let slider: THREE.Mesh;
  let torus: THREE.Mesh;
  let labelGlue0: THREE.Sprite;
  let labelGlue1: THREE.Sprite;
  let labelGlueI: THREE.Sprite;

  const rule: RuleDefinition = {
    name: 'Glue Line',
    judgment: `<div class="nd-rule">${kd('\\Gamma,\\, i{:}\\mathbb{I} \\;\\vdash\\; \\mathrm{Glue}[\\,i{=}0\\mapsto(A,e),\\;i{=}1\\mapsto(B,\\mathrm{id})\\,]\\,B : \\mathcal{U}')}</div>`,
    description: 'A line of Glue types parameterized by <i>i</i> : 𝕀, connecting A at <i>i</i>=0 to B at <i>i</i>=1.',

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      camera.position.set(0, 2, 9);

      // Sphere A (cyan, left)
      sphereA = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x44DDFF }),
      );
      sphereA.position.set(-3, 0, 0);
      scene.add(sphereA);

      // Sphere B (orange, right)
      sphereB = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xFF8844 }),
      );
      sphereB.position.set(3, 0, 0);
      scene.add(sphereB);

      // Connecting tube (cylinder rotated to lie along X)
      cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 6, 16),
        new THREE.MeshBasicMaterial({ color: 0x9988CC, transparent: true, opacity: 0.5 }),
      );
      cylinder.rotation.z = Math.PI / 2;
      scene.add(cylinder);

      // Slider sphere (white dot)
      slider = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
      );
      scene.add(slider);

      // Cross-section torus at slider position
      torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.03, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xFF44AA }),
      );
      torus.rotation.y = Math.PI / 2;
      scene.add(torus);

      // End-cap labels
      labelGlue0 = createTextSprite('Glue(0) ≡ A', '#44DDFF');
      labelGlue0.position.set(-3, -1.2, 0);
      scene.add(labelGlue0);

      labelGlue1 = createTextSprite('Glue(1) ≡ B', '#FF8844');
      labelGlue1.position.set(3, -1.2, 0);
      scene.add(labelGlue1);

      // Moving label above slider
      labelGlueI = createTextSprite('Glue(i)', '#FF44AA');
      labelGlueI.position.set(0, 0.6, 0);
      scene.add(labelGlueI);

      rule.termMappings = [
        { termKey: 'glue_line', objects: [cylinder] },
        { termKey: 'A_end', objects: [sphereA] },
        { termKey: 'B_end', objects: [sphereB] },
        { termKey: 'glue_i', objects: [torus] },
      ];
    },

    update: (t: number, _elapsed?: number) => {
      // t oscillates within the active step's timeRange
      // Slider x = lerp(-3, 3, t)
      const x = -3 + 6 * t;
      slider.position.set(x, 0, 0);
      torus.position.set(x, 0, 0);
      labelGlueI.position.set(x, 0.6, 0);
    },

    cleanup: (scene: THREE.Scene) => {
      scene.remove(sphereA, sphereB, cylinder, slider, torus, labelGlue0, labelGlue1, labelGlueI);
    },

    steps: [
      {
        label: 'Glue type',
        description: 'A Glue type bundles a base type B with partial data: face i=0 is glued to A via e, face i=1 is glued to B via the identity.',
        timeRange: [0, 0.35],
      },
      {
        label: 'Line of types',
        description: 'For each i : 𝕀, Glue gives a type ua(e)(i). The slider shows i varying: the cross-section is the type at that point.',
        timeRange: [0.35, 0.7],
      },
      {
        label: 'Boundary conditions',
        description: 'Glue(0) ≡ A and Glue(1) ≡ B are definitional equalities — enforced by the Glue type reduction rules without any proof.',
        timeRange: [0.7, 1.0],
      },
    ],
  };
</script>

<div class="stage-wrapper">
  <Rule {rule} onStep={(i) => (activeStep = i)} />
  {#if activeStep === 2}
    <div class="continue-wrapper">
      <button class="continue-btn" onclick={onComplete}>
        Continue to Path in 𝒰 →
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
