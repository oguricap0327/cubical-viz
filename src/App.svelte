<script lang="ts">
  import Scene from './lib/Scene.svelte';
  import Controls from './lib/Controls.svelte';
  import { type VisualizationType, VISUALIZATIONS } from './lib/types';

  let current: VisualizationType = $state('interval');
</script>

<main>
  <div class="header">
    <h1>Cubical Type Theory Visualizer</h1>
    <p>{VISUALIZATIONS[current].description}</p>
  </div>

  <Controls selected={current} onSelect={(v) => (current = v)} />
  <Scene visualization={current} />
</main>

<style>
  main {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .header {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    max-width: 500px;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }

  p {
    margin: 0.5rem 0 0 0;
    font-size: 1rem;
    opacity: 0.9;
  }
</style>
