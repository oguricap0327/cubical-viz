<script lang="ts">
  import type { StepDefinition } from '../rules/types';

  let {
    steps,
    activeStep = $bindable(0),
    onStep
  }: {
    steps: StepDefinition[];
    activeStep?: number;
    onStep?: (index: number) => void;
  } = $props();

  function prev() {
    if (activeStep > 0) {
      activeStep--;
      onStep?.(activeStep);
    }
  }

  function next() {
    if (activeStep < steps.length - 1) {
      activeStep++;
      onStep?.(activeStep);
    }
  }
</script>

<div class="step-panel">
  <div class="step-info">
    <span class="step-counter">{activeStep + 1} / {steps.length}</span>
    <span class="step-label">{steps[activeStep].label}</span>
  </div>
  <p class="step-description">{steps[activeStep].description}</p>
  <div class="step-nav">
    <button class="step-btn" onclick={prev} disabled={activeStep === 0}>← Prev</button>
    <button class="step-btn" onclick={next} disabled={activeStep === steps.length - 1}>Next →</button>
  </div>
</div>

<style>
  .step-panel {
    padding: 14px 20px;
    background: rgba(0, 0, 0, 0.8);
    border-top: 1px solid #4a4a6a;
    color: #e0e0e0;
  }

  .step-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .step-counter {
    font-size: 0.8rem;
    color: #88ccff;
    background: rgba(136, 204, 255, 0.15);
    padding: 2px 8px;
    border-radius: 4px;
    font-variant-numeric: tabular-nums;
  }

  .step-label {
    font-weight: 600;
    font-size: 0.95rem;
    color: #ffffff;
  }

  .step-description {
    margin: 0 0 10px 0;
    font-size: 0.9rem;
    line-height: 1.5;
    opacity: 0.85;
  }

  .step-nav {
    display: flex;
    gap: 8px;
  }

  .step-btn {
    padding: 6px 16px;
    background: rgba(136, 204, 255, 0.15);
    border: 1px solid #4a4a6a;
    border-radius: 5px;
    color: #88ccff;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .step-btn:hover:not(:disabled) {
    background: rgba(136, 204, 255, 0.3);
    border-color: #88ccff;
  }

  .step-btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .step-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
</style>
