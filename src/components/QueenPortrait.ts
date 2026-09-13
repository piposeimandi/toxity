import Phaser from 'phaser';

/**
 * Render a Queen portrait as an inline SVG-like drawing.
 * Uses Phaser graphics to draw a stylized queen face.
 */
export function renderQueenPortrait(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const s = size / 100; // scale factor

  // Background circle
  const bg = scene.add.circle(0, 0, 45 * s, 0x2a1a3e);
  bg.setStrokeStyle(3 * s, 0xffd700);
  container.add(bg);

  // Face
  const face = scene.add.circle(0, 5 * s, 30 * s, 0xf5d0a9);
  container.add(face);

  // Hair (dark, styled)
  const hairLeft = scene.add.ellipse(-18 * s, -10 * s, 20 * s, 35 * s, 0x1a0a0a);
  const hairRight = scene.add.ellipse(18 * s, -10 * s, 20 * s, 35 * s, 0x1a0a0a);
  const hairTop = scene.add.ellipse(0, -20 * s, 40 * s, 20 * s, 0x1a0a0a);
  container.add([hairLeft, hairRight, hairTop]);

  // Crown
  const crownY = -32 * s;
  const crown = scene.add.graphics();
  crown.fillStyle(0xffd700, 1);
  crown.beginPath();
  crown.moveTo(-18 * s, crownY + 10 * s);
  crown.lineTo(-12 * s, crownY - 5 * s);
  crown.lineTo(-6 * s, crownY + 5 * s);
  crown.lineTo(0, crownY - 10 * s);
  crown.lineTo(6 * s, crownY + 5 * s);
  crown.lineTo(12 * s, crownY - 5 * s);
  crown.lineTo(18 * s, crownY + 10 * s);
  crown.closePath();
  crown.fillPath();
  container.add(crown);

  // Crown jewels
  const jewel1 = scene.add.circle(-6 * s, crownY, 3 * s, 0xff4444);
  const jewel2 = scene.add.circle(0, crownY - 4 * s, 3 * s, 0x4444ff);
  const jewel3 = scene.add.circle(6 * s, crownY, 3 * s, 0x44ff44);
  container.add([jewel1, jewel2, jewel3]);

  // Eyes
  const eyeL = scene.add.ellipse(-10 * s, 2 * s, 8 * s, 5 * s, 0x2a1a2a);
  const eyeR = scene.add.ellipse(10 * s, 2 * s, 8 * s, 5 * s, 0x2a1a2a);
  container.add([eyeL, eyeR]);

  // Eye highlights
  const highlightL = scene.add.circle(-8 * s, 1 * s, 2 * s, 0xffffff);
  const highlightR = scene.add.circle(12 * s, 1 * s, 2 * s, 0xffffff);
  container.add([highlightL, highlightR]);

  // Eyebrows (raised, regal)
  const browL = scene.add.rectangle(-10 * s, -5 * s, 10 * s, 2 * s, 0x1a0a0a);
  browL.setRotation(-0.2);
  const browR = scene.add.rectangle(10 * s, -5 * s, 10 * s, 2 * s, 0x1a0a0a);
  browR.setRotation(0.2);
  container.add([browL, browR]);

  // Nose
  const nose = scene.add.triangle(0, 8 * s, 0, 0, -3 * s, 6 * s, 3 * s, 6 * s, 0xe8c090);
  container.add(nose);

  // Mouth (slight smirk)
  const mouth = scene.add.graphics();
  mouth.lineStyle(2 * s, 0xcc6666);
  mouth.beginPath();
  mouth.moveTo(-8 * s, 15 * s);
  mouth.lineTo(0, 13 * s);
  mouth.lineTo(8 * s, 15 * s);
  mouth.strokePath();
  container.add(mouth);

  // Name label below
  const label = scene.add.text(0, 50 * s, 'LA REINA', {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: `${Math.max(6, 8 * s)}px`,
    color: '#ffd700',
  }).setOrigin(0.5);
  container.add(label);

  return container;
}
