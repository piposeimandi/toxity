import Phaser from 'phaser';
import type { GameState } from '../types/game';
import type { Candidate, Location } from '../types/data';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { clamp, pick } from '../utils/math';
import { Button } from '../components/Button';
import { renderQueenPortrait } from '../components/QueenPortrait';
import { addDesk, photoFrame, COLORS, FONTS } from '../theme';

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

    // ── Background ──
    addDesk(this, width, height);

    // ── Swipe card ──
    const cardW = 280;
    const cardH = 400;
    const cardX = width / 2;
    const cardY = height / 2 - 20;

    const card = this.add.container(cardX, cardY);

    // Card shadow
    card.add(this.add.rectangle(6, 6, cardW, cardH, 0x000000, 0.35).setOrigin(0.5));

    // Card base (cream paper)
    const cardBg = this.add.rectangle(0, 0, cardW, cardH, COLORS.paper).setOrigin(0.5);
    cardBg.setStrokeStyle(2, COLORS.paperEdge);
    card.add(cardBg);

    // ── Photo area (wooden frame) ──
    const photoH = 160;
    const photoY = -100;

    // Frame + real photo (fallback: initial letter)
    const photoKey = this.dataService.getPhotoKey(this.candidate);
    const hasPhoto = photoKey !== null && this.textures.exists(photoKey);
    card.add(photoFrame(this, 0, photoY, photoH, hasPhoto ? photoKey : undefined));
    if (!hasPhoto) {
      card.add(this.add.text(0, photoY, this.candidate.name.charAt(0), {
        fontFamily: FONTS.BODY,
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#c2257e',
      }).setOrigin(0.5));
    }

    // ── Name ──
    card.add(this.add.text(0, photoY + photoH / 2 + 20, this.candidate.name, {
      fontFamily: FONTS.BODY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#3d2a16',
    }).setOrigin(0.5));

    // ── Traits ──
    card.add(this.add.text(0, photoY + photoH / 2 + 44, this.candidate.traits, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#6b5b42',
      wordWrap: { width: cardW - 40 },
      align: 'center',
    }).setOrigin(0.5));

    // ── Stats row ──
    const statsY = photoY + photoH / 2 + 72;
    const statsIcons = ['⭑', '📍', '🎭'];
    const statsLabels = [
      this.candidate.appeal != null ? `${this.candidate.appeal}` : '?',
      this.loc.name,
      this.candidate.personality,
    ];
    for (let i = 0; i < 3; i++) {
      const sx = -70 + i * 70;
      card.add(this.add.text(sx, statsY, statsIcons[i], { fontSize: '12px' }).setOrigin(0.5));
      card.add(this.add.text(sx, statsY + 16, statsLabels[i], {
        fontFamily: FONTS.BODY,
        fontSize: '10px',
        color: '#7a5c3a',
        wordWrap: { width: 66 },
        align: 'center',
      }).setOrigin(0.5));
    }

    // ── Location info ──
    card.add(this.add.text(0, statsY + 36, `${this.loc.icon} ${this.loc.name}`, {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#996a00',
    }).setOrigin(0.5));

    // ── Action buttons ──
    const btnY = height - 60;

    // ❌ RECHAZAR
    const rejectBtn = new Button(this, cardX - 75, btnY, '❌ NOPE', 100, 44, COLORS.danger, '13px');
    rejectBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: card, x: cardX - 500, angle: -25, alpha: 0,
        duration: 350, ease: 'Quad.easeIn',
        onComplete: () => this.resolveDate(-10, 0),
      });
    });

    // 💘 SALIR
    const acceptBtn = new Button(this, cardX + 75, btnY, '💘 LIKE', 100, 44, 0xd4a017, '13px');
    acceptBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: card, x: cardX + 500, angle: 25, alpha: 0,
        duration: 350, ease: 'Quad.easeIn',
        onComplete: () => this.showDialogueOptions(width, height),
      });
    });

    // Store refs
    this.data.set('card', card);
    this.data.set('rejectBtn', rejectBtn);
    this.data.set('acceptBtn', acceptBtn);
  }

  private showDialogueOptions(width: number, height: number): void {
    const rejectBtn = this.data.get('rejectBtn') as Phaser.GameObjects.Container;
    const acceptBtn = this.data.get('acceptBtn') as Phaser.GameObjects.Container;
    if (rejectBtn) rejectBtn.destroy();
    if (acceptBtn) acceptBtn.destroy();

    const options = this.dataService.dialogueOptions.filter(opt => {
      if (opt.moodCost > 0 && this.state.mood < 30) return false;
      return true;
    }).slice(0, 6);

    const startY = height - 240;
    options.forEach((opt, i) => {
      const y = startY + i * 36;
      const canAfford = this.state.mood >= opt.moodCost;
      const btn = new Button(
        this, width / 2, y,
        `${opt.text.substring(0, 48)}${opt.text.length > 48 ? '...' : ''} [${opt.bonus > 0 ? '+' : ''}${opt.bonus}]`,
        680, 30, canAfford ? 0x3a2a5a : 0x222233, '13px',
      );
      if (!canAfford) {
        btn.setAlpha(0.4);
      } else {
        btn.on('pointerdown', () => this.resolveDate(opt.bonus, opt.moodCost));
      }
    });

    new Button(this, width / 2, height - 28, '← Volver', 180, 28, 0x4a3220, '12px')
      .on('pointerdown', () => {
        this.state.day += 1;
        this.state.daysWithoutDates += 1;
        this.registry.set('gameState', this.state);
        this.scene.start('WorldScene');
      });
  }

  private resolveDate(dialogueBonus: number, moodCost: number): void {
    const { width, height } = this.cameras.main;
    this.state.mood = clamp(this.state.mood - moodCost, 0, 100);

    const totalChance = Math.min(95, this.baseChance + dialogueBonus);
    const success = Math.random() * 100 < totalChance;

    let sabotaged = false;
    if (!this.loc.safe && Math.random() < this.getSabotageRisk()) {
      sabotaged = true;
      this.state.mood = clamp(this.state.mood - 15, 0, 100);
      this.state.pg += 1;
    }

    this.children.removeAll();
    addDesk(this, width, height);

    // Dark notice board behind the result
    const plaque = this.add.rectangle(width / 2, height / 2, 560, 460, 0x2a1a12).setAlpha(0.96);
    plaque.setStrokeStyle(2, COLORS.paperEdge);

    if (success) {
      this.showResult(width, height, true, sabotaged);
    } else {
      this.showResult(width, height, false, sabotaged);
    }
  }

  private showResult(width: number, height: number, success: boolean, sabotaged: boolean): void {
    if (success) {
      // Hearts animation
      for (let i = 0; i < 6; i++) {
        const heart = this.add.text(
          100 + Math.random() * (width - 200), height + 20,
          '💗', { fontSize: '18px' },
        );
        this.tweens.add({
          targets: heart, y: -20,
          x: heart.x + (Math.random() - 0.5) * 80,
          alpha: { from: 1, to: 0 },
          duration: 2000 + Math.random() * 1000,
          delay: i * 150,
          onComplete: () => heart.destroy(),
        });
      }

      this.add.text(width / 2, 60, '¡MATCH!', {
        fontFamily: FONTS.TITLE,
        fontSize: '28px',
        color: '#ff69b4',
      }).setOrigin(0.5);

      const texts = this.dataService.successTexts;
      const msg = (texts[this.loc.key]?.[0] ?? 'La cita fue bien.').replace(/{name}/g, this.candidate.name);
      this.add.text(width / 2, 120, msg, {
        fontFamily: FONTS.BODY,
        fontSize: '14px',
        color: '#ffffff',
        wordWrap: { width: 600 },
        align: 'center',
      }).setOrigin(0.5);

      this.state.mood = clamp(this.state.mood + 10, 0, 100);
      this.state.daysWithoutDates = 0;
      this.state.labia = clamp(this.state.labia + 2, 0, 100);
    } else {
      this.add.text(width / 2, 80, '💔', { fontSize: '42px' }).setOrigin(0.5);
      this.add.text(width / 2, 140, 'CITA FALLIDA', {
        fontFamily: FONTS.TITLE,
        fontSize: '18px',
        color: '#ff6b6b',
      }).setOrigin(0.5);

      const texts = this.dataService.failTexts;
      const msg = (texts[this.loc.key]?.[0] ?? 'No funcionó...').replace(/{name}/g, this.candidate.name);
      this.add.text(width / 2, 200, msg, {
        fontFamily: FONTS.BODY,
        fontSize: '14px',
        color: '#ffffff',
        wordWrap: { width: 600 },
        align: 'center',
      }).setOrigin(0.5);

      this.state.mood = clamp(this.state.mood - 5, 0, 100);
    }

    // Sabotage
    if (sabotaged) {
      renderQueenPortrait(this, width / 2, 280, 60);

      this.add.text(width / 2, 330, '⚠ SABOTAJE DE LA REINA', {
        fontFamily: FONTS.BODY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ff6b6b',
      }).setOrigin(0.5);

      const sabotageMsg = pick(this.dataService.sabotageMessages);
      this.add.text(width / 2, 355, sabotageMsg, {
        fontFamily: FONTS.BODY,
        fontSize: '12px',
        color: '#ffb0b0',
        wordWrap: { width: 500 },
        align: 'center',
      }).setOrigin(0.5);
    }

    // Log
    this.state.dateLog.push({
      week: this.state.week,
      candidate: this.candidate.name,
      location: this.loc.key,
      success,
    });

    this.state.day += 1;
    this.registry.set('gameState', this.state);

    new Button(this, width / 2, height - 50, 'Continuar', 180, 36, COLORS.accentPurple, '13px')
      .on('pointerdown', () => {
        if (this.state.day > 7) {
          this.scene.start('WeekEndScene');
          return;
        }
        this.scene.start('WorldScene');
      });
  }

  private getSabotageRisk(): number {
    const riskMap: Record<string, number> = { low: 0.15, medium: 0.3, high: 0.5, extreme: 0.7 };
    return riskMap[this.loc.risk] ?? 0.3;
  }
}