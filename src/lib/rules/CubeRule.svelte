<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { INTERVAL, BASE_POINT, RESULT, FILL_RESULT, PARTIAL_DATA, EQUIVALENCE, hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(f)}</span>`;

  const H = 1.5; // half side length (side = 3)

  const cubeRule: RuleDefinition = {
    name: 'Cube (3-Dimensional Homotopy)',
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i\\, j\\, k : \\mathbb{I} \\vdash')} ${kt('c', 'c')} ${km(': A')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">Six square faces given by ${km('i,j,k \\in \\{0,1\\}')}</div>
      </div>
    `,
    description: `A cube ${km('c : \\mathbb{I}^3 \\to A')} is parameterized by three interval variables. Its six faces are 2-dimensional paths obtained by fixing one variable at 0 or 1.`,

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      const group = new THREE.Group();
      const cam = camera as THREE.PerspectiveCamera;
      cam.position.set(4, 3, 6);
      cam.lookAt(new THREE.Vector3(0, 0, 0));

      // Wire-frame edges
      const boxGeo = new THREE.BoxGeometry(3, 3, 3);
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      const wireframe = new THREE.LineSegments(
        edgesGeo,
        new THREE.LineBasicMaterial({ color: 0xCCCCCC }),
      );
      group.add(wireframe);
      boxGeo.dispose();

      // Six face meshes
      const faceDefs: { label: string; color: number; position: THREE.Vector3; rotation: THREE.Euler }[] = [
        { label: 'i=0', color: INTERVAL,      position: new THREE.Vector3(-H, 0, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
        { label: 'i=1', color: RESULT,         position: new THREE.Vector3( H, 0, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
        { label: 'j=0', color: BASE_POINT,     position: new THREE.Vector3(0, -H, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) },
        { label: 'j=1', color: FILL_RESULT,    position: new THREE.Vector3(0,  H, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) },
        { label: 'k=0', color: PARTIAL_DATA,   position: new THREE.Vector3(0, 0, -H), rotation: new THREE.Euler(0, 0, 0) },
        { label: 'k=1', color: EQUIVALENCE,    position: new THREE.Vector3(0, 0,  H), rotation: new THREE.Euler(0, 0, 0) },
      ];

      const faceMeshes: THREE.Mesh[] = [];
      const faceMats: THREE.MeshBasicMaterial[] = [];

      for (const face of faceDefs) {
        const geo = new THREE.PlaneGeometry(3, 3);
        const mat = new THREE.MeshBasicMaterial({
          color: face.color,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(face.position);
        mesh.rotation.copy(face.rotation);
        group.add(mesh);
        faceMeshes.push(mesh);
        faceMats.push(mat);

        // Face center label
        const lbl = createTextSprite(face.label, '#ffffff', 60);
        lbl.position.copy(face.position);
        lbl.scale.set(0.5, 0.5, 0.5);
        group.add(lbl);
      }

      // Interior point (small white sphere)
      const sphereGeo = new THREE.SphereGeometry(0.12, 32, 32);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const interiorSphere = new THREE.Mesh(sphereGeo, sphereMat);
      interiorSphere.visible = false;
      group.add(interiorSphere);

      // Interior point label
      const cLabel = createTextSprite('c(i,j,k)', '#ffffff', 50);
      cLabel.scale.set(0.4, 0.4, 0.4);
      cLabel.visible = false;
      group.add(cLabel);

      scene.add(group);

      (scene as any)._cubeRefs = {
        group, faceMeshes, faceMats,
        interiorSphere, cLabel,
      };

      cubeRule.termMappings = [
        { termKey: 'c', objects: [interiorSphere] },
        { termKey: 'face_i0', objects: [faceMeshes[0]] },
        { termKey: 'face_i1', objects: [faceMeshes[1]] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      const refs = (scene as any)._cubeRefs;
      if (!refs) return;

      const t = elapsed !== undefined ? time : (Math.sin(time * 0.5) + 1) / 2;
      const raw = elapsed ?? time;

      const { group, faceMats, interiorSphere, cLabel } = refs;

      // Auto-rotation
      group.rotation.y = raw * 0.18;
      group.rotation.x = Math.sin(raw * 0.2) * 0.3;

      // Step 1 (t in [0, 0.4]): all faces dim, skeleton visible
      if (t < 0.4) {
        for (const mat of faceMats) mat.opacity = 0.18;
        interiorSphere.visible = false;
        cLabel.visible = false;
      }
      // Step 2 (t in [0.4, 0.75]): i=0 and i=1 faces brighter
      else if (t < 0.75) {
        for (let i = 0; i < faceMats.length; i++) {
          faceMats[i].opacity = (i === 0 || i === 1) ? 0.45 : 0.18;
        }
        interiorSphere.visible = false;
        cLabel.visible = false;
      }
      // Step 3 (t in [0.75, 1.0]): all faces at 0.25, interior point visible
      else {
        for (const mat of faceMats) mat.opacity = 0.25;
        interiorSphere.visible = true;
        cLabel.visible = true;

        // Lissajous path through the interior
        const x = Math.sin(raw) * 1.0;
        const y = Math.sin(raw * 0.7) * 1.0;
        const z = Math.sin(raw * 0.4) * 1.0;
        interiorSphere.position.set(x, y, z);
        cLabel.position.set(x, y + 0.3, z);
      }
    },

    cleanup: (scene: THREE.Scene) => {
      const refs = (scene as any)._cubeRefs;
      if (refs?.group) scene.remove(refs.group);
    },

    steps: [
      {
        label: 'Three dimensions',
        description: 'A cube c : I³ → A is parameterized by three interval variables i, j, k. The six faces are the boundaries where one variable is fixed at 0 or 1.',
        timeRange: [0, 0.4],
      },
      {
        label: 'Six faces',
        description: "Setting i=0 or i=1 gives square faces in the j-k plane. Similarly for j and k. Each face carries a typing constraint from the cube's boundary.",
        timeRange: [0.4, 0.75],
      },
      {
        label: 'Interior term',
        description: 'The interior point c(i,j,k) can range freely through A as i,j,k vary. The cube encodes a 3-dimensional homotopy.',
        timeRange: [0.75, 1.0],
      },
    ],
  };
</script>

<Rule rule={cubeRule} />
