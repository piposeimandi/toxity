import Phaser from 'phaser';
import type { GameState } from '../types/game';
import type { Candidate, Location } from '../types/data';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';

const LOCATION_COLORS: Record<string, number> = {
  cafe: 0x6c63ff,
  bar: 0xff6b6b,
  gym: 0x4ecdc4,
  parque: 0x45b7d1,
  app: 0xff69b4,
  restaurante: 0xffaa00,
  libreria: 0x8b4513,
  museo: 0x9370db,
  bowling: 0x20b2aa,
  teatro: 0xdc143c,
};

export class LocationScene extends Phaser.Scene {
  private state!: GameState;
  private dataService!: DataService;
  private locKey: string = '';
  private location!: Location;

  constructor() {
    super({ key: 'LocationScene' });
  }

  create(data: { locKey: string }): void {
    this.state = this.registry.get('gameState') as GameState;
    this.dataService = new DataService(gameData);
    this.locKey = data.locKey;
    this.location = this.dataService.dateLocations[this.locKey];

    const { width, height } = this.cameras.main;
    const bgColor = LOCATION_COLORS[this.locKey] ?? 0x2a2a2a;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, bgColor);

    // Location name
    this.add.text(width / 2, 50, `${this.location.icon} ${this.location.name}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Risk label
    this.add.text(width / 2, 85, `Riesgo: ${this.location.riskLabel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    // Gym is safe haven
    if (this.locKey === 'gym') {
      this.handleGym(width, height);
      return;
    }

    // Try to find a candidate
    const candidates = this.getAvailableCandidates();
    if (candidates.length === 0) {
      this.handleNoCandidate(width, height);
      return;
    }

    const candidate = pick(candidates);

    // Show candidate card
    this.add.text(width / 2, 150, `Encontraste a ${candidate.name}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, 180, candidate.traits, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#cccccc',
    }).setOrigin(0.5);

    this.add.text(width / 2, 205, `Personalidad: ${candidate.personality}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Start date button
    const dateBtn = this.add.rectangle(width / 2, 300, 280, 50, 0xff69b4);
    dateBtn.setInteractive({ useHandCursor: true });
    this.add.text(width / 2, 300, '💘 Ir a la cita', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    dateBtn.on('pointerover', () => dateBtn.setFillStyle(0xff85c2));
    dateBtn.on('pointerout', () => dateBtn.setFillStyle(0xff69b4));
    dateBtn.on('pointerdown', () => {
      const baseChance = this.calculateBaseChance();
      this.scene.start('DateScene', { candidate, loc: this.location, baseChance });
    });

    // Back button
    const backBtn = this.add.rectangle(width / 2, 380, 200, 40, 0x555555);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(width / 2, 380, '← Volver', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#cccccc',
    }).setOrigin(0.5);
    backBtn.on('pointerdown', () => {
      this.state.day += 1;
      this.state.daysWithoutDates += 1;
      this.registry.set('gameState', this.state);
      if (this.state.day > 7) {
        this.scene.start('WeekEndScene');
        return;
      }
      this.scene.start('WorldScene');
    });
  }

  private handleGym(width: number, height: number): void {
    this.add.text(width / 2, 150, 'REFUGIO SEGURO — Sin sabotaje', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    const eventText = pick(this.dataService.gymSoloTexts);
    this.add.text(width / 2, 200, eventText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      wordWrap: { width: 600 },
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 280, 'Ganaste +5 confianza', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    this.state.confidence = Math.min(100, this.state.confidence + 5);
    this.state.mood = Math.min(100, this.state.mood + 3);
    this.state.day += 1;
    this.registry.set('gameState', this.state);

    const backBtn = this.add.rectangle(width / 2, 360, 200, 40, 0x555555);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(width / 2, 360, '← Volver al mapa', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#cccccc',
    }).setOrigin(0.5);
    backBtn.on('pointerdown', () => {
      if (this.state.day > 7) {
        this.scene.start('WeekEndScene');
        return;
      }
      this.scene.start('WorldScene');
    });
  }

  private handleNoCandidate(width: number, height: number): void {
    this.add.text(width / 2, 180, 'No hay nadie aquí...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);

    // Maybe ambient event
    if (Math.random() < 0.5) {
      const event = pick(this.dataService.ambientEvents);
      this.add.text(width / 2, 230, event, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#aaaaaa',
        wordWrap: { width: 600 },
        align: 'center',
      }).setOrigin(0.5);
    }

    this.state.day += 1;
    this.state.daysWithoutDates += 1;
    this.registry.set('gameState', this.state);

    const backBtn = this.add.rectangle(width / 2, 360, 200, 40, 0x555555);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(width / 2, 360, '← Volver al mapa', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#cccccc',
    }).setOrigin(0.5);
    backBtn.on('pointerdown', () => {
      if (this.state.day > 7) {
        this.scene.start('WeekEndScene');
        return;
      }
      this.scene.start('WorldScene');
    });
  }

  private getAvailableCandidates(): Candidate[] {
    const all = [
      ...this.dataService.femaleCandidates,
      ...this.dataService.maleCandidates,
    ];
    // Shuffle and take a few
    const shuffled = all.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  private calculateBaseChance(): number {
    const riskMap: Record<string, number> = {
      low: 65,
      medium: 55,
      high: 45,
      extreme: 35,
    };
    const base = riskMap[this.location.risk] ?? 50;
    // Bonus from stats
    return Math.min(90, base + Math.floor(this.state.labia / 10));
  }
}
