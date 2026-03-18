export type VisualizationType =
  | 'interval'
  | 'path'
  | 'square'
  | 'cube'
  | 'composition'
  | 'transport'
  | 'path-type-rule'
  | 'composition-rule'
  | 'transport-rule'
  | 'kan-filling-rule'
  | 'glue-type-rule'
  | 'path-concat-rule'
  | 'path-inv-rule'
  | 'partial-elements-rule'
  | 'refl-rule'
  | 'fun-ext-rule'
  | 'hcomp-rule'
  | 'pi-sigma-comp'
  | 'face-lattice'
  | 'univalence';

export interface VisualizationInfo {
  label: string;
  icon: string;
  description: string;
}

export interface NavCategory {
  title: string;
  items: VisualizationType[];
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
    description: 'comp A φ u a : A(1) — Kan filling of an open box: base a, side walls u, missing top filled by composition',
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
  'composition-rule': {
    label: 'Composition Rule',
    icon: '∘',
    description: 'Composition operation - being extensible is preserved along paths',
  },
  'transport-rule': {
    label: 'Transport Rule',
    icon: '⇝',
    description: 'Transport - coercion along paths in a type family',
  },
  'kan-filling-rule': {
    label: 'Kan Filling',
    icon: '▣',
    description: 'Kan filling - constructing the missing lid of an open box',
  },
  'glue-type-rule': {
    label: 'Glue Types',
    icon: '≃',
    description: 'Glue types and univalence - equivalent types are equal',
  },
  'path-concat-rule': {
    label: 'Path Concatenation',
    icon: '∙',
    description: 'Path concatenation - joining two paths end-to-end',
  },
  'path-inv-rule': {
    label: 'Path Inversion',
    icon: '⁻¹',
    description: 'Path inversion - reversing the direction of a path',
  },
  'partial-elements-rule': {
    label: 'Partial Elements',
    icon: '∂',
    description: 'Partial elements [φ ↦ u] — values defined only where a face formula holds',
  },
  'refl-rule': {
    label: 'Reflexivity',
    icon: '↺',
    description: 'refl = ⟨i⟩ a — the constant path in cubical type theory',
  },
  'fun-ext-rule': {
    label: 'Function Ext.',
    icon: '⟷',
    description: 'funext = ⟨i⟩ λx. h x @ i — function extensionality in CTT',
  },
  'hcomp-rule': {
    label: 'Homogeneous Comp.',
    icon: '⊡',
    description: 'hcomp^k A [φ ↦ u] a₀ : A — homogeneous composition, the special case of comp for a constant type',
  },
  'pi-sigma-comp': {
    label: 'Π / Σ Composition',
    icon: '⊗',
    description: 'Composition for Π- and Σ-types: why Π-comp needs backward transport and Σ-comp needs fill (not comp) for the second component',
  },
  'face-lattice': {
    label: 'Face Lattice',
    icon: '⊓',
    description: 'The face lattice 𝔽 governing partial elements',
  },
  univalence: {
    label: 'Univalence',
    icon: '≃',
    description: 'The univalence theorem proved via Glue types',
  },
};

export const NAV_CATEGORIES: NavCategory[] = [
  {
    title: 'Primitives',
    items: ['interval', 'path', 'square', 'cube'],
  },
  {
    title: 'Operations',
    items: ['composition', 'transport'],
  },
  {
    title: 'Theory',
    items: ['face-lattice', 'univalence'],
  },
  {
    title: 'Typing Rules',
    items: ['path-type-rule', 'refl-rule', 'fun-ext-rule', 'composition-rule', 'hcomp-rule', 'pi-sigma-comp', 'transport-rule', 'kan-filling-rule', 'glue-type-rule', 'path-concat-rule', 'path-inv-rule', 'partial-elements-rule'],
  },
];
