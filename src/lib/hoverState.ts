import { writable } from 'svelte/store';

/** Key of the currently hovered term, shared between 3D scene and DOM. */
export const hoveredTerm = writable<string | null>(null);
