<script lang="ts">
  import StageNav from './StageNav.svelte';
  import UniSetup from './UniSetup.svelte';
  import UniGlue from './UniGlue.svelte';
  import UniPath from './UniPath.svelte';
  import UniTransport from './UniTransport.svelte';

  let stage = $state(0);
  let completed = $state([false, false, false, false]);

  function advance() {
    completed[stage] = true;
    if (stage < 3) stage++;
  }
</script>

<div class="univalence-page">
  <StageNav {stage} {completed} onSelect={(k) => (stage = k)} />

  <div class="stage-content">
    {#if stage === 0}
      <UniSetup onComplete={advance} />
    {:else if stage === 1}
      <UniGlue onComplete={advance} />
    {:else if stage === 2}
      <UniPath onComplete={advance} />
    {:else if stage === 3}
      <UniTransport onComplete={advance} />
    {/if}
  </div>
</div>

<style>
  .univalence-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    background: #0d1117;
  }

  .stage-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
