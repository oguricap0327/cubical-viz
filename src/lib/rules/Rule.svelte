<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import type { RuleDefinition } from './types';
  import { createCamera, updateCameraAspect } from '../three/camera';
  import { createOrbitControls } from '../three/controls';
  import { createRenderer, updateRendererSize } from '../three/renderer';
  import { createScene } from '../three/scene';
  import type { Snippet } from 'svelte';

  let { rule, controls }: { rule: RuleDefinition; controls?: Snippet } = $props();

  let canvas: HTMLCanvasElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let orbitControls: ReturnType<typeof createOrbitControls>;

  onMount(() => {
    // Initialize Three.js using utilities
    scene = createScene();
    camera = createCamera();
    renderer = createRenderer(canvas);
    orbitControls = createOrbitControls(camera, renderer.domElement);

    // Call rule-specific setup
    rule.setup(scene, camera);

    const clock = new THREE.Clock();
    let animationId: number;

    // Animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      if (rule.update) {
        rule.update(time);
      }
      
      orbitControls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function onResize() {
      updateCameraAspect(camera, window.innerWidth / window.innerHeight);
      updateRendererSize(renderer, window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      
      if (rule.cleanup) {
        rule.cleanup(scene);
      }
      
      orbitControls.dispose();
      renderer.dispose();
    };
  });
</script>

<div class="rule-container">
  <div class="rule-header">
    <h2>{rule.name}</h2>
    <div class="rule-judgment">
      {@html rule.judgment}
    </div>
    <p class="rule-description">{rule.description}</p>
  </div>

  <div class="visualization">
    <canvas bind:this={canvas}></canvas>
  </div>

  {#if controls}
    <div class="controls">
      {@render controls()}
    </div>
  {:else if rule.controls}
    <div class="controls">
      {#if typeof rule.controls === 'function'}
        {@const Component = rule.controls}
        <Component />
      {/if}
    </div>
  {/if}
</div>

<style>
  .rule-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }

  .rule-header {
    padding: 20px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    border-bottom: 2px solid #4a4a6a;
  }

  .rule-header h2 {
    margin: 0 0 10px 0;
    font-size: 1.5rem;
    color: #88ccff;
  }

  .rule-judgment {
    font-family: 'Courier New', monospace;
    font-size: 1rem;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    margin: 10px 0;
    line-height: 1.6;
  }

  .rule-description {
    margin: 10px 0 0 0;
    font-size: 0.95rem;
    opacity: 0.9;
    font-style: italic;
  }

  .visualization {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .controls {
    padding: 20px;
    background: rgba(0, 0, 0, 0.75);
    border-top: 1px solid #4a4a6a;
  }
</style>
