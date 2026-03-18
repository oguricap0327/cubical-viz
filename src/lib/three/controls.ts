import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface ControlsOptions {
  enableDamping?: boolean;
  dampingFactor?: number;
  minDistance?: number;
  maxDistance?: number;
  target?: [number, number, number];
}

export function createOrbitControls(
  camera: THREE.Camera,
  domElement: HTMLElement,
  options: ControlsOptions = {}
): OrbitControls {
  const {
    enableDamping = true,
    dampingFactor = 0.08,
    minDistance = 1,
    maxDistance = 10,
    target = [0, 0, 0],
  } = options;

  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = enableDamping;
  controls.dampingFactor = dampingFactor;
  controls.minDistance = minDistance;
  controls.maxDistance = maxDistance;
  controls.target.set(...target);
  controls.update();

  return controls;
}
