import Phaser from 'phaser';
import { FONTS } from '../theme';

function lighten(color: number, amount: number): number {
  const r = Math.min(255, ((color >> 16) & 0xff) + amount);
  const g = Math.min(255, ((color >> 8) & 0xff) + amount);
  const b = Math.min(255, (color & 0xff) + amount);
  return (r << 16) | (g << 8) | b;
}

function isLightColor(color: number): boolean {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/**
 * Reusable button component: two-tone layered rectangle + BODY font label +
 * interactive zone. Emits 'pointerdown' event when clicked.
 */
export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private zone: Phaser.GameObjects.Zone;
  private baseColor: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    width: number = 200,
    height: number = 50,
    bgColor: number = 0x6c63ff,
    fontSize: string = '13px',
  ) {
    super(scene, x, y);
    this.baseColor = bgColor;

    // Drop shadow
    const shadow = scene.add.rectangle(2, 3, width, height, 0x000000).setOrigin(0.5).setAlpha(0.25);

    // Base fill + border
    this.bg = scene.add.rectangle(0, 0, width, height, bgColor).setOrigin(0.5);
    this.bg.setStrokeStyle(1, 0x000000, 0.22);

    // Two-tone layering: lighter top band + darker bottom band
    const topBand = scene.add.rectangle(0, -height * 0.22, width - 4, height * 0.42, 0xffffff)
      .setOrigin(0.5).setAlpha(0.14);
    const bottomBand = scene.add.rectangle(0, height * 0.36, width - 4, height * 0.22, 0x000000)
      .setOrigin(0.5).setAlpha(0.12);

    this.label = scene.add.text(0, 0, text, {
      fontFamily: FONTS.BODY,
      fontSize,
      fontStyle: 'bold',
      color: isLightColor(bgColor) ? '#3d2a16' : '#ffffff',
      wordWrap: { width: width - 20 },
      align: 'center',
    });
    this.label.setOrigin(0.5);

    this.zone = scene.add.zone(0, 0, width, height);
    this.zone.setInteractive({ useHandCursor: true });

    this.zone.on('pointerover', () => this.setHover(true));
    this.zone.on('pointerout', () => this.setHover(false));
    this.zone.on('pointerdown', () => {
      this.scene.tweens.add({ targets: this, scaleX: 0.97, scaleY: 0.97, duration: 60 });
      scene.input.once('pointerup', () => {
        this.scene.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 60 });
        this.emit('pointerdown');
      });
    });

    this.add([shadow, this.bg, topBand, bottomBand, this.label, this.zone]);
    scene.add.existing(this);
  }

  private setHover(hover: boolean): void {
    this.bg.setFillStyle(hover ? lighten(this.baseColor, 24) : this.baseColor);
  }

  setLabel(text: string): this {
    this.label.setText(text);
    return this;
  }

  setBgColor(color: number): this {
    this.baseColor = color;
    this.bg.setFillStyle(color);
    return this;
  }

  destroy(fromScene?: boolean): void {
    this.zone.removeAllListeners();
    super.destroy(fromScene);
  }
}