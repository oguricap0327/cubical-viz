<script lang="ts">
  import { type VisualizationType, VISUALIZATIONS } from './types';

  let { selected, onSelect }: {
    selected: VisualizationType;
    onSelect: (v: VisualizationType) => void;
  } = $props();

  const items = (Object.keys(VISUALIZATIONS) as VisualizationType[]).map((key) => ({
    type: key,
    ...VISUALIZATIONS[key],
  }));
</script>

<nav class="controls">
  {#each items as item}
    <button
      class="control-btn"
      class:active={selected === item.type}
      onclick={() => onSelect(item.type)}
    >
      <span class="icon">{item.icon}</span>
      <span class="label">{item.label}</span>
    </button>
  {/each}
</nav>

<style>
  .controls {
    position: absolute;
    top: 80px;
    left: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .control-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    background: rgba(20, 20, 40, 0.7);
    backdrop-filter: blur(8px);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    min-width: 160px;
  }

  .control-btn:hover {
    background: rgba(40, 40, 80, 0.85);
    border-color: rgba(100, 140, 255, 0.4);
    color: white;
  }

  .control-btn.active {
    background: rgba(50, 60, 120, 0.85);
    border-color: rgba(100, 140, 255, 0.7);
    color: white;
    box-shadow: 0 0 12px rgba(80, 120, 255, 0.25);
  }

  .icon {
    font-size: 1.1rem;
    width: 1.4em;
    text-align: center;
  }

  .label {
    font-weight: 500;
  }
</style>
