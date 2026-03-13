<script lang="ts">
  let {
    playing = $bindable(true),
    onToggle
  }: {
    playing?: boolean;
    onToggle?: (playing: boolean) => void;
  } = $props();

  function toggle() {
    playing = !playing;
    if (onToggle) {
      onToggle(playing);
    }
  }
</script>

<button class="play-pause-button" onclick={toggle}>
  {#if playing}
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1"/>
      <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>
    <span>Pause</span>
  {:else}
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
    <span>Play</span>
  {/if}
</button>

<style>
  .play-pause-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(136, 204, 255, 0.2);
    border: 1px solid #88ccff;
    border-radius: 6px;
    color: #88ccff;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .play-pause-button:hover {
    background: rgba(136, 204, 255, 0.3);
    border-color: #aaddff;
    color: #aaddff;
  }

  .play-pause-button:active {
    transform: scale(0.98);
  }

  svg {
    width: 20px;
    height: 20px;
  }
</style>
