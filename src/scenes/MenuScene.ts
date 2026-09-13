import Phaser from 'phaser';
import { createDefaultState } from '../models/GameState';
import { Button } from '../components/Button';
import { hasSave, loadGame, getSaveInfo } from '../models/SaveSystem';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // ── Wooden desk background ──
    this.add.rectangle(width / 2, height / 2, width, height, 0x3d2b1f);

    // Wood grain
    for (let i = 0; i < 14; i++) {
      const y = 20 + i * 45;
      this.add.rectangle(width / 2, y, width, 1, 0x4a3525, 0.4);
    }

    // ── Center paper (title card) ──
    const paperW = 400;
    const paperH = 320;
    const paperX = width / 2;
    const paperY = height / 2 - 30;

    // Shadow
    this.add.rectangle(paperX + 4, paperY + 4, paperW, paperH, 0x000000, 0.35);
    // Paper
    this.add.rectangle(paperX, paperY, paperW, paperH, 0xf5f0e8);
    this.add.rectangle(paperX, paperY, paperW, paperH).setStrokeStyle(2, 0xc9b99a);

    // Title
    const title = this.add.text(paperX, paperY - 100, 'TOXITY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '42px',
      color: '#ff6b6b',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(paperX, paperY - 55, 'RPG', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#5a3e1b',
    });
    subtitle.setOrigin(0.5);

    // Separator
    this.add.rectangle(paperX, paperY - 30, 300, 1, 0xccc0b0);

    // Flavor text
    this.add.text(paperX, paperY - 10, 'Reina Falsa Simulator', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#8a7a6a',
    }).setOrigin(0.5);

    // ── New Game button ──
    const newGameBtn = new Button(
      this,
      paperX,
      paperY + 50,
      'Nueva Partida',
      260,
      50,
      0x6c63ff,
      '13px',
    );

    newGameBtn.on('pointerdown', () => {
      const state = createDefaultState();
      this.registry.set('gameState', state);
      this.scene.start('WorldScene');
    });

    // ── Continue button (only if save exists) ──
    if (hasSave()) {
      const saveInfo = getSaveInfo();
      const label = saveInfo
        ? `Continuar (Sem ${saveInfo.week})`
        : 'Continuar';

      const continueBtn = new Button(
        this,
        paperX,
        paperY + 120,
        label,
        260,
        50,
        0x4ecdc4,
        '12px',
      );

      continueBtn.on('pointerdown', () => {
        const state = loadGame();
        if (state) {
          // If game was already over, go to GameOverScene
          if (state.gameOver && state.victory) {
            this.scene.start('GameOverScene', { victoryType: state.victory });
            return;
          }
          this.registry.set('gameState', state);
          this.scene.start('WorldScene');
        } else {
          // Save corrupted, start fresh
          const fresh = createDefaultState();
          this.registry.set('gameState', fresh);
          this.scene.start('WorldScene');
        }
      });
    }

    // ── Bottom tag ──
    this.add.text(paperX, paperY + paperH / 2 - 20, 'v1.0 — Phaser + TypeScript', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#aaa090',
    }).setOrigin(0.5);
  }
}
