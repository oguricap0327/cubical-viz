<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, PARTIAL_DATA, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  const LINE_X0 = -3;
  const LINE_X1 = 3;
  const SPLIT_X = -1; // boundary where φ stops holding

  function makeEdge(a: THREE.Vector3, b: THREE.Vector3, color: number): THREE.Line {
    const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 3 });
    return new THREE.Line(geo, mat);
  }

  const partialElementsRule: RuleDefinition = {
    name: 'Partial Elements [φ ↦ u]',
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma \\vdash')} ${kt('\\varphi', 'phi')} ${km(': \\mathbb{F} \\quad \\Gamma,\\, \\varphi \\vdash')} ${kt('u', 'u')} ${km(': A')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash')} ${kt('[\\varphi \\mapsto u]', 'partial')} ${km(': A \\;\\text{(partial element of } A \\text{, defined when } \\varphi \\text{ holds)}')}</div>
      </div>
    `,
    description: `The notation ${km('[\\varphi \\mapsto u]')} specifies a partial element: a term ${km('u')} defined only on the subset where the face formula ${km('\\varphi')} holds.`,

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();

      // Orthographic-ish camera looking at XY plane
      (camera as THREE.PerspectiveCamera).position.set(0, 0, 6);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // --- Bright segment: where φ holds ---
      const brightSegment = makeEdge(
        new THREE.Vector3(LINE_X0, 0, 0),
        new THREE.Vector3(SPLIT_X, 0, 0),
        PARTIAL_DATA,
      );
      group.add(brightSegment);

      // --- Dim segment: where φ does not hold ---
      const dimSegment = makeEdge(
        new THREE.Vector3(SPLIT_X, 0, 0),
        new THREE.Vector3(LINE_X1, 0, 0),
        0x333355,
      );
      group.add(dimSegment);

      // --- Value sphere at i=0 where φ holds ---
      const sphereMat = new THREE.MeshStandardMaterial({
        color: PARTIAL_DATA,
        emissive: PARTIAL_DATA,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: 1.0,
      });
      const valueSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 32, 32),
        sphereMat,
      );
      valueSphere.position.set(LINE_X0, 0, 0);
      group.add(valueSphere);

      // --- Labels ---
      const uLabel = createTextSprite('u', hexCss(PARTIAL_DATA));
      uLabel.position.set(LINE_X0, 0.4, 0);
      uLabel.scale.set(0.35, 0.35, 0.35);
      group.add(uLabel);

      const phiHoldsLabel = createTextSprite('φ holds here', hexCss(PARTIAL_DATA));
      phiHoldsLabel.position.set(-2, 0.5, 0);
      phiHoldsLabel.scale.set(0.5, 0.5, 0.5);
      group.add(phiHoldsLabel);

      const undefinedLabel = createTextSprite('undefined', '#555577');
      undefinedLabel.position.set(1, 0.5, 0);
      undefinedLabel.scale.set(0.5, 0.5, 0.5);
      group.add(undefinedLabel);

      const i0Label = createTextSprite('i=0', '#aaaaaa');
      i0Label.position.set(LINE_X0, -0.4, 0);
      i0Label.scale.set(0.3, 0.3, 0.3);
      group.add(i0Label);

      const i1Label = createTextSprite('i=1', '#aaaaaa');
      i1Label.position.set(LINE_X1, -0.4, 0);
      i1Label.scale.set(0.3, 0.3, 0.3);
      group.add(i1Label);

      scene.add(group);

      // Store references
      (scene as any)._partialRefs = { group, valueSphere, sphereMat };

      // Term mappings for hover highlighting
      partialElementsRule.termMappings = [
        { termKey: 'phi', objects: [brightSegment] },
        { termKey: 'u', objects: [valueSphere] },
        { termKey: 'partial', objects: [brightSegment, valueSphere] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      const refs = (scene as any)._partialRefs;
      if (!refs) return;

      const rawTime = elapsed ?? time;
      const { sphereMat } = refs;

      // Gentle pulse on the sphere opacity to draw attention
      sphereMat.opacity = 0.8 + 0.2 * Math.sin(rawTime * 2.5);
    },

    cleanup: (scene: THREE.Scene) => {
      const refs = (scene as any)._partialRefs;
      if (refs?.group) scene.remove(refs.group);
    },

    steps: [
      {
        label: 'Face formula φ',
        description: 'A face formula φ : 𝔽 specifies a subset of the interval where data is defined. Here φ = (i=0) means the left endpoint only.',
        timeRange: [0, 0.33],
      },
      {
        label: 'Partial element u',
        description: 'A partial element u : [φ ⊢ A] is a term defined only where φ holds. Outside φ, u is simply not defined — it has no value.',
        timeRange: [0.33, 0.66],
      },
      {
        label: 'Extension [φ ↦ u]',
        description: 'The notation [φ ↦ u] in Composition, Kan Filling, and Glue types means: \'on the part of the boundary where φ holds, the data is given by u\'. This is how partial boundary conditions are specified.',
        timeRange: [0.66, 1.0],
      },
    ],
  };
</script>

<Rule rule={partialElementsRule} />
