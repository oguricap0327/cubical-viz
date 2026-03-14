<script lang="ts">
  import { onMount } from 'svelte';
  import Scene from './lib/Scene.svelte';
  import Controls from './lib/Controls.svelte';
  import IntervalRule from './lib/rules/IntervalRule.svelte';
  import PathTypeRule from './lib/rules/PathTypeRule.svelte';
  import CompositionRule from './lib/rules/CompositionRule.svelte';
  import TransportRule from './lib/rules/TransportRule.svelte';
  import KanFillingRule from './lib/rules/KanFillingRule.svelte';
  import GlueTypeRule from './lib/rules/GlueTypeRule.svelte';
  import PathConcatRule from './lib/rules/PathConcatRule.svelte';
  import PathInvRule from './lib/rules/PathInvRule.svelte';
  import SquareRule from './lib/rules/SquareRule.svelte';
  import CubeRule from './lib/rules/CubeRule.svelte';
  import FaceLattice from './lib/FaceLattice.svelte';
  import Univalence from './lib/univalence/Univalence.svelte';
  import { type VisualizationType, VISUALIZATIONS } from './lib/types';

  const validIds = new Set<string>(Object.keys(VISUALIZATIONS));

  function parseHash(): VisualizationType | null {
    const raw = window.location.hash.replace(/^#/, '');
    // Alias map for short slugs
    const aliases: Record<string, VisualizationType> = {
      'kan-filling': 'kan-filling-rule',
      'path-type': 'path-type-rule',
      'composition': 'composition-rule',
      'transport': 'transport-rule',
      'glue-types': 'glue-type-rule',
    };
    const id = aliases[raw] ?? raw;
    return validIds.has(id) ? (id as VisualizationType) : null;
  }

  let current: VisualizationType = $state(parseHash() ?? 'interval');

  // Track whether the change came from a user sidebar click
  let userClick = false;

  function handleSelect(v: VisualizationType) {
    userClick = true;
    current = v;
  }

  // Sync hash whenever current changes
  $effect(() => {
    const hash = '#' + current;
    if (window.location.hash !== hash) {
      if (userClick) {
        window.history.pushState(null, '', hash);
      } else {
        window.history.replaceState(null, '', hash);
      }
    }
    userClick = false;
  });

  // Browser back/forward support
  function onPopState() {
    const id = parseHash();
    if (id) current = id;
  }

  onMount(() => {
    window.addEventListener('popstate', onPopState);
    // Set initial hash if absent
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#' + current);
    }
    return () => window.removeEventListener('popstate', onPopState);
  });

  let isRuleBased = $derived(
    current === 'interval' ||
    current === 'square' ||
    current === 'cube' ||
    current === 'path-type-rule' ||
    current === 'composition-rule' ||
    current === 'transport-rule' ||
    current === 'kan-filling-rule' ||
    current === 'glue-type-rule' ||
    current === 'path-concat-rule' ||
    current === 'path-inv-rule'
  );

  let isStandalone = $derived(current === 'face-lattice' || current === 'univalence');
</script>

<main>
  <!-- Always-visible categorized sidebar -->
  <Controls selected={current} onSelect={handleSelect} />

  <!-- Content area, offset by sidebar width -->
  <div class="content">
    {#if isStandalone}
      {#key current}
        {#if current === 'face-lattice'}
          <FaceLattice />
        {:else if current === 'univalence'}
          <Univalence />
        {/if}
      {/key}
    {:else if isRuleBased}
      {#key current}
        {#if current === 'interval'}
          <IntervalRule />
        {:else if current === 'square'}
          <SquareRule />
        {:else if current === 'cube'}
          <CubeRule />
        {:else if current === 'path-type-rule'}
          <PathTypeRule />
        {:else if current === 'composition-rule'}
          <CompositionRule />
        {:else if current === 'transport-rule'}
          <TransportRule />
        {:else if current === 'kan-filling-rule'}
          <KanFillingRule />
        {:else if current === 'glue-type-rule'}
          <GlueTypeRule />
        {:else if current === 'path-concat-rule'}
          <PathConcatRule />
        {:else if current === 'path-inv-rule'}
          <PathInvRule />
        {/if}
      {/key}
    {:else}
      <div class="geo-header">
        <h1>Cubical Type Theory Visualizer</h1>
        <p>{VISUALIZATIONS[current].description}</p>
      </div>
      {#key current}
        <Scene visualization={current} />
      {/key}
    {/if}
  </div>
</main>

<style>
  main {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
  }

  .content {
    flex: 1;
    position: relative;
    height: 100vh;
    overflow: hidden;
    margin-left: 204px; /* sidebar width + border */
  }

  .geo-header {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    max-width: 500px;
    pointer-events: none;
  }

  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  p {
    margin: 0.5rem 0 0 0;
    font-size: 0.95rem;
    opacity: 0.9;
  }
</style>
