import Phaser from 'phaser';

export class PhoneScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PhoneScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a3a);

    const label = this.add.text(width / 2, height / 2, 'PhoneScene', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#00ccff',
    });
    label.setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }
}
