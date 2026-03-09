<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { createInterval } from './createInterval';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    // -- Scene --
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // -- Camera --
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.8, 2.5);
    camera.lookAt(0, 0, 0);

    // -- Renderer --
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // -- Lighting --
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 50);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // -- Interval visualization --
    const interval = createInterval();
    scene.add(interval);

    // -- Subtle grid for spatial reference --
    const gridHelper = new THREE.GridHelper(4, 20, 0x333355, 0x222244);
    gridHelper.position.y = -0.3;
    scene.add(gridHelper);

    // -- OrbitControls for interactive camera rotation --
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);
    controls.update();

    // -- Animation loop --
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.update(); // required when damping is enabled
      renderer.render(scene, camera);
    }
    animate();

    // -- Resize handler --
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    // -- Cleanup on component destroy --
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
