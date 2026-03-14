import * as THREE from 'three';
import { createTextSprite } from '../textSprite';
import { INTERVAL, PARTIAL_DATA, RESULT, hexCss } from '../colors';

/** Axis definition: direction, color, and label. */
const AXES = [
  { dir: new THREE.Vector3(1, 0, 0), color: INTERVAL,      label: 'i' }, // X – cyan
  { dir: new THREE.Vector3(0, 1, 0), color: PARTIAL_DATA,   label: 'j' }, // Y – green
  { dir: new THREE.Vector3(0, 0, 1), color: RESULT,         label: 'k' }, // Z – orange
] as const;

const AXIS_HALF = 1.5;

/**
 * Create a small labeled axis helper (i, j, k) and add it to the scene.
 * The returned group is translated to the bottom-left corner so it stays
 * unobtrusive.
 */
export function createAxes(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();

  for (const { dir, color, label } of AXES) {
    const start = dir.clone().multiplyScalar(-AXIS_HALF);
    const end   = dir.clone().multiplyScalar( AXIS_HALF);

    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 1 });
    group.add(new THREE.Line(geo, mat));

    const sprite = createTextSprite(label, hexCss(color), 64);
    sprite.position.copy(end).addScaledVector(dir, 0.2);
    sprite.scale.set(0.2, 0.2, 0.2);
    group.add(sprite);
  }

  group.position.set(-2, -2, -2);
  scene.add(group);
  return group;
}
