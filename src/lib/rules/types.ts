import type * as THREE from 'three';

export interface RuleDefinition {
  name: string;
  judgment: string; // HTML string with typing judgment
  description: string;
  setup: (scene: THREE.Scene, camera: THREE.Camera) => void;
  update?: (time: number) => void;
  cleanup?: (scene: THREE.Scene) => void;
  controls?: any; // Svelte component for interactive controls
}

export interface RuleVisualization {
  group: THREE.Group;
  animate?: (time: number) => void;
}
