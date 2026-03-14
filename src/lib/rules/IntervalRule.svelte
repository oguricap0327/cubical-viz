<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, RESULT, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });

  const LINE_LEN = 2.5;
  const X0 = -LINE_LEN / 2;
  const X1 = LINE_LEN / 2;
  const FIBER_HEIGHT = 1.5;
  const DOT_COUNT = 8;
  const SEGMENTS = 64;

  const cyanColor = new THREE.Color(INTERVAL);
  const orangeColor = new THREE.Color(RESULT);

  const intervalRule: RuleDefinition = {
    name: 'The Interval I',
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\mathbb{I} : \\mathsf{Type}')} &emsp; ${km('i_0 : \\mathbb{I}')} &emsp; ${km('i_1 : \\mathbb{I}')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash A(i) : \\mathsf{Type}')}</div>
      </div>
    `,
    description: `The interval ${km('\\mathbb{I}')} is the foundational primitive of cubical type theory — a continuous "line" between two endpoints used to define paths, higher-dimensional cubes, and all homotopy structure.`,

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();

      // Adjust camera to frame the interval + fiber nicely
      (camera as THREE.PerspectiveCamera).position.set(0, 1.0, 4);
      camera.lookAt(new THREE.Vector3(0, 0.6, 0));

      // --- Gradient line from cyan (i=0) to orange (i=1) ---
      const linePositions = new Float32Array((SEGMENTS + 1) * 3);
      const lineColors = new Float32Array((SEGMENTS + 1) * 3);
      const tmpC = new THREE.Color();

      for (let i = 0; i <= SEGMENTS; i++) {
        const t = i / SEGMENTS;
        linePositions[i * 3] = X0 + t * LINE_LEN;
        linePositions[i * 3 + 1] = 0;
        linePositions[i * 3 + 2] = 0;

        tmpC.copy(cyanColor).lerp(orangeColor, t);
        lineColors[i * 3] = tmpC.r;
        lineColors[i * 3 + 1] = tmpC.g;
        lineColors[i * 3 + 2] = tmpC.b;
      }

      const lineGeom = new THREE.BufferGeometry();
      lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      lineGeom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
      const line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 }));
      group.add(line);

      // --- Endpoint spheres ---
      const endpointGeom = new THREE.SphereGeometry(0.08, 32, 32);

      const i0Sphere = new THREE.Mesh(endpointGeom, new THREE.MeshStandardMaterial({
        color: INTERVAL, emissive: INTERVAL, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.6,
      }));
      i0Sphere.position.set(X0, 0, 0);
      group.add(i0Sphere);

      const i1Sphere = new THREE.Mesh(endpointGeom, new THREE.MeshStandardMaterial({
        color: RESULT, emissive: RESULT, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.6,
      }));
      i1Sphere.position.set(X1, 0, 0);
      group.add(i1Sphere);

      // --- Sliding point sphere ---
      const slidingMat = new THREE.MeshStandardMaterial({
        color: INTERVAL, emissive: INTERVAL, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.7,
      });
      const slidingPoint = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), slidingMat);
      slidingPoint.position.set(X0, 0, 0);
      group.add(slidingPoint);

      // --- Fiber sphere (A(i)) ---
      const fiberMat = new THREE.MeshStandardMaterial({
        color: INTERVAL, emissive: INTERVAL, emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.5,
        transparent: true, opacity: 0.7,
      });
      const fiberSphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), fiberMat);
      fiberSphere.position.set(X0, FIBER_HEIGHT, 0);
      group.add(fiberSphere);

      // --- Connecting dots (dashed-like line) ---
      const dotGeom = new THREE.SphereGeometry(0.018, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x999999 });
      const dots: THREE.Mesh[] = [];
      for (let i = 0; i < DOT_COUNT; i++) {
        const dot = new THREE.Mesh(dotGeom, dotMat);
        group.add(dot);
        dots.push(dot);
      }

      // --- Labels ---
      const i0Label = createTextSprite('i₀', hexCss(INTERVAL));
      i0Label.position.set(X0, -0.3, 0);
      i0Label.scale.set(0.35, 0.35, 0.35);
      group.add(i0Label);

      const i1Label = createTextSprite('i₁', hexCss(RESULT));
      i1Label.position.set(X1, -0.3, 0);
      i1Label.scale.set(0.35, 0.35, 0.35);
      group.add(i1Label);

      const iLabel = createTextSprite('i', '#ffffff');
      iLabel.position.set(X0, -0.55, 0);
      iLabel.scale.set(0.3, 0.3, 0.3);
      group.add(iLabel);

      const aiLabel = createTextSprite('A(i)', '#ffffff');
      aiLabel.position.set(X0, FIBER_HEIGHT + 0.45, 0);
      aiLabel.scale.set(0.3, 0.3, 0.3);
      group.add(aiLabel);

      scene.add(group);

      // Store references for animation
      (scene as any)._intervalRefs = {
        group, slidingPoint, slidingMat, fiberSphere, fiberMat,
        dots, iLabel, aiLabel,
      };

      // Term mappings for hover highlighting
      intervalRule.termMappings = [
        { termKey: 'I', objects: [line] },
        { termKey: 'i0', objects: [i0Sphere] },
        { termKey: 'i1', objects: [i1Sphere] },
        { termKey: 'i', objects: [slidingPoint] },
        { termKey: 'Ai', objects: [fiberSphere] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      const refs = (scene as any)._intervalRefs;
      if (!refs) return;

      const { slidingPoint, slidingMat, fiberSphere, fiberMat, dots, iLabel, aiLabel } = refs;

      // When elapsed is provided, time is already normalized [0,1] by Rule.svelte
      const t = elapsed !== undefined ? time : (Math.sin(time * 0.5) + 1) / 2;
      const rawTime = elapsed ?? time;

      const x = X0 + t * LINE_LEN;

      // Sliding point position & color
      slidingPoint.position.set(x, 0, 0);
      const color = new THREE.Color(INTERVAL).lerp(new THREE.Color(RESULT), t);
      slidingMat.color.copy(color);
      slidingMat.emissive.copy(color);

      // Fiber sphere: position, pulsing scale, matching color
      const fiberScale = 0.3 + 0.1 * Math.sin(rawTime * 2);
      fiberSphere.position.set(x, FIBER_HEIGHT, 0);
      fiberSphere.scale.setScalar(fiberScale / 0.3);
      fiberMat.color.copy(color);
      fiberMat.emissive.copy(color);

      // Connecting dots
      for (let i = 0; i < dots.length; i++) {
        const dt = (i + 1) / (dots.length + 1);
        dots[i].position.set(x, dt * FIBER_HEIGHT, 0);
      }

      // Following labels
      iLabel.position.set(x, -0.55, 0);
      aiLabel.position.set(x, FIBER_HEIGHT + 0.45, 0);
    },

    cleanup: (scene: THREE.Scene) => {
      const refs = (scene as any)._intervalRefs;
      if (refs?.group) scene.remove(refs.group);
    },

    steps: [
      {
        label: 'Endpoints',
        description: 'The interval I has two endpoints: i₀ = 0 and i₁ = 1',
        timeRange: [0, 0.05],
      },
      {
        label: 'Continuous variable',
        description: 'A point i : I can be anywhere between 0 and 1 — it is a continuous variable',
        timeRange: [0.0, 1.0],
      },
      {
        label: 'Type family fiber',
        description: 'A type family A : I → Type assigns a type to each point — the fiber A(i) varies continuously',
        timeRange: [0.0, 1.0],
      },
    ],
  };
</script>

<Rule rule={intervalRule} />
