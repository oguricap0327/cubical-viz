<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import Slider from '../controls/Slider.svelte';
  import PlayPause from '../controls/PlayPause.svelte';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });

  let timeValue = $state(0);
  let playing = $state(true);
  let manualControl = $state(false);

  const kanFillingRule: RuleDefinition = {
    name: "Kan Filling - Completing the Box",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash A \\quad \\Gamma \\vdash \\varphi : \\mathbb{F} \\quad \\Gamma,\\, \\varphi,\\, i : \\mathbb{I} \\vdash u : A \\quad \\Gamma \\vdash a_0 : A(i_0)[\\varphi \\mapsto u(i_0)]')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash \\mathrm{fill}^i\\, A\\, [\\varphi \\mapsto u]\\, a_0 : \\mathrm{Path}\\,(\\lambda j \\to A(j)[\\varphi \\mapsto u(j)])\\, a_0\\, (\\mathrm{comp}^i\\, A\\, [\\varphi \\mapsto u]\\, a_0)')}</div>
      </div>
    `,
    description: "Given an open box (5 faces), construct the missing lid. The fill operation gives us a path from the base to the composition.",
    
    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      
      // Create the open box (5 faces)
      const boxSize = 2;
      const material = new THREE.MeshStandardMaterial({ 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });

      // Bottom face (i=0) - blue
      const bottom = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        material.clone()
      );
      bottom.material.color.setHex(0x4488ff);
      bottom.position.y = -boxSize / 2;
      bottom.rotation.x = -Math.PI / 2;
      group.add(bottom);

      // Four side faces - green
      const sides: THREE.Mesh[] = [];
      
      // Front
      const front = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        material.clone()
      );
      front.material.color.setHex(0x44ff88);
      front.position.z = boxSize / 2;
      group.add(front);
      sides.push(front);

      // Back
      const back = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        material.clone()
      );
      back.material.color.setHex(0x44ff88);
      back.position.z = -boxSize / 2;
      back.rotation.y = Math.PI;
      group.add(back);
      sides.push(back);

      // Left
      const left = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        material.clone()
      );
      left.material.color.setHex(0x44ff88);
      left.position.x = -boxSize / 2;
      left.rotation.y = Math.PI / 2;
      group.add(left);
      sides.push(left);

      // Right
      const right = new THREE.Mesh(
        new THREE.PlaneGeometry(boxSize, boxSize),
        material.clone()
      );
      right.material.color.setHex(0x44ff88);
      right.position.x = boxSize / 2;
      right.rotation.y = -Math.PI / 2;
      group.add(right);
      sides.push(right);

      // Top face (lid) - starts invisible, fills in
      const topGeometry = new THREE.PlaneGeometry(boxSize, boxSize, 20, 20);
      const topMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4488,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        wireframe: false
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = boxSize / 2;
      top.rotation.x = Math.PI / 2;
      group.add(top);

      // Store original positions for animation
      const positions = topGeometry.attributes.position.array as Float32Array;
      const originalPositions = new Float32Array(positions);

      scene.add(group);
      
      return {
        group,
        animate: (time: number) => {
          // Animate the lid filling in
          const t = time;
          for (let i = 0; i < positions.length; i += 3) {
            const x = originalPositions[i];
            const z = originalPositions[i + 2];
            
            // Distance from center
            const dist = Math.sqrt(x * x + z * z) / (boxSize / 2);
            
            // Fill from edges to center
            const fillProgress = Math.max(0, Math.min(1, (t - dist * 0.5) * 2));
            
            // Interpolate y position
            positions[i + 1] = originalPositions[i + 1] - (1 - fillProgress) * boxSize;
          }
          
          topGeometry.attributes.position.needsUpdate = true;
          topGeometry.computeVertexNormals();
        }
      };
    },
    
    cleanup: (scene: THREE.Scene) => {
      // Cleanup handled by Rule component
    }
  };
</script>

<Rule rule={kanFillingRule} bind:time={timeValue}>
  {#snippet controls()}
    <PlayPause bind:playing={playing} />
    <Slider 
      bind:value={timeValue} 
      min={0} 
      max={1} 
      step={0.01}
      onchange={() => { manualControl = true; playing = false; }}
    />
  {/snippet}
</Rule>
