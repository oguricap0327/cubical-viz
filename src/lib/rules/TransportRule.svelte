<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, TYPE_FAMILY, BASE_POINT, RESULT, PARTIAL_DATA, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  // ---------------------------------------------------------------------------
  // Icosahedron geometry helpers
  // ---------------------------------------------------------------------------

  /** Golden ratio. */
  const PHI = (1 + Math.sqrt(5)) / 2;

  /** Build the 12 vertices and 20 triangular faces of a regular icosahedron. */
  function buildIcosahedronFaces(radius: number): {
    verts: THREE.Vector3[];
    faces: [number, number, number][];
  } {
    // Canonical icosahedron vertices (on a unit sphere, then scaled)
    const raw: [number, number, number][] = [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ];
    const verts = raw.map(([x, y, z]) => {
      const v = new THREE.Vector3(x, y, z);
      v.normalize().multiplyScalar(radius);
      return v;
    });

    const faces: [number, number, number][] = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ];

    return { verts, faces };
  }

  /**
   * Build a BufferGeometry that morphs from a regular icosahedron (t=0)
   * to its first stellation (t=1).
   *
   * At t=0 each spike apex sits on the face centroid (flat).
   * At t=1 each apex is pushed outward along the face normal.
   */
  function buildStellatedGeometry(radius: number, t: number): THREE.BufferGeometry {
    const { verts, faces } = buildIcosahedronFaces(radius);
    const spikeHeight = radius * 1.5;

    // 20 faces × 3 sub-triangles × 3 vertices × 3 floats
    const positions = new Float32Array(20 * 3 * 3 * 3);
    let idx = 0;

    const _v0 = new THREE.Vector3();
    const _v1 = new THREE.Vector3();
    const _v2 = new THREE.Vector3();
    const _centroid = new THREE.Vector3();
    const _normal = new THREE.Vector3();
    const _edge1 = new THREE.Vector3();
    const _edge2 = new THREE.Vector3();

    for (const [i0, i1, i2] of faces) {
      _v0.copy(verts[i0]);
      _v1.copy(verts[i1]);
      _v2.copy(verts[i2]);

      // Face centroid
      _centroid.copy(_v0).add(_v1).add(_v2).divideScalar(3);

      // Face normal (outward)
      _edge1.subVectors(_v1, _v0);
      _edge2.subVectors(_v2, _v0);
      _normal.crossVectors(_edge1, _edge2).normalize();
      // Ensure outward-facing
      if (_normal.dot(_centroid) < 0) _normal.negate();

      // Spike apex: centroid + normal * spikeHeight * t
      const apex = _centroid.clone().addScaledVector(_normal, spikeHeight * t);

      // Three sub-triangles: [v0,v1,apex], [v1,v2,apex], [v2,v0,apex]
      const tri = [
        [_v0, _v1, apex],
        [_v1, _v2, apex],
        [_v2, _v0, apex],
      ];

      for (const [a, b, c] of tri) {
        positions[idx++] = a.x; positions[idx++] = a.y; positions[idx++] = a.z;
        positions[idx++] = b.x; positions[idx++] = b.y; positions[idx++] = b.z;
        positions[idx++] = c.x; positions[idx++] = c.y; positions[idx++] = c.z;
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.computeVertexNormals();
    return geom;
  }

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  const X_MIN = -2;
  const X_MAX = 2;
  const RADIUS = 0.55;

  // ---------------------------------------------------------------------------
  // Rule definition
  // ---------------------------------------------------------------------------

  const transportRule: RuleDefinition = {
    name: "Transport - Coercion Along Paths",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash')} ${kt('A', 'A')} ${km('\\quad \\Gamma \\vdash')} ${kt('a', 'a')} ${km(': ')} ${kt('A(i_0)', 'A_i0')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('\\mathrm{transp}^i\\, A\\, a', 'transp_a')} ${km(':')} ${kt('A(i_1)', 'A_i1')}</div>
      </div>
    `,
    description: `Transport moves an element along a path in a type family. It's a special case of composition: ${km('\\mathrm{transp}^i\\, A\\, a = \\mathrm{comp}^i\\, A\\, [\\,]\\, a')}`,

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      const typeColor = new THREE.Color(TYPE_FAMILY);
      const resultColor = new THREE.Color(RESULT);

      // --- Lighting ---
      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(3, 5, 3);
      scene.add(dirLight);

      // --- Left ghost: regular icosahedron (wireframe) ---
      const leftGeom = buildStellatedGeometry(RADIUS, 0);
      const leftMat = new THREE.MeshPhongMaterial({
        color: TYPE_FAMILY,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const leftGhost = new THREE.Mesh(leftGeom, leftMat);
      leftGhost.position.set(X_MIN, 0, 0);
      group.add(leftGhost);

      // --- Right ghost: fully stellated icosahedron (wireframe) ---
      const rightGeom = buildStellatedGeometry(RADIUS * 0.65, 1);
      const rightMat = new THREE.MeshPhongMaterial({
        color: RESULT,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const rightGhost = new THREE.Mesh(rightGeom, rightMat);
      rightGhost.position.set(X_MAX, 0, 0);
      group.add(rightGhost);

      // --- Central morphing shape ---
      const centralGeom = buildStellatedGeometry(RADIUS, 0);
      const centralMat = new THREE.MeshPhongMaterial({
        color: TYPE_FAMILY,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const centralMesh = new THREE.Mesh(centralGeom, centralMat);
      centralMesh.position.set(0, 0, 0);
      group.add(centralMesh);

      // --- Base interval line ---
      const linePoints = [
        new THREE.Vector3(X_MIN, -1.0, 0),
        new THREE.Vector3(X_MAX, -1.0, 0),
      ];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
      const baseLine = new THREE.Line(lineGeom, lineMat);
      group.add(baseLine);

      // --- Slider indicator on the base line ---
      const sliderGeom = new THREE.SphereGeometry(0.06, 12, 12);
      const sliderMat = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        emissive: 0x999999,
        emissiveIntensity: 0.4,
      });
      const slider = new THREE.Mesh(sliderGeom, sliderMat);
      slider.position.set(X_MIN, -1.0, 0);
      group.add(slider);

      // Dashed vertical line connecting 'a' dot to slider on interval line
      const dashedGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -1.0, 0),
      ]);
      const dashedMat = new THREE.LineDashedMaterial({ color: 0x888888, dashSize: 0.08, gapSize: 0.06 });
      const dashedLine = new THREE.LineSegments(dashedGeo, dashedMat);
      dashedLine.computeLineDistances();
      group.add(dashedLine);

      // --- Point 'a': yellow dot inside the fiber ---
      const dotGeom = new THREE.SphereGeometry(0.08, 16, 16);
      const dotMat = new THREE.MeshPhongMaterial({
        color: PARTIAL_DATA,
        emissive: PARTIAL_DATA,
        emissiveIntensity: 0.4,
      });
      const elementDot = new THREE.Mesh(dotGeom, dotMat);
      elementDot.position.set(0, 0, 0);
      group.add(elementDot);

      // --- Fixed wireframe dot 'a' inside A(i₀) ---
      const dotA = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshPhongMaterial({ color: PARTIAL_DATA, wireframe: true })
      );
      dotA.position.set(X_MIN, 0, 0);
      group.add(dotA);

      // --- Fixed wireframe dot 'transp^i A a' inside A(i₁) — red ---
      const dotTransp = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshPhongMaterial({ color: 0xff3333, wireframe: true })
      );
      dotTransp.position.set(X_MAX, 0, 0);
      group.add(dotTransp);

      // --- Labels ---
      const labelA0 = createTextSprite('A(i₀)', hexCss(TYPE_FAMILY));
      labelA0.position.set(X_MIN, 0.9, 0);
      labelA0.scale.set(0.3, 0.3, 0.3);
      group.add(labelA0);

      const labelA1 = createTextSprite('A(i₁)', hexCss(RESULT));
      labelA1.position.set(X_MAX, 0.9, 0);
      labelA1.scale.set(0.3, 0.3, 0.3);
      group.add(labelA1);

      const labelAi = createTextSprite('A(i)', hexCss(TYPE_FAMILY));
      labelAi.position.set(0, 1.1, 0);
      labelAi.scale.set(0.3, 0.3, 0.3);
      group.add(labelAi);

      const labelA = createTextSprite('a', hexCss(PARTIAL_DATA));
      labelA.position.set(0, 0.25, 0);
      labelA.scale.set(0.25, 0.25, 0.25);
      group.add(labelA);

      scene.add(group);

      // Camera
      camera.position.set(0, 1, 7);
      (camera as THREE.PerspectiveCamera).lookAt(0, 0, 0);

      // Store references for animation
      (scene as any)._transportRefs = {
        group,
        centralMesh,
        leftGhost,
        rightGhost,
        elementDot,
        slider,
        dashedLine,
        labelAi,
        labelA,
        ambient,
        dirLight,
      };

      // Term mappings
      transportRule.termMappings = [
        { termKey: 'A', objects: [centralMesh, leftGhost, rightGhost] },
        { termKey: 'A_i0', objects: [leftGhost] },
        { termKey: 'A_i1', objects: [rightGhost] },
        { termKey: 'a', objects: [dotA] },
        { termKey: 'transp_a', objects: [dotTransp] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      const refs = (scene as any)._transportRefs;
      if (!refs) return;

      const { centralMesh, elementDot, slider, dashedLine, labelAi, labelA } = refs;
      const rawTime = elapsed ?? time;

      // Morph parameter oscillates smoothly
      const t = elapsed !== undefined ? time : (Math.sin(rawTime * 0.4) + 1) / 2;

      // Rebuild central geometry
      const oldGeom = centralMesh.geometry as THREE.BufferGeometry;
      const morphRadius = RADIUS * (1 - t * 0.35); // lerp from RADIUS to RADIUS*0.65
      centralMesh.geometry = buildStellatedGeometry(morphRadius, t);
      oldGeom.dispose();

      // Interpolate central mesh color: TYPE_FAMILY → RESULT
      const typeColor = new THREE.Color(TYPE_FAMILY);
      const resultColor = new THREE.Color(RESULT);
      const blended = new THREE.Color().copy(typeColor).lerp(resultColor, t);
      (centralMesh.material as THREE.MeshPhongMaterial).color.copy(blended);

      // Synchronized rotation — all three shapes rotate identically
      const ry = rawTime * 0.2;
      const rx = Math.sin(rawTime * 0.15) * 0.12;
      centralMesh.rotation.y = ry;
      centralMesh.rotation.x = rx;
      refs.leftGhost.rotation.y = ry;
      refs.leftGhost.rotation.x = rx;
      refs.rightGhost.rotation.y = ry;
      refs.rightGhost.rotation.x = rx;

      // Move central mesh, slider, dot, and labels along the x-axis with t
      const xPos = X_MIN + t * (X_MAX - X_MIN);
      centralMesh.position.x = xPos;
      slider.position.x = xPos;

      // Color 'a' dot: lerp PARTIAL_DATA (green) → RESULT (orange) as it transports
      const dotColor = new THREE.Color(PARTIAL_DATA).lerp(new THREE.Color(0xff3333), t);
      (elementDot.material as THREE.MeshPhongMaterial).color.copy(dotColor);
      (elementDot.material as THREE.MeshPhongMaterial).emissive.copy(dotColor);

      elementDot.position.set(xPos, 0, 0);

      // Update "A(i)" label color & position
      if (labelAi) {
        labelAi.position.set(xPos, 1.1, 0);
      }

      // Update dashed line from dot down to slider
      if (dashedLine) {
        const posAttr = dashedLine.geometry.getAttribute('position') as THREE.BufferAttribute;
        posAttr.setXYZ(0, xPos, elementDot.position.y, 0);
        posAttr.setXYZ(1, xPos, -1.0, 0);
        posAttr.needsUpdate = true;
        dashedLine.computeLineDistances();
      }

      // 'a' label follows the dot
      if (labelA) {
        labelA.position.set(xPos + 0.2, elementDot.position.y + 0.15, 0);
      }
    },

    cleanup: (scene: THREE.Scene) => {
      const refs = (scene as any)._transportRefs;
      if (!refs) return;
      scene.remove(refs.group);
      scene.remove(refs.ambient);
      scene.remove(refs.dirLight);
    },

    steps: [
      {
        label: 'Type family',
        description: 'A : I → Type is a path in the universe — a continuously varying type. Each fiber A(i) is a different shape, but all homeomorphic.',
        timeRange: [0, 1.0],
      },
      {
        label: 'Base element',
        description: 'a : A(i₀) is an element sitting in the fiber at i=0. Watch it stay inside A(i) as the fiber travels.',
        timeRange: [0, 1.0],
      },
      {
        label: 'Transport',
        description: 'transpⁱ A a coerces a from A(i₀) to A(i₁) — the element rides through the continuously changing fiber and lands on the other side.',
        timeRange: [0, 1.0],
      },
    ],
  };

</script>

<Rule rule={transportRule} />
