<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import type { RuleDefinition } from './types';
  import { createCamera, updateCameraAspect } from '../three/camera';
  import { createOrbitControls } from '../three/controls';
  import { createRenderer, updateRendererSize } from '../three/renderer';
  import { createScene } from '../three/scene';
  import { hoveredTerm } from '../hoverState';
  import type { Snippet } from 'svelte';

  let { rule, controls }: { rule: RuleDefinition; controls?: Snippet } = $props();

  let canvas: HTMLCanvasElement;
  let ruleHeader: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let orbitControls: ReturnType<typeof createOrbitControls>;

  // Track original materials for highlight restore
  const originalEmissives = new Map<THREE.Object3D, { color: THREE.Color; intensity: number }>();
  const originalColors = new Map<THREE.Object3D, THREE.Color>();

  function saveOriginals(objects: THREE.Object3D[]) {
    for (const obj of objects) {
      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as any;
      if (!mat) continue;
      if ('emissive' in mat && !originalEmissives.has(obj)) {
        originalEmissives.set(obj, { color: mat.emissive.clone(), intensity: mat.emissiveIntensity });
      } else if ('color' in mat && !originalColors.has(obj)) {
        originalColors.set(obj, mat.color.clone());
      }
    }
  }

  function applyHighlight(objects: THREE.Object3D[]) {
    for (const obj of objects) {
      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as any;
      if (!mat) continue;
      saveOriginals([obj]);
      if ('emissive' in mat) {
        mat.emissive.set(0xffdc50);
        mat.emissiveIntensity = 1.5;
      } else if ('color' in mat) {
        mat.color.set(0xffdc50);
      }
    }
  }

  function clearHighlight(objects: THREE.Object3D[]) {
    for (const obj of objects) {
      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as any;
      if (!mat) continue;
      const origEmissive = originalEmissives.get(obj);
      if ('emissive' in mat && origEmissive) {
        mat.emissive.copy(origEmissive.color);
        mat.emissiveIntensity = origEmissive.intensity;
      } else {
        const origColor = originalColors.get(obj);
        if ('color' in mat && origColor) {
          mat.color.copy(origColor);
        }
      }
    }
  }

  onMount(() => {
    scene = createScene();
    camera = createCamera();
    renderer = createRenderer(canvas);
    orbitControls = createOrbitControls(camera, renderer.domElement);

    rule.setup(scene, camera);

    // Pre-save originals for all mapped objects
    if (rule.termMappings) {
      for (const m of rule.termMappings) saveOriginals(m.objects);
    }

    (window as any)._currentScene = scene;

    // --- Raycasting for 3D hover ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHover3D: string | null = null;
    let hoverSource: 'dom' | '3d' | null = null;

    // Collect all raycast-able meshes mapped to termKeys
    function getRaycastTargets(): { obj: THREE.Object3D; key: string }[] {
      const targets: { obj: THREE.Object3D; key: string }[] = [];
      if (!rule.termMappings) return targets;
      for (const m of rule.termMappings) {
        for (const obj of m.objects) {
          if ((obj as THREE.Mesh).isMesh) {
            targets.push({ obj, key: m.termKey });
          }
        }
      }
      return targets;
    }

    function onCanvasMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets = getRaycastTargets();
      const meshes = targets.map(t => t.obj);
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = targets.find(t => t.obj === intersects[0].object);
        if (hit && currentHover3D !== hit.key) {
          currentHover3D = hit.key;
          hoverSource = '3d';
          hoveredTerm.set(hit.key);
        }
      } else if (currentHover3D !== null) {
        currentHover3D = null;
        if (hoverSource === '3d') {
          hoveredTerm.set(null);
          hoverSource = null;
        }
      }
    }

    function onCanvasMouseLeave() {
      if (hoverSource === '3d') {
        currentHover3D = null;
        hoveredTerm.set(null);
        hoverSource = null;
      }
    }

    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseleave', onCanvasMouseLeave);

    // --- Subscribe to hoveredTerm to highlight 3D objects & DOM ---
    const unsubscribe = hoveredTerm.subscribe((key) => {
      if (!rule.termMappings) return;

      // Clear all highlights
      for (const m of rule.termMappings) clearHighlight(m.objects);

      // Apply highlight to matching term
      if (key) {
        const mapping = rule.termMappings.find(m => m.termKey === key);
        if (mapping) applyHighlight(mapping.objects);
      }

      // Update DOM highlighted class
      if (ruleHeader) {
        ruleHeader.querySelectorAll('.term-hover.highlighted').forEach(el =>
          el.classList.remove('highlighted')
        );
        if (key) {
          ruleHeader.querySelectorAll(`.term-hover[data-term="${key}"]`).forEach(el =>
            el.classList.add('highlighted')
          );
        }
      }
    });

    const clock = new THREE.Clock();
    let animationId: number;

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

    function onResize() {
      updateCameraAspect(camera, window.innerWidth / window.innerHeight);
      updateRendererSize(renderer, window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onCanvasMouseMove);
      canvas.removeEventListener('mouseleave', onCanvasMouseLeave);
      unsubscribe();
      (window as any)._currentScene = null;

      if (rule.cleanup) {
        rule.cleanup(scene);
      }

      orbitControls.dispose();
      renderer.dispose();
    };
  });

  function onHeaderMouseOver(e: MouseEvent) {
    const el = (e.target as HTMLElement).closest('[data-term]');
    hoveredTerm.set(el ? el.getAttribute('data-term') : null);
  }

  function onHeaderMouseLeave() {
    hoveredTerm.set(null);
  }
</script>

<div class="rule-container">
  <div
    class="rule-header"
    bind:this={ruleHeader}
    onmouseover={onHeaderMouseOver}
    onmouseleave={onHeaderMouseLeave}
    role="region"
    aria-label="Typing rule"
  >
    <h2>{rule.name}</h2>
    <div class="rule-judgment">
      {@html rule.judgment}
    </div>
    <p class="rule-description">{@html rule.description}</p>
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
    width: 100%;
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

  :global(.nd-rule) { text-align: center; padding: 4px 0; }
  :global(.nd-premises) { font-size: 0.9rem; margin-bottom: 4px; }
  :global(.nd-line) { border: none; border-top: 1.5px solid #88ccff; margin: 4px 60px; }
  :global(.nd-conclusion) { font-size: 0.95rem; }

  :global(.term-hover) {
    cursor: pointer;
    border-radius: 3px;
    transition: background 0.15s, outline-color 0.15s;
  }
  :global(.term-hover:hover),
  :global(.term-hover.highlighted) {
    background: rgba(255, 220, 80, 0.25);
    outline: 1px solid rgba(255, 220, 80, 0.5);
  }
</style>
