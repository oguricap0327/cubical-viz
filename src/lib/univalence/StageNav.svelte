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
</script>

<nav class="stage-nav">
  {#each labels as label, k}
    {#if k > 0}
      <span class="arrow">→</span>
    {/if}
    <button
      class="stage-btn"
      class:active={stage === k}
      class:completed={completed[k] && stage !== k}
      class:future={!completed[k] && stage !== k}
      disabled={!completed[k] && stage !== k}
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
  }

  .stage-btn.active {
    background: #44FF88;
    color: #000;
    cursor: default;
  }

  .stage-btn.completed {
    background: #44DDFF;
    color: #000;
    cursor: pointer;
  }

  .stage-btn.completed:hover {
    filter: brightness(1.15);
  }

  .stage-btn.future {
    background: #333355;
    color: #888;
    cursor: default;
  }
</style>
