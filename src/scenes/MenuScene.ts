import Phaser from 'phaser';
import { createDefaultState } from '../models/GameState';
import { Button } from '../components/Button';

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
    const newGameBtn = new Button(
      this,
      width / 2,
      height / 2 + 40,
      'Nueva Partida',
      260,
      50,
      0x6c63ff,
      '14px',
    );

    newGameBtn.on('pointerdown', () => {
      const state = createDefaultState();
      this.registry.set('gameState', state);
      this.scene.start('WorldScene');
    });

    // Continue button — show only if save exists
    const hasSave = localStorage.getItem('reinaFalsaSave');
    if (hasSave) {
      const continueBtn = new Button(
        this,
        width / 2,
        height / 2 + 110,
        'Continuar',
        260,
        50,
        0x4ecdc4,
        '14px',
      );

      continueBtn.on('pointerdown', () => {
        // Phase 3: Load save. For now, just start new game.
        const state = createDefaultState();
        this.registry.set('gameState', state);
        this.scene.start('WorldScene');
      });
    }
  }
}
