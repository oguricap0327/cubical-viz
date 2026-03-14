<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, BASE_POINT, PARTIAL_DATA, FILL_RESULT, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  const compositionRule: RuleDefinition = {
    name: "Composition - The Heart of Cubical",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash A \\quad \\Gamma \\vdash \\varphi : \\mathbb{F} \\quad \\Gamma,\\, \\varphi,\\, i : \\mathbb{I} \\vdash')} ${kt('u', 'u')} ${km(': A \\quad \\Gamma \\vdash')} ${kt('a_0', 'a0')} ${km(': A(i_0)[\\varphi \\mapsto u(i_0)]')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('\\mathrm{comp}^i\\, A\\, [\\varphi \\mapsto u]\\, a_0', 'comp')} ${km(': A(i_1)[\\varphi \\mapsto u(i_1)]')}</div>
      </div>
    `,
    description: `Being extensible is preserved along paths: if a partial path is extensible at ${km('i=0')}, then it is extensible at ${km('i=1')}.`,
    
    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      
      const boxSize = 1.2;
      
      // Base face (at i=0) - base point
      const baseGeometry = new THREE.PlaneGeometry(boxSize, boxSize);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: BASE_POINT,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, -boxSize/2, 0);
      base.rotation.x = -Math.PI / 2;
      group.add(base);
      
      // Partial side faces (extent φ) - partial data
      const sideGeometry = new THREE.PlaneGeometry(boxSize, boxSize);
      const sideMaterial = new THREE.MeshStandardMaterial({
        color: PARTIAL_DATA,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      
      const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
      leftSide.position.set(-boxSize/2, 0, 0);
      leftSide.rotation.y = Math.PI / 2;
      group.add(leftSide);
      
      const rightSide = new THREE.Mesh(sideGeometry, sideMaterial);
      rightSide.position.set(boxSize/2, 0, 0);
      rightSide.rotation.y = -Math.PI / 2;
      group.add(rightSide);
      
      // Lid face (at i=1) - fill result, initially hidden
      const lidGeometry = new THREE.PlaneGeometry(boxSize, boxSize);
      const lidMaterial = new THREE.MeshStandardMaterial({
        color: FILL_RESULT,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, boxSize/2, 0);
      lid.rotation.x = Math.PI / 2;
      group.add(lid);
      
      // Wireframe edges (interval)
      const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(boxSize, boxSize, boxSize));
      const edgesMaterial = new THREE.LineBasicMaterial({ color: INTERVAL, linewidth: 2 });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      group.add(edges);
      
      // Labels
      const baseLabel = createTextSprite('a₀ (base)', hexCss(BASE_POINT));
      baseLabel.position.set(0, -boxSize/2 - 0.3, 0);
      baseLabel.scale.set(0.3, 0.3, 0.3);
      group.add(baseLabel);
      
      const sideLabel = createTextSprite('u (sides)', hexCss(PARTIAL_DATA));
      sideLabel.position.set(-boxSize/2 - 0.4, 0, 0);
      sideLabel.scale.set(0.3, 0.3, 0.3);
      group.add(sideLabel);
      
      const lidLabel = createTextSprite('comp (lid)', hexCss(FILL_RESULT));
      lidLabel.position.set(0, boxSize/2 + 0.3, 0);
      lidLabel.scale.set(0.3, 0.3, 0.3);
      group.add(lidLabel);
      
      scene.add(group);
      
      (scene as any)._compositionGroup = group;
      (scene as any)._lid = lid;

      // Populate term mappings for hover highlighting
      compositionRule.termMappings = [
        { termKey: 'a0', objects: [base] },
        { termKey: 'u', objects: [leftSide, rightSide] },
        { termKey: 'comp', objects: [lid] },
      ];
    },
    
    update: (time: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      
      const lid = (scene as any)._lid;
      if (lid) {
        const t = (Math.sin(time * 0.5) + 1) / 2;
        lid.material.opacity = t * 0.7;
      }
    },
    
    cleanup: (scene: THREE.Scene) => {
      const group = (scene as any)._compositionGroup;
      if (group) {
        scene.remove(group);
      }
    }
  };
  
</script>

<Rule rule={compositionRule} />
