<script lang="ts">
  import { tick } from 'svelte';
  import katex from 'katex';
  import { PARTIAL_DATA, INTERVAL, BASE_POINT, RESULT, FILL_RESULT, hexCss } from './colors';

  type Dimension = 1 | 2 | 3;

  interface LatticeNode {
    id: string;
    label: string;
    formula: string;
    rank: number;
    x: number;
    y: number;
    color: string;
    meaning: string;
  }

  interface LatticeEdge {
    from: string;
    to: string;
  }

  const C_PARTIAL = hexCss(PARTIAL_DATA);
  const C_INTERVAL = hexCss(INTERVAL);
  const C_BASE = hexCss(BASE_POINT);
  const C_RESULT = hexCss(RESULT);
  const C_FILL = hexCss(FILL_RESULT);
  const C_BOT = '#222244';

  // ── 1-cube lattice ──────────────────────────────────────────────────
  const nodes1: LatticeNode[] = [
    { id: 'bot', label: '⊥', formula: '\\bot', rank: 0,
      x: 300, y: 420, color: C_BOT,
      meaning: 'Empty — no points satisfy this constraint' },
    { id: 'i0', label: 'i=0', formula: '(i{=}0)', rank: 1,
      x: 200, y: 300, color: C_PARTIAL,
      meaning: 'The left endpoint of the interval I' },
    { id: 'i1', label: 'i=1', formula: '(i{=}1)', rank: 1,
      x: 400, y: 300, color: C_PARTIAL,
      meaning: 'The right endpoint of the interval I' },
    { id: 'i0vi1', label: 'i0∨i1', formula: '(i{=}0) \\lor (i{=}1)', rank: 2,
      x: 300, y: 180, color: C_BASE,
      meaning: 'Both endpoints: the boundary ∂I of the interval' },
    { id: 'top', label: '⊤', formula: '\\top', rank: 3,
      x: 300, y: 60, color: C_FILL,
      meaning: 'Everywhere — all points in I satisfy this constraint' },
  ];

  const edges1: LatticeEdge[] = [
    { from: 'bot', to: 'i0' },
    { from: 'bot', to: 'i1' },
    { from: 'i0', to: 'i0vi1' },
    { from: 'i1', to: 'i0vi1' },
    { from: 'i0vi1', to: 'top' },
  ];

  // ── 2-cube lattice ──────────────────────────────────────────────────
  const nodes2: LatticeNode[] = [
    { id: 'bot', label: '⊥', formula: '\\bot', rank: 0,
      x: 300, y: 460, color: C_BOT,
      meaning: 'Empty — no points satisfy this constraint' },
    { id: 'i0', label: 'i=0', formula: '(i{=}0)', rank: 1,
      x: 120, y: 340, color: C_PARTIAL,
      meaning: 'The left face: all points where i=0 (the left wall of the square)' },
    { id: 'i1', label: 'i=1', formula: '(i{=}1)', rank: 1,
      x: 240, y: 340, color: C_PARTIAL,
      meaning: 'The right face: all points where i=1 (the right wall of the square)' },
    { id: 'j0', label: 'j=0', formula: '(j{=}0)', rank: 1,
      x: 360, y: 340, color: C_PARTIAL,
      meaning: 'The bottom face: all points where j=0 (the bottom wall of the square)' },
    { id: 'j1', label: 'j=1', formula: '(j{=}1)', rank: 1,
      x: 480, y: 340, color: C_PARTIAL,
      meaning: 'The top face: all points where j=1 (the top wall of the square)' },
    { id: 'i0j0', label: 'i0∧j0', formula: '(i{=}0) \\land (j{=}0)', rank: 2,
      x: 80, y: 210, color: C_INTERVAL,
      meaning: 'The bottom-left corner: the single point where both i=0 and j=0' },
    { id: 'i0j1', label: 'i0∧j1', formula: '(i{=}0) \\land (j{=}1)', rank: 2,
      x: 180, y: 210, color: C_INTERVAL,
      meaning: 'The top-left corner: the single point where both i=0 and j=1' },
    { id: 'i1j0', label: 'i1∧j0', formula: '(i{=}1) \\land (j{=}0)', rank: 2,
      x: 280, y: 210, color: C_INTERVAL,
      meaning: 'The bottom-right corner: the single point where both i=1 and j=0' },
    { id: 'i1j1', label: 'i1∧j1', formula: '(i{=}1) \\land (j{=}1)', rank: 2,
      x: 380, y: 210, color: C_INTERVAL,
      meaning: 'The top-right corner: the single point where both i=1 and j=1' },
    { id: 'i0vi1', label: 'i0∨i1', formula: '(i{=}0) \\lor (i{=}1)', rank: 2,
      x: 480, y: 210, color: C_BASE,
      meaning: 'Both vertical walls: all points where i is an endpoint (left wall ∪ right wall)' },
    { id: 'j0vj1', label: 'j0∨j1', formula: '(j{=}0) \\lor (j{=}1)', rank: 2,
      x: 560, y: 210, color: C_BASE,
      meaning: 'Both horizontal walls: all points where j is an endpoint (bottom wall ∪ top wall)' },
    { id: 'i0vj0', label: 'i0∨j0', formula: '(i{=}0) \\lor (j{=}0)', rank: 3,
      x: 120, y: 100, color: C_RESULT,
      meaning: 'The L-shape: all points on the left wall OR the bottom wall' },
    { id: 'i0vj1', label: 'i0∨j1', formula: '(i{=}0) \\lor (j{=}1)', rank: 3,
      x: 220, y: 100, color: C_RESULT,
      meaning: 'The Γ-shape: all points on the left wall OR the top wall' },
    { id: 'i1vj0', label: 'i1∨j0', formula: '(i{=}1) \\lor (j{=}0)', rank: 3,
      x: 320, y: 100, color: C_RESULT,
      meaning: 'The reversed-L: all points on the right wall OR the bottom wall' },
    { id: 'i1vj1', label: 'i1∨j1', formula: '(i{=}1) \\lor (j{=}1)', rank: 3,
      x: 420, y: 100, color: C_RESULT,
      meaning: 'The reversed-Γ: all points on the right wall OR the top wall' },
    { id: 'top', label: '⊤', formula: '\\top', rank: 4,
      x: 300, y: 30, color: C_FILL,
      meaning: 'Everywhere — all points in I² satisfy this constraint' },
  ];

  const edges2: LatticeEdge[] = [
    { from: 'bot', to: 'i0' }, { from: 'bot', to: 'i1' },
    { from: 'bot', to: 'j0' }, { from: 'bot', to: 'j1' },
    { from: 'i0', to: 'i0j0' }, { from: 'i0', to: 'i0j1' },
    { from: 'i0', to: 'i0vi1' },
    { from: 'i0', to: 'i0vj0' }, { from: 'i0', to: 'i0vj1' },
    { from: 'i1', to: 'i1j0' }, { from: 'i1', to: 'i1j1' },
    { from: 'i1', to: 'i0vi1' },
    { from: 'i1', to: 'i1vj0' }, { from: 'i1', to: 'i1vj1' },
    { from: 'j0', to: 'i0j0' }, { from: 'j0', to: 'i1j0' },
    { from: 'j0', to: 'j0vj1' },
    { from: 'j0', to: 'i0vj0' }, { from: 'j0', to: 'i1vj0' },
    { from: 'j1', to: 'i0j1' }, { from: 'j1', to: 'i1j1' },
    { from: 'j1', to: 'j0vj1' },
    { from: 'j1', to: 'i0vj1' }, { from: 'j1', to: 'i1vj1' },
    { from: 'i0j0', to: 'i0vj0' }, { from: 'i0j1', to: 'i0vj1' },
    { from: 'i1j0', to: 'i1vj0' }, { from: 'i1j1', to: 'i1vj1' },
    { from: 'i0vi1', to: 'top' }, { from: 'j0vj1', to: 'top' },
    { from: 'i0vj0', to: 'top' }, { from: 'i0vj1', to: 'top' },
    { from: 'i1vj0', to: 'top' }, { from: 'i1vj1', to: 'top' },
  ];

  // ── 3-cube lattice ──────────────────────────────────────────────────
  // Shows only the geometric faces: ⊥, 6 face-atoms, 12 edge-meets, 8 corner-meets, ⊤
  // (The full lattice also includes joins, but the geometric skeleton is most visual)
  const nodes3: LatticeNode[] = [
    // rank 0
    { id: 'bot', label: '⊥', formula: '\\bot', rank: 0,
      x: 500, y: 610, color: C_BOT,
      meaning: 'Empty — no points satisfy this constraint' },
    // rank 1 — 6 faces of the cube
    { id: 'i0', label: 'i=0', formula: '(i{=}0)', rank: 1,
      x: 120, y: 490, color: C_PARTIAL,
      meaning: 'The i=0 face: the left square face of the 3-cube' },
    { id: 'i1', label: 'i=1', formula: '(i{=}1)', rank: 1,
      x: 250, y: 490, color: C_PARTIAL,
      meaning: 'The i=1 face: the right square face of the 3-cube' },
    { id: 'j0', label: 'j=0', formula: '(j{=}0)', rank: 1,
      x: 390, y: 490, color: C_PARTIAL,
      meaning: 'The j=0 face: the front square face of the 3-cube' },
    { id: 'j1', label: 'j=1', formula: '(j{=}1)', rank: 1,
      x: 510, y: 490, color: C_PARTIAL,
      meaning: 'The j=1 face: the back square face of the 3-cube' },
    { id: 'k0', label: 'k=0', formula: '(k{=}0)', rank: 1,
      x: 650, y: 490, color: C_PARTIAL,
      meaning: 'The k=0 face: the bottom square face of the 3-cube' },
    { id: 'k1', label: 'k=1', formula: '(k{=}1)', rank: 1,
      x: 780, y: 490, color: C_PARTIAL,
      meaning: 'The k=1 face: the top square face of the 3-cube' },
    // rank 2 — 12 edges (pairwise meets of compatible face atoms)
    { id: 'i0j0', label: 'i0∧j0', formula: '(i{=}0)\\land(j{=}0)', rank: 2,
      x: 60, y: 340, color: C_INTERVAL,
      meaning: 'The i=0, j=0 edge: where the left and front faces meet' },
    { id: 'i0j1', label: 'i0∧j1', formula: '(i{=}0)\\land(j{=}1)', rank: 2,
      x: 145, y: 340, color: C_INTERVAL,
      meaning: 'The i=0, j=1 edge: where the left and back faces meet' },
    { id: 'i1j0', label: 'i1∧j0', formula: '(i{=}1)\\land(j{=}0)', rank: 2,
      x: 230, y: 340, color: C_INTERVAL,
      meaning: 'The i=1, j=0 edge: where the right and front faces meet' },
    { id: 'i1j1', label: 'i1∧j1', formula: '(i{=}1)\\land(j{=}1)', rank: 2,
      x: 315, y: 340, color: C_INTERVAL,
      meaning: 'The i=1, j=1 edge: where the right and back faces meet' },
    { id: 'i0k0', label: 'i0∧k0', formula: '(i{=}0)\\land(k{=}0)', rank: 2,
      x: 400, y: 340, color: C_INTERVAL,
      meaning: 'The i=0, k=0 edge: where the left and bottom faces meet' },
    { id: 'i0k1', label: 'i0∧k1', formula: '(i{=}0)\\land(k{=}1)', rank: 2,
      x: 480, y: 340, color: C_INTERVAL,
      meaning: 'The i=0, k=1 edge: where the left and top faces meet' },
    { id: 'i1k0', label: 'i1∧k0', formula: '(i{=}1)\\land(k{=}0)', rank: 2,
      x: 560, y: 340, color: C_INTERVAL,
      meaning: 'The i=1, k=0 edge: where the right and bottom faces meet' },
    { id: 'i1k1', label: 'i1∧k1', formula: '(i{=}1)\\land(k{=}1)', rank: 2,
      x: 640, y: 340, color: C_INTERVAL,
      meaning: 'The i=1, k=1 edge: where the right and top faces meet' },
    { id: 'j0k0', label: 'j0∧k0', formula: '(j{=}0)\\land(k{=}0)', rank: 2,
      x: 720, y: 340, color: C_INTERVAL,
      meaning: 'The j=0, k=0 edge: where the front and bottom faces meet' },
    { id: 'j0k1', label: 'j0∧k1', formula: '(j{=}0)\\land(k{=}1)', rank: 2,
      x: 800, y: 340, color: C_INTERVAL,
      meaning: 'The j=0, k=1 edge: where the front and top faces meet' },
    { id: 'j1k0', label: 'j1∧k0', formula: '(j{=}1)\\land(k{=}0)', rank: 2,
      x: 880, y: 340, color: C_INTERVAL,
      meaning: 'The j=1, k=0 edge: where the back and bottom faces meet' },
    { id: 'j1k1', label: 'j1∧k1', formula: '(j{=}1)\\land(k{=}1)', rank: 2,
      x: 950, y: 340, color: C_INTERVAL,
      meaning: 'The j=1, k=1 edge: where the back and top faces meet' },
    // rank 3 — 8 corners (triple meets)
    { id: 'i0j0k0', label: 'i0j0k0', formula: '(i{=}0)\\land(j{=}0)\\land(k{=}0)', rank: 3,
      x: 80, y: 185, color: C_BASE,
      meaning: 'The (0,0,0) corner: where left, front, and bottom faces all meet' },
    { id: 'i0j0k1', label: 'i0j0k1', formula: '(i{=}0)\\land(j{=}0)\\land(k{=}1)', rank: 3,
      x: 200, y: 185, color: C_BASE,
      meaning: 'The (0,0,1) corner: where left, front, and top faces all meet' },
    { id: 'i0j1k0', label: 'i0j1k0', formula: '(i{=}0)\\land(j{=}1)\\land(k{=}0)', rank: 3,
      x: 320, y: 185, color: C_BASE,
      meaning: 'The (0,1,0) corner: where left, back, and bottom faces all meet' },
    { id: 'i0j1k1', label: 'i0j1k1', formula: '(i{=}0)\\land(j{=}1)\\land(k{=}1)', rank: 3,
      x: 430, y: 185, color: C_BASE,
      meaning: 'The (0,1,1) corner: where left, back, and top faces all meet' },
    { id: 'i1j0k0', label: 'i1j0k0', formula: '(i{=}1)\\land(j{=}0)\\land(k{=}0)', rank: 3,
      x: 540, y: 185, color: C_BASE,
      meaning: 'The (1,0,0) corner: where right, front, and bottom faces all meet' },
    { id: 'i1j0k1', label: 'i1j0k1', formula: '(i{=}1)\\land(j{=}0)\\land(k{=}1)', rank: 3,
      x: 650, y: 185, color: C_BASE,
      meaning: 'The (1,0,1) corner: where right, front, and top faces all meet' },
    { id: 'i1j1k0', label: 'i1j1k0', formula: '(i{=}1)\\land(j{=}1)\\land(k{=}0)', rank: 3,
      x: 760, y: 185, color: C_BASE,
      meaning: 'The (1,1,0) corner: where right, back, and bottom faces all meet' },
    { id: 'i1j1k1', label: 'i1j1k1', formula: '(i{=}1)\\land(j{=}1)\\land(k{=}1)', rank: 3,
      x: 870, y: 185, color: C_BASE,
      meaning: 'The (1,1,1) corner: where right, back, and top faces all meet' },
    // rank 4
    { id: 'top', label: '⊤', formula: '\\top', rank: 4,
      x: 500, y: 55, color: C_FILL,
      meaning: 'Everywhere — all points in I³ satisfy this constraint' },
  ];

  const edges3: LatticeEdge[] = [
    // ⊥ → face atoms
    { from: 'bot', to: 'i0' }, { from: 'bot', to: 'i1' },
    { from: 'bot', to: 'j0' }, { from: 'bot', to: 'j1' },
    { from: 'bot', to: 'k0' }, { from: 'bot', to: 'k1' },
    // face atoms → edge meets
    { from: 'i0', to: 'i0j0' }, { from: 'i0', to: 'i0j1' },
    { from: 'i0', to: 'i0k0' }, { from: 'i0', to: 'i0k1' },
    { from: 'i1', to: 'i1j0' }, { from: 'i1', to: 'i1j1' },
    { from: 'i1', to: 'i1k0' }, { from: 'i1', to: 'i1k1' },
    { from: 'j0', to: 'i0j0' }, { from: 'j0', to: 'i1j0' },
    { from: 'j0', to: 'j0k0' }, { from: 'j0', to: 'j0k1' },
    { from: 'j1', to: 'i0j1' }, { from: 'j1', to: 'i1j1' },
    { from: 'j1', to: 'j1k0' }, { from: 'j1', to: 'j1k1' },
    { from: 'k0', to: 'i0k0' }, { from: 'k0', to: 'i1k0' },
    { from: 'k0', to: 'j0k0' }, { from: 'k0', to: 'j1k0' },
    { from: 'k1', to: 'i0k1' }, { from: 'k1', to: 'i1k1' },
    { from: 'k1', to: 'j0k1' }, { from: 'k1', to: 'j1k1' },
    // edge meets → corner meets
    { from: 'i0j0', to: 'i0j0k0' }, { from: 'i0j0', to: 'i0j0k1' },
    { from: 'i0j1', to: 'i0j1k0' }, { from: 'i0j1', to: 'i0j1k1' },
    { from: 'i1j0', to: 'i1j0k0' }, { from: 'i1j0', to: 'i1j0k1' },
    { from: 'i1j1', to: 'i1j1k0' }, { from: 'i1j1', to: 'i1j1k1' },
    { from: 'i0k0', to: 'i0j0k0' }, { from: 'i0k0', to: 'i0j1k0' },
    { from: 'i0k1', to: 'i0j0k1' }, { from: 'i0k1', to: 'i0j1k1' },
    { from: 'i1k0', to: 'i1j0k0' }, { from: 'i1k0', to: 'i1j1k0' },
    { from: 'i1k1', to: 'i1j0k1' }, { from: 'i1k1', to: 'i1j1k1' },
    { from: 'j0k0', to: 'i0j0k0' }, { from: 'j0k0', to: 'i1j0k0' },
    { from: 'j0k1', to: 'i0j0k1' }, { from: 'j0k1', to: 'i1j0k1' },
    { from: 'j1k0', to: 'i0j1k0' }, { from: 'j1k0', to: 'i1j1k0' },
    { from: 'j1k1', to: 'i0j1k1' }, { from: 'j1k1', to: 'i1j1k1' },
    // corners → ⊤
    { from: 'i0j0k0', to: 'top' }, { from: 'i0j0k1', to: 'top' },
    { from: 'i0j1k0', to: 'top' }, { from: 'i0j1k1', to: 'top' },
    { from: 'i1j0k0', to: 'top' }, { from: 'i1j0k1', to: 'top' },
    { from: 'i1j1k0', to: 'top' }, { from: 'i1j1k1', to: 'top' },
  ];

  // ── State ───────────────────────────────────────────────────────────
  let dimension = $state<Dimension>(2);
  let selectedId: string | null = $state(null);
  let hoveredId: string | null = $state(null);
  let canvasEl: HTMLCanvasElement | undefined = $state(undefined);

  // ── Derived ─────────────────────────────────────────────────────────
  let nodes = $derived(dimension === 1 ? nodes1 : dimension === 2 ? nodes2 : nodes3);
  let edges = $derived(dimension === 1 ? edges1 : dimension === 2 ? edges2 : edges3);
  let nodeMap = $derived(new Map(nodes.map(n => [n.id, n])));
  let svgViewBox = $derived(dimension === 3 ? '0 0 1020 650' : '0 0 640 500');
  let selectedNode = $derived(selectedId ? nodeMap.get(selectedId) ?? null : null);

  let highlightedEdges = $derived.by(() => {
    const set = new Set<number>();
    if (!hoveredId) return set;
    edges.forEach((e, i) => {
      if (e.from === hoveredId || e.to === hoveredId) set.add(i);
    });
    return set;
  });

  // ── KaTeX ───────────────────────────────────────────────────────────
  const kd = (f: string) =>
    katex.renderToString(f, { throwOnError: false, displayMode: true });

  // ── Canvas preview ──────────────────────────────────────────────────
  function satisfies1D(id: string, px: number, size: number): boolean {
    const atI0 = px <= 2;
    const atI1 = px >= size - 3;
    switch (id) {
      case 'bot': return false;
      case 'i0': return atI0;
      case 'i1': return atI1;
      case 'i0vi1': return atI0 || atI1;
      case 'top': return true;
      default: return false;
    }
  }

  function satisfies2D(id: string, px: number, py: number, size: number): boolean {
    const atI0 = px <= 2;
    const atI1 = px >= size - 3;
    const atJ0 = py >= size - 3;
    const atJ1 = py <= 2;
    switch (id) {
      case 'bot': return false;
      case 'i0': return atI0;
      case 'i1': return atI1;
      case 'j0': return atJ0;
      case 'j1': return atJ1;
      case 'i0j0': return atI0 && atJ0;
      case 'i0j1': return atI0 && atJ1;
      case 'i1j0': return atI1 && atJ0;
      case 'i1j1': return atI1 && atJ1;
      case 'i0vi1': return atI0 || atI1;
      case 'j0vj1': return atJ0 || atJ1;
      case 'i0vj0': return atI0 || atJ0;
      case 'i0vj1': return atI0 || atJ1;
      case 'i1vj0': return atI1 || atJ0;
      case 'i1vj1': return atI1 || atJ1;
      case 'top': return true;
      default: return false;
    }
  }

  // For 3D: each node id encodes the active faces (e.g. 'i0j0k1' is active on i=0, j=0, k=1)
  function faceActive3D(nodeId: string, face: string): boolean {
    if (nodeId === 'bot') return false;
    if (nodeId === 'top') return true;
    return nodeId.includes(face);
  }

  function drawIsometricCube(node: LatticeNode, el: HTMLCanvasElement) {
    const scale = 2;
    el.width = 240 * scale;
    el.height = 240 * scale;
    const rawCtx = el.getContext('2d');
    if (!rawCtx) return;
    const ctx = rawCtx;

    const w = el.width, h = el.height;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    const S = 68 * scale;
    const cx = w / 2 + 4 * scale;
    const cy = h / 2 + 16 * scale;
    const cos30 = Math.cos(Math.PI / 6);

    function iso(x: number, y: number, z: number): [number, number] {
      return [cx + (x - y) * S * cos30, cy - z * S + (x + y) * S * 0.5];
    }

    // 8 vertices: V[0]=000,V[1]=100,V[2]=110,V[3]=010,V[4]=001,V[5]=101,V[6]=111,V[7]=011
    const V: [number,number][] = [
      iso(0,0,0), iso(1,0,0), iso(1,1,0), iso(0,1,0),
      iso(0,0,1), iso(1,0,1), iso(1,1,1), iso(0,1,1),
    ];

    // 6 faces: face-id, vertex indices, is-hidden
    const FACES = [
      { id:'i0', vi:[0,3,7,4], hidden:true  },
      { id:'j1', vi:[3,2,6,7], hidden:true  },
      { id:'k0', vi:[0,1,2,3], hidden:true  },
      { id:'j0', vi:[0,1,5,4], hidden:false },
      { id:'i1', vi:[1,2,6,5], hidden:false },
      { id:'k1', vi:[4,5,6,7], hidden:false },
    ];

    // 12 edges: vertex pair + two adjacent face ids
    const EDGES = [
      { vi:[0,1], faces:['j0','k0'] }, { vi:[1,2], faces:['i1','k0'] },
      { vi:[2,3], faces:['j1','k0'] }, { vi:[3,0], faces:['i0','k0'] },
      { vi:[4,5], faces:['j0','k1'] }, { vi:[5,6], faces:['i1','k1'] },
      { vi:[6,7], faces:['j1','k1'] }, { vi:[7,4], faces:['i0','k1'] },
      { vi:[0,4], faces:['i0','j0'] }, { vi:[1,5], faces:['i1','j0'] },
      { vi:[2,6], faces:['i1','j1'] }, { vi:[3,7], faces:['i0','j1'] },
    ];

    // 8 corners: vertex index + three adjacent face ids
    const CORNERS = [
      { vi:0, faces:['i0','j0','k0'] }, { vi:1, faces:['i1','j0','k0'] },
      { vi:2, faces:['i1','j1','k0'] }, { vi:3, faces:['i0','j1','k0'] },
      { vi:4, faces:['i0','j0','k1'] }, { vi:5, faces:['i1','j0','k1'] },
      { vi:6, faces:['i1','j1','k1'] }, { vi:7, faces:['i0','j1','k1'] },
    ];

    const rank = node.rank;
    const id   = node.id;
    const hasFace = (f: string) => id === 'top' || (id !== 'bot' && id.includes(f));

    // ── 1. Draw faces (dim for edges/vertices, bright for face nodes) ──
    for (const f of FACES) {
      const activeFace = rank === 1 && hasFace(f.id);
      const fillHex = f.hidden
        ? (activeFace ? '#2a4a6a' : '#12182a')
        : (activeFace ? C_PARTIAL  : '#1e2a44');
      const alpha = f.hidden ? (activeFace ? 0.55 : 0.18) : (activeFace ? 0.7 : 1);

      ctx.beginPath();
      ctx.moveTo(V[f.vi[0]!]![0], V[f.vi[0]!]![1]);
      for (let i = 1; i < f.vi.length; i++) ctx.lineTo(V[f.vi[i]!]![0], V[f.vi[i]!]![1]);
      ctx.closePath();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fillHex;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `rgba(255,255,255,${f.hidden ? 0.18 : 0.3})`;
      ctx.lineWidth = scale;
      ctx.setLineDash(f.hidden ? [4*scale, 3*scale] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── 2. Draw edges ──
    for (const e of EDGES) {
      const activeEdge = rank === 2 && e.faces.every(f => hasFace(f));
      const [a, b] = [V[e.vi[0]!]!, V[e.vi[1]!]!];
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.strokeStyle = activeEdge ? C_INTERVAL : 'rgba(255,255,255,0.2)';
      ctx.lineWidth   = activeEdge ? 3 * scale   : scale;
      ctx.setLineDash([]);
      ctx.stroke();
    }

    // ── 3. Draw corner dots ──
    for (const c of CORNERS) {
      const activeVtx = rank === 3 && c.faces.every(f => hasFace(f));
      const [px, py] = V[c.vi]!;
      ctx.beginPath();
      ctx.arc(px, py, activeVtx ? 5 * scale : 3 * scale, 0, Math.PI * 2);
      ctx.fillStyle = activeVtx ? C_BASE : 'rgba(255,255,255,0.3)';
      ctx.fill();
    }

    // ── 4. Axis labels ──
    ctx.font      = `${11 * scale}px monospace`;
    ctx.fillStyle = 'rgba(200,200,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('i', iso(0.5, 0, 0)[0],          iso(0.5, 0, 0)[1] + 10 * scale);
    ctx.fillText('j', iso(0, 0.5, 0)[0] - 10*scale, iso(0, 0.5, 0)[1] + 6 * scale);
    ctx.fillText('k', iso(0, 0, 0.5)[0] - 10*scale, iso(0, 0, 0.5)[1]);
  }

  function drawPreview(node: LatticeNode, el: HTMLCanvasElement) {
    if (dimension === 3) {
      drawIsometricCube(node, el);
      return;
    }

    const grid = 60;
    const scale = 2;
    el.width = grid * scale;
    el.height = grid * scale;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    const dark = '#1a1a2e';
    const bright = C_PARTIAL;

    if (dimension === 1) {
      ctx.fillStyle = dark;
      ctx.fillRect(0, 0, grid * scale, grid * scale);
      const barH = 12;
      const barY = (grid - barH) / 2;
      for (let px = 0; px < grid; px++) {
        ctx.fillStyle = satisfies1D(node.id, px, grid) ? bright : '#333355';
        ctx.fillRect(px * scale, barY * scale, scale, barH * scale);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, barY * scale - 1, grid * scale, barH * scale + 2);
    } else {
      for (let py = 0; py < grid; py++) {
        for (let px = 0; px < grid; px++) {
          ctx.fillStyle = satisfies2D(node.id, px, py, grid) ? bright : dark;
          ctx.fillRect(px * scale, py * scale, scale, scale);
        }
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, grid * scale, grid * scale);
    }
  }

  $effect(() => {
    const node = selectedNode;
    const el = canvasEl;
    if (node && el) {
      tick().then(() => drawPreview(node, el));
    }
  });

  function selectNode(id: string) {
    selectedId = selectedId === id ? null : id;
  }

  function setDimension(d: Dimension) {
    dimension = d;
    selectedId = null;
    hoveredId = null;
  }
</script>

<div class="face-lattice">
  <header class="fl-header">
    <h1>Face Lattice <span class="sym">𝔽</span></h1>
    <p>
      The free distributive lattice generated by face constraints —
      governing which partial elements can be composed in cubical type theory.
    </p>
  </header>

  <div class="dim-selector">
    <button class:active={dimension === 1} onclick={() => setDimension(1)}>1-cube</button>
    <button class:active={dimension === 2} onclick={() => setDimension(2)}>2-cube</button>
    <button class:active={dimension === 3} onclick={() => setDimension(3)}>3-cube</button>
  </div>

  <div class="main-layout">
    <!-- SVG Hasse diagram -->
    <div class="diagram-panel">
      <svg viewBox={svgViewBox} xmlns="http://www.w3.org/2000/svg">
        {#each edges as edge, idx}
          {@const fn = nodeMap.get(edge.from)}
          {@const tn = nodeMap.get(edge.to)}
          {#if fn && tn}
            <line
              x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
              stroke={highlightedEdges.has(idx) ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'}
              stroke-width="1.5"
            />
          {/if}
        {/each}

        {#each nodes as node (node.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <g
            class="svg-node"
            onmouseenter={() => (hoveredId = node.id)}
            onmouseleave={() => (hoveredId = null)}
            onclick={() => selectNode(node.id)}
          >
            <circle
              cx={node.x} cy={node.y}
              r={hoveredId === node.id ? 26 : 22}
              fill={node.color}
              stroke={selectedId === node.id ? C_FILL : 'white'}
              stroke-width={selectedId === node.id ? 3 : 1}
            />
            <text
              x={node.x} y={node.y}
              text-anchor="middle" dominant-baseline="central"
              fill="white" font-size={dimension === 3 ? '7.5' : '10'} font-family="monospace"
              style="pointer-events:none"
            >{node.label}</text>
          </g>
        {/each}
      </svg>
    </div>

    <!-- Info panel -->
    <div class="info-panel">
      {#if selectedNode}
        <div class="node-info">
          <div class="formula">{@html kd(selectedNode.formula)}</div>
          <div class="meta">
            <span class="rank-badge" style="background:{selectedNode.color}">
              Rank {selectedNode.rank}
            </span>
            {#if dimension === 3}
              <span class="geo-badge">
                {selectedNode.rank === 0 ? 'empty' :
                 selectedNode.rank === 1 ? 'face' :
                 selectedNode.rank === 2 ? 'edge' :
                 selectedNode.rank === 3 ? 'vertex' : 'full'}
              </span>
            {/if}
          </div>
          <p class="meaning">{selectedNode.meaning}</p>
          <div class="preview-section">
            <span class="preview-label">
              Active region on {dimension === 1 ? 'I' : dimension === 2 ? 'I²' : 'I³'}
              {#if dimension === 3}<span class="hint">(solid = visible, dashed = hidden)</span>{/if}
            </span>
            <canvas bind:this={canvasEl}
              width={dimension === 3 ? 480 : 240}
              height={dimension === 3 ? 480 : 240}
              class="preview-canvas {dimension === 3 ? 'preview-canvas-3d' : ''}"
            ></canvas>
          </div>
        </div>
      {:else}
        <div class="legend">
          <h3>Legend</h3>
          <div class="legend-item">
            <span class="color-dot" style="background:{C_BOT}"></span>
            <span>⊥ — bottom (empty)</span>
          </div>
          <div class="legend-item">
            <span class="color-dot" style="background:{C_PARTIAL}"></span>
            <span>{dimension === 3 ? 'Faces — 6 square faces of the cube' : 'Atoms — single face constraints'}</span>
          </div>
          {#if dimension === 2 || dimension === 3}
            <div class="legend-item">
              <span class="color-dot" style="background:{C_INTERVAL}"></span>
              <span>{dimension === 3 ? 'Edges — 12 edges (meets of two faces)' : 'Meets — conjunctions of atoms'}</span>
            </div>
          {/if}
          <div class="legend-item">
            <span class="color-dot" style="background:{C_BASE}"></span>
            {#if dimension === 3}
              <span>Vertices — 8 corners (meets of three faces)</span>
            {:else}
              <span>Endpoint joins — (i=0)∨(i=1)</span>
            {/if}
          </div>
          {#if dimension === 2}
            <div class="legend-item">
              <span class="color-dot" style="background:{C_RESULT}"></span>
              <span>Cross joins — (i=ε)∨(j=δ)</span>
            </div>
          {/if}
          <div class="legend-item">
            <span class="color-dot" style="background:{C_FILL}"></span>
            <span>⊤ — top (everywhere)</span>
          </div>

          <p class="info-text">
            {#if dimension === 3}
              The 3-cube has <strong>6 faces</strong> (rank 1),
              <strong>12 edges</strong> (rank 2), and
              <strong>8 vertices</strong> (rank 3) — exactly the face lattice of a cube.
              Click any node to see which faces of I³ it covers, visualised on an isometric cube.
            {:else}
              The face lattice 𝔽 is generated by constraints <code>(i=0)</code> and
              <code>(i=1)</code> for each dimension variable&nbsp;<em>i</em>.
              The key relation is <code>(i=0) ∧ (i=1) = ⊥</code> — a variable
              cannot be both 0 and 1.
            {/if}
          </p>
          <p class="info-text">
            Click any node to see its formula, geometric meaning, and
            active region on the {dimension === 1 ? 'interval' : dimension === 2 ? 'square' : 'cube'}.
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .face-lattice {
    width: 100%;
    height: 100vh;
    background: #0d1117;
    color: #e6edf3;
    overflow-y: auto;
    padding: 1.5rem 2rem;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  }

  .fl-header h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #58d4f0;
  }
  .fl-header .sym {
    color: #ffdd44;
  }
  .fl-header p {
    margin: 0.4rem 0 0;
    font-size: 0.95rem;
    opacity: 0.8;
    max-width: 640px;
  }

  .dim-selector {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
  }
  .dim-selector button {
    padding: 0.35rem 1rem;
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 6px;
    background: transparent;
    color: #e6edf3;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background 0.15s, border-color 0.15s;
  }
  .dim-selector button:hover {
    background: rgba(255,255,255,0.08);
  }
  .dim-selector button.active {
    background: rgba(88,212,240,0.18);
    border-color: #58d4f0;
    color: #58d4f0;
  }

  .main-layout {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }
  .diagram-panel {
    flex: 0 0 65%;
    min-width: 0;
  }
  .diagram-panel svg {
    width: 100%;
    height: auto;
    max-height: calc(100vh - 180px);
  }
  .info-panel {
    flex: 1;
    min-width: 220px;
  }

  .svg-node { cursor: pointer; }
  .svg-node circle {
    transition: r 0.15s, stroke 0.15s, stroke-width 0.15s;
  }

  .node-info {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 1.2rem;
  }
  .formula {
    text-align: center;
    margin-bottom: 0.8rem;
  }
  .formula :global(.katex) {
    font-size: 1.4rem;
  }
  .meta {
    margin-bottom: 0.6rem;
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }
  .rank-badge {
    display: inline-block;
    padding: 0.15rem 0.7rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #000;
  }
  .geo-badge {
    display: inline-block;
    padding: 0.15rem 0.7rem;
    border-radius: 12px;
    font-size: 0.8rem;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.75);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .meaning {
    font-size: 0.9rem;
    line-height: 1.45;
    opacity: 0.9;
    margin: 0 0 1rem;
  }
  .preview-section {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .preview-label {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.6;
  }
  .hint {
    font-size: 0.7rem;
    opacity: 0.6;
    text-transform: none;
    letter-spacing: 0;
    margin-left: 0.3rem;
  }
  .preview-canvas {
    width: 120px;
    height: 120px;
    border-radius: 4px;
  }

  .preview-canvas-3d {
    width: 240px;
    height: 240px;
    border-radius: 4px;
  }

  .legend {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 1.2rem;
  }
  .legend h3 {
    margin: 0 0 0.7rem;
    font-size: 1rem;
    color: #58d4f0;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.45rem;
    font-size: 0.85rem;
  }
  .color-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.3);
  }
  .info-text {
    font-size: 0.85rem;
    line-height: 1.5;
    opacity: 0.75;
    margin: 0.8rem 0 0;
  }
  .info-text code {
    background: rgba(255,255,255,0.08);
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    font-size: 0.82rem;
  }

  @media (max-width: 900px) {
    .main-layout {
      flex-direction: column;
    }
    .diagram-panel {
      flex: none;
    }
  }
</style>
