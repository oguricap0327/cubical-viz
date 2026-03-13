<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import { createInterval } from '../createInterval';
  import * as THREE from 'three';

  const pathTypeRule: RuleDefinition = {
    name: "Path Types - Introduction",
    judgment: `
      <div style="text-align: center;">
        <div style="margin-bottom: 5px;">Γ, i : 𝕀 ⊢ t : A</div>
        <div style="border-top: 2px solid #88ccff; margin: 5px 20px;"></div>
        <div>Γ ⊢ ⟨i⟩ t : Path<sub>A</sub> t(i₀) t(i₁)</div>
      </div>
    `,
    description: "A path is a function from the interval 𝕀 to a type A. The interval has two endpoints: i₀ (zero) and i₁ (one).",
    
    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      // Create the interval visualization
      const intervalGroup = createInterval();
      scene.add(intervalGroup);
      
      // Store reference for cleanup
      (scene as any)._intervalGroup = intervalGroup;
    },
    
    cleanup: (scene: THREE.Scene) => {
      const intervalGroup = (scene as any)._intervalGroup;
      if (intervalGroup) {
        scene.remove(intervalGroup);
      }
    }
  };
</script>

<Rule rule={pathTypeRule} />
