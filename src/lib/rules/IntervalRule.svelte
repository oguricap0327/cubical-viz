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

  const LINE_LEN = 2.5;
  const X0 = -LINE_LEN / 2;
  const X1 = LINE_LEN / 2;
  const FIBER_HEIGHT = 1.5;
  const DOT_COUNT = 8;
  const SEGMENTS = 64;

  const STEP_RANGES: [number, number][] = [
    [0, 0.25],
    [0, 0.5],
    [0, 0.75],
    [0.75, 1.0],
  ];

  const cyanColor = new THREE.Color(INTERVAL);
  const orangeColor = new THREE.Color(RESULT);

  const intervalRule: RuleDefinition = {
    name: 'The Interval I',
    judgment: `
      <div style="display:flex;gap:2em;justify-content:center;align-items:flex-end;flex-wrap:wrap;padding:4px 0">
        <div style="text-align:center">
          <div style="font-size:0.88rem;margin-bottom:3px">${km('\\Gamma \\vdash')} &ensp; <span style="font-size:0.82em;opacity:0.75">(${km('i \\notin \\mathsf{dom}(\\Gamma)')})</span></div>
          <hr style="border:none;border-top:1.5px solid rgba(255,255,255,0.6);margin:2px 0">
          <div style="font-size:0.92rem">${km('\\Gamma,')} <span class="term-hover" data-term="i">${km('i : \\mathbb{I}')}</span> ${km('\\vdash')}</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:0.88rem;margin-bottom:3px">${km('\\Gamma,')} <span class="term-hover" data-term="i">${km('i : \\mathbb{I}')}</span> ${km('\\vdash')} ${kt('t', 't')} ${km(': A')}</div>
          <hr style="border:none;border-top:1.5px solid rgba(255,255,255,0.6);margin:2px 0">
          <div style="font-size:0.92rem">${km('\\Gamma \\vdash')} ${kt('\\langle i \\rangle\\, t', 'path')} ${km(': \\mathsf{Path}\\,A')} ${kt('\\,t(i/0)', 'i0')} ${kt('\\,t(i/1)', 'i1')}</div>
        </div>
      </div>
      <div style="margin-top:0.5em;font-size:0.82em;opacity:0.75;text-align:center">
        ${km('r,s ::=')} ${kt('\\,0', 'i0')} ${km('\\mid')} ${kt('1', 'i1')} ${km('\\mid')} ${kt('i', 'i')} ${km('\\mid')} ${kt('1{-}r', 'neg')} ${km('\\mid')} ${kt('r\\wedge s', 'meet')} ${km('\\mid')} ${kt('r\\vee s', 'join')}
        &nbsp;— elements of ${km('\\mathbb{I}')} (de Morgan algebra)
      </div>
    `,
    description: `${km('\\mathbb{I}')} is a <strong>sort</strong>, not a type. Names ${km('i,j,k,\\ldots')} are added to contexts via <em>name declarations</em> ${km('\\Gamma,\\,i:\\mathbb{I}\\vdash')}. Elements of ${km('\\mathbb{I}')} are the free de Morgan algebra: meet ${km('r\\wedge s')} (min), join ${km('r\\vee s')} (max), negation ${km('1{-}r')} (reversal). Path abstraction ${km('\\langle i\\rangle\\,t')} binds a name; its endpoints are the substitutions ${km('t(i/0)')} and ${km('t(i/1)')}.`,

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

      const aiLabel = createTextSprite('t(i)', '#ffffff');
      aiLabel.position.set(X0, FIBER_HEIGHT + 0.45, 0);
      aiLabel.scale.set(0.3, 0.3, 0.3);
      group.add(aiLabel);

      // --- Endpoint value spheres for step 3 (t(i₀) and t(i₁)) ---
      const ti0Sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 32, 32),
        new THREE.MeshStandardMaterial({
          color: INTERVAL, emissive: INTERVAL, emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.5,
          transparent: true, opacity: 0.9,
        }),
      );
      ti0Sphere.position.set(X0, FIBER_HEIGHT, 0);
      ti0Sphere.visible = false;
      group.add(ti0Sphere);

      const ti1Sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 32, 32),
        new THREE.MeshStandardMaterial({
          color: RESULT, emissive: RESULT, emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.5,
          transparent: true, opacity: 0.9,
        }),
      );
      ti1Sphere.position.set(X1, FIBER_HEIGHT, 0);
      ti1Sphere.visible = false;
      group.add(ti1Sphere);

      const ti0Label = createTextSprite('t(i/0)', hexCss(INTERVAL));
      ti0Label.position.set(X0, FIBER_HEIGHT + 0.45, 0);
      ti0Label.scale.set(0.3, 0.3, 0.3);
      ti0Label.visible = false;
      group.add(ti0Label);

      const ti1Label = createTextSprite('t(i/1)', hexCss(RESULT));
      ti1Label.position.set(X1, FIBER_HEIGHT + 0.45, 0);
      ti1Label.scale.set(0.3, 0.3, 0.3);
      ti1Label.visible = false;
      group.add(ti1Label);

      // --- Straight path line at fiber height (step 3 only) ---
      const pathLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(X0, FIBER_HEIGHT, 0),
        new THREE.Vector3(X1, FIBER_HEIGHT, 0),
      ]);
      const pathLineMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true });
      const pathLine = new THREE.Line(pathLineGeo, pathLineMat);
      pathLine.visible = false;
      group.add(pathLine);

      // --- Negation point (1−i) for de Morgan step ---
      const negMat = new THREE.MeshStandardMaterial({
        color: RESULT, emissive: RESULT, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.7,
      });
      const negPoint = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), negMat);
      negPoint.position.set(X1, 0, 0);
      negPoint.visible = false;
      group.add(negPoint);

      const negLabel = createTextSprite('1−i', hexCss(RESULT));
      negLabel.position.set(X1, -0.55, 0);
      negLabel.scale.set(0.3, 0.3, 0.3);
      negLabel.visible = false;
      group.add(negLabel);

      const negDescLabel = createTextSprite('negation: 1−i reverses direction', '#aaaaaa');
      negDescLabel.position.set(0, -0.8, 0);
      negDescLabel.scale.set(0.6, 0.6, 0.6);
      negDescLabel.visible = false;
      group.add(negDescLabel);

      scene.add(group);

      // Store references for animation
      (scene as any)._intervalRefs = {
        group, slidingPoint, slidingMat, fiberSphere, fiberMat,
        dots, iLabel, aiLabel, negPoint, negMat, negLabel, negDescLabel,
        ti0Sphere, ti1Sphere, ti0Label, ti1Label, pathLine,
      };

      // Term mappings for hover highlighting
      intervalRule.termMappings = [
        { termKey: 'i',    objects: [slidingPoint, iLabel] },
        { termKey: 'i0',   objects: [i0Sphere, ti0Sphere] },
        { termKey: 'i1',   objects: [i1Sphere, ti1Sphere] },
        { termKey: 't',    objects: [fiberSphere] },
        { termKey: 'path', objects: [line, fiberSphere] },
        { termKey: 'neg',  objects: [negPoint] },
        { termKey: 'meet', objects: [slidingPoint] },
        { termKey: 'join', objects: [slidingPoint] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      const refs = (scene as any)._intervalRefs;
      if (!refs) return;

      const { slidingPoint, slidingMat, fiberSphere, fiberMat, dots, iLabel, aiLabel,
              negPoint, negMat, negLabel, negDescLabel,
              ti0Sphere, ti1Sphere, ti0Label, ti1Label, pathLine } = refs;

      // When elapsed is provided, time is already normalized [0,1] by Rule.svelte
      const t = elapsed !== undefined ? time : (Math.sin(time * 0.5) + 1) / 2;
      const rawTime = elapsed ?? time;

      // Steps 0-2 share [0,1] animation; step 3 is de Morgan
      const step = (window as any)._activeStep ?? 0;
      const isDemorgan = step === 3;
      const isFiber = step === 2;

      // t is [0,1] for all steps; de Morgan reuses same oscillation
      const moveT = t;

      const x = X0 + moveT * LINE_LEN;

      // Sliding point position & color
      slidingPoint.position.set(x, 0, 0);
      const color = new THREE.Color(INTERVAL).lerp(new THREE.Color(RESULT), moveT);
      slidingMat.color.copy(color);
      slidingMat.emissive.copy(color);

      // De Morgan negation point: moves right-to-left (1−i)
      negPoint.visible = isDemorgan;
      negLabel.visible = isDemorgan;
      negDescLabel.visible = isDemorgan;
      if (isDemorgan) {
        const negX = X1 - moveT * LINE_LEN; // right-to-left
        negPoint.position.set(negX, 0, 0);
        const negColor = new THREE.Color(RESULT).lerp(new THREE.Color(INTERVAL), moveT);
        negMat.color.copy(negColor);
        negMat.emissive.copy(negColor);
        negLabel.position.set(negX, -0.55, 0);
      }

      // Fiber sphere: visible for steps 0-2, hidden in step 3
      fiberSphere.visible = !isDemorgan;
      aiLabel.visible = !isDemorgan;
      for (const d of dots) d.visible = !isDemorgan;

      // Endpoint value spheres + path: visible only on step 3 (type family fiber), never hide
      ti0Sphere.visible = isFiber;
      ti1Sphere.visible = isFiber;
      ti0Label.visible = isFiber;
      ti1Label.visible = isFiber;
      pathLine.visible = isFiber;

      if (!isDemorgan) {
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
        aiLabel.position.set(x, FIBER_HEIGHT + 0.45, 0);
      }

      iLabel.position.set(x, -0.55, 0);
    },

    cleanup: (scene: THREE.Scene) => {
      const refs = (scene as any)._intervalRefs;
      if (refs?.group) scene.remove(refs.group);
    },

    steps: [
      {
        label: 'Endpoints',
        description: 'The interval I has two endpoints: i₀ = 0 and i₁ = 1',
        timeRange: [0, 1],
      },
      {
        label: 'Continuous variable',
        description: 'A point i : I can be anywhere between 0 and 1 — it is a continuous variable',
        timeRange: [0, 1],
      },
      {
        label: 'Type family fiber',
        description: 'Given t : A parameterized by i : 𝕀, the fiber t(i) moves continuously. The fixed endpoints t(i/0) (cyan) and t(i/1) (orange) are the two endpoints of the resulting path ⟨i⟩t.',
        timeRange: [0, 1],
      },
      {
        label: 'Interval operations',
        description: 'The interval 𝕀 supports de Morgan algebra operations: negation 1−i (reversal), meet i∧j (minimum), and join i∨j (maximum). These generate all face formulas in the Face Lattice.',
        timeRange: [0.75, 1.0],
      },
    ],
  };
</script>

<Rule rule={intervalRule} />
