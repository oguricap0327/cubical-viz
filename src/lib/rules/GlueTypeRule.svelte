<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
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

      // Left object: sphere (blue, TYPE_FAMILY)
      const sphereA = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshBasicMaterial({
          color: TYPE_FAMILY,
          transparent: true,
          opacity: 0.8,
          wireframe: true
        })
      );
      sphereA.position.x = -2;
      group.add(sphereA);

      // Right object: torus (pink/orange, RESULT)
      const torusB = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.2, 16, 32),
        new THREE.MeshBasicMaterial({
          color: RESULT,
          transparent: true,
          opacity: 0.8,
          wireframe: true
        })
      );
      torusB.position.x = 2;
      group.add(torusB);

      const arcMat = new THREE.MeshBasicMaterial({
        color: EQUIVALENCE,
        transparent: true,
        opacity: 0.6
      });

      // Top arc: f: T→A (left→right), upward curve
      const topCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(-1, 0.7, 0),
        new THREE.Vector3(0, 1.0, 0),
        new THREE.Vector3(1, 0.7, 0),
        new THREE.Vector3(2, 0, 0)
      ]);
      const topArc = new THREE.Mesh(
        new THREE.TubeGeometry(topCurve, 64, 0.04, 8, false),
        arcMat
      );
      group.add(topArc);

      // Bottom arc: g: A→T (right→left), downward curve
      const bottomCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(2, 0, 0),
        new THREE.Vector3(1, -0.7, 0),
        new THREE.Vector3(0, -1.0, 0),
        new THREE.Vector3(-1, -0.7, 0),
        new THREE.Vector3(-2, 0, 0)
      ]);
      const bottomArc = new THREE.Mesh(
        new THREE.TubeGeometry(bottomCurve, 64, 0.04, 8, false),
        arcMat
      );
      group.add(bottomArc);

      // Arrowheads (small cones at each arc endpoint)
      const arrowGeo = new THREE.ConeGeometry(0.08, 0.25, 12);
      const arrowMat = new THREE.MeshBasicMaterial({ color: EQUIVALENCE });

      // Top arc arrowhead (pointing right at x=2)
      const topArrow = new THREE.Mesh(arrowGeo, arrowMat);
      topArrow.position.copy(topCurve.getPoint(1));
      topArrow.rotation.z = -Math.PI / 2; // point right
      group.add(topArrow);

      // Bottom arc arrowhead (pointing left at x=-2)
      const bottomArrow = new THREE.Mesh(arrowGeo, arrowMat);
      bottomArrow.position.copy(bottomCurve.getPoint(1));
      bottomArrow.rotation.z = Math.PI / 2; // point left
      group.add(bottomArrow);

      // Moving dot (round-trip: top arc left→right, bottom arc right→left)
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshBasicMaterial({ color: BASE_POINT })
      );
      group.add(dot);

      // Labels
      const labelA = createTextSprite('A', hexCss(TYPE_FAMILY));
      labelA.position.set(-2, -1.5, 0);
      group.add(labelA);

      const labelB = createTextSprite('B', hexCss(RESULT));
      labelB.position.set(2, -1.5, 0);
      group.add(labelB);

      const labelF = createTextSprite('f', hexCss(EQUIVALENCE));
      labelF.position.set(0, 1.4, 0);
      group.add(labelF);

      const labelG = createTextSprite('g', hexCss(EQUIVALENCE));
      labelG.position.set(0, -1.4, 0);
      group.add(labelG);

      scene.add(group);

      (scene as any)._glueGroup = group;
      (scene as any)._glueDot = dot;
      (scene as any)._glueTopCurve = topCurve;
      (scene as any)._glueBottomCurve = bottomCurve;
      (scene as any)._glueSphereA = sphereA;
      (scene as any)._glueTorusB = torusB;

      glueTypeRule.termMappings = [
        { termKey: 'A', objects: [sphereA] },
        { termKey: 'B', objects: [torusB] },
        { termKey: 'e', objects: [topArc, bottomArc] },
        { termKey: 'glue', objects: [dot] },
      ];
    },

    update: (time: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;

      const dot = (scene as any)._glueDot as THREE.Mesh | undefined;
      const topCurve = (scene as any)._glueTopCurve as THREE.CatmullRomCurve3 | undefined;
      const bottomCurve = (scene as any)._glueBottomCurve as THREE.CatmullRomCurve3 | undefined;
      const sphereA = (scene as any)._glueSphereA as THREE.Mesh | undefined;
      const torusB = (scene as any)._glueTorusB as THREE.Mesh | undefined;

      if (!dot || !topCurve || !bottomCurve) return;

      // Full round-trip: 0→1 top arc (left→right), 1→2 bottom arc (right→left)
      const period = 6; // seconds for full loop
      const loopT = (time % period) / period; // 0..1 over full cycle
      let point: THREE.Vector3;
      if (loopT < 0.5) {
        // First half: travel along top arc left→right
        point = topCurve.getPoint(loopT * 2);
      } else {
        // Second half: travel along bottom arc right→left
        point = bottomCurve.getPoint((loopT - 0.5) * 2);
      }
      dot.position.copy(point);

      // Gentle rotation on both objects
      if (sphereA) sphereA.rotation.y = time * 0.3;
      if (torusB) torusB.rotation.y = time * 0.3;
    },

    cleanup: (scene: THREE.Scene) => {
      const group = (scene as any)._glueGroup;
      if (group) scene.remove(group);
    }
  };
</script>

<Rule rule={glueTypeRule} />
