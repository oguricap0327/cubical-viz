<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let canvas: HTMLCanvasElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;

  onMount(() => {
    // Initialize Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add a simple cube for now
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff88,
      wireframe: true 
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  });
</script>

<main>
  <div class="header">
    <h1>Cubical Type Theory Visualizer</h1>
    <p>Interactive 3D visualization of cubical type theory concepts</p>
  </div>
  <canvas bind:this={canvas}></canvas>
</main>

<style>
  main {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .header {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }

  p {
    margin: 0.5rem 0 0 0;
    font-size: 1rem;
    opacity: 0.9;
  }

  canvas {
    display: block;
  }
</style>
