<script lang="ts">
  import Scene from './lib/Scene.svelte';
  import Controls from './lib/Controls.svelte';
  import PathTypeRule from './lib/rules/PathTypeRule.svelte';
  import CompositionRule from './lib/rules/CompositionRule.svelte';
  import TransportRule from './lib/rules/TransportRule.svelte';
  import KanFillingRule from './lib/rules/KanFillingRule.svelte';
  import GlueTypeRule from './lib/rules/GlueTypeRule.svelte';
  import { type VisualizationType, VISUALIZATIONS } from './lib/types';

  let current: VisualizationType = $state('interval');

  let isRuleBased = $derived(
    current === 'path-type-rule' ||
    current === 'composition-rule' ||
    current === 'transport-rule' ||
    current === 'kan-filling-rule' ||
    current === 'glue-type-rule'
  );
</script>

<main>
  <!-- Always-visible categorized sidebar -->
  <Controls selected={current} onSelect={(v) => (current = v)} />

  <!-- Content area, offset by sidebar width -->
  <div class="content">
    {#if isRuleBased}
      {#key current}
        {#if current === 'path-type-rule'}
          <PathTypeRule />
        {:else if current === 'composition-rule'}
          <CompositionRule />
        {:else if current === 'transport-rule'}
          <TransportRule />
        {:else if current === 'kan-filling-rule'}
          <KanFillingRule />
        {:else if current === 'glue-type-rule'}
          <GlueTypeRule />
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
