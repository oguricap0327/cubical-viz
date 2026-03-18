import * as THREE from 'three';
import { INTERVAL, TYPE_FAMILY, hexCss } from './colors';

/**
 * Creates a text sprite using a canvas texture.
 * Sprites always face the camera, making them ideal for labels.
 */
function createTextSprite(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  ctx.font = 'bold 80px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.4, 0.4, 0.4);
  return sprite;
}

/**
 * Creates a visual representation of the interval I = [0, 1]
 * from cubical type theory.
 *
 * The interval is the fundamental building block: a path from
 * endpoint i0 (the "zero" face) to endpoint i1 (the "one" face).
 *
 * @returns THREE.Group containing the interval line, endpoint
 *          spheres, and text labels.
 */
export function createInterval(): THREE.Group {
  const group = new THREE.Group();

  // -- Interval line segment from i0=(0,0,0) to i1=(1,0,0) --
  // Vertex-colored gradient: INTERVAL (cyan) at i₀ → TYPE_FAMILY (blue) at i₁
  const lineGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array([0, 0, 0, 1, 0, 0]);
  const intervalColor = new THREE.Color(INTERVAL);
  const familyColor = new THREE.Color(TYPE_FAMILY);
  const colors = new Float32Array([
    intervalColor.r, intervalColor.g, intervalColor.b,
    familyColor.r,   familyColor.g,   familyColor.b,
  ]);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    linewidth: 2,
  });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  group.add(line);

  // -- Endpoint spheres --
  const sphereGeometry = new THREE.SphereGeometry(0.06, 32, 32);

  // i0 endpoint (INTERVAL cyan) at origin
  const i0Material = new THREE.MeshStandardMaterial({
    color: INTERVAL,
    emissive: 0x226688,
    roughness: 0.3,
    metalness: 0.6,
  });
  const i0Sphere = new THREE.Mesh(sphereGeometry, i0Material);
  i0Sphere.position.set(0, 0, 0);
  group.add(i0Sphere);

  // i1 endpoint (TYPE_FAMILY blue) at (1,0,0)
  const i1Material = new THREE.MeshStandardMaterial({
    color: TYPE_FAMILY,
    emissive: 0x224488,
    roughness: 0.3,
    metalness: 0.6,
  });
  const i1Sphere = new THREE.Mesh(sphereGeometry, i1Material);
  i1Sphere.position.set(1, 0, 0);
  group.add(i1Sphere);

  // -- Text labels --
  const i0Label = createTextSprite('i0', hexCss(INTERVAL));
  i0Label.position.set(0, -0.2, 0);
  group.add(i0Label);

  const i1Label = createTextSprite('i1', hexCss(TYPE_FAMILY));
  i1Label.position.set(1, -0.2, 0);
  group.add(i1Label);

  // Center the group so the interval is symmetric about the origin
  group.position.set(-0.5, 0, 0);

  return group;
}
