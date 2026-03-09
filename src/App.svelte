<script lang="ts">
  import Interval from './lib/Interval.svelte';
</script>

<main>
  <div class="header">
    <h1>Cubical Type Theory Visualizer</h1>
    <p>The interval <strong>I</strong> — a path from i0 to i1</p>
  </div>
  <Interval />
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
