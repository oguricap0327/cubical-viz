<script lang="ts">
  let {
    value = $bindable(0),
    min = 0,
    max = 1,
    step = 0.01,
    label = "Time",
    onChange
  }: {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    onChange?: (value: number) => void;
  } = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = parseFloat(target.value);
    if (onChange) {
      onChange(value);
    }
  }
</script>

<div class="slider-control">
  <label>
    <span class="label-text">{label}: {value.toFixed(2)}</span>
    <input
      type="range"
      {min}
      {max}
      {step}
      {value}
      oninput={handleInput}
    />
  </label>
</div>

<style>
  .slider-control {
    margin: 10px 0;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .label-text {
    font-size: 0.9rem;
    color: #88ccff;
    font-weight: 500;
  }

  input[type="range"] {
    width: 100%;
    height: 6px;
    background: rgba(136, 204, 255, 0.2);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #88ccff;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    background: #aaddff;
  }

  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #88ccff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    transition: background 0.2s;
  }

  input[type="range"]::-moz-range-thumb:hover {
    background: #aaddff;
  }
</style>
