<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, BASE_POINT, RESULT, FILL_RESULT, PARTIAL_DATA, EQUIVALENCE, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  const HALF = 2;
  const SEGS = 64;

  const squareRule: RuleDefinition = {
    name: 'Square (Path of Paths)',
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i\\, j : \\mathbb{I} \\vdash')} ${kt('s', 's')} ${km(': A')} &emsp; ${km('s : \\mathbb{I} \\times \\mathbb{I} \\to A')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('s', 's')} ${km(':')} ${kt('p', 'p')} ${km('=_{a =_A b}')} ${kt('q', 'q')}</div>
      </div>
    `,
    description: `A square ${km('s')} is a 2-dimensional path — a homotopy between paths ${km('p')} and ${km('q')}. Its four boundary edges are paths in ${km('A')}.`,

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      const cam = camera as THREE.PerspectiveCamera;
      cam.position.set(0, 0, 8);
      cam.lookAt(new THREE.Vector3(0, 0, 0));

      const tmp = new THREE.Color();

      // Bottom edge (j=0): p — gradient INTERVAL → BASE_POINT
      const bottomGeo = new THREE.BufferGeometry();
      const bPos = new Float32Array((SEGS + 1) * 3);
      const bCol = new Float32Array((SEGS + 1) * 3);
      const cInterval = new THREE.Color(INTERVAL);
      const cBase = new THREE.Color(BASE_POINT);
      for (let i = 0; i <= SEGS; i++) {
        const u = i / SEGS;
        bPos[i * 3]     = -HALF + u * HALF * 2;
        bPos[i * 3 + 1] = -HALF;
        bPos[i * 3 + 2] = 0;
        tmp.copy(cInterval).lerp(cBase, u);
        bCol[i * 3]     = tmp.r;
        bCol[i * 3 + 1] = tmp.g;
        bCol[i * 3 + 2] = tmp.b;
      }
      bottomGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
      bottomGeo.setAttribute('color', new THREE.BufferAttribute(bCol, 3));
      const bottomEdge = new THREE.Line(bottomGeo, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 }));
      group.add(bottomEdge);

      // Top edge (j=1): q — gradient RESULT → FILL_RESULT
      const topGeo = new THREE.BufferGeometry();
      const tPos = new Float32Array((SEGS + 1) * 3);
      const tCol = new Float32Array((SEGS + 1) * 3);
      const cResult = new THREE.Color(RESULT);
      const cFill = new THREE.Color(FILL_RESULT);
      for (let i = 0; i <= SEGS; i++) {
        const u = i / SEGS;
        tPos[i * 3]     = -HALF + u * HALF * 2;
        tPos[i * 3 + 1] = HALF;
        tPos[i * 3 + 2] = 0;
        tmp.copy(cResult).lerp(cFill, u);
        tCol[i * 3]     = tmp.r;
        tCol[i * 3 + 1] = tmp.g;
        tCol[i * 3 + 2] = tmp.b;
      }
      topGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
      topGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3));
      const topEdge = new THREE.Line(topGeo, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 }));
      group.add(topEdge);

      // Left edge (i=0): r — solid PARTIAL_DATA
      const leftGeo = new THREE.BufferGeometry();
      leftGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        -HALF, -HALF, 0,
        -HALF,  HALF, 0,
      ]), 3));
      const leftEdge = new THREE.Line(leftGeo, new THREE.LineBasicMaterial({ color: PARTIAL_DATA, linewidth: 2 }));
      group.add(leftEdge);

      // Right edge (i=1): t — solid EQUIVALENCE
      const rightGeo = new THREE.BufferGeometry();
      rightGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        HALF, -HALF, 0,
        HALF,  HALF, 0,
      ]), 3));
      const rightEdge = new THREE.Line(rightGeo, new THREE.LineBasicMaterial({ color: EQUIVALENCE, linewidth: 2 }));
      group.add(rightEdge);

      // Interior mesh (PlaneGeometry 4×4)
      const interiorGeo = new THREE.PlaneGeometry(4, 4);
      const interiorMat = new THREE.MeshBasicMaterial({
        color: FILL_RESULT,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const interior = new THREE.Mesh(interiorGeo, interiorMat);
      interior.visible = false;
      group.add(interior);

      // Scan line (horizontal, white)
      const scanGeo = new THREE.BufferGeometry();
      scanGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        -HALF, -HALF, 0.01,
         HALF, -HALF, 0.01,
      ]), 3));
      const scanMat = new THREE.LineBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8,
      });
      const scanLine = new THREE.Line(scanGeo, scanMat);
      scanLine.visible = false;
      group.add(scanLine);

      // Labels
      const pLabel = createTextSprite('p', hexCss(INTERVAL));
      pLabel.position.set(0, -HALF - 0.4, 0);
      pLabel.scale.set(0.5, 0.5, 0.5);
      group.add(pLabel);

      const qLabel = createTextSprite('q', hexCss(RESULT));
      qLabel.position.set(0, HALF + 0.4, 0);
      qLabel.scale.set(0.5, 0.5, 0.5);
      group.add(qLabel);

      const rLabel = createTextSprite('r', hexCss(PARTIAL_DATA));
      rLabel.position.set(-HALF - 0.5, 0, 0);
      rLabel.scale.set(0.5, 0.5, 0.5);
      group.add(rLabel);

      const tEdgeLabel = createTextSprite('t', hexCss(EQUIVALENCE));
      tEdgeLabel.position.set(HALF + 0.5, 0, 0);
      tEdgeLabel.scale.set(0.5, 0.5, 0.5);
      group.add(tEdgeLabel);

      const iLabel = createTextSprite('i →', '#ffffff', 50);
      iLabel.position.set(HALF - 0.3, -HALF - 0.8, 0);
      iLabel.scale.set(0.35, 0.35, 0.35);
      group.add(iLabel);

      const jLabel = createTextSprite('j ↑', '#ffffff', 50);
      jLabel.position.set(-HALF - 0.9, HALF - 0.3, 0);
      jLabel.scale.set(0.35, 0.35, 0.35);
      group.add(jLabel);

      scene.add(group);

      (scene as any)._squareRefs = {
        group, interior, interiorMat, scanLine, scanMat,
      };

      squareRule.termMappings = [
        { termKey: 'p', objects: [bottomEdge] },
        { termKey: 'q', objects: [topEdge] },
        { termKey: 'r', objects: [leftEdge] },
        { termKey: 't', objects: [rightEdge] },
        { termKey: 's', objects: [interior] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      const refs = (scene as any)._squareRefs;
      if (!refs) return;

      const t = elapsed !== undefined ? time : (Math.sin(time * 0.5) + 1) / 2;

      const { interior, interiorMat, scanLine, scanMat } = refs;

      // Step 1 (t in [0, 0.4]): boundary only
      if (t < 0.4) {
        scanLine.visible = false;
        interior.visible = false;
        interiorMat.opacity = 0;
      }
      // Step 2 (t in [0.4, 0.75]): boundary + animated scan line
      else if (t < 0.75) {
        scanLine.visible = true;
        scanMat.opacity = 0.8;
        interior.visible = false;
        interiorMat.opacity = 0;

        const scanT = (t - 0.4) / 0.35;
        const y = -HALF + scanT * HALF * 2;
        const attr = scanLine.geometry.attributes.position as THREE.BufferAttribute;
        attr.setY(0, y);
        attr.setY(1, y);
        attr.needsUpdate = true;
      }
      // Step 3 (t in [0.75, 1.0]): fade in interior + scan line continues
      else {
        scanLine.visible = true;
        scanMat.opacity = 0.8;

        const scanT = (t - 0.75) / 0.25;
        const y = -HALF + scanT * HALF * 2;
        const attr = scanLine.geometry.attributes.position as THREE.BufferAttribute;
        attr.setY(0, y);
        attr.setY(1, y);
        attr.needsUpdate = true;

        interior.visible = true;
        const fadeT = (t - 0.75) / 0.25;
        interiorMat.opacity = fadeT * 0.2;
      }
    },

    cleanup: (scene: THREE.Scene) => {
      const refs = (scene as any)._squareRefs;
      if (refs?.group) scene.remove(refs.group);
    },

    steps: [
      {
        label: 'Boundary',
        description: 'A square s : I×I → A has four boundary paths: bottom p, top q, left r, right t. These are paths in A.',
        timeRange: [0, 0.4],
      },
      {
        label: 'Sweep',
        description: 'For each j : I, the slice s(-,j) : I → A is a path from r(j) to t(j). The scan line sweeps j from 0 to 1.',
        timeRange: [0.4, 0.75],
      },
      {
        label: 'Homotopy',
        description: 'The full square s is a homotopy from p (at j=0) to q (at j=1). It witnesses a path-of-paths: p =_{a=b} q.',
        timeRange: [0.75, 1.0],
      },
    ],
  };
</script>

<Rule rule={squareRule} />
