<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, TYPE_FAMILY, BASE_POINT, RESULT, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  /** Create a geometry that morphs between a sphere (t=0) and an icosahedron (t=1). */
  function createFiberGeometry(t: number, radius: number): THREE.BufferGeometry {
    if (t <= 0) return new THREE.SphereGeometry(radius, 24, 24);
    if (t >= 1) return new THREE.IcosahedronGeometry(radius, 1);

    const sphere = new THREE.SphereGeometry(radius, 24, 24);
    const ico = new THREE.IcosahedronGeometry(radius, 1);

    // Morph sphere vertices toward icosahedron by projecting onto the ico surface
    const sPos = sphere.attributes.position;
    const iPos = ico.attributes.position;
    const icoVerts: THREE.Vector3[] = [];
    for (let i = 0; i < iPos.count; i++) {
      icoVerts.push(new THREE.Vector3(iPos.getX(i), iPos.getY(i), iPos.getZ(i)));
    }

    for (let i = 0; i < sPos.count; i++) {
      const sv = new THREE.Vector3(sPos.getX(i), sPos.getY(i), sPos.getZ(i));
      // Find nearest ico vertex and lerp toward it
      let nearest = icoVerts[0];
      let minDist = sv.distanceToSquared(nearest);
      for (let j = 1; j < icoVerts.length; j++) {
        const d = sv.distanceToSquared(icoVerts[j]);
        if (d < minDist) { minDist = d; nearest = icoVerts[j]; }
      }
      sv.lerp(nearest, t * 0.6);
      sPos.setXYZ(i, sv.x, sv.y, sv.z);
    }
    sPos.needsUpdate = true;
    sphere.computeVertexNormals();
    return sphere;
  }

  const FIBER_COUNT = 5;
  const FIBER_POSITIONS = [0, 0.25, 0.5, 0.75, 1.0]; // i-values
  const X_MIN = -2, X_MAX = 2;
  const FIBER_RADIUS = 0.4;

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
      const fiberMeshes: THREE.Mesh[] = [];

      // Create 5 fiber shapes morphing from sphere (i=0) to icosahedron (i=1)
      for (let fi = 0; fi < FIBER_COUNT; fi++) {
        const t = FIBER_POSITIONS[fi];
        const x = X_MIN + t * (X_MAX - X_MIN);
        const geom = createFiberGeometry(t, FIBER_RADIUS);
        const fiberColor = new THREE.Color().copy(typeColor).lerp(resultColor, t);
        const mat = new THREE.MeshStandardMaterial({
          color: fiberColor,
          transparent: true,
          opacity: 0.55,
          wireframe: true,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(x, 0, 0);
        group.add(mesh);
        fiberMeshes.push(mesh);
      }

      const fiberI0 = fiberMeshes[0];
      const fiberI1 = fiberMeshes[FIBER_COUNT - 1];

      // Gradient arc connecting fibers: INTERVAL (cyan) → RESULT (orange)
      const pathCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(X_MIN, 0, 0),
        new THREE.Vector3(X_MIN * 0.5, 0.5, 0.15),
        new THREE.Vector3(0, 0.7, 0),
        new THREE.Vector3(X_MAX * 0.5, 0.5, -0.15),
        new THREE.Vector3(X_MAX, 0, 0),
      ]);

      const pathPoints = pathCurve.getPoints(80);
      const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
      const intervalColor = new THREE.Color(INTERVAL);
      const arcEndColor = new THREE.Color(RESULT);
      const vertexColors = new Float32Array(pathPoints.length * 3);
      const tmpColor = new THREE.Color();
      for (let i = 0; i < pathPoints.length; i++) {
        const t = i / (pathPoints.length - 1);
        tmpColor.copy(intervalColor).lerp(arcEndColor, t);
        vertexColors[i * 3] = tmpColor.r;
        vertexColors[i * 3 + 1] = tmpColor.g;
        vertexColors[i * 3 + 2] = tmpColor.b;
      }
      pathGeometry.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
      const pathMaterial = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 });
      const pathLine = new THREE.Line(pathGeometry, pathMaterial);
      group.add(pathLine);
      
      // Moving element 'a' — glowing yellow dot
      const elementGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const elementMaterial = new THREE.MeshStandardMaterial({
        color: BASE_POINT,
        emissive: BASE_POINT,
        emissiveIntensity: 0.6,
      });
      const element = new THREE.Mesh(elementGeometry, elementMaterial);
      element.position.copy(pathCurve.getPointAt(0));
      group.add(element);
      
      // Labels
      const labelA0 = createTextSprite('A(i₀)', hexCss(TYPE_FAMILY));
      labelA0.position.set(X_MIN, -0.7, 0);
      labelA0.scale.set(0.3, 0.3, 0.3);
      group.add(labelA0);
      
      const labelA1 = createTextSprite('A(i₁)', hexCss(RESULT));
      labelA1.position.set(X_MAX, -0.7, 0);
      labelA1.scale.set(0.3, 0.3, 0.3);
      group.add(labelA1);
      
      const labelElement = createTextSprite('a', hexCss(BASE_POINT));
      labelElement.position.set(X_MIN, 0.6, 0);
      labelElement.scale.set(0.25, 0.25, 0.25);
      group.add(labelElement);
      
      const labelTransport = createTextSprite('transp a', hexCss(BASE_POINT));
      labelTransport.position.set(X_MAX, 0.6, 0);
      labelTransport.scale.set(0.25, 0.25, 0.25);
      group.add(labelTransport);
      
      scene.add(group);
      
      // Store references for animation
      (scene as any)._transportGroup = group;
      (scene as any)._element = element;
      (scene as any)._pathCurve = pathCurve;
      (scene as any)._labelElement = labelElement;
      (scene as any)._fiberMeshes = fiberMeshes;

      // Term mappings for hover highlighting
      transportRule.termMappings = [
        { termKey: 'a', objects: [element] },
        { termKey: 'A', objects: [...fiberMeshes] },
        { termKey: 'A_i0', objects: [fiberI0] },
        { termKey: 'A_i1', objects: [fiberI1] },
        { termKey: 'transp_a', objects: [pathLine] },
      ];
    },
    
    update: (time: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      
      const element = (scene as any)._element as THREE.Mesh | undefined;
      const pathCurve = (scene as any)._pathCurve as THREE.CatmullRomCurve3 | undefined;
      const labelElement = (scene as any)._labelElement;
      const fiberMeshes = (scene as any)._fiberMeshes as THREE.Mesh[] | undefined;
      
      if (element && pathCurve) {
        // Smooth oscillation from i=0 to i=1
        const t = (Math.sin(time * 0.5) + 1) / 2;
        const pos = pathCurve.getPointAt(t);
        element.position.copy(pos);
        
        if (labelElement) {
          labelElement.position.set(pos.x, pos.y + 0.5, pos.z);
        }
      }

      // Gentle breathing rotation on fibers
      if (fiberMeshes) {
        for (let i = 0; i < fiberMeshes.length; i++) {
          const mesh = fiberMeshes[i];
          mesh.rotation.y = time * 0.3 + i * 0.5;
          mesh.rotation.x = Math.sin(time * 0.2 + i) * 0.15;
        }
      }
    },
    
    cleanup: (scene: THREE.Scene) => {
      const group = (scene as any)._transportGroup;
      if (group) {
        scene.remove(group);
      }
    }
  };

</script>

<Rule rule={transportRule} />
