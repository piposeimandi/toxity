import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x3a1a1a);

    const label = this.add.text(width / 2, height / 2, 'GameOverScene', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ff4444',
    });
    label.setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }
}
