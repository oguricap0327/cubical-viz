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
      
      // A(i0) - sphere (type family)
      const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: TYPE_FAMILY,
        transparent: true,
        opacity: 0.7,
        wireframe: true,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(-1, 0, 0);
      group.add(sphere);
      
      // A(i1) - torus (result)
      const torusGeometry = new THREE.TorusGeometry(0.3, 0.12, 16, 32);
      const torusMaterial = new THREE.MeshStandardMaterial({
        color: RESULT,
        transparent: true,
        opacity: 0.7,
        wireframe: true,
      });
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torus.position.set(1, 0, 0);
      group.add(torus);
      
      // Path arc with vertex-color gradient: INTERVAL (cyan) → RESULT (orange)
      const pathCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(-0.5, 0.3, 0.1),
        new THREE.Vector3(0, 0.4, 0),
        new THREE.Vector3(0.5, 0.3, -0.1),
        new THREE.Vector3(1, 0, 0),
      ]);

      const pathPoints = pathCurve.getPoints(50);
      const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);

      const intervalColor = new THREE.Color(INTERVAL);
      const resultColor = new THREE.Color(RESULT);
      const vertexColors = new Float32Array(pathPoints.length * 3);
      const tmpColor = new THREE.Color();
      for (let i = 0; i < pathPoints.length; i++) {
        const t = i / (pathPoints.length - 1);
        tmpColor.copy(intervalColor).lerp(resultColor, t);
        vertexColors[i * 3] = tmpColor.r;
        vertexColors[i * 3 + 1] = tmpColor.g;
        vertexColors[i * 3 + 2] = tmpColor.b;
      }
      pathGeometry.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));

      const pathMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 2,
      });
      const pathLine = new THREE.Line(pathGeometry, pathMaterial);
      group.add(pathLine);
      
      // Element 'a' (base point)
      const elementGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const elementMaterial = new THREE.MeshStandardMaterial({
        color: BASE_POINT,
        emissive: 0xaa8800,
      });
      const element = new THREE.Mesh(elementGeometry, elementMaterial);
      element.position.copy(pathCurve.getPointAt(0));
      group.add(element);
      
      // Labels
      const labelA0 = createTextSprite('A(i₀)', hexCss(TYPE_FAMILY));
      labelA0.position.set(-1, -0.5, 0);
      labelA0.scale.set(0.3, 0.3, 0.3);
      group.add(labelA0);
      
      const labelA1 = createTextSprite('A(i₁)', hexCss(RESULT));
      labelA1.position.set(1, -0.5, 0);
      labelA1.scale.set(0.3, 0.3, 0.3);
      group.add(labelA1);
      
      const labelElement = createTextSprite('a', hexCss(BASE_POINT));
      labelElement.position.set(-1, 0.4, 0);
      labelElement.scale.set(0.25, 0.25, 0.25);
      group.add(labelElement);
      
      const labelTransport = createTextSprite('transp a', hexCss(BASE_POINT));
      labelTransport.position.set(1, 0.4, 0);
      labelTransport.scale.set(0.25, 0.25, 0.25);
      group.add(labelTransport);
      
      scene.add(group);
      
      // Store references for animation
      (scene as any)._transportGroup = group;
      (scene as any)._element = element;
      (scene as any)._pathCurve = pathCurve;
      (scene as any)._labelElement = labelElement;

      // Populate term mappings for hover highlighting
      transportRule.termMappings = [
        { termKey: 'a', objects: [element] },
        { termKey: 'A', objects: [pathLine] },
        { termKey: 'A_i0', objects: [sphere] },
        { termKey: 'A_i1', objects: [torus] },
        { termKey: 'transp_a', objects: [element, torus] },
      ];
    },
    
    update: (time: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      
      const element = (scene as any)._element;
      const pathCurve = (scene as any)._pathCurve;
      const labelElement = (scene as any)._labelElement;
      
      if (element && pathCurve) {
        const t = (Math.sin(time * 0.5) + 1) / 2;
        const pos = pathCurve.getPointAt(t);
        element.position.copy(pos);
        
        if (labelElement) {
          labelElement.position.set(pos.x, pos.y + 0.4, pos.z);
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
