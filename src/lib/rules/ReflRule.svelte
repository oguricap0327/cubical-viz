<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, BASE_POINT, TYPE_FAMILY, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${katex.renderToString(f, { throwOnError: false })}</span>`;

  let sphere: THREE.Mesh;
  let loopLine: THREE.Line;
  let dot: THREE.Mesh;
  let loopPoints: THREE.Vector3[] = [];

  const reflRule: RuleDefinition = {
    name: "Reflexivity",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma \\vdash')} ${kt('a', 'a')} ${km(': A')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('\\langle i \\rangle\\, a', 'refl')} ${km(': \\mathrm{Path}_A')} ${kt('\\,a', 'a_left')} ${kt('\\,a', 'a_right')}</div>
      </div>
    `,
    description: `In cubical type theory, ${km('\\mathrm{refl}')} is the constant path ${km('\\langle i \\rangle\\, a')} — a function from ${km('\\mathbb{I}')} that ignores ${km('i')} and always returns ${km('a')}.`,

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      camera.position.set(0, 0.8, 5);
      (camera as THREE.PerspectiveCamera).lookAt(0, 0.8, 0);

      // Base point sphere
      sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 32, 32),
        new THREE.MeshBasicMaterial({ color: BASE_POINT }),
      );
      sphere.position.set(0, 0, 0);
      scene.add(sphere);

      // Looping arc (constant path that returns to the same point)
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-1, 0.8, 0.5),
        new THREE.Vector3(0, 1.6, 0),
        new THREE.Vector3(1, 0.8, -0.5),
        new THREE.Vector3(0, 0, 0),
      ], false);
      loopPoints = curve.getPoints(80);

      const loopGeo = new THREE.BufferGeometry().setFromPoints(loopPoints);
      loopLine = new THREE.Line(loopGeo, new THREE.LineBasicMaterial({ color: INTERVAL }));
      scene.add(loopLine);

      // Animated white dot
      dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
      );
      scene.add(dot);

      // Endpoint markers (both at origin to show endpoints coincide)
      const markerGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: BASE_POINT });
      const markerLeft = new THREE.Mesh(markerGeo, markerMat);
      markerLeft.position.set(0, 0, 0);
      scene.add(markerLeft);
      const markerRight = new THREE.Mesh(markerGeo.clone(), markerMat.clone());
      markerRight.position.set(0, 0, 0);
      scene.add(markerRight);

      // Labels
      const labelA = createTextSprite('a', hexCss(BASE_POINT));
      labelA.position.set(0, 0.6, 0);
      scene.add(labelA);

      const labelRefl = createTextSprite('⟨i⟩a', hexCss(INTERVAL));
      labelRefl.position.set(0, 1.9, 0);
      scene.add(labelRefl);

      reflRule.termMappings = [
        { termKey: 'a', objects: [sphere] },
        { termKey: 'a_left', objects: [sphere] },
        { termKey: 'a_right', objects: [sphere] },
        { termKey: 'refl', objects: [loopLine] },
      ];
    },

    update: (t: number, _elapsed?: number) => {
      if (loopPoints.length > 0) {
        const frac = t * (loopPoints.length - 1);
        const i0 = Math.min(Math.floor(frac), loopPoints.length - 2);
        const alpha = frac - i0;
        dot.position.lerpVectors(loopPoints[i0], loopPoints[i0 + 1], alpha);
      }
    },

    cleanup: (scene: THREE.Scene) => {
      const toRemove: THREE.Object3D[] = [];
      scene.traverse((obj) => { if (obj !== scene) toRemove.push(obj); });
      for (const obj of toRemove) scene.remove(obj);
    },

    steps: [
      {
        label: 'Constant path',
        description: 'In CTT, refl is not an axiom but a construction: ⟨i⟩ a is a function from 𝕀 to A that ignores i and always returns a. It\'s a path that stays at a for every moment.',
        timeRange: [0, 1.0],
      },
      {
        label: 'Endpoints coincide',
        description: 'Applying the path at either endpoint gives a definitionally: (⟨i⟩ a)(i₀) ≡ a and (⟨i⟩ a)(i₁) ≡ a. Both endpoints are the same point — hence Path A a a.',
        timeRange: [0, 1.0],
      },
      {
        label: 'Transport computes',
        description: 'Unlike MLTT where J has only propositional computation, transport along refl = transpⁱ A (⟨i⟩ a) definitionally reduces to the identity: transpⁱ A a ≡ a. No axiom needed.',
        timeRange: [0, 1.0],
      },
    ],
  };
</script>

<Rule rule={reflRule} />
