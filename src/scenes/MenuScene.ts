import Phaser from 'phaser';
import { createDefaultState } from '../models/GameState';
import { Button } from '../components/Button';
import { hasSave, loadGame, getSaveInfo } from '../models/SaveSystem';
import { addDesk, addPaper, addSticky, addLabel, COLORS, FONTS } from '../theme';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // ── Wooden desk background ──
    addDesk(this, width, height);

    // ── Sticky notes scattered on desk ──
    // Note 1: Top left
    addSticky(this, 120, 80, 140, 100, COLORS.stickyYellow, {
      text: '☕ Café\n💕 Citas\n📱 Teléfono',
      fontSize: 13,
      rotation: -3,
    });

    // Note 2: Top right
    addSticky(this, 680, 90, 130, 90, COLORS.stickyPink, {
      text: '🏋️ Gym\n💪 Stats\n📈 Nivel',
      fontSize: 13,
      rotation: 2,
    });

    // Note 3: Bottom left
    addSticky(this, 100, 420, 120, 80, COLORS.stickyBlue, {
      text: '🌳 Parque\n🍺 Bar\n🌙 Noche',
      fontSize: 13,
      rotation: -1,
    });

    // ── Center paper (title card) ──
    const paperW = 360;
    const paperH = 280;
    const paperX = width / 2;
    const paperY = height / 2;

    addPaper(this, paperX, paperY, paperW, paperH, { tint: 0xf5f0e8 });

    // Title
    const title = this.add.text(paperX, paperY - 90, 'TOXITY', {
      fontFamily: FONTS.TITLE,
      fontSize: '38px',
      color: '#ff69b4',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(paperX, paperY - 50, 'RPG', {
      fontFamily: FONTS.TITLE,
      fontSize: '12px',
      color: '#3d2a16',
    });
    subtitle.setOrigin(0.5);

    // Separator
    this.add.rectangle(paperX, paperY - 30, 260, 1, COLORS.paperEdge);

    // Flavor text
    addLabel(this, paperX, paperY - 12, 'Reina Falsa Simulator', {
      fontSize: 13,
      color: '#8a7a6a',
      align: 'center',
    }).setOrigin(0.5);

    // ── New Game button ──
    const newGameBtn = new Button(
      this,
      paperX,
      paperY + 40,
      'Nueva Partida',
      240,
      46,
      COLORS.accentPurple,
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
        paperY + 100,
        label,
        240,
        46,
        COLORS.accentTeal,
        '13px',
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
    addLabel(this, paperX, paperY + paperH / 2 - 16, 'v1.0 — Phaser + TypeScript', {
      fontSize: 12,
      color: '#8a7a6a',
      align: 'center',
    }).setOrigin(0.5);
  }
}