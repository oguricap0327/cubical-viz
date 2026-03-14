<script lang="ts">
  import Rule from '../rules/Rule.svelte';
  import type { RuleDefinition } from '../rules/types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import katex from 'katex';

  let { onComplete }: { onComplete: () => void } = $props();
  let activeStep = $state(0);
  let showCompletion = $state(false);

  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });

  // Left side objects
  let leftSphereA: THREE.Mesh;
  let leftSphereB: THREE.Mesh;
  let leftArc: THREE.Line;
  let leftDot: THREE.Mesh;
  let leftLabelUa: THREE.Sprite;
  let leftCurvePoints: THREE.Vector3[] = [];

  // Right side objects
  let rightSphereA: THREE.Mesh;
  let rightSphereEa: THREE.Mesh;
  let rightArc: THREE.Line;
  let morphDot: THREE.Mesh;
  let rightLabelA: THREE.Sprite;
  let rightLabelEa: THREE.Sprite;
  let rightCurvePoints: THREE.Vector3[] = [];

  // Separator & section labels
  let separator: THREE.LineSegments;
  let labelLeft: THREE.Sprite;
  let labelRight: THREE.Sprite;

  const completionKatex = katex.renderToString(
    'e \\mapsto \\mathrm{ua}(e) \\mapsto \\mathrm{transp}^i(\\mathrm{ua}(e)(i)) \\equiv e',
    { throwOnError: false, displayMode: true },
  );

  function buildGradientLine(points: THREE.Vector3[]): THREE.Line {
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    const cA = new THREE.Color(0x44DDFF);
    const cB = new THREE.Color(0xFF8844);
    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i].x;
      positions[i * 3 + 1] = points[i].y;
      positions[i * 3 + 2] = points[i].z;
      const c = cA.clone().lerp(cB, i / (points.length - 1));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 1 }));
  }

  const rule: RuleDefinition = {
    name: 'Transport computes e(a)',
    judgment: `<div class="nd-rule">${kd('\\Gamma \\;\\vdash\\; \\mathrm{transp}^i\\bigl(\\mathrm{ua}(e)(i)\\bigr)\\,a \\;\\equiv\\; e(a) \\;:\\; B')}</div>`,
    description: 'Transporting along ua(<i>e</i>) computes as the underlying function of the equivalence <i>e</i>.',

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      camera.position.set(0, 2, 10);
      (camera as THREE.PerspectiveCamera).lookAt(0, 0, 0);

      // Vertical separator
      const sepGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -2, 0),
        new THREE.Vector3(0, 2, 0),
      ]);
      separator = new THREE.LineSegments(sepGeo, new THREE.LineBasicMaterial({ color: 0x444466 }));
      scene.add(separator);

      // ── LEFT SIDE: miniature path in 𝒰 ──
      leftSphereA = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x44DDFF }),
      );
      leftSphereA.position.set(-3, 0, 0);
      scene.add(leftSphereA);

      leftSphereB = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xFF8844 }),
      );
      leftSphereB.position.set(-0.5, 0, 0);
      scene.add(leftSphereB);

      const leftCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-3, 0, 0),
        new THREE.Vector3(-1.75, 1, 0.5),
        new THREE.Vector3(-0.5, 0, 0),
      );
      leftCurvePoints = leftCurve.getPoints(50);
      leftArc = buildGradientLine(leftCurvePoints);
      scene.add(leftArc);

      leftDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
      );
      scene.add(leftDot);

      leftLabelUa = createTextSprite('ua(e)', '#FFFFFF');
      leftLabelUa.position.set(-1.75, 0.9, 0);
      scene.add(leftLabelUa);

      // ── RIGHT SIDE: fiber transport ──
      rightSphereA = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x44DDFF }),
      );
      rightSphereA.position.set(1, 0, 0);
      scene.add(rightSphereA);

      rightSphereEa = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xFF8844 }),
      );
      rightSphereEa.position.set(3.5, 0, 0);
      scene.add(rightSphereEa);

      const rightCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(2.25, 1, 0.5),
        new THREE.Vector3(3.5, 0, 0),
      );
      rightCurvePoints = rightCurve.getPoints(50);
      rightArc = buildGradientLine(rightCurvePoints);
      scene.add(rightArc);

      morphDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x44DDFF }),
      );
      scene.add(morphDot);

      rightLabelA = createTextSprite('a : A', '#44DDFF');
      rightLabelA.position.set(1, -0.6, 0);
      scene.add(rightLabelA);

      rightLabelEa = createTextSprite('e(a) : B', '#FF8844');
      rightLabelEa.position.set(3.5, -0.6, 0);
      scene.add(rightLabelEa);

      // Section labels at top
      labelLeft = createTextSprite('Path in 𝒰', '#666688');
      labelLeft.position.set(-1.75, 1.8, 0);
      scene.add(labelLeft);

      labelRight = createTextSprite('Transport', '#666688');
      labelRight.position.set(2.25, 1.8, 0);
      scene.add(labelRight);

      rule.termMappings = [
        { termKey: 'transp', objects: [morphDot] },
        { termKey: 'a', objects: [rightSphereA] },
        { termKey: 'ea', objects: [rightSphereEa] },
      ];
    },

    update: (t: number, _elapsed?: number) => {
      // Left side: traveling dot along ua(e) arc
      if (leftCurvePoints.length > 0) {
        const idx = Math.min(Math.floor(t * (leftCurvePoints.length - 1)), leftCurvePoints.length - 1);
        leftDot.position.copy(leftCurvePoints[Math.max(0, idx)]);
      }

      // Right side: morphing dot along transport arc, color lerp
      if (rightCurvePoints.length > 0) {
        const idx = Math.min(Math.floor(t * (rightCurvePoints.length - 1)), rightCurvePoints.length - 1);
        morphDot.position.copy(rightCurvePoints[Math.max(0, idx)]);
        const cA = new THREE.Color(0x44DDFF);
        const cB = new THREE.Color(0xFF8844);
        (morphDot.material as THREE.MeshBasicMaterial).color.copy(cA.lerp(cB, t));
      }
    },

    cleanup: (scene: THREE.Scene) => {
      scene.remove(
        separator,
        leftSphereA, leftSphereB, leftArc, leftDot, leftLabelUa,
        rightSphereA, rightSphereEa, rightArc, morphDot, rightLabelA, rightLabelEa,
        labelLeft, labelRight,
      );
    },

    steps: [
      {
        label: 'Recall transport',
        description: 'Transport along a path p : A =_𝒰 B sends elements of A to elements of B: transp^i p(i) a : B.',
        timeRange: [0, 0.35],
      },
      {
        label: 'Transport along ua(e)',
        description: 'Transporting a : A along ua(e) moves a from the fiber at i=0 (type A) to the fiber at i=1 (type B).',
        timeRange: [0.35, 0.7],
      },
      {
        label: 'Computation rule',
        description: 'By the definitional reduction of Glue types, this transport computes to e(a) — the underlying function of the equivalence. This closes the loop.',
        timeRange: [0.7, 1.0],
      },
    ],
  };
</script>

<div class="stage-wrapper">
  <Rule {rule} onStep={(i) => (activeStep = i)} />
  {#if activeStep === 2 && !showCompletion}
    <div class="continue-wrapper">
      <button class="continue-btn finish-btn" onclick={() => (showCompletion = true)}>
        Finish — see proof! 🎉
      </button>
    </div>
  {/if}
</div>

{#if showCompletion}
  <div class="completion-overlay">
    <div class="completion-panel">
      <h2 class="completion-title">Univalence Proved! 🎉</h2>
      <div class="completion-katex">
        {@html completionKatex}
      </div>
      <div class="completion-buttons">
        <button class="comp-btn review-btn" onclick={onComplete}>
          Review from Stage 1
        </button>
        <button class="comp-btn explore-btn" onclick={() => (window.location.hash = '#glue-type-rule')}>
          Explore: Glue Types
        </button>
        <button class="comp-btn explore-btn" onclick={() => (window.location.hash = '#transport-rule')}>
          Explore: Transport
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .stage-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .continue-wrapper {
    display: flex;
    justify-content: center;
    padding: 14px;
    background: rgba(0, 0, 0, 0.85);
    border-top: 1px solid #4a4a6a;
  }

  .continue-btn {
    padding: 10px 28px;
    background: #44FF88;
    color: #000;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: filter 0.2s;
  }

  .continue-btn:hover {
    filter: brightness(1.15);
  }

  .finish-btn {
    background: linear-gradient(135deg, #44FF88, #44DDFF);
    font-size: 1.1rem;
    padding: 12px 32px;
  }

  /* ── Completion Overlay ── */
  .completion-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .completion-panel {
    max-width: 500px;
    width: 90%;
    background: #0d1117;
    border: 1px solid #44FF88;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
  }

  .completion-title {
    color: #44FF88;
    font-size: 1.8rem;
    margin: 0 0 20px 0;
  }

  .completion-katex {
    margin: 20px 0;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .completion-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;
  }

  .comp-btn {
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.2s;
  }

  .comp-btn:hover {
    filter: brightness(1.15);
  }

  .review-btn {
    background: #44FF88;
    color: #000;
  }

  .explore-btn {
    background: #333355;
    color: #88ccff;
    border: 1px solid #4a4a6a;
  }
</style>
