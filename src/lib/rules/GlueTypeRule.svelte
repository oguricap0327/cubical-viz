<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { createAxes } from '../three/axes';
  import { TYPE_FAMILY, RESULT, EQUIVALENCE, BASE_POINT, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  const glueTypeRule: RuleDefinition = {
    name: "Glue Types and Univalence",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma \\vdash \\varphi : \\mathbb{F} \\quad \\Gamma,\\, \\varphi \\vdash T : \\mathrm{Type} \\quad \\Gamma,\\, \\varphi \\vdash')} ${kt('e', 'e')} ${km(': T \\simeq')} ${kt('A', 'A')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('\\mathrm{Glue}[\\varphi \\mapsto (T, e)]\\, A', 'glue')} ${km(': \\mathrm{Type}')}</div>
        <div style="margin-top: 8px; font-style: italic;">${km('\\text{Univalence: } (')} ${kt('A', 'A')} ${km('\\simeq')} ${kt('B', 'B')} ${km(') \\simeq (')} ${kt('A', 'A')} ${km('=')} ${kt('B', 'B')} ${km(')')}</div>
      </div>
    `,
    description: "Glue types allow us to 'glue' types together along equivalences. Univalence says that equivalent types are equal.",
    
    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      
      const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const sphereA = new THREE.Mesh(
        sphereGeometry,
        new THREE.MeshBasicMaterial({
          color: TYPE_FAMILY,
          transparent: true,
          opacity: 0.8,
          wireframe: true
        })
      );
      sphereA.position.x = -2;
      group.add(sphereA);

      const torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
      const torusB = new THREE.Mesh(
        torusGeometry,
        new THREE.MeshBasicMaterial({
          color: RESULT,
          transparent: true,
          opacity: 0.8,
          wireframe: true
        })
      );
      torusB.position.x = 2;
      group.add(torusB);

      const pathCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(-1, 0.5, 0),
        new THREE.Vector3(0, 0.8, 0),
        new THREE.Vector3(1, 0.5, 0),
        new THREE.Vector3(2, 0, 0)
      ]);

      const pathGeometry = new THREE.TubeGeometry(pathCurve, 64, 0.05, 8, false);
      const pathMesh = new THREE.Mesh(
        pathGeometry,
        new THREE.MeshBasicMaterial({
          color: EQUIVALENCE,
          transparent: true,
          opacity: 0.6
        })
      );
      group.add(pathMesh);

      const elementGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const element = new THREE.Mesh(
        elementGeometry,
        new THREE.MeshBasicMaterial({ color: BASE_POINT })
      );
      group.add(element);

      const labelA = createTextSprite('A', hexCss(TYPE_FAMILY));
      labelA.position.set(-2, -1, 0);
      group.add(labelA);

      const labelB = createTextSprite('B', hexCss(RESULT));
      labelB.position.set(2, -1, 0);
      group.add(labelB);

      const labelEquiv = createTextSprite('A ≃ B', hexCss(EQUIVALENCE));
      labelEquiv.position.set(0, 1.2, 0);
      group.add(labelEquiv);

      const axes = createAxes(scene);

      scene.add(group);

      (scene as any)._glueGroup = group;
      (scene as any)._axes = axes;
      (scene as any)._glueElement = element;
      (scene as any)._gluePathCurve = pathCurve;
      (scene as any)._glueSphereA = sphereA;
      (scene as any)._glueTorusB = torusB;

      glueTypeRule.termMappings = [
        { termKey: 'A', objects: [sphereA] },
        { termKey: 'B', objects: [torusB] },
        { termKey: 'e', objects: [pathMesh] },
        { termKey: 'glue', objects: [element] },
      ];
    },
    
    update: (time: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;

      const element = (scene as any)._glueElement as THREE.Mesh | undefined;
      const pathCurve = (scene as any)._gluePathCurve as THREE.CatmullRomCurve3 | undefined;
      const sphereA = (scene as any)._glueSphereA as THREE.Mesh | undefined;
      const torusB = (scene as any)._glueTorusB as THREE.Mesh | undefined;

      if (!element || !pathCurve) return;

      const t = (Math.sin(time * 0.5) + 1) / 2;
      const point = pathCurve.getPoint(t);
      element.position.copy(point);

      const scale = 1 + Math.sin(t * Math.PI) * 0.3;
      element.scale.set(scale, scale, scale);

      if (sphereA) sphereA.rotation.y = t * Math.PI * 2;
      if (torusB) torusB.rotation.y = t * Math.PI * 2;
    },
    
    cleanup: (scene: THREE.Scene) => {
      const group = (scene as any)._glueGroup;
      if (group) scene.remove(group);
      const axes = (scene as any)._axes;
      if (axes) scene.remove(axes);
    }
  };
</script>

<Rule rule={glueTypeRule} />
