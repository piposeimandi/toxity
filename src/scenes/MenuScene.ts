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

    // ── Sticky notes scattered on desk ──
    // Note 1: Top left
    this.renderStickyNote(120, 80, 140, 100, '☕ Café\n💕 Citas\n📱 Teléfono', 0xfff9b0, -3);

    // Note 2: Top right
    this.renderStickyNote(680, 90, 130, 90, '🏋️ Gym\n💪 Stats\n📈 Nivel', 0xf0e6ff, 2);

    // Note 3: Bottom left
    this.renderStickyNote(100, 420, 120, 80, '🌳 Parque\n🍺 Bar\n🌙 Noche', 0xe6f0ff, -1);

    // ── Center paper (title card) ──
    const paperW = 360;
    const paperH = 280;
    const paperX = width / 2;
    const paperY = height / 2;

    // Shadow
    this.add.rectangle(paperX + 4, paperY + 4, paperW, paperH, 0x000000, 0.35);
    // Paper
    this.add.rectangle(paperX, paperY, paperW, paperH, 0xf5f0e8);
    this.add.rectangle(paperX, paperY, paperW, paperH).setStrokeStyle(2, 0xc9b99a);

    // Title
    const title = this.add.text(paperX, paperY - 90, 'TOXITY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '38px',
      color: '#ff6b6b',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(paperX, paperY - 50, 'RPG', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#5a3e1b',
    });
    subtitle.setOrigin(0.5);

    // Separator
    this.add.rectangle(paperX, paperY - 30, 260, 1, 0xccc0b0);

    // Flavor text
    this.add.text(paperX, paperY - 12, 'Reina Falsa Simulator', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#8a7a6a',
    }).setOrigin(0.5);

    // ── New Game button ──
    const newGameBtn = new Button(
      this,
      paperX,
      paperY + 40,
      'Nueva Partida',
      240,
      46,
      0x6c63ff,
      '12px',
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
        paperY + 100,
        label,
        240,
        46,
        0x4ecdc4,
        '11px',
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
    this.add.text(paperX, paperY + paperH / 2 - 16, 'v1.0 — Phaser + TypeScript', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#aaa090',
    }).setOrigin(0.5);
  }

  private renderStickyNote(
    x: number, y: number, w: number, h: number,
    text: string, color: number, angle: number,
  ): void {
    // Shadow
    this.add.rectangle(x + 3, y + 3, w, h, 0x000000, 0.2);
    // Note
    const note = this.add.rectangle(x, y, w, h, color);
    note.setAngle(angle);
    // Text
    this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#5a3e1b',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);
  }
}
