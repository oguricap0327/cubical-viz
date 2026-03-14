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

  const glueTypeRule: RuleDefinition = {
    name: "Glue Types and Univalence",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma \\vdash \\varphi : \\mathbb{F} \\quad \\Gamma,\\, \\varphi \\vdash T : \\mathrm{Type} \\quad \\Gamma,\\, \\varphi \\vdash e : T \\simeq A')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash \\mathrm{Glue}[\\varphi \\mapsto (T, e)]\\, A : \\mathrm{Type}')}</div>
        <div style="margin-top: 8px; font-style: italic;">${km('\\text{Univalence: } (A \\simeq B) \\simeq (A = B)')}</div>
      </div>
    `,
    description: "Glue types allow us to 'glue' types together along equivalences. Univalence says that equivalent types are equal.",
    
    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      
      // Create two types: A (sphere) and B (torus)
      const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const sphereMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4488ff,
        transparent: true,
        opacity: 0.8,
        wireframe: true
      });
      const sphereA = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphereA.position.x = -2;
      group.add(sphereA);

      const torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
      const torusMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff4488,
        transparent: true,
        opacity: 0.8,
        wireframe: true
      });
      const torusB = new THREE.Mesh(torusGeometry, torusMaterial);
      torusB.position.x = 2;
      group.add(torusB);

      // Create the equivalence path (glue)
      const pathCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(-1, 0.5, 0),
        new THREE.Vector3(0, 0.8, 0),
        new THREE.Vector3(1, 0.5, 0),
        new THREE.Vector3(2, 0, 0)
      ]);

      const pathGeometry = new THREE.TubeGeometry(pathCurve, 64, 0.05, 8, false);
      const pathMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffaa44,
        transparent: true,
        opacity: 0.6
      });
      const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
      group.add(pathMesh);

      // Create a moving element along the path
      const elementGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const elementMaterial = new THREE.MeshStandardMaterial({ color: 0x44ff88 });
      const element = new THREE.Mesh(elementGeometry, elementMaterial);
      group.add(element);

      // Labels
      const labelA = createTextSprite('A', 0.5);
      labelA.position.set(-2, -1, 0);
      group.add(labelA);

      const labelB = createTextSprite('B', 0.5);
      labelB.position.set(2, -1, 0);
      group.add(labelB);

      const labelEquiv = createTextSprite('A ≃ B', 0.5);
      labelEquiv.position.set(0, 1.2, 0);
      group.add(labelEquiv);

      scene.add(group);
      
      return {
        group,
        animate: (time: number) => {
          // Move element along the path
          const point = pathCurve.getPoint(time);
          element.position.copy(point);

          // Morph element shape
          const scale = 1 + Math.sin(time * Math.PI) * 0.3;
          element.scale.set(scale, scale, scale);

          // Rotate the types slightly
          sphereA.rotation.y = time * Math.PI * 2;
          torusB.rotation.y = time * Math.PI * 2;
        }
      };
    },
    
    cleanup: (scene: THREE.Scene) => {
      // Cleanup handled by Rule component
    }
  };
</script>

<Rule rule={glueTypeRule} bind:time={timeValue}>
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
