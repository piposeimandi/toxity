import Phaser from 'phaser';

export class WeekEndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WeekEndScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x2a2a1a);

    const label = this.add.text(width / 2, height / 2, 'WeekEndScene', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffaa00',
    });
    label.setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }
}
