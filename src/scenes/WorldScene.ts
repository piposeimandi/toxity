import Phaser from 'phaser';
import type { GameState } from '../types/game';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { saveGame } from '../models/SaveSystem';
import { addDesk, addPaper, addSticky, addLabel, COLORS, FONTS } from '../theme';

const MAP_LOCATIONS = [
  { key: 'cafe', label: 'Café', icon: '☕', color: 0x6c63ff, x: 150, y: 200 },
  { key: 'bar', label: 'Bar', icon: '🍺', color: 0xff6b6b, x: 350, y: 150 },
  { key: 'gym', label: 'Gym', icon: '🏋️', color: 0x4ecdc4, x: 550, y: 200 },
  { key: 'parque', label: 'Parque', icon: '🌳', color: 0x45b7d1, x: 250, y: 380 },
];

export class WorldScene extends Phaser.Scene {
  private state!: GameState;
  private dataService!: DataService;

  constructor() {
    super({ key: 'WorldScene' });
  }

  create(): void {
    this.state = this.registry.get('gameState') as GameState;
    this.dataService = new DataService(gameData);

    const { width, height } = this.cameras.main;

    // ── Wooden desk background ──
    addDesk(this, width, height);

    // ── Paper map spread on desk ──
    const mapW = 560;
    const mapH = 340;
    const mapX = width / 2;
    const mapY = height / 2 - 10;

    addPaper(this, mapX, mapY, mapW, mapH, { tint: 0xf5ecd7 });

    // ── Handwritten title (sticky note style) ──
    const stickyW = 220;
    const stickyH = 50;
    const stickyX = width / 2;
    const stickyY = height - 60;

    addSticky(this, stickyX, stickyY, stickyW, stickyH, COLORS.stickyYellow, {
      text: '¿A dónde hoy?',
      fontSize: 16,
      rotation: 0,
    });

    // ── Week / Day label (corner tag) ──
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const tagW = 160;
    const tagH = 30;
    const tagX = width - tagW / 2 - 12;
    const tagY = tagH / 2 + 8;

    addSticky(this, tagX, tagY, tagW, tagH, COLORS.stickyGreen, {
      text: `Sem ${this.state.week} — ${dayNames[this.state.day - 1]}`,
      fontSize: 13,
      rotation: 0,
      pin: false,
    });

    // ── Location cards on the map ──
    for (const loc of MAP_LOCATIONS) {
      const cardW = 110;
      const cardH = 80;

      const container = this.add.container(loc.x, loc.y);

      // Card shadow
      const shadow = this.add.rectangle(3, 3, cardW, cardH, 0x000000, 0.3);
      shadow.setOrigin(0.5);

      // Card (paper)
      const card = this.add.rectangle(0, 0, cardW, cardH, COLORS.paper).setOrigin(0.5);
      card.setStrokeStyle(1, COLORS.paperEdge);

      // Colored top tab
      const tab = this.add.rectangle(0, -34, cardW, 12, loc.color).setOrigin(0.5).setAlpha(0.9);

      // Location icon
      const icon = this.add.text(0, -16, loc.icon, {
        fontSize: '22px',
      }).setOrigin(0.5);

      // Location name
      const label = addLabel(this, 0, 10, loc.label, {
        fontSize: 13,
        bold: true,
        color: '#3d2a16',
        align: 'center',
      }).setOrigin(0.5);

      // Cost
      const locData = this.dataService.dateLocations[loc.key];
      const costText = addLabel(this, 0, 28, `$${locData.cost}`, {
        fontSize: 12,
        color: '#7a5c3a',
        align: 'center',
      }).setOrigin(0.5);

      const zone = this.add.zone(0, 0, cardW, cardH);
      zone.setInteractive({ useHandCursor: true });

      // Hover: card lifts up (shadow grows, card moves up)
      zone.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          y: loc.y - 6,
          duration: 120,
          ease: 'Quad.easeOut',
        });
        card.setFillStyle(0xfff5d6);
        card.setStrokeStyle(2, 0x8b6914);
      });

      zone.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          y: loc.y,
          duration: 120,
          ease: 'Quad.easeOut',
        });
        card.setFillStyle(COLORS.paper);
        card.setStrokeStyle(1, COLORS.paperEdge);
      });

      zone.on('pointerdown', () => {
        if (this.state.money < locData.cost) {
          this.showMessage('No tenés plata suficiente', width / 2, height - 110);
          this.time.delayedCall(1200, () => {
            this.state.mood = Math.max(0, this.state.mood - 3);
            this.state.day += 1;
            this.state.daysWithoutDates += 1;
            this.registry.set('gameState', this.state);
            if (this.state.day > 7) {
              saveGame(this.state);
              this.scene.start('WeekEndScene');
            } else {
              this.scene.restart();
            }
          });
          return;
        }
        this.state.money -= locData.cost;
        this.registry.set('gameState', this.state);
        this.scene.start('LocationScene', { locKey: loc.key });
      });

      container.add([shadow, card, tab, icon, label, costText, zone]);
    }

    // ── Phone button (sticky note style) ──
    const phoneZone = this.add.zone(width - 60, height - 115, 100, 44);
    phoneZone.setInteractive({ useHandCursor: true });
    this.add.rectangle(width - 58, height - 113, 100, 44, 0x000000, 0.2);
    this.add.rectangle(width - 60, height - 115, 100, 44, COLORS.stickyBlue);
    this.add.rectangle(width - 60, height - 115, 100, 44).setStrokeStyle(1, 0x9db8cc);
    addLabel(this, width - 60, height - 115, '📱 Teléfono', {
      fontSize: 13,
      bold: true,
      color: '#2c3e50',
      align: 'center',
    }).setOrigin(0.5);
    phoneZone.on('pointerdown', () => {
      this.scene.start('PhoneScene');
    });

    // ── Advance day button (sticky note style) ──
    const skipZone = this.add.zone(width / 2, height - 115, 140, 44);
    skipZone.setInteractive({ useHandCursor: true });
    this.add.rectangle(width / 2, height - 113, 140, 44, 0x000000, 0.2);
    this.add.rectangle(width / 2, height - 115, 140, 44, COLORS.stickyPink);
    this.add.rectangle(width / 2, height - 115, 140, 44).setStrokeStyle(1, 0xd4738a);
    addLabel(this, width / 2, height - 115, '⏭ Avanzar día', {
      fontSize: 13,
      bold: true,
      color: '#5a3e1b',
      align: 'center',
    }).setOrigin(0.5);
    skipZone.on('pointerdown', () => {
      this.state.mood = Math.max(0, this.state.mood - 3);
      this.state.day += 1;
      this.state.daysWithoutDates += 1;
      if (this.state.day > 7) {
        this.registry.set('gameState', this.state);
        saveGame(this.state);
        this.scene.start('WeekEndScene');
        return;
      }
      this.registry.set('gameState', this.state);
      this.scene.restart();
    });

    // Launch HUD overlay
    if (!this.scene.isActive('HUDScene')) {
      this.scene.launch('HUDScene');
    }
    this.scene.get('HUDScene').events.emit('hud-update');
  }

  private showMessage(text: string, x: number, y: number): void {
    const msg = addLabel(this, x, y, text, {
      fontSize: 14,
      bold: true,
      color: '#ffb3ad',
      align: 'center',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: y - 20,
      duration: 1200,
      onComplete: () => msg.destroy(),
    });
  }
}