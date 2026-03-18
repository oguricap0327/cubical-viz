<script lang="ts">
  import { type VisualizationType, VISUALIZATIONS, NAV_CATEGORIES } from './types';

  let { selected, onSelect }: {
    selected: VisualizationType;
    onSelect: (v: VisualizationType) => void;
  } = $props();
</script>

<nav class="controls">
  {#each NAV_CATEGORIES as category}
    <div class="category">
      <div class="category-title">{category.title}</div>
      {#each category.items as type}
        {@const info = VISUALIZATIONS[type]}
        <button
          class="control-btn"
          class:active={selected === type}
          onclick={() => onSelect(type)}
        >
          <span class="icon">{info.icon}</span>
          <span class="label">{info.label}</span>
        </button>
      {/each}
    </div>
  {/each}
</nav>

<style>
  .controls {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 16px 12px;
    width: 180px;
    background: rgba(10, 10, 25, 0.85);
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(100, 120, 200, 0.2);
    overflow-y: auto;
  }

  .category {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 18px;
  }

  .category-title {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(140, 160, 255, 0.6);
    padding: 0 8px 4px 8px;
    border-bottom: 1px solid rgba(100, 120, 200, 0.15);
    margin-bottom: 2px;
  }

  .control-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    width: 100%;
  }

  .control-btn:hover {
    background: rgba(60, 70, 140, 0.5);
    border-color: rgba(100, 140, 255, 0.3);
    color: white;
  }

  .control-btn.active {
    background: rgba(50, 70, 150, 0.75);
    border-color: rgba(100, 150, 255, 0.6);
    color: white;
    box-shadow: 0 0 10px rgba(80, 120, 255, 0.2);
  }

  .icon {
    font-size: 1rem;
    width: 1.3em;
    text-align: center;
    flex-shrink: 0;
  }

  .label {
    font-weight: 500;
  }
</style>
