import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // ── Dark retro background ──
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    // Scanline effect
    for (let i = 0; i < height; i += 3) {
      this.add.rectangle(width / 2, i, width, 1, 0x000000, 0.15);
    }

    // ── CRT vignette corners ──
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.0);

    // ── Pixel art border ──
    const borderW = 420;
    const borderH = 280;
    const borderX = width / 2;
    const borderY = height / 2;

    this.add.rectangle(borderX, borderY, borderW, borderH, 0x1a1a3a);
    this.add.rectangle(borderX, borderY, borderW - 4, borderH - 4, 0x0a0a2a);

    // Inner glow
    this.add.rectangle(borderX, borderY, borderW - 8, borderH - 8).setStrokeStyle(1, 0x3333aa);

    // ── Title ──
    const titleText = this.add.text(borderX, borderY - 80, 'TOXITY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '36px',
      color: '#ff6b6b',
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
    const loadingText = this.add.text(borderX, borderY - 30, 'INICIALIZANDO SISTEMAS...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#4ecdc4',
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

    // ── Loading bar background (retro style) ──
    const barW = 300;
    const barH = 20;
    const barX = borderX - barW / 2;
    const barY = borderY + 10;

    // Outer border
    this.add.rectangle(borderX, barY, barW + 4, barH + 4, 0x333366);

    // Bar background
    this.add.rectangle(borderX, barY, barW, barH, 0x111133);

    // Bar fill (animated)
    const barFill = this.add.rectangle(barX, barY, 0, barH - 4, 0x6c63ff);
    barFill.setOrigin(0, 0.5);

    // ── Percentage text ──
    const pctText = this.add.text(borderX, barY, '0%', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff',
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
    this.add.text(borderX, borderY + 100, 'v1.0 — Phaser + TypeScript', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#444466',
    }).setOrigin(0.5);

    // ── Bottom credit ──
    this.add.text(borderX, height - 20, 'Gentle AI × Toxity', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#333355',
    }).setOrigin(0.5);
  }
}
