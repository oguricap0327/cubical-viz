<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import Slider from '../controls/Slider.svelte';
  import PlayPause from '../controls/PlayPause.svelte';

  let timeValue = $state(0);
  let playing = $state(true);
  let manualControl = $state(false);
  
  // Start animation on mount
  $effect(() => {
    playing = true;
    manualControl = false;
  });

  const transportRule: RuleDefinition = {
    name: "Transport - Coercion Along Paths",
    judgment: `
      <div style="text-align: center; line-height: 1.8;">
        <div style="margin-bottom: 5px;">Γ, i : 𝕀 ⊢ A &nbsp;&nbsp;&nbsp; Γ ⊢ a : A(i₀)</div>
        <div style="border-top: 2px solid #88ccff; margin: 5px 40px;"></div>
        <div>Γ ⊢ transp<sup>i</sup> A a : A(i₁)</div>
      </div>
    `,
    description: "Transport moves an element along a path in a type family. It's a special case of composition: transp^i A a = comp^i A [] a",
    
    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      
      // Create two shapes representing A(i0) and A(i1)
      // A(i0) - sphere (blue)
      const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x3366ff,
        transparent: true,
        opacity: 0.7,
        wireframe: true,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(-1, 0, 0);
      group.add(sphere);
      
      // A(i1) - torus (red)
      const torusGeometry = new THREE.TorusGeometry(0.3, 0.12, 16, 32);
      const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4433,
        transparent: true,
        opacity: 0.7,
        wireframe: true,
      });
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torus.position.set(1, 0, 0);
      group.add(torus);
      
      // Path connecting them (type family A)
      const pathCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(-0.5, 0.3, 0.1),
        new THREE.Vector3(0, 0.4, 0),
        new THREE.Vector3(0.5, 0.3, -0.1),
        new THREE.Vector3(1, 0, 0),
      ]);
      
      const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathCurve.getPoints(50));
      const pathMaterial = new THREE.LineBasicMaterial({ 
        color: 0x88ccff,
        linewidth: 2,
      });
      const pathLine = new THREE.Line(pathGeometry, pathMaterial);
      group.add(pathLine);
      
      // Element 'a' at A(i0)
      const elementGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const elementMaterial = new THREE.MeshStandardMaterial({
        color: 0xffcc33,
        emissive: 0xaa8800,
      });
      const element = new THREE.Mesh(elementGeometry, elementMaterial);
      element.position.copy(pathCurve.getPointAt(0));
      group.add(element);
      
      // Labels
      const labelA0 = createTextSprite('A(i₀)', '#6699ff');
      labelA0.position.set(-1, -0.5, 0);
      labelA0.scale.set(0.3, 0.3, 0.3);
      group.add(labelA0);
      
      const labelA1 = createTextSprite('A(i₁)', '#ff6655');
      labelA1.position.set(1, -0.5, 0);
      labelA1.scale.set(0.3, 0.3, 0.3);
      group.add(labelA1);
      
      const labelElement = createTextSprite('a', '#ffcc33');
      labelElement.position.set(-1, 0.4, 0);
      labelElement.scale.set(0.25, 0.25, 0.25);
      group.add(labelElement);
      
      const labelTransport = createTextSprite('transp a', '#ffcc33');
      labelTransport.position.set(1, 0.4, 0);
      labelTransport.scale.set(0.25, 0.25, 0.25);
      group.add(labelTransport);
      
      scene.add(group);
      
      // Store references for animation
      (scene as any)._transportGroup = group;
      (scene as any)._element = element;
      (scene as any)._pathCurve = pathCurve;
      (scene as any)._labelElement = labelElement;
    },
    
    update: (time: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      
      const element = (scene as any)._element;
      const pathCurve = (scene as any)._pathCurve;
      const labelElement = (scene as any)._labelElement;
      
      if (element && pathCurve) {
        // Use manual control if slider is being used, otherwise animate
        const t = manualControl ? timeValue : (Math.sin(time * 0.5) + 1) / 2;
        const pos = pathCurve.getPointAt(t);
        element.position.copy(pos);
        
        if (labelElement) {
          labelElement.position.set(pos.x, pos.y + 0.4, pos.z);
        }
        
        // Update timeValue for display
        if (!manualControl && playing) {
          timeValue = t;
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

<Rule rule={transportRule}>
  {#snippet controls()}
    <div class="controls-container">
      <PlayPause {playing} onToggle={handlePlayPause} />
      <Slider 
        bind:value={timeValue}
        min={0}
        max={1}
        step={0.01}
        label="Transport Progress (i)"
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
