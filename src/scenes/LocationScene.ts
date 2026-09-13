import Phaser from 'phaser';
import type { GameState } from '../types/game';
import type { Candidate, Location } from '../types/data';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';
import { addDesk, addPaper, addSticky, photoFrame, COLORS, FONTS } from '../theme';

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
    addDesk(this, width, height);

    // ── Title sticky note (below HUD bar) ──
    const locIcon = LOCATION_ICONS[this.locKey] ?? '📍';
    addSticky(this, width / 2, 46, 240, 36, COLORS.stickyYellow, {
      text: `${locIcon} ${this.location.name}`,
      fontSize: 15,
      rotation: 0,
    });

    // Risk
    const riskColor = this.location.risk === 'low' ? '#2aa79b' :
                      this.location.risk === 'medium' ? '#cf9418' :
                      this.location.risk === 'high' ? '#e07b1f' : '#d43a34';
    this.add.text(width / 2, 70, `Riesgo: ${this.location.riskLabel}`, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      fontStyle: 'bold',
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

    // Back panel (manila frame)
    this.add.rectangle(folderX + 3, folderY + 3, folderW, folderH, 0xdcc9a8);

    // Tab
    const tab = this.add.rectangle(folderX - 80, folderY - folderH / 2 - 10, 100, 20, 0xd4c4a0);
    tab.setStrokeStyle(1, 0xaa9a78);
    this.add.text(folderX - 80, folderY - folderH / 2 - 10, 'EXPEDIENTE', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#3d2a16',
    }).setOrigin(0.5);

    // Folder paper
    this.add.rectangle(folderX, folderY, folderW, folderH, COLORS.paper);
    this.add.rectangle(folderX, folderY, folderW, folderH).setStrokeStyle(2, COLORS.paperEdge);

    // ── Photo ──
    const photoX = folderX;
    const photoY = folderY - 80;
    const photoW = 90;
    const photoH = 100;

    // Wooden photo frame + real photo (fallback: initial letter)
    const photoKey = this.dataService.getPhotoKey(candidate);
    const hasPhoto = photoKey !== null && this.textures.exists(photoKey);
    photoFrame(this, photoX, photoY, 92, hasPhoto ? photoKey : undefined);
    if (!hasPhoto) {
      this.add.text(photoX, photoY, candidate.name.charAt(0), {
        fontFamily: FONTS.BODY,
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#7a5c3a',
      }).setOrigin(0.5);
    }

    // ── Candidate info ──
    this.add.text(folderX, photoY + photoH / 2 + 30, candidate.name, {
      fontFamily: FONTS.BODY,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#3d2a16',
    }).setOrigin(0.5);

    this.add.text(folderX, photoY + photoH / 2 + 52, candidate.traits, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#6b5b42',
      wordWrap: { width: folderW - 40 },
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(folderX, photoY + photoH / 2 + 74, `Personalidad: ${candidate.personality}`, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
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
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      fontStyle: 'bold',
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
    const backBg = this.add.rectangle(0, 0, 120, 38, COLORS.stickyBlue).setOrigin(0.5);
    backBg.setStrokeStyle(1, 0x9db8cc);
    backBtn.add(backBg);
    backBtn.add(this.add.text(0, 0, '← Volver', {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      fontStyle: 'bold',
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

    addPaper(this, paperX, paperY, paperW, paperH);

    // Stamp
    this.add.rectangle(paperX, paperY - 50, 180, 26, 0xffffff).setAlpha(0.5);
    this.add.rectangle(paperX, paperY - 50, 180, 26).setStrokeStyle(2, COLORS.accentTeal);
    this.add.text(paperX, paperY - 50, 'REFUGIO SEGURO', {
      fontFamily: FONTS.TITLE,
      fontSize: '10px',
      color: '#2aa79b',
    }).setOrigin(0.5);

    const eventText = pick(this.dataService.gymSoloTexts);
    this.add.text(paperX, paperY + 10, eventText, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#3d2a16',
      wordWrap: { width: paperW - 40 },
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(paperX, paperY + 50, 'Ganaste +5 confianza', {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#1f7a5a',
    }).setOrigin(0.5);

    this.state.confidence = Math.min(100, this.state.confidence + 5);
    this.state.mood = Math.min(100, this.state.mood + 3);
    this.state.day += 1;
    this.registry.set('gameState', this.state);

    // Back button
    const backBtn = this.add.container(paperX, paperY + paperH / 2 + 36);
    backBtn.add(this.add.rectangle(3, 3, 160, 34, 0x000000, 0.2).setOrigin(0.5));
    backBtn.add(this.add.rectangle(0, 0, 160, 34, COLORS.stickyBlue).setOrigin(0.5).setStrokeStyle(1, 0x9db8cc));
    backBtn.add(this.add.text(0, 0, '← Volver al mapa', {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      fontStyle: 'bold',
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

    addPaper(this, paperX, paperY, paperW, paperH);

    this.add.text(paperX, paperY - 25, 'No hay nadie aquí...', {
      fontFamily: FONTS.BODY,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#3d2a16',
    }).setOrigin(0.5);

    if (Math.random() < 0.5) {
      const event = pick(this.dataService.ambientEvents);
      this.add.text(paperX, paperY + 15, event, {
        fontFamily: FONTS.BODY,
        fontSize: '13px',
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
    backBtn.add(this.add.rectangle(0, 0, 160, 30, COLORS.stickyBlue).setOrigin(0.5).setStrokeStyle(1, 0x9db8cc));
    backBtn.add(this.add.text(0, 0, '← Volver al mapa', {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      fontStyle: 'bold',
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