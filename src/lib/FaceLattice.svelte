<script lang="ts">
  import { tick } from 'svelte';
  import katex from 'katex';
  import { PARTIAL_DATA, INTERVAL, BASE_POINT, RESULT, FILL_RESULT, hexCss } from './colors';

  type Dimension = 1 | 2;

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
    // ⊥ → atoms
    { from: 'bot', to: 'i0' }, { from: 'bot', to: 'i1' },
    { from: 'bot', to: 'j0' }, { from: 'bot', to: 'j1' },
    // (i=0) → rank 2/3
    { from: 'i0', to: 'i0j0' }, { from: 'i0', to: 'i0j1' },
    { from: 'i0', to: 'i0vi1' },
    { from: 'i0', to: 'i0vj0' }, { from: 'i0', to: 'i0vj1' },
    // (i=1) → rank 2/3
    { from: 'i1', to: 'i1j0' }, { from: 'i1', to: 'i1j1' },
    { from: 'i1', to: 'i0vi1' },
    { from: 'i1', to: 'i1vj0' }, { from: 'i1', to: 'i1vj1' },
    // (j=0) → rank 2/3
    { from: 'j0', to: 'i0j0' }, { from: 'j0', to: 'i1j0' },
    { from: 'j0', to: 'j0vj1' },
    { from: 'j0', to: 'i0vj0' }, { from: 'j0', to: 'i1vj0' },
    // (j=1) → rank 2/3
    { from: 'j1', to: 'i0j1' }, { from: 'j1', to: 'i1j1' },
    { from: 'j1', to: 'j0vj1' },
    { from: 'j1', to: 'i0vj1' }, { from: 'j1', to: 'i1vj1' },
    // rank 2 meets → rank 3
    { from: 'i0j0', to: 'i0vj0' }, { from: 'i0j1', to: 'i0vj1' },
    { from: 'i1j0', to: 'i1vj0' }, { from: 'i1j1', to: 'i1vj1' },
    // rank 2/3 → ⊤
    { from: 'i0vi1', to: 'top' }, { from: 'j0vj1', to: 'top' },
    { from: 'i0vj0', to: 'top' }, { from: 'i0vj1', to: 'top' },
    { from: 'i1vj0', to: 'top' }, { from: 'i1vj1', to: 'top' },
  ];

  // ── State ───────────────────────────────────────────────────────────
  let dimension: Dimension = $state(2);
  let selectedId: string | null = $state(null);
  let hoveredId: string | null = $state(null);
  let canvasEl: HTMLCanvasElement | undefined = $state(undefined);

  // ── Derived ─────────────────────────────────────────────────────────
  let nodes = $derived(dimension === 1 ? nodes1 : nodes2);
  let edges = $derived(dimension === 1 ? edges1 : edges2);
  let nodeMap = $derived(new Map(nodes.map(n => [n.id, n])));
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

  function drawPreview(node: LatticeNode, el: HTMLCanvasElement) {
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const grid = 60;
    const scale = 2;
    el.width = grid * scale;
    el.height = grid * scale;

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
  </div>

  <div class="main-layout">
    <!-- SVG Hasse diagram -->
    <div class="diagram-panel">
      <svg viewBox="0 0 640 500" xmlns="http://www.w3.org/2000/svg">
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
              fill="white" font-size="10" font-family="monospace"
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
          </div>
          <p class="meaning">{selectedNode.meaning}</p>
          <div class="preview-section">
            <span class="preview-label">Active region on {dimension === 1 ? 'I' : 'I²'}</span>
            <canvas bind:this={canvasEl} width="120" height="120" class="preview-canvas"></canvas>
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
            <span>Atoms — single face constraints</span>
          </div>
          {#if dimension === 2}
            <div class="legend-item">
              <span class="color-dot" style="background:{C_INTERVAL}"></span>
              <span>Meets — conjunctions of atoms</span>
            </div>
          {/if}
          <div class="legend-item">
            <span class="color-dot" style="background:{C_BASE}"></span>
            <span>Endpoint joins — (i=0)∨(i=1)</span>
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
            The face lattice 𝔽 is generated by constraints <code>(i=0)</code> and
            <code>(i=1)</code> for each dimension variable&nbsp;<em>i</em>.
            The key relation is <code>(i=0) ∧ (i=1) = ⊥</code> — a variable
            cannot be both 0 and 1.
          </p>
          <p class="info-text">
            Click any node to see its formula, geometric meaning, and
            active region on the {dimension === 1 ? 'interval' : 'square'}.
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

  /* dimension buttons */
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

  /* main split */
  .main-layout {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }
  .diagram-panel {
    flex: 0 0 60%;
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

  /* SVG nodes */
  .svg-node { cursor: pointer; }
  .svg-node circle {
    transition: r 0.15s, stroke 0.15s, stroke-width 0.15s;
  }

  /* info panel - node selected */
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
    font-size: 1.6rem;
  }
  .meta {
    margin-bottom: 0.6rem;
  }
  .rank-badge {
    display: inline-block;
    padding: 0.15rem 0.7rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #000;
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
  .preview-canvas {
    width: 120px;
    height: 120px;
    border-radius: 4px;
  }

  /* legend */
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
