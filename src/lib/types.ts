export type VisualizationType =
  | 'interval'
  | 'path'
  | 'square'
  | 'cube'
  | 'composition'
  | 'transport'
  | 'path-type-rule';

export interface VisualizationInfo {
  label: string;
  icon: string;
  description: string;
}

export const VISUALIZATIONS: Record<VisualizationType, VisualizationInfo> = {
  interval: {
    label: 'Interval',
    icon: '━',
    description: 'The interval I — a path from i0 to i1',
  },
  path: {
    label: 'Path Type',
    icon: '⌒',
    description: 'Path type p : I → A — a continuous map from the interval into a type',
  },
  square: {
    label: 'Square',
    icon: '▢',
    description: 'Square I × I — a product of two intervals forming a 2-dimensional face',
  },
  cube: {
    label: 'Cube',
    icon: '⬡',
    description: 'Cube I × I × I — a product of three intervals forming a 3-cell',
  },
  composition: {
    label: 'Composition',
    icon: '∙',
    description: 'Composition p ∙ q — joining two paths end-to-end via Kan filling',
  },
  transport: {
    label: 'Transport',
    icon: '⇝',
    description: 'Transport — moving an element along a path in a type family',
  },
  'path-type-rule': {
    label: 'Path Type Rule',
    icon: '⊢',
    description: 'Path type introduction rule with typing judgment',
  },
};
