import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 30, 'Cargando...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);

    // Loading bar background
    const barBg = this.add.rectangle(width / 2, height / 2 + 20, 300, 20, 0x333355);
    barBg.setOrigin(0.5);

    // Loading bar fill
    const barFill = this.add.rectangle(
      width / 2 - 150,
      height / 2 + 20,
      0,
      16,
      0x6c63ff
    );
    barFill.setOrigin(0, 0.5);

    // Simulate loading with a tween
    this.tweens.add({
      targets: barFill,
      width: 300,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start('PreloadScene');
      },
    });
  }
}
