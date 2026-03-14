import type * as THREE from 'three';

export interface TermMapping {
  termKey: string;            // unique key, e.g. "a", "A", "path", "transp_a"
  objects: THREE.Object3D[];  // 3D objects to highlight
}

export interface RuleDefinition {
  name: string;
  judgment: string; // HTML string with typing judgment
  description: string;
  setup: (scene: THREE.Scene, camera: THREE.Camera) => void;
  update?: (time: number) => void;
  cleanup?: (scene: THREE.Scene) => void;
  controls?: any; // Svelte component for interactive controls
  termMappings?: TermMapping[];  // populated after setup()
}

export interface RuleVisualization {
  group: THREE.Group;
  animate?: (time: number) => void;
}
