<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import * as THREE from 'three';
  import { createTextSprite } from '../textSprite';
  import { hexCss } from '../colors';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kt = (f: string, key: string) =>
    `<span class="term-hover" data-term="${key}">${katex.renderToString(f, { throwOnError: false })}</span>`;

  let funextActiveStep = $state(0);

  // ──── Color palette ────────────────────────────────────────────
  const F_COLOR    = 0x00ccff; // aqua   – f pipe
  const G_COLOR    = 0xff8800; // orange – g pipe
  const OBJ_SAME   = 0x4488ff; // blue   – identical source objects
  const OBJ_SOURCE = 0x9944cc; // purple – unified single source (between blue/red)
  const OBJ_F      = 0x2266ff; // deeper blue – f output color
  const OBJ_G      = 0xff3333; // red    – g output color

  // ──── Layout constants ─────────────────────────────────────────
  const fZ         = -1.5;
  const gZ         =  1.5;
  const TUBE_R     =  0.30;
  const pipeStartX = -2.8;
  const pipeEndX   =  3.0;
  const outputX    =  pipeEndX + 0.5; // gap between pipe opening and output objects
  const inputX     = -3.5;
  const OBJ_BOX    =  0.13; // cube half-size → 0.26 side (fits in tube radius 0.30)
  const OBJ_R      =  0.10; // sphere radius

  // Stage 0 loop timing
  const LOOP1      = 5.5;
  const STATIC_DUR = 1.2; // time showing single source before split begins

  const funextRule: RuleDefinition = {
    name: "Function Extensionality",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">
          ${km('\\Gamma \\vdash')} ${kt('f', 'f')} ${km(',')} ${kt('\\,g', 'g')} ${km(': A \\to B')}
          &nbsp;&nbsp;&nbsp;
          ${km('\\Gamma \\vdash')} ${kt('h', 'h')} ${km(': \\prod_{x:A}\\,\\mathrm{Path}\\,B\\,(fx)\\,(gx)')}
        </div>
        <hr class="nd-line">
        <div class="nd-conclusion">
          ${km('\\Gamma \\vdash')} ${kt('\\mathsf{funext}\\,h', 'funext')} ${km(': \\mathrm{Path}\\,(A{\\to}B)')} ${kt('\\,f', 'f')} ${kt('\\,g', 'g')}
        </div>
      </div>
    `,
    description: `funext h := ⟨i⟩ λx. h x @ i assembles pointwise paths into a path between functions in ${km('A \\to B')}.`,

    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      camera.position.set(0, 4.5, 10);
      (camera as THREE.PerspectiveCamera).lookAt(0, 0, 0);

      // ── Object helpers ─────────────────────────────────────────
      const mkBox = (color: number) => new THREE.Mesh(
        new THREE.BoxGeometry(OBJ_BOX * 2, OBJ_BOX * 2, OBJ_BOX * 2),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 1.0 })
      );
      const mkBall = (color: number, r = OBJ_R) => new THREE.Mesh(
        new THREE.SphereGeometry(r, 24, 24),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 1.0 })
      );

      // ── f pipe (aqua, z = fZ) ──────────────────────────────────
      const fPipe = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.LineCurve3(
            new THREE.Vector3(pipeStartX, 0, fZ),
            new THREE.Vector3(pipeEndX,   0, fZ)
          ), 20, TUBE_R, 32, false
        ),
        new THREE.MeshPhongMaterial({ color: F_COLOR, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })
      );
      scene.add(fPipe);

      // ── g pipe (orange, z = gZ) ────────────────────────────────
      const gPipe = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.LineCurve3(
            new THREE.Vector3(pipeStartX, 0, gZ),
            new THREE.Vector3(pipeEndX,   0, gZ)
          ), 20, TUBE_R, 32, false
        ),
        new THREE.MeshPhongMaterial({ color: G_COLOR, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })
      );
      scene.add(gPipe);

      // ── Stage 0: single purple source cube (starts centered between f/g) ──
      const sourceCube = mkBox(OBJ_SOURCE);
      sourceCube.position.set(inputX, 0, 0);
      sourceCube.visible = false;
      scene.add(sourceCube);

      // ── Split animation objects (reused from source → split) ──
      const splitCubeF = mkBox(OBJ_SOURCE);
      const splitCubeG = mkBox(OBJ_SOURCE);
      splitCubeF.visible = false;
      splitCubeG.visible = false;
      scene.add(splitCubeF);
      scene.add(splitCubeG);

      // ── Static input cubes (both same color = identical) ───────
      const fInputCube = mkBox(OBJ_SAME);
      const gInputCube = mkBox(OBJ_SAME);
      fInputCube.position.set(inputX, 0, fZ);
      gInputCube.position.set(inputX, 0, gZ);
      fInputCube.visible = false;
      gInputCube.visible = false;
      scene.add(fInputCube);
      scene.add(gInputCube);

      // ── Flowing objects: f pipe (blue cube → blue sphere) ──────
      const fFlowBox  = mkBox(OBJ_SAME);
      const fFlowBall = mkBall(OBJ_F, OBJ_R * 1.5);
      fFlowBox.visible  = false;
      fFlowBall.visible = false;
      scene.add(fFlowBox);
      scene.add(fFlowBall);

      // ── Flowing objects: g pipe (blue→red cube → red sphere) ───
      const gFlowBox  = mkBox(OBJ_SAME);
      const gFlowBall = mkBall(OBJ_G, OBJ_R * 1.5);
      gFlowBox.visible  = false;
      gFlowBall.visible = false;
      scene.add(gFlowBox);
      scene.add(gFlowBall);

      // ── Stage 1: wireframe output spheres at f(x) and g(x) ─────
      const fOutputWire = new THREE.Mesh(
        new THREE.SphereGeometry(OBJ_R * 1.5, 24, 24),
        new THREE.MeshPhongMaterial({ color: OBJ_F, wireframe: true, transparent: true, opacity: 0.85 })
      );
      fOutputWire.position.set(outputX, 0, fZ);
      fOutputWire.visible = false;
      scene.add(fOutputWire);

      const gOutputWire = new THREE.Mesh(
        new THREE.SphereGeometry(OBJ_R * 1.5, 24, 24),
        new THREE.MeshPhongMaterial({ color: OBJ_G, wireframe: true, transparent: true, opacity: 0.85 })
      );
      gOutputWire.position.set(outputX, 0, gZ);
      gOutputWire.visible = false;
      scene.add(gOutputWire);

      // ── Stage 1: gradient line f(x)→g(x) (vertex colors) ──────
      const cf = new THREE.Color(OBJ_F);
      const cg = new THREE.Color(OBJ_G);
      const gradGeo = new THREE.BufferGeometry();
      gradGeo.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([outputX, 0, fZ, outputX, 0, gZ]), 3
      ));
      gradGeo.setAttribute('color', new THREE.BufferAttribute(
        new Float32Array([cf.r, cf.g, cf.b, cg.r, cg.g, cg.b]), 3
      ));
      const gradientLine = new THREE.Line(
        gradGeo,
        new THREE.LineBasicMaterial({ vertexColors: true })
      );
      gradientLine.visible = false;
      scene.add(gradientLine);

      // ── Stage 1: single solid ball moving along f(x)→g(x) ──────
      const movingBall = mkBall(OBJ_F, OBJ_R * 1.5);
      (movingBall.material as THREE.MeshPhongMaterial).opacity = 1.0;
      movingBall.position.set(outputX, 0, fZ);
      movingBall.visible = false;
      scene.add(movingBall);

      // ── Stage 1: interval axis (z-axis at x=outputX, y=-1.8) ─
      const iAxis2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(outputX, -1.8, fZ - 0.4),
          new THREE.Vector3(outputX, -1.8, gZ + 0.4),
        ]),
        new THREE.LineBasicMaterial({ color: 0xff4444 })
      );
      iAxis2.visible = false;
      scene.add(iAxis2);

      const iSlider2 = mkBall(0xcccccc, 0.09);
      (iSlider2.material as THREE.MeshPhongMaterial).opacity = 1.0;
      iSlider2.visible = false;
      scene.add(iSlider2);

      const i0Label2 = createTextSprite('i₀', '#888888');
      i0Label2.position.set(outputX, -2.25, fZ - 0.15);
      i0Label2.scale.set(0.35, 0.35, 0.35);
      i0Label2.visible = false;
      scene.add(i0Label2);

      const i1Label2 = createTextSprite('i₁', '#888888');
      i1Label2.position.set(outputX, -2.25, gZ + 0.15);
      i1Label2.scale.set(0.35, 0.35, 0.35);
      i1Label2.visible = false;
      scene.add(i1Label2);

      // ── Stage 1: dynamic dashed line slider→ball ────────────────
      const dashPos2 = new Float32Array(6);
      const dashAttr2 = new THREE.BufferAttribute(dashPos2, 3);
      dashAttr2.setUsage(THREE.DynamicDrawUsage);
      const dashGeo2 = new THREE.BufferGeometry();
      dashGeo2.setAttribute('position', dashAttr2);
      const dashLine2 = new THREE.Line(
        dashGeo2,
        new THREE.LineDashedMaterial({ color: 0x888888, dashSize: 0.12, gapSize: 0.08 })
      );
      dashLine2.visible = false;
      scene.add(dashLine2);

      // ── Stage 2: moving pipe (along x, z changes dynamically) ──
      const movingPipeMesh = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.LineCurve3(
            new THREE.Vector3(pipeStartX, 0, 0),
            new THREE.Vector3(pipeEndX,   0, 0)
          ), 20, TUBE_R, 32, false
        ),
        new THREE.MeshPhongMaterial({ color: F_COLOR, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false })
      );
      movingPipeMesh.visible = false;
      scene.add(movingPipeMesh);

      // ── Stage 2: ball inside moving pipe ────────────────────────
      const movingPipeBox = mkBox(OBJ_SAME);
      movingPipeBox.visible = false;
      scene.add(movingPipeBox);

      const movingPipeObj = mkBall(OBJ_F, OBJ_R * 1.5);
      (movingPipeObj.material as THREE.MeshPhongMaterial).opacity = 1.0;
      movingPipeObj.visible = false;
      scene.add(movingPipeObj);

      // ── Stage 2: interval axis (z-axis, centered at x=0, y=-2.0) ─
      const iAxis3 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -2.0, fZ),
          new THREE.Vector3(0, -2.0, gZ),
        ]),
        new THREE.LineBasicMaterial({ color: 0x888888 })
      );
      iAxis3.visible = false;
      scene.add(iAxis3);

      const iSlider3 = mkBall(0xcccccc, 0.09);
      (iSlider3.material as THREE.MeshPhongMaterial).opacity = 1.0;
      iSlider3.visible = false;
      scene.add(iSlider3);

      const i0Label3 = createTextSprite('i₀', '#888888');
      i0Label3.position.set(0, -2.4, fZ - 0.15);
      i0Label3.scale.set(0.35, 0.35, 0.35);
      i0Label3.visible = false;
      scene.add(i0Label3);

      const i1Label3 = createTextSprite('i₁', '#888888');
      i1Label3.position.set(0, -2.4, gZ + 0.15);
      i1Label3.scale.set(0.35, 0.35, 0.35);
      i1Label3.visible = false;
      scene.add(i1Label3);

      // ── Permanent labels ────────────────────────────────────────
      const labelF = createTextSprite('f', hexCss(F_COLOR));
      labelF.position.set(0, 0.7, fZ);
      labelF.scale.set(0.4, 0.4, 0.4);
      scene.add(labelF);

      const labelG = createTextSprite('g', hexCss(G_COLOR));
      labelG.position.set(0, 0.7, gZ);
      labelG.scale.set(0.4, 0.4, 0.4);
      scene.add(labelG);

      const labelA = createTextSprite('A', '#aaaaaa');
      labelA.position.set(inputX - 0.3, 0.7, 0);
      labelA.scale.set(0.4, 0.4, 0.4);
      scene.add(labelA);

      const labelB = createTextSprite('B', '#aaaaaa');
      labelB.position.set(pipeEndX + 0.6, 0.7, 0);
      labelB.scale.set(0.4, 0.4, 0.4);
      scene.add(labelB);

      // ── Conditional labels ──────────────────────────────────────
      const labelHX = createTextSprite('h x', '#99bbff');
      labelHX.position.set(pipeEndX + 0.8, 0.3, 0);
      labelHX.scale.set(0.35, 0.35, 0.35);
      labelHX.visible = false;
      scene.add(labelHX);

      const labelFunext = createTextSprite('funext h', '#ffffff');
      labelFunext.position.set(0, 0.8, 0);
      labelFunext.scale.set(0.35, 0.35, 0.35);
      labelFunext.visible = false;
      scene.add(labelFunext);

      // ── Store all refs ──────────────────────────────────────────
      (scene as any)._funextRefs = {
        fPipe, gPipe,
        sourceCube,
        splitCubeF, splitCubeG,
        fInputCube, gInputCube,
        fFlowBox, fFlowBall,
        gFlowBox, gFlowBall,
        fOutputWire, gOutputWire,
        gradientLine,
        movingBall,
        iAxis2, iSlider2, i0Label2, i1Label2, dashLine2,
        movingPipeMesh, movingPipeBox, movingPipeObj,
        iAxis3, iSlider3, i0Label3, i1Label3,
        labelHX, labelFunext,
      };

      funextRule.termMappings = [
        { termKey: 'f',      objects: [fPipe, fInputCube] },
        { termKey: 'g',      objects: [gPipe, gInputCube] },
        { termKey: 'h',      objects: [gradientLine, movingBall] },
        { termKey: 'funext', objects: [movingPipeMesh, movingPipeBox, movingPipeObj] },
      ];
    },

    update: (time: number, elapsed?: number) => {
      const scene = (window as any)._currentScene;
      if (!scene) return;
      const refs = (scene as any)._funextRefs;
      if (!refs) return;

      const rawTime = elapsed ?? time;
      const step = funextActiveStep;

      const {
        splitCubeF, splitCubeG,
        sourceCube,
        fInputCube, gInputCube,
        fFlowBox, fFlowBall,
        gFlowBox, gFlowBall,
        fOutputWire, gOutputWire,
        gradientLine,
        movingBall,
        iAxis2, iSlider2, i0Label2, i1Label2, dashLine2,
        movingPipeMesh, movingPipeBox, movingPipeObj,
        iAxis3, iSlider3, i0Label3, i1Label3,
        labelHX, labelFunext,
      } = refs;

      // Wireframe f/g pipes only in stage 3
      (refs.fPipe.material as THREE.MeshPhongMaterial).wireframe = (step === 2);
      (refs.gPipe.material as THREE.MeshPhongMaterial).wireframe = (step === 2);

      // Hide all optional objects each frame; stages selectively re-show them
      const hideAll = () => {
        [
          sourceCube,
          splitCubeF, splitCubeG,
          fInputCube, gInputCube,
          fFlowBox, fFlowBall, gFlowBox, gFlowBall,
          fOutputWire, gOutputWire,
          gradientLine, movingBall,
          iAxis2, iSlider2, i0Label2, i1Label2, dashLine2,
          movingPipeMesh, movingPipeBox, movingPipeObj,
          iAxis3, iSlider3, i0Label3, i1Label3,
          labelHX, labelFunext,
        ].forEach(o => { o.visible = false; });
      };
      hideAll();

      // ── Shared timeline constants (identical across all stages) ──
      const T_STATIC   = 1.0;   // Duration source cube is shown before split
      const T_P1_DUR   = 1.4;   // Phase 1: Z-split duration
      const T_P2_DUR   = 3.0;   // Phase 2: X-flow through pipe duration
      const T_FADE_DUR = 1.2;   // Fadeout at target position
      const LOOP_DUR   = 7.0;   // Total loop (leaves ~0.4 s gap before restart)

      const T_P1_END   = T_STATIC + T_P1_DUR;       // 2.4
      const T_P2_END   = T_P1_END + T_P2_DUR;       // 5.4
      const T_FADE_END = T_P2_END + T_FADE_DUR;     // 6.6

      const loopT = rawTime % LOOP_DUR;

      // Phase progress values; -1 means the phase has not started yet
      let phase1T = -1.0;
      let phase2T = -1.0;
      let fadeT   = -1.0;

      if (loopT < T_STATIC) {
        // static phase: source handled per-step below
      } else if (loopT < T_P1_END) {
        phase1T = (loopT - T_STATIC) / T_P1_DUR;
      } else if (loopT < T_P2_END) {
        phase1T = 1.0;
        phase2T = (loopT - T_P1_END) / T_P2_DUR;
      } else if (loopT < T_FADE_END) {
        phase1T = 1.0;
        phase2T = 1.0;
        fadeT   = (loopT - T_P2_END) / T_FADE_DUR;
      }
      // loopT >= T_FADE_END: everything stays hidden (hideAll handled it)

      // ── Core flow animation ─────────────────────────────────────
      // Two strictly sequential phases, shared by all three stages:
      //
      //   Phase 1 (p1T 0→1): Z-axis split only.
      //     Cube moves from z=0 → targetZ, stays at x=inputX.
      //     Source color, opacity 1.0 throughout.
      //
      //   Phase 2 (p2T 0→1): X-axis flow through the pipe.
      //     Object travels from inputX → outputX at constant opacity 1.0.
      //     Color transitions startColor→endColor over the first 70% of travel.
      //     Shape morphs from cube to sphere via scale+opacity cross-fade over 35%–60%.
      //
      //   Fadeout (fT 0→1): object held at outputX, opacity fades 1→0.
      //     Only begins after Phase 2 completes (object at target position).
      const doFlow = (
        flowBox:    THREE.Mesh,
        flowBall:   THREE.Mesh,
        targetZ:    number,
        startColor: number,
        endColor:   number,
        p1T: number,
        p2T: number,
        fT:  number,
      ) => {
        if (p1T < 0) return;

        if (p2T < 0) {
          // Phase 1: Z movement, cube only, source color, full opacity
          const z = THREE.MathUtils.lerp(0, targetZ, THREE.MathUtils.smoothstep(p1T, 0, 1));
          flowBox.position.set(inputX, 0, z);
          (flowBox.material as THREE.MeshPhongMaterial).color.setHex(startColor);
          (flowBox.material as THREE.MeshPhongMaterial).opacity = 1.0;
          flowBox.scale.setScalar(1.0);
          flowBox.visible  = true;
          flowBall.visible = false;
          return;
        }

        // Phase 2 / fadeout: X movement
        const x = (fT >= 0) ? outputX : THREE.MathUtils.lerp(inputX, outputX, p2T);

        // Color transitions startColor → endColor over first 70% of phase 2.
        // Opacity stays 1.0 until fadeout starts — no transparency during transform.
        const colorT = THREE.MathUtils.smoothstep((fT >= 0) ? 1.0 : p2T, 0.0, 0.7);
        const col    = new THREE.Color(startColor).lerp(new THREE.Color(endColor), colorT);
        const opacity = (fT >= 0) ? (1.0 - fT) : 1.0;

        // Cube → sphere: smooth cross-fade + scale morph over 35%–60% of phase 2.
        // When fT >= 0 (fadeout phase), morphT = 1.0 so only sphere shows.
        const rawMorphProgress = (fT >= 0) ? 1.0 : p2T;
        const morphT = THREE.MathUtils.smoothstep(rawMorphProgress, 0.35, 0.60);

        flowBox.position.set(x, 0, targetZ);
        flowBall.position.set(x, 0, targetZ);
        (flowBox.material  as THREE.MeshPhongMaterial).color.copy(col);
        (flowBall.material as THREE.MeshPhongMaterial).color.copy(col);
        (flowBox.material  as THREE.MeshPhongMaterial).opacity = opacity * (1.0 - morphT);
        (flowBall.material as THREE.MeshPhongMaterial).opacity = opacity * morphT;
        flowBox.scale.setScalar(1.0 - morphT * 0.9);   // cube shrinks toward 0.1
        flowBall.scale.setScalar(0.15 + morphT * 0.85); // sphere grows from small
        flowBox.visible  = morphT < 1.0;
        flowBall.visible = morphT > 0.0;
      };

      // ── Stages 1 & 2: split+flow with single static purple source ─
      if (step !== 2) {
        doFlow(fFlowBox, fFlowBall, fZ, OBJ_SOURCE, OBJ_F, phase1T, phase2T, fadeT);
        doFlow(gFlowBox, gFlowBall, gZ, OBJ_SOURCE, OBJ_G, phase1T, phase2T, fadeT);
        // Single static purple source cube (replaces the two blue static cubes)
        sourceCube.position.set(inputX, 0, 0);
        (sourceCube.material as THREE.MeshPhongMaterial).opacity = 1.0;
        sourceCube.visible = true;
      }

      // ── Stage 2 (h): wireframe endpoints + gradient path + interval ──
      // Identical core animation as stage 1, plus:
      //   • f(x) / g(x) wireframe spheres at outputX (final target of flow objects)
      //   • h(x) ball traveling the gradient line between f(x) and g(x)
      //   • Interval axis + dashed slider line
      if (step === 1) {
        fOutputWire.visible = true;
        gOutputWire.visible = true;
        gradientLine.visible = true;
        movingBall.visible   = true;
        labelHX.visible      = true;

        const ballT = (Math.sin(rawTime * 1.2) + 1) / 2;
        const ballZ = THREE.MathUtils.lerp(fZ, gZ, ballT);
        movingBall.position.set(outputX, 0, ballZ);
        (movingBall.material as THREE.MeshPhongMaterial).color.copy(
          new THREE.Color(OBJ_F).lerp(new THREE.Color(OBJ_G), ballT)
        );

        iAxis2.visible    = true;
        iSlider2.visible  = true;
        i0Label2.visible  = true;
        i1Label2.visible  = true;
        dashLine2.visible = true;
        iSlider2.position.set(outputX, -1.8, ballZ);

        const pa = dashLine2.geometry.getAttribute('position') as THREE.BufferAttribute;
        pa.setXYZ(0, outputX, -1.8, ballZ);
        pa.setXYZ(1, outputX,  0.0, ballZ);
        pa.needsUpdate = true;
        dashLine2.computeLineDistances();
      }

      // ── Stage 3 (funext): 3-pipe fade-in animation ───────────────
      // All three tubes animate identically (same timing, same shape change)
      // except for color. No split phase — objects start at their z position.
      if (step === 2) {
        const T_FI     = 1.0;    // fade-in duration
        const T_FL     = 3.0;    // flow duration
        const T_FO     = 1.2;    // fade-out duration
        const T_FI_END = T_FI;
        const T_FL_END = T_FI + T_FL;
        const T_FO_END = T_FI + T_FL + T_FO;

        const doFlowFadeIn = (
          flowBox:    THREE.Mesh,
          flowBall:   THREE.Mesh,
          targetZ:    number,
          startColor: number,
          endColor:   number,
        ) => {
          if (loopT < T_FI_END) {
            const fi = THREE.MathUtils.smoothstep(loopT, 0, T_FI);
            flowBox.position.set(inputX, 0, targetZ);
            (flowBox.material as THREE.MeshPhongMaterial).color.setHex(startColor);
            (flowBox.material as THREE.MeshPhongMaterial).opacity = fi;
            flowBox.scale.setScalar(1.0);
            flowBall.scale.setScalar(1.0);
            flowBox.visible  = true;
            flowBall.visible = false;
          } else if (loopT < T_FL_END) {
            const p2T    = (loopT - T_FI_END) / T_FL;
            const x      = THREE.MathUtils.lerp(inputX, outputX, p2T);
            const colorT = THREE.MathUtils.smoothstep(p2T, 0.0, 0.7);
            const col    = new THREE.Color(startColor).lerp(new THREE.Color(endColor), colorT);
            // Smooth cube → sphere: scale + opacity cross-fade over 35%–60%
            const morphT = THREE.MathUtils.smoothstep(p2T, 0.35, 0.60);
            flowBox.position.set(x, 0, targetZ);
            flowBall.position.set(x, 0, targetZ);
            (flowBox.material  as THREE.MeshPhongMaterial).color.copy(col);
            (flowBall.material as THREE.MeshPhongMaterial).color.copy(col);
            (flowBox.material  as THREE.MeshPhongMaterial).opacity = 1.0 - morphT;
            (flowBall.material as THREE.MeshPhongMaterial).opacity = morphT;
            flowBox.scale.setScalar(1.0 - morphT * 0.9);
            flowBall.scale.setScalar(0.15 + morphT * 0.85);
            flowBox.visible  = morphT < 1.0;
            flowBall.visible = morphT > 0.0;
          } else if (loopT < T_FO_END) {
            const fo = 1.0 - (loopT - T_FL_END) / T_FO;
            flowBall.position.set(outputX, 0, targetZ);
            flowBall.scale.setScalar(1.0);
            (flowBall.material as THREE.MeshPhongMaterial).color.setHex(endColor);
            (flowBall.material as THREE.MeshPhongMaterial).opacity = fo;
            flowBox.visible  = false;
            flowBall.visible = true;
          }
          // else: hidden — hideAll already handled it
        };

        const pipeT     = (Math.sin(rawTime * 0.7) + 1) / 2;
        const pipeZ     = THREE.MathUtils.lerp(fZ, gZ, pipeT);
        const pipeColor = new THREE.Color(OBJ_F).lerp(new THREE.Color(OBJ_G), pipeT).getHex();

        // Animate objects through all three pipes (identical except color)
        doFlowFadeIn(fFlowBox,      fFlowBall,      fZ,    OBJ_SOURCE, OBJ_F      );
        doFlowFadeIn(movingPipeBox, movingPipeObj,   pipeZ, OBJ_SOURCE, pipeColor  );
        doFlowFadeIn(gFlowBox,      gFlowBall,       gZ,    OBJ_SOURCE, OBJ_G      );

        movingPipeMesh.visible = true;
        labelFunext.visible    = true;
        movingPipeMesh.position.z = pipeZ;
        (movingPipeMesh.material as THREE.MeshPhongMaterial).color.copy(
          new THREE.Color(F_COLOR).lerp(new THREE.Color(G_COLOR), pipeT)
        );
        labelFunext.position.set(0, 0.8, pipeZ);

        iAxis3.visible   = true;
        iSlider3.visible = true;
        i0Label3.visible = true;
        i1Label3.visible = true;
        iSlider3.position.set(0, -2.0, pipeZ);
      }
    },

    cleanup: (scene: THREE.Scene) => {
      const toRemove: THREE.Object3D[] = [];
      scene.traverse((obj) => { if (obj !== scene) toRemove.push(obj); });
      for (const obj of toRemove) scene.remove(obj);
    },

    steps: [
      {
        label: 'The functions f and g',
        description: `f and g both inhabit ${km('A \\to B')}. A single element ${km('x : A')} splits and enters both pipes. Through ${km('f')} (aqua) it emerges as one blue shape; through ${km('g')} (orange) it transforms into a different red shape — same input, potentially different outputs.`,
        timeRange: [0, 1.0],
      },
      {
        label: `Path ${km('B\\,(fx)\\,(gx)')} — homotopy h`,
        description: `For every ${km('x : A')}, ${km('fx')} and ${km('gx')} are endpoints of a path ${km('h\\,x : \\mathrm{Path}\\,B\\,(fx)\\,(gx)')}. The solid ball travels along this straight line (gradient blue→red). The interval axis below mirrors ${km('i')}'s position, with a dashed line up to the ball.`,
        timeRange: [0, 1.0],
      },
      {
        label: 'Function extensionality',
        description: `${km('\\mathsf{funext}\\,h := \\langle i \\rangle\\,\\lambda x.\\,hx\\,{@}\\,i')} assembles the pointwise paths into a path between ${km('f')} and ${km('g')} in ${km('A{\\to}B')}. The moving pipe sweeps from ${km('f')}'s track to ${km('g')}'s track as ${km('i')} varies. The interval ${km('i')} below shows the pipe's current position.`,
        timeRange: [0, 1.0],
      },
    ],
  };
</script>

<Rule rule={funextRule} bind:activeStep={funextActiveStep} />
