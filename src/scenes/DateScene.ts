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

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x2a1a2a);

    // Candidate portrait area
    this.add.rectangle(width / 2, 100, 120, 120, 0x4a3a4a);
    this.add.text(width / 2, 100, this.candidate.name.charAt(0), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ff69b4',
    }).setOrigin(0.5);

    // Candidate name
    this.add.text(width / 2, 180, this.candidate.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Traits
    this.add.text(width / 2, 205, this.candidate.traits, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#cccccc',
    }).setOrigin(0.5);

    // Location info
    this.add.text(width / 2, 230, `${this.loc.icon} ${this.loc.name} — Riesgo: ${this.loc.riskLabel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    // Dialogue options — show up to 6 options (filtered by mood)
    const options = this.dataService.dialogueOptions.filter(opt => {
      if (opt.moodCost > 0 && this.state.mood < 30) return false;
      return true;
    });

    const displayOptions = options.slice(0, 6);
    const startY = 270;
    const spacing = 42;

    displayOptions.forEach((opt, i) => {
      const y = startY + i * spacing;
      const canAfford = this.state.mood >= opt.moodCost;

      const btn = new Button(
        this,
        width / 2,
        y,
        `${opt.text.substring(0, 50)}${opt.text.length > 50 ? '...' : ''} [${opt.bonus > 0 ? '+' : ''}${opt.bonus}]`,
        700,
        36,
        canAfford ? 0x4a3a6a : 0x333333,
        '8px',
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
      height - 40,
      '← Volver sin cita',
      200,
      36,
      0x555555,
      '9px',
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

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Result
    const resultText = success ? '¡CITA EXITOSA!' : 'CITA FALLIDA';
    const resultColor = success ? '#4ecdc4' : '#ff6b6b';
    this.add.text(width / 2, 100, resultText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: resultColor,
    }).setOrigin(0.5);

    if (sabotaged) {
      this.add.text(width / 2, 135, '⚠ SABOTAJE DE LA REINA', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#ff4444',
      }).setOrigin(0.5);

      const sabotageMsg = pick(this.dataService.sabotageMessages);
      this.add.text(width / 2, 165, sabotageMsg, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#ff8888',
        wordWrap: { width: 600 },
        align: 'center',
      }).setOrigin(0.5);
    }

    // Show result text
    const locKey = this.loc.key;
    const texts = success ? this.dataService.successTexts : this.dataService.failTexts;
    const resultMsg = texts[locKey]?.[0] ?? (success ? 'La cita fue bien.' : 'No funcionó...');
    const formatted = resultMsg.replace(/{name}/g, this.candidate.name);

    this.add.text(width / 2, 220, formatted, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      wordWrap: { width: 650 },
      align: 'center',
    }).setOrigin(0.5);

    // Apply effects
    if (success) {
      this.state.mood = clamp(this.state.mood + 10, 0, 100);
      this.state.daysWithoutDates = 0;
      this.state.labia = clamp(this.state.labia + 2, 0, 100);
    } else {
      this.state.mood = clamp(this.state.mood - 5, 0, 100);
    }

    // Log date
    this.state.dateLog.push({
      week: this.state.week,
      candidate: this.candidate.name,
      location: locKey,
      success,
    });

    // Advance day
    this.state.day += 1;
    this.registry.set('gameState', this.state);

    // Back button
    const backBtn = new Button(
      this,
      width / 2,
      height - 60,
      'Continuar',
      200,
      40,
      0x6c63ff,
      '12px',
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
