<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import {
    INTERVAL, TYPE_FAMILY, BASE_POINT, RESULT, PARTIAL_DATA,
    FILL_RESULT, hexCss,
  } from '../colors';
  import katex from 'katex';

  const km = (s: string) => katex.renderToString(s, { throwOnError: false, displayMode: false });
  const kt = (s: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${km(s)}</span>`;

  // ─── shared palette ────────────────────────────────────────────────────────
  const C_A     = TYPE_FAMILY;    // type family A — teal
  const C_B     = PARTIAL_DATA;   // type family B — purple/violet
  const C_F     = BASE_POINT;     // function f / element — yellow
  const C_X     = FILL_RESULT;    // input x — orange
  const C_RES   = RESULT;         // result — bright green
  const C_TUBE  = INTERVAL;       // tube / path — blue

  // ─── helpers ──────────────────────────────────────────────────────────────
  function mkDisk(r: number, color: number, opacity = 0.45): THREE.Mesh {
    const geo = new THREE.CircleGeometry(r, 48);
    return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false,
    }));
  }

  function mkLabel(text: string, sc = 0.35): THREE.Sprite {
    const s = createTextSprite(text, '#ccddff');
    s.scale.set(sc, sc, sc);
    return s;
  }

  function tube(start: THREE.Vector3, end: THREE.Vector3, r: number, color: number, opacity = 1): THREE.Mesh {
    const geo = new THREE.TubeGeometry(
      new THREE.LineCurve3(start, end), 20, r, 12, false,
    );
    return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      color, transparent: true, opacity, depthWrite: false,
    }));
  }

  function arrow(
    start: THREE.Vector3, end: THREE.Vector3,
    color: number, opacity = 1,
    headR = 0.07, headL = 0.18,
  ): THREE.Group {
    const g = new THREE.Group();
    const dir = end.clone().sub(start);
    const len = dir.length();
    const shaftEnd = start.clone().add(dir.clone().normalize().multiplyScalar(len - headL));
    g.add(tube(start, shaftEnd, 0.03, color, opacity));
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(headR, headL, 16),
      new THREE.MeshPhongMaterial({ color, transparent: true, opacity }),
    );
    cone.position.copy(shaftEnd.clone().add(dir.clone().normalize().multiplyScalar(headL / 2)));
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    g.add(cone);
    return g;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Π-TYPE COMPOSITION RULE
  // ══════════════════════════════════════════════════════════════════════════

  const piRule: RuleDefinition = {
    name: 'Π-type Composition',

    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">
          ${kt('\\Gamma \\vdash A : \\mathcal{U}', 'A')} &nbsp;
          ${kt('\\Gamma, x\\!:\\!A \\vdash B : \\mathcal{U}', 'B')}
        </div>
        <div class="nd-bar"></div>
        <div class="nd-conclusion">
          ${kt('\\bigl(\\mathrm{comp}^i\\,(x\\!:\\!A)\\!\\to\\! B\\,[\\varphi\\mapsto u]\\,f_0\\bigr)(x)'
             + '= \\mathrm{comp}^i\\,B(x\')\\,[\\varphi\\mapsto u\\,x\']\\,(f_0\\,x_0)', 'comp')}
        </div>
      </div>`,

    description:
      `To compose in ${km('(x:A)\\to B')} we must transport ${km('x')} `
      + `<em>backwards</em> along ${km('A')} (using the reversed line) to obtain `
      + `${km('x_0 \\in A(i_0)')} and the filler ${km("x'")}, `
      + `then compose ${km('B')} pointwise along the function tube.`,

    setup(scene: THREE.Scene, camera: THREE.Camera) {
      (camera as THREE.PerspectiveCamera).position.set(0, 3.5, 11);
      (camera as THREE.PerspectiveCamera).lookAt(0, 0, 0);

      const g = new THREE.Group();
      scene.add(g);

      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(4, 6, 8);
      scene.add(ambient);
      scene.add(dir);

      // ── Axes: i goes left(-3) → right(+3) ────────────────────────────────
      const I_LEFT = -3.2, I_RIGHT = 3.2;
      g.add(arrow(
        new THREE.Vector3(I_LEFT, -2.5, 0),
        new THREE.Vector3(I_RIGHT, -2.5, 0),
        0xffffff, 0.4,
      ));
      const iLabel = mkLabel('i');
      iLabel.position.set(I_RIGHT + 0.4, -2.5, 0);
      g.add(iLabel);

      // ── Two fiber disks: A(i₀) at left, A(i₁) at right ──────────────────
      const diskA0 = mkDisk(1.1, C_A, 0.35);
      diskA0.rotation.y = Math.PI / 2;
      diskA0.position.set(-3, 0, 0);
      g.add(diskA0);

      const diskA1 = mkDisk(1.1, C_A, 0.35);
      diskA1.rotation.y = Math.PI / 2;
      diskA1.position.set(3, 0, 0);
      g.add(diskA1);

      // Fiber labels
      const lA0 = mkLabel('A(i₀)');
      lA0.position.set(-3, 1.4, 0);
      g.add(lA0);
      const lA1 = mkLabel('A(i₁)');
      lA1.position.set(3, 1.4, 0);
      g.add(lA1);

      // ── A tube (dim, just outlines the path) ─────────────────────────────
      const aTube = tube(
        new THREE.Vector3(-3, 0, -0.8),
        new THREE.Vector3(3, 0, -0.8),
        0.06, C_A, 0.2,
      );
      g.add(aTube);
      const aTube2 = tube(
        new THREE.Vector3(-3, 0, 0.8),
        new THREE.Vector3(3, 0, 0.8),
        0.06, C_A, 0.2,
      );
      g.add(aTube2);

      // ── Function sheet (u surface) ────────────────────────────────────────
      const sheetGeo = new THREE.PlaneGeometry(6, 2.2);
      const sheetMat = new THREE.MeshPhongMaterial({
        color: C_F, transparent: true, opacity: 0.12,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const sheet = new THREE.Mesh(sheetGeo, sheetMat);
      sheet.position.set(0, 1.1, 0);
      g.add(sheet);

      const sheetLabel = mkLabel('u : function tube');
      sheetLabel.position.set(0, 2.4, 0);
      g.add(sheetLabel);

      // ── x at i=1 (input element) ─────────────────────────────────────────
      const xBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 24),
        new THREE.MeshPhongMaterial({ color: C_X, emissive: C_X, emissiveIntensity: 0.3 }),
      );
      xBall.position.set(3, 0, 0);
      g.add(xBall);
      const xLabel = mkLabel('x ∈ A(i₁)');
      xLabel.position.set(3.6, 0.5, 0);
      g.add(xLabel);

      // ── Backward transport arrow (x' filler, from i=1 to i=0 reversed) ──
      const revArrow = arrow(
        new THREE.Vector3(3, 0, 0),
        new THREE.Vector3(-3, 0, 0),
        C_TUBE, 0, // starts invisible
      );
      g.add(revArrow);
      const revLabel = mkLabel("x' = fill(A^rev)(x)");
      revLabel.position.set(0, -0.6, 0);
      revLabel.material.opacity = 0;
      g.add(revLabel);

      // ── x₀ at i=0 ────────────────────────────────────────────────────────
      const x0Ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 24),
        new THREE.MeshPhongMaterial({ color: C_TUBE, transparent: true, opacity: 0 }),
      );
      x0Ball.position.set(-3, 0, 0);
      g.add(x0Ball);
      const x0Label = mkLabel('x₀ = transp(A^rev)(x)');
      x0Label.position.set(-3.5, -0.8, 0);
      x0Label.material.opacity = 0;
      g.add(x0Label);

      // ── f₀(x₀) ball ──────────────────────────────────────────────────────
      const fBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 24),
        new THREE.MeshPhongMaterial({ color: C_F, transparent: true, opacity: 0 }),
      );
      fBall.position.set(-3, 2.2, 0);
      g.add(fBall);
      const fLabel = mkLabel('f₀(x₀) ∈ B(x₀)');
      fLabel.position.set(-3.5, 2.7, 0);
      fLabel.material.opacity = 0;
      g.add(fLabel);

      // ── Result ball at i=1 ────────────────────────────────────────────────
      const resBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 24, 24),
        new THREE.MeshPhongMaterial({ color: C_RES, emissive: C_RES, emissiveIntensity: 0.4, transparent: true, opacity: 0 }),
      );
      resBall.position.set(3, 2.2, 0);
      g.add(resBall);
      const resLabel = mkLabel('comp(…) ∈ B(x)');
      resLabel.position.set(3.5, 2.7, 0);
      resLabel.material.opacity = 0;
      g.add(resLabel);

      // ── Top horizontal comp arrow ─────────────────────────────────────────
      const topArrow = arrow(
        new THREE.Vector3(-3, 2.2, 0),
        new THREE.Vector3(3, 2.2, 0),
        C_RES, 0,
      );
      g.add(topArrow);

      (scene as any)._piRefs = {
        g, ambient, dir,
        revArrow, revLabel,
        x0Ball, x0Label,
        fBall, fLabel,
        resBall, resLabel,
        topArrow,
        xBall,
      };
    },

    update(t: number) {
      const refs = (window as any)._currentScene?._piRefs;
      if (!refs) return;
      // phase 0..1 maps to step 0 (show), 1..2 rev transport, 2..3 apply f, 3..4 comp result
      const fadeIn  = (v: THREE.Object3D, phase: number) => {
        const mat = (v as THREE.Mesh).material as THREE.MeshPhongMaterial | THREE.SpriteMaterial;
        if (mat && 'opacity' in mat) mat.opacity = Math.min(1, Math.max(0, (t - phase) * 2));
      };
      const { revArrow, revLabel, x0Ball, x0Label, fBall, fLabel, resBall, resLabel, topArrow } = refs;
      // Show reversed transport at t>0.4
      revArrow.children.forEach((c: THREE.Object3D) => {
        const m = (c as THREE.Mesh).material as THREE.MeshPhongMaterial;
        if (m) m.opacity = Math.min(1, Math.max(0, (t * 0.7 - 0.28) * 3)) * 0.85;
      });
      (revLabel as THREE.Sprite).material.opacity = Math.min(1, Math.max(0, (t * 0.7 - 0.28) * 3));
      // x₀ at t>0.6
      (x0Ball.material as THREE.MeshPhongMaterial).opacity = Math.min(1, Math.max(0, (t * 0.7 - 0.42) * 4));
      (x0Label as THREE.Sprite).material.opacity = Math.min(1, Math.max(0, (t * 0.7 - 0.42) * 4));
      // f₀(x₀) at t>0.75
      (fBall.material as THREE.MeshPhongMaterial).opacity = Math.min(1, Math.max(0, (t * 0.7 - 0.52) * 4));
      (fLabel as THREE.Sprite).material.opacity = Math.min(1, Math.max(0, (t * 0.7 - 0.52) * 4));
      // comp result at t>0.85
      (resBall.material as THREE.MeshPhongMaterial).opacity = Math.min(1, Math.max(0, (t * 0.7 - 0.60) * 4));
      (resLabel as THREE.Sprite).material.opacity = Math.min(1, Math.max(0, (t * 0.7 - 0.60) * 4));
      topArrow.children.forEach((c: THREE.Object3D) => {
        const m = (c as THREE.Mesh).material as THREE.MeshPhongMaterial;
        if (m) m.opacity = Math.min(1, Math.max(0, (t * 0.7 - 0.60) * 4)) * 0.8;
      });
    },

    cleanup(scene: THREE.Scene) {
      const refs = (scene as any)._piRefs;
      if (!refs) return;
      scene.remove(refs.g);
      scene.remove(refs.ambient);
      scene.remove(refs.dir);
    },

    steps: [
      {
        label: 'Setup',
        description:
          `We want to compose a tube of functions ${km('u : \\varphi \\to (x:A)\\to B')} `
          + `with base function ${km('f_0 : (x:A)\\to B')}. `
          + `The type ${km('A')} (teal disks) varies with ${km('i')}. `
          + `An input ${km('x \\in A(i_1)')} (orange ball) is given at the right end.`,
        timeRange: [0, 0.4],
      },
      {
        label: 'Back-transport x',
        description:
          `We cannot apply ${km('f_0')} to ${km('x')} directly — ${km('f_0')} expects `
          + `an element of ${km('A(i_0)')}. `
          + `So we transport ${km('x')} <em>backwards</em> along the reversed path `
          + `${km('A^{\\mathrm{rev}}')} (blue arrow) to get ${km('x_0 \\in A(i_0)')} `
          + `and the filler ${km("x' = \\mathrm{fill}^i(A^{\\mathrm{rev}})(x)")}.`,
        timeRange: [0.4, 0.7],
      },
      {
        label: 'Apply f₀',
        description:
          `Now ${km('f_0(x_0) \\in B(x_0)')} is well-typed. `
          + `The filler ${km("x'")} gives us a path in ${km('A')} from ${km('x_0')} to ${km('x')}, `
          + `so we can compose in ${km("B(x')")} pointwise using the function tube ${km('u')}.`,
        timeRange: [0.7, 0.85],
      },
      {
        label: 'Compose in B',
        description:
          `The result is ${km('\\mathrm{comp}^i\\,B(x\')\\,[\\varphi\\mapsto u\\,x\']\\,(f_0\\,x_0)')} `
          + `— an element of ${km('B(x)')} at ${km('i_1')}. `
          + `The backward transport was essential: without it, the types wouldn't align.`,
        timeRange: [0.85, 1.0],
      },
    ],
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Σ-TYPE COMPOSITION RULE
  // ══════════════════════════════════════════════════════════════════════════

  const sigmaRule: RuleDefinition = {
    name: 'Σ-type Composition',

    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">
          ${kt('\\Gamma \\vdash A : \\mathcal{U}', 'A')} &nbsp;
          ${kt('\\Gamma, x\\!:\\!A \\vdash B : \\mathcal{U}', 'B')}
        </div>
        <div class="nd-bar"></div>
        <div class="nd-conclusion">
          ${kt('\\mathrm{comp}^i\\,((x\\!:\\!A)\\!\\times\\! B)\\,[\\varphi\\mapsto w]\\,w_0 = (c_1,\\,c_2)', 'comp')}
        </div>
      </div>`,

    description:
      `To compose in ${km('(x:A)\\times B')} we compose the first component in ${km('A')} to `
      + `get ${km('c_1')}, then use the <em>fill</em> (not comp!) of ${km('A')} as the interior `
      + `path ${km('v')}, so the second component can be composed in ${km('B(v(i))')} — `
      + `since ${km('B')} depends on the first component at each point ${km('i \\in I')}.`,

    setup(scene: THREE.Scene, camera: THREE.Camera) {
      (camera as THREE.PerspectiveCamera).position.set(0, 3, 11);
      (camera as THREE.PerspectiveCamera).lookAt(0, 0.5, 0);

      const g = new THREE.Group();
      scene.add(g);

      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(4, 6, 8);
      scene.add(ambient);
      scene.add(dir);

      // ── i axis ───────────────────────────────────────────────────────────
      g.add(arrow(
        new THREE.Vector3(-3.5, -2, 0),
        new THREE.Vector3(3.5,  -2, 0),
        0xffffff, 0.4,
      ));
      const iLabel = mkLabel('i');
      iLabel.position.set(3.9, -2, 0);
      g.add(iLabel);

      // ── A fiber disks (bottom layer) ──────────────────────────────────────
      const A_Y = -0.5;
      const diskAL = mkDisk(1.0, C_A, 0.3);
      diskAL.rotation.y = Math.PI / 2;
      diskAL.position.set(-3, A_Y, 0);
      g.add(diskAL);

      const diskAR = mkDisk(1.0, C_A, 0.3);
      diskAR.rotation.y = Math.PI / 2;
      diskAR.position.set(3, A_Y, 0);
      g.add(diskAR);

      const lAL = mkLabel('A(i₀)');
      lAL.position.set(-3, A_Y + 1.2, 0);
      g.add(lAL);
      const lAR = mkLabel('A(i₁)');
      lAR.position.set(3, A_Y + 1.2, 0);
      g.add(lAR);

      // ── w₀ base point (pair) ─────────────────────────────────────────────
      const w0Ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 24, 24),
        new THREE.MeshPhongMaterial({ color: C_F, emissive: C_F, emissiveIntensity: 0.3 }),
      );
      w0Ball.position.set(-3, A_Y, 0);
      g.add(w0Ball);
      const w0Label = mkLabel('w₀ = (a₀, b₀)');
      w0Label.position.set(-3.8, A_Y - 0.7, 0);
      g.add(w0Label);

      // ── c₁ (comp of A, endpoint) ─────────────────────────────────────────
      const c1Ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 24),
        new THREE.MeshPhongMaterial({ color: C_RES, transparent: true, opacity: 0 }),
      );
      c1Ball.position.set(3, A_Y, 0);
      g.add(c1Ball);
      const c1Label = mkLabel('c₁ = comp A ···');
      c1Label.position.set(3.7, A_Y - 0.7, 0);
      c1Label.material.opacity = 0;
      g.add(c1Label);

      // ── fill path v (interior rod through A) ─────────────────────────────
      const vRod = tube(
        new THREE.Vector3(-3, A_Y, 0),
        new THREE.Vector3( 3, A_Y, 0),
        0.05, C_TUBE, 0,
      );
      g.add(vRod);
      const vLabel = mkLabel('v = fill A ··· (interior path)');
      vLabel.position.set(0, A_Y - 0.8, 0);
      vLabel.material.opacity = 0;
      g.add(vLabel);

      // ── Small v(i) dot that travels along the fill path ───────────────────
      const viDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 16),
        new THREE.MeshPhongMaterial({ color: C_TUBE, transparent: true, opacity: 0 }),
      );
      g.add(viDot);

      // ── B fiber disks (top layer, ride on v) ─────────────────────────────
      const B_Y = 2.0;
      const diskBL = mkDisk(0.85, C_B, 0.0); // start invisible
      diskBL.rotation.y = Math.PI / 2;
      diskBL.position.set(-3, B_Y, 0);
      g.add(diskBL);

      const diskBR = mkDisk(0.85, C_B, 0.0);
      diskBR.rotation.y = Math.PI / 2;
      diskBR.position.set(3, B_Y, 0);
      g.add(diskBR);

      const lBL = mkLabel('B(v(i₀))');
      lBL.position.set(-3, B_Y + 1.1, 0);
      lBL.material.opacity = 0;
      g.add(lBL);
      const lBR = mkLabel('B(v(i₁))');
      lBR.position.set(3, B_Y + 1.1, 0);
      lBR.material.opacity = 0;
      g.add(lBR);

      // Vertical stalks connecting A to B (B is "above" A, riding on fill)
      const stalkL = tube(
        new THREE.Vector3(-3, A_Y, 0), new THREE.Vector3(-3, B_Y, 0),
        0.03, C_B, 0,
      );
      const stalkR = tube(
        new THREE.Vector3(3, A_Y, 0), new THREE.Vector3(3, B_Y, 0),
        0.03, C_B, 0,
      );
      g.add(stalkL);
      g.add(stalkR);

      // ── b₀ in B(v(i₀)) ───────────────────────────────────────────────────
      const b0Ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 24, 24),
        new THREE.MeshPhongMaterial({ color: C_F, transparent: true, opacity: 0 }),
      );
      b0Ball.position.set(-3, B_Y, 0);
      g.add(b0Ball);
      const b0Label = mkLabel('b₀ ∈ B(a₀)');
      b0Label.position.set(-3.7, B_Y - 0.65, 0);
      b0Label.material.opacity = 0;
      g.add(b0Label);

      // ── c₂ result ─────────────────────────────────────────────────────────
      const c2Ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 24, 24),
        new THREE.MeshPhongMaterial({ color: C_RES, emissive: C_RES, emissiveIntensity: 0.4, transparent: true, opacity: 0 }),
      );
      c2Ball.position.set(3, B_Y, 0);
      g.add(c2Ball);
      const c2Label = mkLabel('c₂ = comp B(v) ···');
      c2Label.position.set(3.7, B_Y - 0.65, 0);
      c2Label.material.opacity = 0;
      g.add(c2Label);

      // ── Top comp arrow ────────────────────────────────────────────────────
      const topArrow = arrow(
        new THREE.Vector3(-3, B_Y, 0),
        new THREE.Vector3( 3, B_Y, 0),
        C_RES, 0,
      );
      g.add(topArrow);

      (scene as any)._sigmaRefs = {
        g, ambient, dir,
        vRod, vLabel, viDot,
        c1Ball, c1Label,
        diskBL, diskBR, lBL, lBR,
        stalkL, stalkR,
        b0Ball, b0Label,
        c2Ball, c2Label,
        topArrow,
        A_Y, B_Y,
      };
    },

    update(t: number) {
      const refs = (window as any)._currentScene?._sigmaRefs;
      if (!refs) return;
      const { vRod, vLabel, viDot, c1Ball, c1Label,
              diskBL, diskBR, lBL, lBR, stalkL, stalkR,
              b0Ball, b0Label, c2Ball, c2Label, topArrow } = refs;

      const fade = (obj: THREE.Object3D, phase: number, speed = 3) => {
        const m = (obj as THREE.Mesh | THREE.Sprite).material as THREE.MeshPhongMaterial | THREE.SpriteMaterial;
        if (m && 'opacity' in m) m.opacity = Math.max(0, Math.min(1, (t - phase) * speed));
      };
      const fadeGroup = (grp: THREE.Group, phase: number, max = 0.85) => {
        grp.children.forEach((c) => {
          const m = (c as THREE.Mesh).material as THREE.MeshPhongMaterial;
          if (m && 'opacity' in m) m.opacity = Math.max(0, Math.min(max, (t - phase) * 3));
        });
      };

      // t 0→0.3: c₁ appears
      fade(c1Ball, 0.05); fade(c1Label, 0.05);

      // t 0.3→0.6: fill rod + v label + viDot traveling
      const vOpacity = Math.max(0, Math.min(0.9, (t - 0.3) * 3.5));
      (vRod.material as THREE.MeshPhongMaterial).opacity = vOpacity;
      fade(vLabel, 0.3, 2.5);

      // traveling dot along v
      if (t > 0.3) {
        const p = Math.min(1, (t - 0.3) / 0.45); // 0→1 over interval
        viDot.position.set(-3 + 6 * p, refs.A_Y, 0);
        (viDot.material as THREE.MeshPhongMaterial).opacity = vOpacity;
      }

      // t 0.6→: B fibers appear riding on fill
      fade(diskBL, 0.6, 2); fade(diskBR, 0.6, 2);
      fade(lBL, 0.65, 2); fade(lBR, 0.65, 2);
      fade(stalkL, 0.6, 2.5); fade(stalkR, 0.6, 2.5);
      fade(b0Ball, 0.65, 2.5); fade(b0Label, 0.65, 2.5);

      // t 0.8→: result c₂
      fade(c2Ball, 0.8, 3); fade(c2Label, 0.8, 3);
      fadeGroup(topArrow, 0.82, 0.8);
    },

    cleanup(scene: THREE.Scene) {
      const refs = (scene as any)._sigmaRefs;
      if (!refs) return;
      scene.remove(refs.g);
      scene.remove(refs.ambient);
      scene.remove(refs.dir);
    },

    steps: [
      {
        label: 'Compose A → c₁',
        description:
          `First, compose the ${km('A')}-projection of the tube ${km('w')} in ${km('A')} `
          + `to get the endpoint ${km('c_1 = \\mathrm{comp}^i\\,A\\,[\\varphi\\mapsto w.1]\\,a_0')}. `
          + `This gives the first component of the result pair.`,
        timeRange: [0, 0.3],
      },
      {
        label: 'Fill A → interior path v',
        description:
          `Now compute ${km('v = \\mathrm{fill}^i\\,A\\,[\\varphi\\mapsto w.1]\\,a_0')} — `
          + `the <strong>entire interior path</strong> from ${km('a_0')} to ${km('c_1')}. `
          + `The traveling dot shows ${km('v(i) \\in A(i)')} at each ${km('i')}. `
          + `<strong>Why fill, not comp?</strong> Because ${km('B')} depends on the <em>first component at each i</em> — we need ${km('v(i)')} for every ${km('i')}, not just the endpoint.`,
        timeRange: [0.3, 0.6],
      },
      {
        label: 'B fibers ride on v',
        description:
          `With ${km('v')} in hand, ${km('B(v(i))')} is a well-defined type family over ${km('I')} `
          + `(purple fibers above the fill path). `
          + `The second component ${km('b_0 \\in B(w_0.1) = B(a_0)')} sits in the left fiber.`,
        timeRange: [0.6, 0.8],
      },
      {
        label: 'Compose B → c₂',
        description:
          `Finally, compose in ${km('B(v)')} to get `
          + `${km('c_2 = \\mathrm{comp}^i\\,B(v)\\,[\\varphi\\mapsto w.2]\\,b_0')}. `
          + `The result is the pair ${km('(c_1, c_2)')} — the composition in ${km('(x:A)\\times B')}.`,
        timeRange: [0.8, 1.0],
      },
    ],
  };

  // ── Tab state ──────────────────────────────────────────────────────────────
  let activeTab: 'pi' | 'sigma' = $state('pi');
</script>

<div class="tabs">
  <button class:active={activeTab === 'pi'}   onclick={() => activeTab = 'pi'}>
    Π-types
  </button>
  <button class:active={activeTab === 'sigma'} onclick={() => activeTab = 'sigma'}>
    Σ-types
  </button>
</div>

{#if activeTab === 'pi'}
  <Rule rule={piRule} />
{:else}
  <Rule rule={sigmaRule} />
{/if}

<style>
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .tabs button {
    padding: 0.4rem 1.2rem;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s, color 0.2s;
  }
  .tabs button.active {
    background: rgba(100,160,255,0.18);
    color: #fff;
    border-color: rgba(100,160,255,0.5);
  }
  .tabs button:hover:not(.active) {
    background: rgba(255,255,255,0.08);
  }
</style>
