/** Consistent color vocabulary for cubical-type-theory visualizations. */

// Semantic color constants (hex numbers for THREE.js materials)
export const INTERVAL = 0x44ddff; // cyan  – i-dimension
export const TYPE_FAMILY = 0x4488ff; // blue  – A (type family)
export const BASE_POINT = 0xffdd44; // yellow – a₀ / base element
export const RESULT = 0xff8844; // orange – transported/composed result
export const PARTIAL_DATA = 0x44ff88; // green  – φ / u / partial element
export const FILL_RESULT = 0xff44aa; // pink   – composition/fill output
export const EQUIVALENCE = 0xaa44ff; // purple – equivalences

/** Convert a hex color number to a CSS hex string (e.g. 0xff8844 → '#ff8844'). */
export function hexCss(c: number): string {
  return '#' + c.toString(16).padStart(6, '0');
}
