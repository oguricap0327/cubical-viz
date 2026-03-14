<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import Slider from '../controls/Slider.svelte';
  import PlayPause from '../controls/PlayPause.svelte';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });

  let timeValue = $state(0);
  let playing = $state(true);
  let manualControl = $state(false);
  
  // Start animation on mount
  $effect(() => {
    playing = true;
    manualControl = false;
  });

  const compositionRule: RuleDefinition = {
    name: "Composition - The Heart of Cubical",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash A \\quad \\Gamma \\vdash \\varphi : \\mathbb{F} \\quad \\Gamma,\\, \\varphi,\\, i : \\mathbb{I} \\vdash u : A \\quad \\Gamma \\vdash a_0 : A(i_0)[\\varphi \\mapsto u(i_0)]')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash \\mathrm{comp}^i\\, A\\, [\\varphi \\mapsto u]\\, a_0 : A(i_1)[\\varphi \\mapsto u(i_1)]')}</div>
      </div>
    `,
    description: `Being extensible is preserved along paths: if a partial path is extensible at ${km('i=0')}, then it is extensible at ${km('i=1')}.`,
    
    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      
      // Create an "open box" - a cube with some faces highlighted
      const boxSize = 1.2;
      
      // Base face (at i=0) - blue
      const baseGeometry = new THREE.PlaneGeometry(boxSize, boxSize);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x3366ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, -boxSize/2, 0);
      base.rotation.x = -Math.PI / 2;
      group.add(base);
      
      // Partial side faces (extent φ) - green
      const sideGeometry = new THREE.PlaneGeometry(boxSize, boxSize);
      const sideMaterial = new THREE.MeshStandardMaterial({
        color: 0x44cc88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      
      // Left side
      const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
      leftSide.position.set(-boxSize/2, 0, 0);
      leftSide.rotation.y = Math.PI / 2;
      group.add(leftSide);
      
      // Right side
      const rightSide = new THREE.Mesh(sideGeometry, sideMaterial);
      rightSide.position.set(boxSize/2, 0, 0);
      rightSide.rotation.y = -Math.PI / 2;
      group.add(rightSide);
      
      // Lid face (at i=1) - red, initially hidden
      const lidGeometry = new THREE.PlaneGeometry(boxSize, boxSize);
      const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4433,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, boxSize/2, 0);
      lid.rotation.x = Math.PI / 2;
      group.add(lid);
      
      // Wireframe edges
      const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(boxSize, boxSize, boxSize));
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x88ccff, linewidth: 2 });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      group.add(edges);
      
      // Labels
      const baseLabel = createTextSprite('a₀ (base)', '#6699ff');
      baseLabel.position.set(0, -boxSize/2 - 0.3, 0);
      baseLabel.scale.set(0.3, 0.3, 0.3);
      group.add(baseLabel);
      
      const sideLabel = createTextSprite('u (sides)', '#66ddaa');
      sideLabel.position.set(-boxSize/2 - 0.4, 0, 0);
      sideLabel.scale.set(0.3, 0.3, 0.3);
      group.add(sideLabel);
      
      const lidLabel = createTextSprite('comp (lid)', '#ff6655');
      lidLabel.position.set(0, boxSize/2 + 0.3, 0);
      lidLabel.scale.set(0.3, 0.3, 0.3);
      group.add(lidLabel);
      
      scene.add(group);
      
      // Store references for animation
      (scene as any)._compositionGroup = group;
      (scene as any)._lid = lid;
    },
    
    update: (time: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      
      const lid = (scene as any)._lid;
      if (lid) {
        // Use manual control if slider is being used, otherwise animate
        const t = manualControl ? timeValue : (Math.sin(time * 0.5) + 1) / 2;
        lid.material.opacity = t * 0.7;
        
        // Update timeValue for display
        if (!manualControl && playing) {
          timeValue = t;
        }
      }
    },
    
    cleanup: (scene: THREE.Scene) => {
      const group = (scene as any)._compositionGroup;
      if (group) {
        scene.remove(group);
      }
    }
  };
  
  // Store scene reference for update function
  $effect(() => {
    return () => {
      (window as any)._currentScene = null;
    };
  });

  function handleSliderChange(value: number) {
    timeValue = value;
    manualControl = true;
  }

  function handlePlayPause(isPlaying: boolean) {
    playing = isPlaying;
    if (isPlaying) {
      manualControl = false;
    }
  }
</script>

<Rule rule={compositionRule}>
  {#snippet controls()}
    <div class="controls-container">
      <PlayPause {playing} onToggle={handlePlayPause} />
      <Slider 
        bind:value={timeValue}
        min={0}
        max={1}
        step={0.01}
        label="Filling Progress (i)"
        onChange={handleSliderChange}
      />
    </div>
  {/snippet}
</Rule>

<style>
  .controls-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
</style>
