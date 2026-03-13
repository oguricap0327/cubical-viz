import * as THREE from 'three';

export interface RendererOptions {
  antialias?: boolean;
  pixelRatio?: number;
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  options: RendererOptions = {}
): THREE.WebGLRenderer {
  const {
    antialias = true,
    pixelRatio = window.devicePixelRatio,
  } = options;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(pixelRatio);

  return renderer;
}

export function updateRendererSize(
  renderer: THREE.WebGLRenderer,
  width: number,
  height: number
): void {
  renderer.setSize(width, height);
}
