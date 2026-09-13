import Phaser from 'phaser';

/**
 * Shared visual theme for Toxity: a warm "desk with papers and sticky notes"
 * aesthetic (inspired by "That's Not My Neighbor"), rendered cheaply on the
 * canvas renderer with flat fills, alpha layering and offset drop shadows.
 */

export const COLORS = {
  deskBrown: 0x6b4a2f,
  deskBrownDark: 0x4a3220,
  deskGrain: 0x7d5a3c,
  paper: 0xf7f1e3,
  paperEdge: 0xd9c9a8,
  stickyYellow: 0xfff3a0,
  stickyPink: 0xffd3dd,
  stickyBlue: 0xcfe3ff,
  stickyGreen: 0xd4f2d0,
  ink: 0x3d2a16,
  accentPink: 0xff69b4,
  accentPurple: 0x6c63ff,
  accentTeal: 0x2ec4b6,
  danger: 0xe0564f,
  white: 0xffffff,
} as const;

export const FONTS = {
  /** Pixel font — headings/titles only, minimum 10px. */
  TITLE: '"Press Start 2P", monospace',
  /** Rounded humanist font — all body text, 11–15px. */
  BODY: '"Nunito", "Segoe UI", Roboto, sans-serif',
} as const;

export const INK = '#3d2a16';

export interface LabelOptions {
  fontSize?: number;
  color?: string;
  wrapWidth?: number;
  align?: Phaser.Types.GameObjects.Text.TextStyle['align'];
  bold?: boolean;
}

/**
 * Body-font text with sensible defaults (13px, ink color).
 */
export function addLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  options: LabelOptions = {},
): Phaser.GameObjects.Text {
  const style: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: FONTS.BODY,
    fontSize: `${options.fontSize ?? 13}px`,
    color: options.color ?? INK,
    fontStyle: options.bold ? 'bold' : undefined,
    align: options.align,
  };
  if (options.wrapWidth) {
    style.wordWrap = { width: options.wrapWidth };
  }
  return scene.add.text(x, y, text, style);
}

/**
 * Procedural warm wood desk filling the whole viewport:
 * two overlapping base tones, scattered low-alpha grain lines and a cheap
 * top/bottom vignette. No gradients — layered rects only.
 */
export function addDesk(scene: Phaser.Scene, w: number, h: number): void {
  // Base (two overlapping tones for subtle texture)
  scene.add.rectangle(w / 2, h / 2, w, h, COLORS.deskBrown);
  scene.add.rectangle(w / 2, h / 2, w, h, COLORS.deskBrownDark).setAlpha(0.45);

  // Grain lines (light and dark, low alpha)
  for (let i = 0; i < 18; i++) {
    const y = 10 + i * (h / 18);
    if (i % 3 === 0) {
      scene.add.rectangle(w / 2 - w * 0.08, y, w * 0.84, 1, COLORS.deskGrain).setAlpha(0.1);
    } else if (i % 3 === 1) {
      scene.add.rectangle(w / 2 + w * 0.04, y, w * 0.7, 1, 0x000000).setAlpha(0.07);
    } else {
      scene.add.rectangle(w / 2, y, w * 0.9, 1, COLORS.deskGrain).setAlpha(0.08);
    }
  }

  // Vignette (dark rects top/bottom)
  scene.add.rectangle(w / 2, 0, w, h * 0.1, 0x000000).setAlpha(0.14);
  scene.add.rectangle(w / 2, h, w, h * 0.08, 0x000000).setAlpha(0.12);
}

export interface PaperOptions {
  title?: string;
  tint?: number;
}

/**
 * Cream paper sheet with drop shadow and paperEdge border.
 * Container is centered at (x, y). Optional bold body-font title at the top.
 */
export function addPaper(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  options: PaperOptions = {},
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);

  const shadow = scene.add.rectangle(4, 4, w, h, 0x000000).setOrigin(0.5).setAlpha(0.25);
  const paper = scene.add.rectangle(0, 0, w, h, options.tint ?? COLORS.paper).setOrigin(0.5);
  paper.setStrokeStyle(1, COLORS.paperEdge);

  container.add([shadow, paper]);

  if (options.title) {
    const title = addLabel(scene, 0, -h / 2 + 18, options.title, {
      fontSize: 14,
      bold: true,
      align: 'center',
      wrapWidth: w - 24,
    });
    title.setOrigin(0.5);
    container.add(title);
  }

  scene.add.existing(container);
  return container;
}

export interface StickyOptions {
  text?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  /** Rotation in degrees (-2..2 typical). */
  rotation?: number;
  /** Small pin dot at the top-center. Default true. */
  pin?: boolean;
}

/**
 * Sticky note with shadow, colored body, optional centered text, optional
 * light rotation and an optional pin detail.
 */
export function addSticky(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  options: StickyOptions = {},
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);

  const shadow = scene.add.rectangle(3, 3, w, h, 0x000000).setOrigin(0.5).setAlpha(0.22);
  const note = scene.add.rectangle(0, 0, w, h, color).setOrigin(0.5);
  note.setStrokeStyle(1, 0x000000, 0.12);

  container.add([shadow, note]);

  if (options.text !== undefined) {
    const label = addLabel(scene, 0, 0, options.text, {
      fontSize: options.fontSize ?? 14,
      color: options.color ?? INK,
      bold: options.bold ?? true,
      align: 'center',
    });
    label.setOrigin(0.5);
    container.add(label);
  }

  if (options.pin ?? true) {
    const pin = scene.add.circle(0, -h / 2 + 8, 4, 0x000000).setAlpha(0.3);
    container.add(pin);
  }

  const rotation = options.rotation ?? 0;
  if (rotation !== 0) {
    container.setRotation((rotation * Math.PI) / 180);
  }

  scene.add.existing(container);
  return container;
}

/**
 * Wooden photo frame: shadow, brown frame (size + 8), cream inner (size) and
 * an optional photo texture displayed at size - 10 (centered at x, y).
 */
export function photoFrame(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
  textureKey?: string,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);

  const shadow = scene.add.rectangle(4, 4, size + 8, size + 8, 0x000000).setOrigin(0.5).setAlpha(0.25);
  const frame = scene.add.rectangle(0, 0, size + 8, size + 8, 0x8a5a34).setOrigin(0.5);
  frame.setStrokeStyle(1, 0x5a3a1e);
  const inner = scene.add.rectangle(0, 0, size, size, COLORS.paper).setOrigin(0.5);

  container.add([shadow, frame, inner]);

  if (textureKey && scene.textures.exists(textureKey)) {
    const photo = scene.add.image(0, 0, textureKey).setOrigin(0.5).setDisplaySize(size - 10, size - 10);
    container.add(photo);
  }

  scene.add.existing(container);
  return container;
}