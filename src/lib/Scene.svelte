<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import type { VisualizationType } from './types';
  import { createInterval } from './createInterval';
  import { createPath } from './createPath';
  import { createSquare } from './createSquare';
  import { createCube } from './createCube';
  import { createComposition } from './createComposition';
  import { createTransport } from './createTransport';
  import { createCamera, updateCameraAspect } from './three/camera';
  import { createOrbitControls } from './three/controls';
  import { createRenderer, updateRendererSize } from './three/renderer';
  import { createScene } from './three/scene';

  let { visualization }: { visualization: VisualizationType } = $props();

  let canvas: HTMLCanvasElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: ReturnType<typeof createOrbitControls>;
  let currentGroup: THREE.Group | undefined;
  let currentAnimate: ((time: number) => void) | undefined;
  let sceneReady = $state(false);

  function loadVisualization(type: VisualizationType) {
    if (currentGroup) {
      scene.remove(currentGroup);
      currentGroup = undefined;
      currentAnimate = undefined;
    }

    let result: { group: THREE.Group; animate?: (time: number) => void };

    switch (type) {
      case 'interval':
        result = { group: createInterval() };
        break;
      case 'path':
        result = createPath();
        break;
      case 'square':
        result = createSquare();
        break;
      case 'cube':
        result = createCube();
        break;
      case 'composition':
        result = createComposition();
        break;
      case 'transport':
        result = createTransport();
        break;
    }

    currentGroup = result.group;
    currentAnimate = result.animate;
    scene.add(currentGroup);
  }

  $effect(() => {
    if (sceneReady) {
      loadVisualization(visualization);
    }
  });

  onMount(() => {
    // Initialize scene using utilities
    scene = createScene();
    camera = createCamera();
    renderer = createRenderer(canvas);
    controls = createOrbitControls(camera, renderer.domElement);

    sceneReady = true;

    const clock = new THREE.Clock();
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (currentAnimate) currentAnimate(t);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      updateCameraAspect(camera, window.innerWidth / window.innerHeight);
      updateRendererSize(renderer, window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    };
  });
</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
