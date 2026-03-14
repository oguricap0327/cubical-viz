import * as THREE from 'three';

export interface SceneOptions {
  backgroundColor?: number;
  ambientLightColor?: number;
  ambientLightIntensity?: number;
  pointLightColor?: number;
  pointLightIntensity?: number;
  pointLightPosition?: [number, number, number];
  addGrid?: boolean;
  gridSize?: number;
  gridDivisions?: number;
}

export function createScene(options: SceneOptions = {}): THREE.Scene {
  const {
    backgroundColor = 0x1a1a2e,
    ambientLightColor = 0xffffff,
    ambientLightIntensity = 0.6,
    pointLightColor = 0xffffff,
    pointLightIntensity = 1.2,
    pointLightPosition = [2, 3, 4],
    addGrid = true,
    gridSize = 4,
    gridDivisions = 20,
  } = options;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(ambientLightColor, ambientLightIntensity);
  scene.add(ambientLight);

  // No point light — avoids specular reflections on objects

  // Add grid helper
  if (addGrid) {
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x333355, 0x222244);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);
  }

  return scene;
}
