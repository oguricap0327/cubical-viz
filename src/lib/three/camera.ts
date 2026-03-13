import * as THREE from 'three';

export interface CameraOptions {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  position?: [number, number, number];
  lookAt?: [number, number, number];
}

export function createCamera(options: CameraOptions = {}): THREE.PerspectiveCamera {
  const {
    fov = 50,
    aspect = window.innerWidth / window.innerHeight,
    near = 0.1,
    far = 100,
    position = [0, 0.8, 3],
    lookAt = [0, 0, 0],
  } = options;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(...position);
  camera.lookAt(...lookAt);

  return camera;
}

export function updateCameraAspect(camera: THREE.PerspectiveCamera, aspect: number): void {
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
