import Phaser from 'phaser';
import { addDesk, addPaper, addLabel, COLORS, FONTS } from '../theme';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // ── Warm desk background ──
    addDesk(this, width, height);

    // ── Paper card with the boot panel ──
    const borderW = 420;
    const borderH = 280;
    const borderX = width / 2;
    const borderY = height / 2;

    addPaper(this, borderX, borderY, borderW, borderH);

    // ── Title ──
    const titleText = this.add.text(borderX, borderY - 80, 'TOXITY', {
      fontFamily: FONTS.TITLE,
      fontSize: '34px',
      color: '#ff69b4',
    });
    titleText.setOrigin(0.5);

    // Glow effect on title
    this.tweens.add({
      targets: titleText,
      alpha: { from: 0.7, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // ── Loading text ──
    const loadingText = addLabel(this, borderX, borderY - 30, 'INICIALIZANDO SISTEMAS...', {
      fontSize: 14,
      bold: true,
      align: 'center',
    });
    loadingText.setOrigin(0.5);

    // Blinking dots
    let dotCount = 0;
    this.time.addEvent({
      delay: 300,
      repeat: 9,
      callback: () => {
        dotCount = (dotCount + 1) % 4;
        loadingText.setText('INICIALIZANDO SISTEMAS' + '.'.repeat(dotCount));
      },
    });

    // ── Loading bar ──
    const barW = 300;
    const barH = 20;
    const barX = borderX - barW / 2;
    const barY = borderY + 10;

    // Outer border
    this.add.rectangle(borderX, barY, barW + 4, barH + 4, COLORS.paperEdge);

    // Bar background
    this.add.rectangle(borderX, barY, barW, barH, 0x000000).setAlpha(0.08);

    // Bar fill (animated)
    const barFill = this.add.rectangle(barX, barY, 0, barH - 4, COLORS.accentPurple);
    barFill.setOrigin(0, 0.5);

    // ── Percentage text ──
    const pctText = addLabel(this, borderX, barY, '0%', {
      fontSize: 13,
      bold: true,
      align: 'center',
    });
    pctText.setOrigin(0.5);

    // ── Animate loading bar ──
    this.tweens.add({
      targets: barFill,
      width: barW - 4,
      duration: 1200,
      ease: 'Power2',
      onUpdate: () => {
        const pct = Math.round((barFill.width / (barW - 4)) * 100);
        pctText.setText(`${pct}%`);
      },
      onComplete: () => {
        pctText.setText('100%');
        this.time.delayedCall(200, () => {
          this.scene.start('PreloadScene');
        });
      },
    });

    // ── Version text ──
    addLabel(this, borderX, borderY + 100, 'v1.0 — Phaser + TypeScript', {
      fontSize: 12,
      color: '#8a7a6a',
      align: 'center',
    }).setOrigin(0.5);

    // ── Bottom credit ──
    addLabel(this, borderX, height - 20, 'Gentle AI × Toxity', {
      fontSize: 12,
      color: '#8a7a6a',
      align: 'center',
    }).setOrigin(0.5);
  }
}