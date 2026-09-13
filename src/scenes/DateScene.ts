import Phaser from 'phaser';
import type { GameState } from '../types/game';
import type { Candidate, Location } from '../types/data';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { clamp, pick } from '../utils/math';
import { Button } from '../components/Button';

export class DateScene extends Phaser.Scene {
  private state!: GameState;
  private dataService!: DataService;
  private candidate!: Candidate;
  private loc!: Location;
  private baseChance: number = 50;

  constructor() {
    super({ key: 'DateScene' });
  }

  create(data: { candidate: Candidate; loc: Location; baseChance: number }): void {
    this.state = this.registry.get('gameState') as GameState;
    this.dataService = new DataService(gameData);
    this.candidate = data.candidate;
    this.loc = data.loc;
    this.baseChance = data.baseChance;

    const { width, height } = this.cameras.main;

    // ── Tinder-style dark gradient background ──
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a1a);
    // Gradient stripes
    for (let i = 0; i < 10; i++) {
      const alpha = 0.08 + i * 0.015;
      this.add.rectangle(width / 2, (i * height) / 10, width, height / 10, 0x2a0a2a, alpha);
    }

    // ── Swipe card ──
    const cardW = 300;
    const cardH = 420;
    const cardX = width / 2;
    const cardY = height / 2 - 10;

    const card = this.add.container(cardX, cardY);

    // Card shadow
    const cardShadow = this.add.rectangle(6, 6, cardW, cardH, 0x000000, 0.4);
    cardShadow.setOrigin(0.5);

    // Card base
    const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x2a2a3e);
    cardBg.setOrigin(0.5);
    cardBg.setStrokeStyle(2, 0x444466);

    // ── Photo placeholder (large) ──
    const photoW = cardW - 40;
    const photoH = 180;
    const photoY = -110;

    this.add.rectangle(0, photoY, photoW, photoH, 0x3a3a5e);
    this.add.rectangle(0, photoY, photoW, photoH).setStrokeStyle(1, 0x555577);

    // Initial letter (big)
    this.add.text(0, photoY, this.candidate.name.charAt(0), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: '#ff69b4',
    }).setOrigin(0.5);

    // "Foto" label
    this.add.text(0, photoY + photoH / 2 - 12, '[ foto ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#6666aa',
    }).setOrigin(0.5);

    // ── Name (large) ──
    this.add.text(0, photoY + photoH / 2 + 24, this.candidate.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // ── Traits ──
    this.add.text(0, photoY + photoH / 2 + 50, this.candidate.traits, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#aaaacc',
      wordWrap: { width: cardW - 40 },
      align: 'center',
    }).setOrigin(0.5);

    // ── Stats row ──
    const statsY = photoY + photoH / 2 + 80;
    const stats = [
      { icon: '🎂', label: '25' },
      { icon: '💼', label: this.loc.name },
      { icon: '🎮', label: 'Gamer' },
    ];

    stats.forEach((stat, i) => {
      const sx = -80 + i * 80;
      this.add.text(sx, statsY, stat.icon, {
        fontSize: '14px',
      }).setOrigin(0.5);
      this.add.text(sx, statsY + 18, stat.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#8888aa',
      }).setOrigin(0.5);
    });

    // Location info
    this.add.text(0, statsY + 40, `${this.loc.icon} ${this.loc.name} — Riesgo: ${this.loc.riskLabel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    card.add([cardShadow, cardBg]);

    // ── Action buttons (bottom) ──
    // ❌ RECHAZAR (red, left)
    const rejectW = 110;
    const rejectH = 50;
    const rejectX = cardX - 80;
    const rejectY = height - 55;

    const rejectBtn = this.add.container(rejectX, rejectY);

    const rejectShadow = this.add.rectangle(3, 3, rejectW, rejectH, 0x000000, 0.3);
    rejectShadow.setOrigin(0.5);
    const rejectBg = this.add.rectangle(0, 0, rejectW, rejectH, 0xcc3333);
    rejectBg.setOrigin(0.5);
    rejectBg.setStrokeStyle(2, 0xff4444);
    const rejectText = this.add.text(0, 0, '❌ RECHAZAR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const rejectZone = this.add.zone(0, 0, rejectW, rejectH);
    rejectZone.setInteractive({ useHandCursor: true });

    rejectZone.on('pointerover', () => {
      this.tweens.add({ targets: rejectBtn, scaleX: 1.08, scaleY: 1.08, duration: 100 });
      rejectBg.setFillStyle(0xdd4444);
    });
    rejectZone.on('pointerout', () => {
      this.tweens.add({ targets: rejectBtn, scaleX: 1, scaleY: 1, duration: 100 });
      rejectBg.setFillStyle(0xcc3333);
    });
    rejectZone.on('pointerdown', () => {
      // Swipe card left animation
      this.tweens.add({
        targets: card,
        x: cardX - 500,
        angle: -25,
        alpha: 0,
        duration: 400,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.resolveDate(-10, 0); // Rejection penalty
        },
      });
    });

    rejectBtn.add([rejectShadow, rejectBg, rejectText, rejectZone]);

    // 💘 SALIR (pink/gold, right)
    const acceptW = 110;
    const acceptH = 50;
    const acceptX = cardX + 80;
    const acceptY = height - 55;

    const acceptBtn = this.add.container(acceptX, acceptY);

    const acceptShadow = this.add.rectangle(3, 3, acceptW, acceptH, 0x000000, 0.3);
    acceptShadow.setOrigin(0.5);
    const acceptBg = this.add.rectangle(0, 0, acceptW, acceptH, 0xd4a017);
    acceptBg.setOrigin(0.5);
    acceptBg.setStrokeStyle(2, 0xffcc00);
    const acceptText = this.add.text(0, 0, '💘 SALIR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const acceptZone = this.add.zone(0, 0, acceptW, acceptH);
    acceptZone.setInteractive({ useHandCursor: true });

    acceptZone.on('pointerover', () => {
      this.tweens.add({ targets: acceptBtn, scaleX: 1.08, scaleY: 1.08, duration: 100 });
      acceptBg.setFillStyle(0xe4b027);
    });
    acceptZone.on('pointerout', () => {
      this.tweens.add({ targets: acceptBtn, scaleX: 1, scaleY: 1, duration: 100 });
      acceptBg.setFillStyle(0xd4a017);
    });
    acceptZone.on('pointerdown', () => {
      // Swipe card right animation
      this.tweens.add({
        targets: card,
        x: cardX + 500,
        angle: 25,
        alpha: 0,
        duration: 400,
        ease: 'Quad.easeIn',
        onComplete: () => {
          // Show dialogue options after swipe
          this.showDialogueOptions(width, height);
        },
      });
    });

    acceptBtn.add([acceptShadow, acceptBg, acceptText, acceptZone]);

    // ── Dialogue options (shown after accept) ──
    // We store references so we can show them later
    this.data.set('card', card);
    this.data.set('cardX', cardX);
    this.data.set('rejectBtn', rejectBtn);
    this.data.set('acceptBtn', acceptBtn);
  }

  private showDialogueOptions(width: number, height: number): void {
    // Hide action buttons
    const rejectBtn = this.data.get('rejectBtn') as Phaser.GameObjects.Container;
    const acceptBtn = this.data.get('acceptBtn') as Phaser.GameObjects.Container;
    if (rejectBtn) rejectBtn.destroy();
    if (acceptBtn) acceptBtn.destroy();

    // Dialogue options
    const options = this.dataService.dialogueOptions.filter(opt => {
      if (opt.moodCost > 0 && this.state.mood < 30) return false;
      return true;
    });

    const displayOptions = options.slice(0, 6);
    const startY = height - 260;
    const spacing = 38;

    displayOptions.forEach((opt, i) => {
      const y = startY + i * spacing;
      const canAfford = this.state.mood >= opt.moodCost;

      const btn = new Button(
        this,
        width / 2,
        y,
        `${opt.text.substring(0, 50)}${opt.text.length > 50 ? '...' : ''} [${opt.bonus > 0 ? '+' : ''}${opt.bonus}]`,
        700,
        32,
        canAfford ? 0x3a2a5a : 0x222233,
        '7px',
      );

      if (!canAfford) {
        btn.setAlpha(0.5);
      } else {
        btn.on('pointerdown', () => {
          this.resolveDate(opt.bonus, opt.moodCost);
        });
      }
    });

    // Back button (skip date)
    const backBtn = new Button(
      this,
      width / 2,
      height - 30,
      '← Volver sin cita',
      200,
      32,
      0x444466,
      '8px',
    );
    backBtn.on('pointerdown', () => {
      this.state.day += 1;
      this.state.daysWithoutDates += 1;
      this.registry.set('gameState', this.state);
      this.scene.start('WorldScene');
    });
  }

  private resolveDate(dialogueBonus: number, moodCost: number): void {
    const { width, height } = this.cameras.main;

    // Apply mood cost
    this.state.mood = clamp(this.state.mood - moodCost, 0, 100);

    // Calculate total chance
    const totalChance = Math.min(95, this.baseChance + dialogueBonus);
    const roll = Math.random() * 100;
    const success = roll < totalChance;

    // Sabotage check (only for non-safe locations)
    let sabotaged = false;
    if (!this.loc.safe && Math.random() < this.getSabotageRisk()) {
      sabotaged = true;
      this.state.mood = clamp(this.state.mood - 15, 0, 100);
      this.state.pg += 1;
    }

    // Clear scene
    this.children.removeAll();

    // ── Result screen ──
    // Dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a1a);

    // Match animation or fail
    if (success) {
      this.showMatchAnimation(width, height, sabotaged);
    } else {
      this.showFailScreen(width, height, sabotaged);
    }
  }

  private showMatchAnimation(width: number, height: number, sabotaged: boolean): void {
    // Big "MATCH!" text
    const matchText = this.add.text(width / 2, 80, '¡MATCH!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ff69b4',
    }).setOrigin(0.5);

    // Pulsing animation
    this.tweens.add({
      targets: matchText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Floating hearts
    for (let i = 0; i < 8; i++) {
      const heart = this.add.text(
        100 + Math.random() * (width - 200),
        height + 30,
        '💗',
        { fontSize: '20px' },
      );
      this.tweens.add({
        targets: heart,
        y: -30,
        x: heart.x + (Math.random() - 0.5) * 100,
        alpha: { from: 1, to: 0 },
        duration: 2000 + Math.random() * 1500,
        delay: i * 200,
        onComplete: () => heart.destroy(),
      });
    }

    if (sabotaged) {
      this.add.text(width / 2, 130, '⚠ SABOTAJE DE LA REINA', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#ff4444',
      }).setOrigin(0.5);

      const sabotageMsg = pick(this.dataService.sabotageMessages);
      this.add.text(width / 2, 160, sabotageMsg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ff8888',
        wordWrap: { width: 600 },
        align: 'center',
      }).setOrigin(0.5);
    }

    // Result text
    const locKey = this.loc.key;
    const texts = this.dataService.successTexts;
    const resultMsg = texts[locKey]?.[0] ?? 'La cita fue bien.';
    const formatted = resultMsg.replace(/{name}/g, this.candidate.name);

    this.add.text(width / 2, 220, formatted, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
      wordWrap: { width: 650 },
      align: 'center',
    }).setOrigin(0.5);

    // Apply effects
    this.state.mood = clamp(this.state.mood + 10, 0, 100);
    this.state.daysWithoutDates = 0;
    this.state.labia = clamp(this.state.labia + 2, 0, 100);

    // Log date
    this.state.dateLog.push({
      week: this.state.week,
      candidate: this.candidate.name,
      location: locKey,
      success: true,
    });

    // Advance day
    this.state.day += 1;
    this.registry.set('gameState', this.state);

    // Continue button
    const backBtn = new Button(
      this,
      width / 2,
      height - 60,
      'Continuar',
      200,
      40,
      0x6c63ff,
      '11px',
    );
    backBtn.on('pointerdown', () => {
      if (this.state.day > 7) {
        this.scene.start('WeekEndScene');
        return;
      }
      this.scene.start('WorldScene');
    });
  }

  private showFailScreen(width: number, height: number, sabotaged: boolean): void {
    // Sad face / X
    this.add.text(width / 2, 100, '💔', {
      fontSize: '48px',
    }).setOrigin(0.5);

    this.add.text(width / 2, 160, 'CITA FALLIDA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ff6b6b',
    }).setOrigin(0.5);

    if (sabotaged) {
      this.add.text(width / 2, 200, '⚠ SABOTAJE DE LA REINA', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#ff4444',
      }).setOrigin(0.5);

      const sabotageMsg = pick(this.dataService.sabotageMessages);
      this.add.text(width / 2, 230, sabotageMsg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ff8888',
        wordWrap: { width: 600 },
        align: 'center',
      }).setOrigin(0.5);
    }

    // Result text
    const locKey = this.loc.key;
    const texts = this.dataService.failTexts;
    const resultMsg = texts[locKey]?.[0] ?? 'No funcionó...';
    const formatted = resultMsg.replace(/{name}/g, this.candidate.name);

    this.add.text(width / 2, 280, formatted, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
      wordWrap: { width: 650 },
      align: 'center',
    }).setOrigin(0.5);

    // Apply effects
    this.state.mood = clamp(this.state.mood - 5, 0, 100);

    // Log date
    this.state.dateLog.push({
      week: this.state.week,
      candidate: this.candidate.name,
      location: locKey,
      success: false,
    });

    // Advance day
    this.state.day += 1;
    this.registry.set('gameState', this.state);

    // Continue button
    const backBtn = new Button(
      this,
      width / 2,
      height - 60,
      'Continuar',
      200,
      40,
      0x6c63ff,
      '11px',
    );
    backBtn.on('pointerdown', () => {
      if (this.state.day > 7) {
        this.scene.start('WeekEndScene');
        return;
      }
      this.scene.start('WorldScene');
    });
  }

  private getSabotageRisk(): number {
    const riskMap: Record<string, number> = {
      low: 0.15,
      medium: 0.3,
      high: 0.5,
      extreme: 0.7,
    };
    return riskMap[this.loc.risk] ?? 0.3;
  }
}
