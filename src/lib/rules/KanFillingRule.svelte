<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  const kanFillingRule: RuleDefinition = {
    name: "Kan Filling - Completing the Box",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash A \\quad \\Gamma \\vdash \\varphi : \\mathbb{F} \\quad \\Gamma,\\, \\varphi,\\, i : \\mathbb{I} \\vdash')} ${kt('u', 'u')} ${km(': A \\quad \\Gamma \\vdash')} ${kt('a_0', 'a_0')} ${km(': A(i_0)[\\varphi \\mapsto u(i_0)]')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('\\mathrm{fill}^i\\, A\\, [\\varphi \\mapsto u]\\, a_0', 'fill')} ${km(': \\mathrm{Path}\\,(\\lambda j \\to A(j)[\\varphi \\mapsto u(j)])\\, a_0\\, (\\mathrm{comp}^i\\, A\\, [\\varphi \\mapsto u]\\, a_0)')}</div>
      </div>
    `,
    description: "Given an open box (5 faces), construct the missing lid. The fill operation gives us a path from the base to the composition.",
    
    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      
      const boxSize = 2;

      // Bottom face (i=0) - blue
      const bottom = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        new THREE.MeshBasicMaterial({
          color: 0x4488ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        })
      );
      bottom.position.y = -boxSize / 2;
      bottom.rotation.x = -Math.PI / 2;
      group.add(bottom);

      // Four side faces - green
      const sides: THREE.Mesh[] = [];

      const front = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        new THREE.MeshBasicMaterial({
          color: 0x44ff88,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        })
      );
      front.position.z = boxSize / 2;
      group.add(front);
      sides.push(front);

      const back = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        new THREE.MeshBasicMaterial({
          color: 0x44ff88,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        })
      );
      back.position.z = -boxSize / 2;
      back.rotation.y = Math.PI;
      group.add(back);
      sides.push(back);

      const left = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        new THREE.MeshBasicMaterial({
          color: 0x44ff88,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        })
      );
      left.position.x = -boxSize / 2;
      left.rotation.y = Math.PI / 2;
      group.add(left);
      sides.push(left);

      const right = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        new THREE.MeshBasicMaterial({
          color: 0x44ff88,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        })
      );
      right.position.x = boxSize / 2;
      right.rotation.y = -Math.PI / 2;
      group.add(right);
      sides.push(right);

      // Top face (lid)
      const topGeometry = new THREE.PlaneGeometry(boxSize, boxSize, 20, 20);
      const top = new THREE.Mesh(
        topGeometry,
        new THREE.MeshBasicMaterial({
          color: 0xff4488,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        })
      );
      top.position.y = boxSize / 2;
      top.rotation.x = Math.PI / 2;
      group.add(top);

      const positions = topGeometry.attributes.position.array as Float32Array;
      const originalPositions = new Float32Array(positions);

      scene.add(group);

      (scene as any)._kanGroup = group;
      (scene as any)._kanTopPositions = positions;
      (scene as any)._kanOriginalPositions = originalPositions;
      (scene as any)._kanTopGeometry = topGeometry;
      (scene as any)._kanBoxSize = boxSize;

      kanFillingRule.termMappings = [
        { termKey: 'a_0', objects: [bottom] },
        { termKey: 'u', objects: sides },
        { termKey: 'fill', objects: [top] },
      ];
    },
    
    update: (time: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;

      const positions = (scene as any)._kanTopPositions as Float32Array | undefined;
      const originalPositions = (scene as any)._kanOriginalPositions as Float32Array | undefined;
      const topGeometry = (scene as any)._kanTopGeometry as THREE.PlaneGeometry | undefined;
      const boxSize = (scene as any)._kanBoxSize as number | undefined;

      if (!positions || !originalPositions || !topGeometry || !boxSize) return;

      const t = (Math.sin(time * 0.5) + 1) / 2;

      for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const z = originalPositions[i + 2];
        const dist = Math.sqrt(x * x + z * z) / (boxSize / 2);
        const fillProgress = Math.max(0, Math.min(1, (t - dist * 0.5) * 2));
        positions[i + 1] = originalPositions[i + 1] - (1 - fillProgress) * boxSize;
      }

      topGeometry.attributes.position.needsUpdate = true;
      topGeometry.computeVertexNormals();
    },
    
    cleanup: (scene: THREE.Scene) => {
      const group = (scene as any)._kanGroup;
      if (group) {
        scene.remove(group);
      }
    }
  };
</script>

<Rule rule={kanFillingRule} />
