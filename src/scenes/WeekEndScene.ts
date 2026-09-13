import Phaser from 'phaser';
import type { GameState } from '../types/game';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';
import { formatMoney } from '../utils/text';
import { Button } from '../components/Button';

export class WeekEndScene extends Phaser.Scene {
  private state!: GameState;
  private dataService!: DataService;

  constructor() {
    super({ key: 'WeekEndScene' });
  }

  create(): void {
    this.state = this.registry.get('gameState') as GameState;
    this.dataService = new DataService(gameData);

    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.add.text(width / 2, 50, 'FIN DE SEMANA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    this.add.text(width / 2, 80, `Semana ${this.state.week} completada`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Salary
    this.add.text(width / 2, 130, `💵 Salario: +$80`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    this.state.money += 80;

    // Week gag
    const gag = pick(this.dataService.weekSummaryGags);
    this.add.text(width / 2, 175, gag, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#cccccc',
      wordWrap: { width: 650 },
      align: 'center',
    }).setOrigin(0.5);

    // Stats summary
    const summaryY = 230;
    const lines = [
      `Ánimo: ${this.state.mood}`,
      `Días sin citas: ${this.state.daysWithoutDates}`,
      `Plata: ${formatMoney(this.state.money)}`,
    ];

    lines.forEach((line, i) => {
      this.add.text(width / 2, summaryY + i * 25, line, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffffff',
      }).setOrigin(0.5);
    });

    // Partner info
    if (this.state.partner) {
      const rel = this.state.relations.find(r => r.id === this.state.partner);
      if (rel) {
        this.add.text(width / 2, summaryY + 100, `💕 ${rel.name} — Salud: ${rel.healthPoints}/100`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '11px',
          color: '#ff69b4',
        }).setOrigin(0.5);
      }
    }

    // Advance week
    this.state.day = 1;
    this.state.week += 1;

    // Save state and continue
    this.registry.set('gameState', this.state);

    // Continue button
    const continueBtn = new Button(
      this,
      width / 2,
      height - 80,
      '→ Semana siguiente',
      280,
      50,
      0x6c63ff,
      '12px',
    );

    continueBtn.on('pointerdown', () => {
      this.scene.start('WorldScene');
    });
  }
}
