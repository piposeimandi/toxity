import Phaser from 'phaser';

export class LocationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LocationScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x2a1a1a);

    const label = this.add.text(width / 2, height / 2, 'LocationScene', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ff6b6b',
    });
    label.setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }
}
