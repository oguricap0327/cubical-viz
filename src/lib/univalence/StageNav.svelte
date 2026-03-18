<script lang="ts">
  let {
    stage,
    completed,
    onSelect,
  }: {
    stage: number;
    completed: boolean[];
    onSelect: (n: number) => void;
  } = $props();

  const labels = ['1. Setup', '2. Glue Line', '3. Path in 𝒰', '4. Transport'];

  // Stage k is unlocked if:
  // - it's the first stage (always unlocked), OR
  // - the previous stage has been completed
  function isUnlocked(k: number): boolean {
    return k === 0 || completed[k - 1] === true;
  }
</script>

<nav class="stage-nav">
  {#each labels as label, k}
    {#if k > 0}
      <span class="arrow">→</span>
    {/if}
    <button
      class="stage-btn"
      class:active={stage === k}
      class:done={completed[k] && stage !== k}
      class:locked={!isUnlocked(k) && stage !== k}
      onclick={() => onSelect(k)}
    >
      {label}
    </button>
  {/each}
</nav>

<style>
  .stage-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    background: rgba(0, 0, 0, 0.85);
    border-bottom: 1px solid #4a4a6a;
  }

  .arrow {
    color: #666;
    font-size: 1.1rem;
    user-select: none;
  }

  .stage-btn {
    padding: 8px 18px;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s;
    /* default: unlocked but not active, not done */
    background: #444466;
    color: #ccc;
    cursor: pointer;
  }

  .stage-btn:hover:not(:disabled):not(.active) {
    filter: brightness(1.25);
  }

  /* Currently viewing this stage */
  .stage-btn.active {
    background: #44FF88;
    color: #000;
    cursor: default;
  }

  /* Stage completed, can navigate back */
  .stage-btn.done {
    background: #44DDFF;
    color: #000;
    cursor: pointer;
  }

  /* Not yet visited */
  .stage-btn.locked {
    background: #333355;
    color: #aaa;
    cursor: pointer;
  }
</style>
