import * as THREE from 'three';

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
  // Use a vertex-colored line to show the gradient from blue → red
  const lineGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array([0, 0, 0, 1, 0, 0]);
  const colors = new Float32Array([
    0.2, 0.4, 1.0, // blue  at i0
    1.0, 0.3, 0.2, // red   at i1
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

  // i0 endpoint (blue) at origin
  const i0Material = new THREE.MeshStandardMaterial({
    color: 0x3366ff,
    emissive: 0x1133aa,
    roughness: 0.3,
    metalness: 0.6,
  });
  const i0Sphere = new THREE.Mesh(sphereGeometry, i0Material);
  i0Sphere.position.set(0, 0, 0);
  group.add(i0Sphere);

  // i1 endpoint (red) at (1,0,0)
  const i1Material = new THREE.MeshStandardMaterial({
    color: 0xff4433,
    emissive: 0xaa1100,
    roughness: 0.3,
    metalness: 0.6,
  });
  const i1Sphere = new THREE.Mesh(sphereGeometry, i1Material);
  i1Sphere.position.set(1, 0, 0);
  group.add(i1Sphere);

  // -- Text labels --
  const i0Label = createTextSprite('i0', '#6699ff');
  i0Label.position.set(0, -0.2, 0);
  group.add(i0Label);

  const i1Label = createTextSprite('i1', '#ff6655');
  i1Label.position.set(1, -0.2, 0);
  group.add(i1Label);

  // Center the group so the interval is symmetric about the origin
  group.position.set(-0.5, 0, 0);

  return group;
}
