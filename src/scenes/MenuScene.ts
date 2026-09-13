import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Title
    const title = this.add.text(width / 2, height / 2 - 100, 'TOXITY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: '#ff6b6b',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 2 - 50, 'RPG', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
    });
    subtitle.setOrigin(0.5);

    // New Game button
    const newGameBtn = this.add.rectangle(
      width / 2,
      height / 2 + 40,
      260,
      50,
      0x6c63ff
    );
    newGameBtn.setInteractive({ useHandCursor: true });

    const newGameText = this.add.text(width / 2, height / 2 + 40, 'Nueva Partida', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    });
    newGameText.setOrigin(0.5);

    newGameBtn.on('pointerover', () => newGameBtn.setFillStyle(0x8b83ff));
    newGameBtn.on('pointerout', () => newGameBtn.setFillStyle(0x6c63ff));
    newGameBtn.on('pointerdown', () => {
      // TODO: Initialize GameState in Phase 1
      this.scene.start('WorldScene');
    });

    // TODO: Continue button — show only if save exists (Phase 3)
    // const hasSave = localStorage.getItem('reinaFalsaSave');
    // if (hasSave) { ... }
  }
}
