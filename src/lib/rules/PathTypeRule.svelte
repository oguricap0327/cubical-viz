<script lang="ts">
  import Rule from './Rule.svelte';
  import type { RuleDefinition } from './types';
  import { createInterval } from '../createInterval';
  import * as THREE from 'three';
  import katex from 'katex';

  const km = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: false });
  const kd = (f: string) => katex.renderToString(f, { throwOnError: false, displayMode: true });

  const pathTypeRule: RuleDefinition = {
    name: "Path Types - Introduction",
    judgment: `
      <div class="nd-rule">
        <div class="nd-premises">${km('\\Gamma,\\, i : \\mathbb{I} \\vdash t : A')}</div>
        <hr class="nd-line">
        <div class="nd-conclusion">${km('\\Gamma \\vdash \\langle i \\rangle\\, t : \\mathrm{Path}_A\\, t(i_0)\\, t(i_1)')}</div>
      </div>
    `,
    description: `A path is a function from the interval 𝕀 to a type A. The interval has two endpoints: ${km('i_0')} (zero) and ${km('i_1')} (one).`,
    
    setup: (scene: THREE.Scene, camera: THREE.Camera) => {
      // Create the interval visualization
      const intervalGroup = createInterval();
      scene.add(intervalGroup);
      
      // Store references for cleanup
      (scene as any)._intervalGroup = intervalGroup;
    },
    
    cleanup: (scene: THREE.Scene) => {
      const intervalGroup = (scene as any)._intervalGroup;
      if (intervalGroup) scene.remove(intervalGroup);
    }
  };
</script>

<Rule rule={pathTypeRule} />
