import Phaser from 'phaser';
import type { GameState } from '../types/game';
import { getDayName, formatMoney } from '../utils/text';
import { FONTS, COLORS } from '../theme';

export class HUDScene extends Phaser.Scene {
  private weekText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private moodText!: Phaser.GameObjects.Text;
  private moodBar!: Phaser.GameObjects.Rectangle;
  private moodBarBg!: Phaser.GameObjects.Rectangle;
  private moodBarGlow!: Phaser.GameObjects.Rectangle;
  private partnerText!: Phaser.GameObjects.Text;
  private partnerBar!: Phaser.GameObjects.Rectangle;
  private partnerBarBg!: Phaser.GameObjects.Rectangle;
  private partnerBarGlow!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    const { width } = this.cameras.main;

    // HUD background bar — thin, semi-transparent dark ink, at very top
    this.add.rectangle(width / 2, 12, width, 24, 0x1a1008).setAlpha(0.88);
    this.add.rectangle(width / 2, 12, width, 24).setStrokeStyle(1, COLORS.paperEdge, 0.25);

    // Week + Day
    this.weekText = this.add.text(10, 5, 'Sem 1', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
    });

    this.dayText = this.add.text(80, 5, 'Lun', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
    });

    // Money
    this.moneyText = this.add.text(140, 5, '$100', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#8de8dc',
    });

    // Mood
    this.moodText = this.add.text(220, 5, 'Ánimo', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#ffffff',
    });

    this.moodBarBg = this.add.rectangle(270, 10, 60, 8, 0x0a0503);
    this.moodBarBg.setOrigin(0, 0.5);
    this.moodBarBg.setAlpha(0.6);
    this.moodBarBg.setStrokeStyle(1, COLORS.paperEdge, 0.35);
    this.moodBar = this.add.rectangle(270, 10, 60, 6, COLORS.accentTeal);
    this.moodBar.setOrigin(0, 0.5);
    this.moodBarGlow = this.add.rectangle(270, 8, 60, 2, 0xffffff).setOrigin(0, 0.5).setAlpha(0.25);

    // Partner
    this.partnerText = this.add.text(370, 5, '', {
      fontFamily: FONTS.BODY,
      fontSize: '10px',
      color: '#ffb0d4',
    });

    this.partnerBarBg = this.add.rectangle(470, 10, 60, 8, 0x0a0503);
    this.partnerBarBg.setOrigin(0, 0.5);
    this.partnerBarBg.setAlpha(0.6);
    this.partnerBarBg.setStrokeStyle(1, COLORS.paperEdge, 0.35);
    this.partnerBar = this.add.rectangle(470, 10, 60, 6, COLORS.accentPink);
    this.partnerBar.setOrigin(0, 0.5);
    this.partnerBarGlow = this.add.rectangle(470, 8, 60, 2, 0xffffff).setOrigin(0, 0.5).setAlpha(0.25);

    // Listen for updates
    this.events.on('hud-update', () => this.refresh());

    // Initial refresh
    this.refresh();
  }

  refresh(): void {
    const state = this.registry.get('gameState') as GameState | null;
    if (!state) return;

    this.weekText.setText(`Sem ${state.week}`);
    this.dayText.setText(getDayName(state.day));
    this.moneyText.setText(formatMoney(state.money));

    // Mood bar
    const moodPct = state.mood / 100;
    this.moodBar.width = Math.max(0, 60 * moodPct);
    this.moodBarGlow.width = this.moodBar.width;
    if (moodPct > 0.6) this.moodBar.setFillStyle(COLORS.accentTeal);
    else if (moodPct > 0.3) this.moodBar.setFillStyle(0xffaa00);
    else this.moodBar.setFillStyle(COLORS.danger);

    // Partner bar
    if (state.partner) {
      const rel = state.relations.find(r => r.id === state.partner);
      if (rel) {
        this.partnerText.setText(rel.name);
        const hpPct = rel.healthPoints / 100;
        this.partnerBar.width = Math.max(0, 60 * hpPct);
        this.partnerBarGlow.width = this.partnerBar.width;
        this.partnerBarBg.setVisible(true);
        this.partnerBar.setVisible(true);
        this.partnerBarGlow.setVisible(true);
        this.partnerText.setVisible(true);
        return;
      }
    }
    this.partnerText.setText('');
    this.partnerBarBg.setVisible(false);
    this.partnerBar.setVisible(false);
    this.partnerBarGlow.setVisible(false);
  }
}