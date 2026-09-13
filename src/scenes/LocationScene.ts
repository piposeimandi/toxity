import Phaser from 'phaser';
import type { GameState } from '../types/game';
import type { Candidate, Location } from '../types/data';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';

const LOCATION_ICONS: Record<string, string> = {
  cafe: '☕', bar: '🍺', gym: '🏋️', parque: '🌳', app: '📱',
  restaurante: '🍽️', libreria: '📚', museo: '🏛️', bowling: '🎳', teatro: '🎭',
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

    // ── Desk background ──
    this.add.rectangle(width / 2, height / 2, width, height, 0x3d2b1f);
    for (let i = 0; i < 18; i++) {
      this.add.rectangle(width / 2, 20 + i * 35, width, 1, 0x4a3525, 0.4);
    }

    // ── Title sticky note (below HUD bar) ──
    const locIcon = LOCATION_ICONS[this.locKey] ?? '📍';
    this.add.rectangle(width / 2 + 2, 48, 240, 36, 0x000000, 0.2);
    this.add.rectangle(width / 2, 46, 240, 36, 0xfff9b0);
    this.add.text(width / 2, 46, `${locIcon} ${this.location.name}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#5a3e1b',
    }).setOrigin(0.5);

    // Risk
    const riskColor = this.location.risk === 'low' ? '#4ecdc4' :
                      this.location.risk === 'medium' ? '#ffcc00' :
                      this.location.risk === 'high' ? '#ff8844' : '#ff4444';
    this.add.text(width / 2, 70, `Riesgo: ${this.location.riskLabel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: riskColor,
    }).setOrigin(0.5);

    // ── Gym safe haven ──
    if (this.locKey === 'gym') {
      this.handleGym(width, height);
      return;
    }

    // ── Find candidate ──
    const candidates = this.getAvailableCandidates();
    if (candidates.length === 0) {
      this.handleNoCandidate(width, height);
      return;
    }

    const candidate = pick(candidates);

    // ── File folder ──
    const folderW = 380;
    const folderH = 340;
    const folderX = width / 2;
    const folderY = height / 2 + 30;

    // Shadow
    this.add.rectangle(folderX + 4, folderY + 4, folderW, folderH, 0x000000, 0.3);

    // Tab
    this.add.rectangle(folderX - 80, folderY - folderH / 2 - 10, 100, 20, 0xd4c4a0);
    this.add.text(folderX - 80, folderY - folderH / 2 - 10, 'EXPEDIENTE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#5a3e1b',
    }).setOrigin(0.5);

    // Folder paper
    this.add.rectangle(folderX, folderY, folderW, folderH, 0xfaf3e0);
    this.add.rectangle(folderX, folderY, folderW, folderH).setStrokeStyle(2, 0xc9b99a);

    // ── Photo ──
    const photoX = folderX;
    const photoY = folderY - 80;
    const photoW = 90;
    const photoH = 100;

    // Photo frame
    this.add.rectangle(photoX, photoY, photoW + 6, photoH + 6, 0x8a7a62);
    this.add.rectangle(photoX, photoY, photoW, photoH, 0xe8dcc8);

    // Real photo (fallback: initial letter)
    const photoKey = this.dataService.getPhotoKey(candidate);
    if (photoKey && this.textures.exists(photoKey)) {
      const size = Math.min(photoW, photoH) - 8;
      this.add.image(photoX, photoY, photoKey).setOrigin(0.5).setDisplaySize(size, size);
    } else {
      this.add.text(photoX, photoY, candidate.name.charAt(0), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '32px',
        color: '#7a5c3a',
      }).setOrigin(0.5);
    }

    // ── Candidate info ──
    this.add.text(folderX, photoY + photoH / 2 + 30, candidate.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#3e2712',
    }).setOrigin(0.5);

    this.add.text(folderX, photoY + photoH / 2 + 52, candidate.traits, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#6b5b42',
      wordWrap: { width: folderW - 40 },
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(folderX, photoY + photoH / 2 + 74, `Personalidad: ${candidate.personality}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#8a7a62',
    }).setOrigin(0.5);

    // ── Action buttons ──
    // "Ir a la cita" — pink note
    const dateBtn = this.add.container(folderX - 80, folderY + folderH / 2 - 36);
    dateBtn.add(this.add.rectangle(3, 3, 140, 38, 0x000000, 0.2).setOrigin(0.5));
    const dateBg = this.add.rectangle(0, 0, 140, 38, 0xffb6c1).setOrigin(0.5);
    dateBg.setStrokeStyle(1, 0xd4738a);
    dateBtn.add(dateBg);
    dateBtn.add(this.add.text(0, 0, '💘 Ir a la cita', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#6b1a2a',
    }).setOrigin(0.5));
    const dateZone = this.add.zone(0, 0, 140, 38).setInteractive({ useHandCursor: true });
    dateBtn.add(dateZone);
    dateZone.on('pointerover', () => this.tweens.add({ targets: dateBtn, y: dateBtn.y - 3, duration: 80 }));
    dateZone.on('pointerout', () => this.tweens.add({ targets: dateBtn, y: folderY + folderH / 2 - 36, duration: 80 }));
    dateZone.on('pointerdown', () => {
      const baseChance = this.calculateBaseChance();
      this.scene.start('DateScene', { candidate, loc: this.location, baseChance });
    });

    // "Volver" — blue note
    const backBtn = this.add.container(folderX + 80, folderY + folderH / 2 - 36);
    backBtn.add(this.add.rectangle(3, 3, 120, 38, 0x000000, 0.2).setOrigin(0.5));
    const backBg = this.add.rectangle(0, 0, 120, 38, 0xd4e6f1).setOrigin(0.5);
    backBg.setStrokeStyle(1, 0x8aaabb);
    backBtn.add(backBg);
    backBtn.add(this.add.text(0, 0, '← Volver', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#2c3e50',
    }).setOrigin(0.5));
    const backZone = this.add.zone(0, 0, 120, 38).setInteractive({ useHandCursor: true });
    backBtn.add(backZone);
    backZone.on('pointerover', () => this.tweens.add({ targets: backBtn, y: backBtn.y - 3, duration: 80 }));
    backZone.on('pointerout', () => this.tweens.add({ targets: backBtn, y: folderY + folderH / 2 - 36, duration: 80 }));
    backZone.on('pointerdown', () => {
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
    const paperW = 380;
    const paperH = 200;
    const paperX = width / 2;
    const paperY = height / 2 + 30;

    this.add.rectangle(paperX + 4, paperY + 4, paperW, paperH, 0x000000, 0.3);
    this.add.rectangle(paperX, paperY, paperW, paperH, 0xfaf3e0);
    this.add.rectangle(paperX, paperY, paperW, paperH).setStrokeStyle(2, 0xc9b99a);

    // Stamp
    this.add.rectangle(paperX, paperY - 50, 180, 26);
    this.add.rectangle(paperX, paperY - 50, 180, 26).setStrokeStyle(2, 0x4ecdc4);
    this.add.text(paperX, paperY - 50, 'REFUGIO SEGURO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    const eventText = pick(this.dataService.gymSoloTexts);
    this.add.text(paperX, paperY + 10, eventText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#3e2712',
      wordWrap: { width: paperW - 40 },
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(paperX, paperY + 50, 'Ganaste +5 confianza', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    this.state.confidence = Math.min(100, this.state.confidence + 5);
    this.state.mood = Math.min(100, this.state.mood + 3);
    this.state.day += 1;
    this.registry.set('gameState', this.state);

    // Back button
    const backBtn = this.add.container(paperX, paperY + paperH / 2 + 36);
    backBtn.add(this.add.rectangle(3, 3, 160, 34, 0x000000, 0.2).setOrigin(0.5));
    backBtn.add(this.add.rectangle(0, 0, 160, 34, 0xd4e6f1).setOrigin(0.5).setStrokeStyle(1, 0x8aaabb));
    backBtn.add(this.add.text(0, 0, '← Volver al mapa', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#2c3e50',
    }).setOrigin(0.5));
    const backZone = this.add.zone(0, 0, 160, 34).setInteractive({ useHandCursor: true });
    backBtn.add(backZone);
    backZone.on('pointerdown', () => {
      if (this.state.day > 7) {
        this.scene.start('WeekEndScene');
        return;
      }
      this.scene.start('WorldScene');
    });
  }

  private handleNoCandidate(width: number, height: number): void {
    const paperW = 360;
    const paperH = 140;
    const paperX = width / 2;
    const paperY = height / 2 + 30;

    this.add.rectangle(paperX + 4, paperY + 4, paperW, paperH, 0x000000, 0.3);
    this.add.rectangle(paperX, paperY, paperW, paperH, 0xfaf3e0);
    this.add.rectangle(paperX, paperY, paperW, paperH).setStrokeStyle(2, 0xc9b99a);

    this.add.text(paperX, paperY - 25, 'No hay nadie aquí...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#6b5b42',
    }).setOrigin(0.5);

    if (Math.random() < 0.5) {
      const event = pick(this.dataService.ambientEvents);
      this.add.text(paperX, paperY + 15, event, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#8a7a62',
        wordWrap: { width: paperW - 40 },
        align: 'center',
      }).setOrigin(0.5);
    }

    this.state.day += 1;
    this.state.daysWithoutDates += 1;
    this.registry.set('gameState', this.state);

    const backBtn = this.add.container(paperX, paperY + paperH / 2 + 32);
    backBtn.add(this.add.rectangle(3, 3, 160, 30, 0x000000, 0.2).setOrigin(0.5));
    backBtn.add(this.add.rectangle(0, 0, 160, 30, 0xd4e6f1).setOrigin(0.5).setStrokeStyle(1, 0x8aaabb));
    backBtn.add(this.add.text(0, 0, '← Volver al mapa', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#2c3e50',
    }).setOrigin(0.5));
    const backZone = this.add.zone(0, 0, 160, 30).setInteractive({ useHandCursor: true });
    backBtn.add(backZone);
    backZone.on('pointerdown', () => {
      if (this.state.day > 7) {
        this.scene.start('WeekEndScene');
        return;
      }
      this.scene.start('WorldScene');
    });
  }

  private getAvailableCandidates(): Candidate[] {
    const all = [...this.dataService.femaleCandidates, ...this.dataService.maleCandidates];
    return all.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  private calculateBaseChance(): number {
    const riskMap: Record<string, number> = { low: 65, medium: 55, high: 45, extreme: 35 };
    const base = riskMap[this.location.risk] ?? 50;
    return Math.min(90, base + Math.floor(this.state.labia / 10));
  }
}
