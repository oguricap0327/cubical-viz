<script lang="ts">
  import Rule from '../rules/Rule.svelte';
  import type { RuleDefinition } from '../rules/types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import katex from 'katex';

  let { onComplete }: { onComplete: () => void } = $props();
  let activeStep = $state(0);

  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });

  let sphereA: THREE.Mesh;
  let sphereB: THREE.Mesh;
  let pathLine: THREE.Line;
  let travelDot: THREE.Mesh;
  let grid: THREE.GridHelper;
  let lineA: THREE.LineSegments;
  let lineB: THREE.LineSegments;
  let labelA: THREE.Sprite;
  let labelB: THREE.Sprite;
  let labelUa: THREE.Sprite;
  let sceneGroup: THREE.Group;
  let curvePoints: THREE.Vector3[] = [];

  const rule: RuleDefinition = {
    name: 'Path in 𝒰',
    judgment: `<div class="nd-rule">${kd('\\Gamma \\;\\vdash\\; \\lambda\\,i.\\;\\mathrm{Glue}[\\cdots]\\,B \\;:\\; A =_{\\mathcal{U}} B')}</div>`,
    description: 'The line of Glue types is a path in the universe 𝒰 from A to B.',

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      camera.position.set(0, 4, 14);
      (camera as THREE.PerspectiveCamera).lookAt(0, 0, 0);

      sceneGroup = new THREE.Group();
      scene.add(sceneGroup);

      // Universe grid
      grid = new THREE.GridHelper(20, 20, 0x222244, 0x333366);
      grid.position.y = -2.5;
      sceneGroup.add(grid);

      // Path curve with vertex colors
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-3, 0, 0),
        new THREE.Vector3(0, 1.5, 1.5),
        new THREE.Vector3(3, 0, 0),
      );
      curvePoints = curve.getPoints(60);

      const positions = new Float32Array(curvePoints.length * 3);
      const colors = new Float32Array(curvePoints.length * 3);
      const cA = new THREE.Color(0x44DDFF);
      const cB = new THREE.Color(0xFF8844);
      for (let i = 0; i < curvePoints.length; i++) {
        positions[i * 3] = curvePoints[i].x;
        positions[i * 3 + 1] = curvePoints[i].y;
        positions[i * 3 + 2] = curvePoints[i].z;
        const c = cA.clone().lerp(cB, i / (curvePoints.length - 1));
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      const pathGeo = new THREE.BufferGeometry();
      pathGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pathGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      pathLine = new THREE.Line(pathGeo, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 1 }));
      sceneGroup.add(pathLine);

      // Sphere A
      sphereA = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x44DDFF }),
      );
      sphereA.position.set(-3, 0, 0);
      sceneGroup.add(sphereA);

      // Sphere B
      sphereB = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xFF8844 }),
      );
      sphereB.position.set(3, 0, 0);
      sceneGroup.add(sphereB);

      // Vertical drop lines to grid
      const lineGeoA = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-3, 0, 0),
        new THREE.Vector3(-3, -2.5, 0),
      ]);
      lineA = new THREE.LineSegments(lineGeoA, new THREE.LineBasicMaterial({ color: 0x44DDFF, transparent: true, opacity: 0.4 }));
      sceneGroup.add(lineA);

      const lineGeoB = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(3, 0, 0),
        new THREE.Vector3(3, -2.5, 0),
      ]);
      lineB = new THREE.LineSegments(lineGeoB, new THREE.LineBasicMaterial({ color: 0xFF8844, transparent: true, opacity: 0.4 }));
      sceneGroup.add(lineB);

      // Labels
      labelA = createTextSprite('A', '#44DDFF');
      labelA.position.set(-3, 0.9, 0);
      sceneGroup.add(labelA);

      labelB = createTextSprite('B', '#FF8844');
      labelB.position.set(3, 0.9, 0);
      sceneGroup.add(labelB);

      labelUa = createTextSprite('ua(e)', '#FFFFFF');
      labelUa.position.set(0, 1.8, 0.8);
      sceneGroup.add(labelUa);

      // Traveling dot
      travelDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
      );
      sceneGroup.add(travelDot);

      rule.termMappings = [
        { termKey: 'ua_path', objects: [pathLine] },
        { termKey: 'A', objects: [sphereA] },
        { termKey: 'B', objects: [sphereB] },
      ];
    },

    update: (t: number, elapsed?: number) => {
      // Move traveling dot along curve
      if (curvePoints.length > 0) {
        const idx = Math.min(Math.floor(t * (curvePoints.length - 1)), curvePoints.length - 1);
        travelDot.position.copy(curvePoints[Math.max(0, idx)]);
      }
      // Slow auto-rotation
      if (sceneGroup) {
        sceneGroup.rotation.y += 0.002;
      }
    },

    cleanup: (scene: THREE.Scene) => {
      scene.remove(sceneGroup);
    },

    steps: [
      {
        label: 'The universe 𝒰',
        description: 'The universe 𝒰 contains all types as points. The grid represents 𝒰. A path in 𝒰 between A and B is exactly an element of A =_𝒰 B.',
        timeRange: [0, 0.4],
      },
      {
        label: 'ua(e) as a path',
        description: 'The line of Glue types i ↦ Glue[…]B is a term of type A =_𝒰 B — a literal path in the universe from A to B.',
        timeRange: [0.4, 0.75],
      },
      {
        label: 'Univalence achieved',
        description: 'This is the univalence map: ua : (A ≃ B) → (A =_𝒰 B). No axiom was needed — the path was constructed from the Glue type former.',
        timeRange: [0.75, 1.0],
      },
    ],
  };
</script>

<div class="stage-wrapper">
  <Rule {rule} onStep={(i) => (activeStep = i)} />
  {#if activeStep === 2}
    <div class="continue-wrapper">
      <button class="continue-btn" onclick={onComplete}>
        Continue to Transport →
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
