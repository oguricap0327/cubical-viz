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

  const pathInvRule: RuleDefinition = {
    name: "Path Inversion",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma \\vdash')} ${kt('p', 'p')} ${km(': ')} ${kt('a', 'a')} ${km('=_A')} ${kt('b', 'b')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('p^{-1}', 'pinv')} ${km(': ')} ${kt('b', 'b')} ${km('=_A')} ${kt('a', 'a')}</div>
      </div>
    `,
    description: "Path inversion reverses a path's direction. If p goes from a to b, then p⁻¹ goes from b to a via p⁻¹(i) = p(1−i).",

    setup: (scene: THREE.Scene, _camera: THREE.Camera) => {
      const group = new THREE.Group();

      const posA = new THREE.Vector3(-2, 0, 0);
      const posB = new THREE.Vector3(2, 0, 0);

      // Point spheres
      const sphereA = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 24, 24),
        new THREE.MeshBasicMaterial({ color: INTERVAL })
      );
      sphereA.position.copy(posA);
      group.add(sphereA);

      const sphereB = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 24, 24),
        new THREE.MeshBasicMaterial({ color: RESULT })
      );
      sphereB.position.copy(posB);
      group.add(sphereB);

      // Helper: create gradient line
      function createGradientLine(
        from: THREE.Vector3, to: THREE.Vector3,
        colorA: number, colorB: number, yOffset: number, segments = 40
      ): THREE.Line {
        const points: THREE.Vector3[] = [];
        const colors: number[] = [];
        const cA = new THREE.Color(colorA);
        const cB = new THREE.Color(colorB);
        const tmp = new THREE.Color();
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const pt = new THREE.Vector3().lerpVectors(from, to, t);
          pt.y = yOffset;
          points.push(pt);
          tmp.copy(cA).lerp(cB, t);
          colors.push(tmp.r, tmp.g, tmp.b);
        }
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        return new THREE.Line(geom, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 }));
      }

      // Forward path p (a→b): cyan → orange, on y=0.15
      const lineP = createGradientLine(posA, posB, INTERVAL, RESULT, 0.15);
      group.add(lineP);

      // Inverse path p⁻¹ (b→a): orange → cyan, on y=-0.15, initially hidden
      const linePInv = createGradientLine(posB, posA, RESULT, INTERVAL, -0.15);
      linePInv.visible = false;
      group.add(linePInv);

      // Arrowhead for forward path (pointing right, near b)
      const arrowGeo = new THREE.ConeGeometry(0.07, 0.2, 12);
      const arrowFwd = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: RESULT }));
      arrowFwd.position.set(1.6, 0.15, 0);
      arrowFwd.rotation.z = -Math.PI / 2; // point right
      group.add(arrowFwd);

      // Arrowhead for inverse path (pointing left, near a), initially hidden
      const arrowInv = new THREE.Mesh(
        arrowGeo.clone(),
        new THREE.MeshBasicMaterial({ color: INTERVAL })
      );
      arrowInv.position.set(-1.6, -0.15, 0);
      arrowInv.rotation.z = Math.PI / 2; // point left
      arrowInv.visible = false;
      group.add(arrowInv);

      // Traveling dot for forward path
      const dotFwd = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: INTERVAL })
      );
      dotFwd.position.copy(posA);
      group.add(dotFwd);

      // Traveling dot for inverse path, initially hidden
      const dotInv = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: RESULT })
      );
      dotInv.position.copy(posB);
      dotInv.visible = false;
      group.add(dotInv);

      // Labels
      const labelA = createTextSprite('a', hexCss(INTERVAL));
      labelA.position.set(-2, -0.7, 0);
      labelA.scale.set(0.3, 0.3, 0.3);
      group.add(labelA);

      const labelB = createTextSprite('b', hexCss(RESULT));
      labelB.position.set(2, -0.7, 0);
      labelB.scale.set(0.3, 0.3, 0.3);
      group.add(labelB);

      const labelP = createTextSprite('p', hexCss(INTERVAL));
      labelP.position.set(0, 0.55, 0);
      labelP.scale.set(0.25, 0.25, 0.25);
      group.add(labelP);

      const labelPInv = createTextSprite('p⁻¹', hexCss(RESULT));
      labelPInv.position.set(0, -0.55, 0);
      labelPInv.scale.set(0.25, 0.25, 0.25);
      labelPInv.visible = false;
      group.add(labelPInv);

      scene.add(group);

      // Store references
      (scene as any)._invGroup = group;
      (scene as any)._invDotFwd = dotFwd;
      (scene as any)._invDotInv = dotInv;
      (scene as any)._invLinePInv = linePInv;
      (scene as any)._invArrowInv = arrowInv;
      (scene as any)._invArrowFwd = arrowFwd;
      (scene as any)._invLabelPInv = labelPInv;
      (scene as any)._invLineP = lineP;
      (scene as any)._invLabelP = labelP;

      pathInvRule.termMappings = [
        { termKey: 'a', objects: [sphereA] },
        { termKey: 'b', objects: [sphereB] },
        { termKey: 'p', objects: [lineP] },
        { termKey: 'pinv', objects: [linePInv] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;

      const dotFwd = (scene as any)._invDotFwd as THREE.Mesh | undefined;
      const dotInv = (scene as any)._invDotInv as THREE.Mesh | undefined;
      const linePInv = (scene as any)._invLinePInv as THREE.Line | undefined;
      const arrowInv = (scene as any)._invArrowInv as THREE.Mesh | undefined;
      const arrowFwd = (scene as any)._invArrowFwd as THREE.Mesh | undefined;
      const labelPInv = (scene as any)._invLabelPInv as THREE.Sprite | undefined;
      const lineP = (scene as any)._invLineP as THREE.Line | undefined;
      const labelP = (scene as any)._invLabelP as THREE.Sprite | undefined;

      if (!dotFwd || !dotInv || !linePInv || !arrowInv || !arrowFwd || !labelPInv) return;

      const t = elapsed !== undefined ? time : (Math.sin(time * 0.5) + 1) / 2;
      const rawTime = elapsed ?? time;
      const osc = (Math.sin(rawTime * 1.5) + 1) / 2;

      const posA = new THREE.Vector3(-2, 0, 0);
      const posB = new THREE.Vector3(2, 0, 0);

      const isStep2 = t >= 0.5;

      // Forward path dot: travels left → right on y=0.15
      dotFwd.visible = !isStep2;
      const fwdPos = new THREE.Vector3().lerpVectors(posA, posB, osc);
      fwdPos.y = 0.15;
      dotFwd.position.copy(fwdPos);

      // Inverse path elements visibility
      linePInv.visible = isStep2;
      arrowInv.visible = isStep2;
      dotInv.visible = isStep2;
      labelPInv.visible = isStep2;

      if (isStep2) {
        // Dot travels right → left on y=-0.15
        const invPos = new THREE.Vector3().lerpVectors(posB, posA, osc);
        invPos.y = -0.15;
        dotInv.position.copy(invPos);

        // Fade forward path slightly
        if (lineP) {
          (lineP.material as THREE.LineBasicMaterial).opacity = 0.35;
          (lineP.material as THREE.LineBasicMaterial).transparent = true;
        }
        if (arrowFwd) {
          (arrowFwd.material as THREE.MeshBasicMaterial).opacity = 0.35;
          (arrowFwd.material as THREE.MeshBasicMaterial).transparent = true;
        }
        if (labelP) labelP.material.opacity = 0.35;
      } else {
        if (lineP) {
          (lineP.material as THREE.LineBasicMaterial).opacity = 1;
          (lineP.material as THREE.LineBasicMaterial).transparent = false;
        }
        if (arrowFwd) {
          (arrowFwd.material as THREE.MeshBasicMaterial).opacity = 1;
          (arrowFwd.material as THREE.MeshBasicMaterial).transparent = false;
        }
        if (labelP) labelP.material.opacity = 1;
      }
    },

    cleanup: (scene: THREE.Scene) => {
      const group = (scene as any)._invGroup;
      if (group) scene.remove(group);
    },

    steps: [
      {
        label: 'Path p',
        description: 'p : a =_A b — a path from a to b, traversed left to right (i: 0 → 1)',
        timeRange: [0, 0.5],
      },
      {
        label: 'Inversion p⁻¹',
        description: 'p⁻¹ : b =_A a reverses the path direction. Formally, p⁻¹(i) = p(1-i) — we compose with the reversal map on I.',
        timeRange: [0.5, 1.0],
      },
    ],
  };
</script>

<Rule rule={pathInvRule} />
