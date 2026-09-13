import Phaser from 'phaser';
import type { GameState } from '../types/game';
import { getDayName, formatMoney } from '../utils/text';

export class HUDScene extends Phaser.Scene {
  private weekText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private moodText!: Phaser.GameObjects.Text;
  private moodBar!: Phaser.GameObjects.Rectangle;
  private moodBarBg!: Phaser.GameObjects.Rectangle;
  private partnerText!: Phaser.GameObjects.Text;
  private partnerBar!: Phaser.GameObjects.Rectangle;
  private partnerBarBg!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    const { width } = this.cameras.main;

    // HUD background bar
    this.add.rectangle(width / 2, 20, width, 40, 0x000000, 0.8);

    // Week + Day
    this.weekText = this.add.text(15, 12, 'Sem 1', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffcc00',
    });

    this.dayText = this.add.text(95, 12, 'Lun', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    });

    // Money
    this.moneyText = this.add.text(185, 12, '$100', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#4ecdc4',
    });

    // Mood
    this.moodText = this.add.text(280, 12, 'Ánimo', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#aaaaaa',
    });

    this.moodBarBg = this.add.rectangle(340, 18, 80, 12, 0x333333);
    this.moodBarBg.setOrigin(0, 0.5);
    this.moodBar = this.add.rectangle(340, 18, 80, 12, 0x4ecdc4);
    this.moodBar.setOrigin(0, 0.5);

    // Partner
    this.partnerText = this.add.text(460, 12, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ff69b4',
    });

    this.partnerBarBg = this.add.rectangle(560, 18, 80, 12, 0x333333);
    this.partnerBarBg.setOrigin(0, 0.5);
    this.partnerBar = this.add.rectangle(560, 18, 80, 12, 0xff69b4);
    this.partnerBar.setOrigin(0, 0.5);

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
    this.moodBar.width = Math.max(0, 80 * moodPct);
    if (moodPct > 0.6) this.moodBar.setFillStyle(0x4ecdc4);
    else if (moodPct > 0.3) this.moodBar.setFillStyle(0xffaa00);
    else this.moodBar.setFillStyle(0xff6b6b);

    // Partner bar
    if (state.partner) {
      const rel = state.relations.find(r => r.id === state.partner);
      if (rel) {
        this.partnerText.setText(rel.name);
        const hpPct = rel.healthPoints / 100;
        this.partnerBar.width = Math.max(0, 80 * hpPct);
        this.partnerBarBg.setVisible(true);
        this.partnerBar.setVisible(true);
        this.partnerText.setVisible(true);
        return;
      }
    }
    this.partnerText.setText('');
    this.partnerBarBg.setVisible(false);
    this.partnerBar.setVisible(false);
  }
}
