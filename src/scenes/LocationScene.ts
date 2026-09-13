import Phaser from 'phaser';
import type { GameState } from '../types/game';
import type { Candidate, Location } from '../types/data';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';

const LOCATION_ICONS: Record<string, string> = {
  cafe: '☕',
  bar: '🍺',
  gym: '🏋️',
  parque: '🌳',
  app: '📱',
  restaurante: '🍽️',
  libreria: '📚',
  museo: '🏛️',
  bowling: '🎳',
  teatro: '🎭',
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

    // ── Wooden desk background ──
    this.add.rectangle(width / 2, height / 2, width, height, 0x3d2b1f);

    // Wood grain lines
    for (let i = 0; i < 18; i++) {
      const y = 20 + i * 35;
      this.add.rectangle(width / 2, y, width, 1, 0x4a3525, 0.4);
    }

    // ── Location title (sticky note in corner) ──
    const locIcon = LOCATION_ICONS[this.locKey] ?? '📍';
    const titleW = 260;
    const titleH = 40;
    const titleX = width / 2;
    const titleY = titleH / 2 + 14;

    this.add.rectangle(titleX + 2, titleY + 2, titleW, titleH, 0x000000, 0.2);
    this.add.rectangle(titleX, titleY, titleW, titleH, 0xfff9b0);
    this.add.rectangle(titleX, titleY, titleW, titleH).setStrokeStyle(1, 0xc9b99a);

    this.add.text(titleX, titleY, `${locIcon} ${this.location.name}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#5a3e1b',
    }).setOrigin(0.5);

    // Risk label
    const riskColor = this.location.risk === 'low' ? '#4ecdc4' :
                      this.location.risk === 'medium' ? '#ffcc00' :
                      this.location.risk === 'high' ? '#ff8844' : '#ff4444';

    this.add.text(titleX, titleY + 28, `Riesgo: ${this.location.riskLabel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: riskColor,
    }).setOrigin(0.5);

    // ── Gym is safe haven ──
    if (this.locKey === 'gym') {
      this.handleGym(width, height);
      return;
    }

    // ── Try to find a candidate ──
    const candidates = this.getAvailableCandidates();
    if (candidates.length === 0) {
      this.handleNoCandidate(width, height);
      return;
    }

    const candidate = pick(candidates);

    // ── Candidate "file folder" ──
    const folderW = 400;
    const folderH = 320;
    const folderX = width / 2;
    const folderY = height / 2 + 20;

    // Folder shadow
    this.add.rectangle(folderX + 5, folderY + 5, folderW, folderH, 0x000000, 0.35);

    // Folder tab (top tab sticking out)
    this.add.rectangle(folderX - 100, folderY - folderH / 2 - 12, 120, 24, 0xd4c4a0);
    this.add.text(folderX - 100, folderY - folderH / 2 - 12, 'EXPEDIENTE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#5a3e1b',
    }).setOrigin(0.5);

    // Folder paper
    this.add.rectangle(folderX, folderY, folderW, folderH, 0xfaf3e0);
    this.add.rectangle(folderX, folderY, folderW, folderH).setStrokeStyle(2, 0xc9b99a);

    // ── Photo placeholder (portrait box) ──
    const photoW = 100;
    const photoH = 110;
    const photoX = folderX;
    const photoY = folderY - 90;

    this.add.rectangle(photoX, photoY, photoW, photoH, 0xe8dcc8);
    this.add.rectangle(photoX, photoY, photoW, photoH).setStrokeStyle(1, 0xa0937a);

    // Initial letter as placeholder
    this.add.text(photoX, photoY, candidate.name.charAt(0), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#7a5c3a',
    }).setOrigin(0.5);

    // "Foto" label under photo
    this.add.text(photoX, photoY + photoH / 2 + 12, '[ foto ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#a0937a',
    }).setOrigin(0.5);

    // ── Candidate name ──
    this.add.text(folderX, photoY + photoH / 2 + 32, candidate.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#3e2712',
    }).setOrigin(0.5);

    // ── Traits ──
    this.add.text(folderX, photoY + photoH / 2 + 56, candidate.traits, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#6b5b42',
      wordWrap: { width: folderW - 40 },
      align: 'center',
    }).setOrigin(0.5);

    // ── Personality ──
    this.add.text(folderX, photoY + photoH / 2 + 80, `Personalidad: ${candidate.personality}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#8a7a62',
    }).setOrigin(0.5);

    // ── Action buttons (sticky notes / stamps) ──
    // "Ir a la cita" — pink sticky note
    const dateNoteW = 160;
    const dateNoteH = 44;
    const dateNoteX = folderX - 90;
    const dateNoteY = folderY + folderH / 2 - 38;

    const dateNote = this.add.container(dateNoteX, dateNoteY);

    const dateShadow = this.add.rectangle(3, 3, dateNoteW, dateNoteH, 0x000000, 0.2);
    dateShadow.setOrigin(0.5);
    const dateBg = this.add.rectangle(0, 0, dateNoteW, dateNoteH, 0xffb6c1);
    dateBg.setOrigin(0.5);
    dateBg.setStrokeStyle(1, 0xd4738a);
    const dateText = this.add.text(0, 0, '💘 Ir a la cita', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#6b1a2a',
    }).setOrigin(0.5);
    const dateZone = this.add.zone(0, 0, dateNoteW, dateNoteH);
    dateZone.setInteractive({ useHandCursor: true });

    dateZone.on('pointerover', () => {
      this.tweens.add({ targets: dateNote, y: dateNoteY - 3, duration: 100 });
      dateBg.setFillStyle(0xffcdd8);
    });
    dateZone.on('pointerout', () => {
      this.tweens.add({ targets: dateNote, y: dateNoteY, duration: 100 });
      dateBg.setFillStyle(0xffb6c1);
    });
    dateZone.on('pointerdown', () => {
      const baseChance = this.calculateBaseChance();
      this.scene.start('DateScene', { candidate, loc: this.location, baseChance });
    });

    dateNote.add([dateShadow, dateBg, dateText, dateZone]);

    // "Volver" — blue sticky note
    const backNoteW = 140;
    const backNoteH = 44;
    const backNoteX = folderX + 90;
    const backNoteY = folderY + folderH / 2 - 38;

    const backNote = this.add.container(backNoteX, backNoteY);

    const backShadow = this.add.rectangle(3, 3, backNoteW, backNoteH, 0x000000, 0.2);
    backShadow.setOrigin(0.5);
    const backBg = this.add.rectangle(0, 0, backNoteW, backNoteH, 0xd4e6f1);
    backBg.setOrigin(0.5);
    backBg.setStrokeStyle(1, 0x8aaabb);
    const backText = this.add.text(0, 0, '← Volver', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#2c3e50',
    }).setOrigin(0.5);
    const backZone = this.add.zone(0, 0, backNoteW, backNoteH);
    backZone.setInteractive({ useHandCursor: true });

    backZone.on('pointerover', () => {
      this.tweens.add({ targets: backNote, y: backNoteY - 3, duration: 100 });
      backBg.setFillStyle(0xe0eef6);
    });
    backZone.on('pointerout', () => {
      this.tweens.add({ targets: backNote, y: backNoteY, duration: 100 });
      backBg.setFillStyle(0xd4e6f1);
    });
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

    backNote.add([backShadow, backBg, backText, backZone]);
  }

  private handleGym(width: number, height: number): void {
    // ── Gym paper on desk ──
    const paperW = 400;
    const paperH = 220;
    const paperX = width / 2;
    const paperY = height / 2 + 20;

    this.add.rectangle(paperX + 4, paperY + 4, paperW, paperH, 0x000000, 0.3);
    this.add.rectangle(paperX, paperY, paperW, paperH, 0xfaf3e0);
    this.add.rectangle(paperX, paperY, paperW, paperH).setStrokeStyle(2, 0xc9b99a);

    // Stamp: "REFUGIO SEGURO"
    const stampW = 200;
    const stampH = 30;
    this.add.rectangle(paperX, paperY - 60, stampW, stampH);
    const stampBorder = this.add.rectangle(paperX, paperY - 60, stampW, stampH);
    stampBorder.setStrokeStyle(2, 0x4ecdc4);
    this.add.text(paperX, paperY - 60, 'REFUGIO SEGURO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    const eventText = pick(this.dataService.gymSoloTexts);
    this.add.text(paperX, paperY + 5, eventText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#3e2712',
      wordWrap: { width: paperW - 40 },
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(paperX, paperY + 55, 'Ganaste +5 confianza', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    this.state.confidence = Math.min(100, this.state.confidence + 5);
    this.state.mood = Math.min(100, this.state.mood + 3);
    this.state.day += 1;
    this.registry.set('gameState', this.state);

    // Back sticky note
    const backNoteW = 180;
    const backNoteH = 40;
    const backNoteX = paperX;
    const backNoteY = paperY + paperH / 2 + 40;

    const backNote = this.add.container(backNoteX, backNoteY);
    const backShadow = this.add.rectangle(3, 3, backNoteW, backNoteH, 0x000000, 0.2);
    backShadow.setOrigin(0.5);
    const backBg = this.add.rectangle(0, 0, backNoteW, backNoteH, 0xd4e6f1);
    backBg.setOrigin(0.5);
    backBg.setStrokeStyle(1, 0x8aaabb);
    const backText = this.add.text(0, 0, '← Volver al mapa', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#2c3e50',
    }).setOrigin(0.5);
    const backZone = this.add.zone(0, 0, backNoteW, backNoteH);
    backZone.setInteractive({ useHandCursor: true });

    backZone.on('pointerover', () => {
      this.tweens.add({ targets: backNote, y: backNoteY - 3, duration: 100 });
      backBg.setFillStyle(0xe0eef6);
    });
    backZone.on('pointerout', () => {
      this.tweens.add({ targets: backNote, y: backNoteY, duration: 100 });
      backBg.setFillStyle(0xd4e6f1);
    });
    backZone.on('pointerdown', () => {
      if (this.state.day > 7) {
        this.scene.start('WeekEndScene');
        return;
      }
      this.scene.start('WorldScene');
    });

    backNote.add([backShadow, backBg, backText, backZone]);
  }

  private handleNoCandidate(width: number, height: number): void {
    // ── Empty paper on desk ──
    const paperW = 380;
    const paperH = 160;
    const paperX = width / 2;
    const paperY = height / 2 + 30;

    this.add.rectangle(paperX + 4, paperY + 4, paperW, paperH, 0x000000, 0.3);
    this.add.rectangle(paperX, paperY, paperW, paperH, 0xfaf3e0);
    this.add.rectangle(paperX, paperY, paperW, paperH).setStrokeStyle(2, 0xc9b99a);

    this.add.text(paperX, paperY - 30, 'No hay nadie aquí...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#6b5b42',
    }).setOrigin(0.5);

    // Maybe ambient event
    if (Math.random() < 0.5) {
      const event = pick(this.dataService.ambientEvents);
      this.add.text(paperX, paperY + 20, event, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#8a7a62',
        wordWrap: { width: paperW - 40 },
        align: 'center',
      }).setOrigin(0.5);
    }

    this.state.day += 1;
    this.state.daysWithoutDates += 1;
    this.registry.set('gameState', this.state);

    // Back sticky note
    const backNoteW = 180;
    const backNoteH = 40;
    const backNoteX = paperX;
    const backNoteY = paperY + paperH / 2 + 36;

    const backNote = this.add.container(backNoteX, backNoteY);
    const backShadow = this.add.rectangle(3, 3, backNoteW, backNoteH, 0x000000, 0.2);
    backShadow.setOrigin(0.5);
    const backBg = this.add.rectangle(0, 0, backNoteW, backNoteH, 0xd4e6f1);
    backBg.setOrigin(0.5);
    backBg.setStrokeStyle(1, 0x8aaabb);
    const backText = this.add.text(0, 0, '← Volver al mapa', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#2c3e50',
    }).setOrigin(0.5);
    const backZone = this.add.zone(0, 0, backNoteW, backNoteH);
    backZone.setInteractive({ useHandCursor: true });

    backZone.on('pointerover', () => {
      this.tweens.add({ targets: backNote, y: backNoteY - 3, duration: 100 });
      backBg.setFillStyle(0xe0eef6);
    });
    backZone.on('pointerout', () => {
      this.tweens.add({ targets: backNote, y: backNoteY, duration: 100 });
      backBg.setFillStyle(0xd4e6f1);
    });
    backZone.on('pointerdown', () => {
      if (this.state.day > 7) {
        this.scene.start('WeekEndScene');
        return;
      }
      this.scene.start('WorldScene');
    });

    backNote.add([backShadow, backBg, backText, backZone]);
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
