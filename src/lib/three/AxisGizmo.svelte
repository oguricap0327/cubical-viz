<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let { camera }: { camera: THREE.PerspectiveCamera } = $props();

  let gizmoCanvas: HTMLCanvasElement;

  const SIZE = 120;
  const ARROW_LENGTH = 1.6;
  const SHAFT_RADIUS = 0.045;
  const TIP_RADIUS = 0.12;
  const TIP_HEIGHT = 0.32;
  const CAMERA_DISTANCE = 4.5;

  const AXES = [
    { dir: new THREE.Vector3(1, 0, 0), color: 0xff4444, label: 'i' },
    { dir: new THREE.Vector3(0, 1, 0), color: 0x44ff44, label: 'j' },
    { dir: new THREE.Vector3(0, 0, 1), color: 0x4488ff, label: 'k' },
  ] as const;

  onMount(() => {
    const renderer = new THREE.WebGLRenderer({
      canvas: gizmoCanvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();

    const gizmoCam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    gizmoCam.position.set(0, 0, CAMERA_DISTANCE);
    gizmoCam.lookAt(0, 0, 0);

    // Ambient + directional light so the arrows are visible
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);

    // Build arrow meshes for each axis
    for (const { dir, color } of AXES) {
      const mat = new THREE.MeshStandardMaterial({ color });

      // Shaft: cylinder from origin along dir
      const shaftLen = ARROW_LENGTH - TIP_HEIGHT;
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(SHAFT_RADIUS, SHAFT_RADIUS, shaftLen, 8),
        mat,
      );
      // Cylinder is along Y by default; orient it along dir
      shaft.position.copy(dir.clone().multiplyScalar(shaftLen / 2));
      shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      scene.add(shaft);

      // Tip: cone at end of shaft
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(TIP_RADIUS, TIP_HEIGHT, 12),
        mat,
      );
      tip.position.copy(dir.clone().multiplyScalar(shaftLen + TIP_HEIGHT / 2));
      tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      scene.add(tip);
    }

    // Small sphere at origin
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x888888 }),
      ),
    );

    // --- Label overlay using a 2D canvas ---
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = SIZE * window.devicePixelRatio;
    labelCanvas.height = SIZE * window.devicePixelRatio;
    labelCanvas.style.cssText = `position:absolute;top:0;left:0;width:${SIZE}px;height:${SIZE}px;pointer-events:none`;
    gizmoCanvas.parentElement!.appendChild(labelCanvas);
    const ctx = labelCanvas.getContext('2d')!;

    function renderLabels() {
      const dpr = window.devicePixelRatio;
      ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${14 * dpr}px sans-serif`;

      for (const { dir, color, label } of AXES) {
        // Project tip position to 2D
        const tipWorld = dir.clone().multiplyScalar(ARROW_LENGTH * 1.15);
        tipWorld.project(gizmoCam);
        const sx = ((tipWorld.x + 1) / 2) * SIZE * dpr;
        const sy = ((1 - tipWorld.y) / 2) * SIZE * dpr;

        const hex = '#' + new THREE.Color(color).getHexString();
        ctx.fillStyle = hex;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 3 * dpr;
        ctx.strokeText(label, sx, sy);
        ctx.fillText(label, sx, sy);
      }
    }

    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);

      // Sync gizmo camera orientation to main camera
      gizmoCam.position
        .set(0, 0, 1)
        .applyQuaternion(camera.quaternion)
        .multiplyScalar(CAMERA_DISTANCE);
      gizmoCam.up.copy(camera.up);
      gizmoCam.lookAt(0, 0, 0);

      renderer.render(scene, gizmoCam);
      renderLabels();
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      labelCanvas.remove();
      renderer.dispose();
    };
  });
</script>

<div class="axis-gizmo">
  <canvas bind:this={gizmoCanvas}></canvas>
</div>

<style>
  .axis-gizmo {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 120px;
    height: 120px;
    pointer-events: none;
    z-index: 10;
  }
  .axis-gizmo canvas {
    width: 120px;
    height: 120px;
    display: block;
  }
</style>
