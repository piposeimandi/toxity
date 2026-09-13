import Phaser from 'phaser';

/**
 * Reusable button component: colored rectangle + text + interactive zone.
 * Emits 'pointerdown' event when clicked.
 */
export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private zone: Phaser.GameObjects.Zone;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    width: number = 200,
    height: number = 50,
    bgColor: number = 0x6c63ff,
    fontSize: string = '12px',
  ) {
    super(scene, x, y);

    this.bg = scene.add.rectangle(0, 0, width, height, bgColor);
    this.bg.setOrigin(0.5);

    this.label = scene.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize,
      color: '#ffffff',
      wordWrap: { width: width - 20 },
      align: 'center',
    });
    this.label.setOrigin(0.5);

    this.zone = scene.add.zone(0, 0, width, height);
    this.zone.setInteractive({ useHandCursor: true });

    this.zone.on('pointerover', () => this.bg.setFillStyle(bgColor + 0x1f1f1f));
    this.zone.on('pointerout', () => this.bg.setFillStyle(bgColor));
    this.zone.on('pointerdown', () => {
      scene.input.once('pointerup', () => {
        this.emit('pointerdown');
      });
    });

    this.add([this.bg, this.label, this.zone]);
    scene.add.existing(this);
  }

  setLabel(text: string): this {
    this.label.setText(text);
    return this;
  }

  setBgColor(color: number): this {
    this.bg.setFillStyle(color);
    return this;
  }

  destroy(fromScene?: boolean): void {
    this.zone.removeAllListeners();
    super.destroy(fromScene);
  }
}
