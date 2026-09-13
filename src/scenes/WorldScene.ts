import Phaser from 'phaser';
import type { GameState } from '../types/game';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { saveGame } from '../models/SaveSystem';

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
    this.add.rectangle(width / 2, height / 2, width, height, 0x3d2b1f);

    // Wood grain lines (subtle)
    for (let i = 0; i < 18; i++) {
      const y = 20 + i * 35;
      this.add.rectangle(width / 2, y, width, 1, 0x4a3525, 0.4);
    }

    // ── Paper map spread on desk ──
    const mapW = 560;
    const mapH = 340;
    const mapX = width / 2;
    const mapY = height / 2 - 10;

    // Paper shadow
    this.add.rectangle(mapX + 4, mapY + 4, mapW, mapH, 0x1a0f05, 0.5);

    // Paper base (cream / manila)
    this.add.rectangle(mapX, mapY, mapW, mapH, 0xf5ecd7);
    // Subtle border
    const mapBorder = this.add.rectangle(mapX, mapY, mapW, mapH);
    mapBorder.setStrokeStyle(2, 0xc9b99a);

    // ── Handwritten title (sticky note style) ──
    const stickyW = 220;
    const stickyH = 50;
    const stickyX = width / 2;
    const stickyY = height - 60;

    // Sticky note shadow
    this.add.rectangle(stickyX + 3, stickyY + 3, stickyW, stickyH, 0x000000, 0.25);
    // Sticky note
    this.add.rectangle(stickyX, stickyY, stickyW, stickyH, 0xfff9b0);

    this.add.text(stickyX, stickyY, '¿A dónde hoy?', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#5a3e1b',
    }).setOrigin(0.5);

    // ── Week / Day label (corner tag) ──
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const tagW = 160;
    const tagH = 36;
    const tagX = width - tagW / 2 - 12;
    const tagY = tagH / 2 + 12;

    this.add.rectangle(tagX + 2, tagY + 2, tagW, tagH, 0x000000, 0.2);
    this.add.rectangle(tagX, tagY, tagW, tagH, 0xf0e6c8);
    this.add.rectangle(tagX, tagY, tagW, tagH).setStrokeStyle(1, 0xc9b99a);

    this.add.text(tagX, tagY, `Sem ${this.state.week} — ${dayNames[this.state.day - 1]}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#5a3e1b',
    }).setOrigin(0.5);

    // ── Location cards on the map ──
    for (const loc of MAP_LOCATIONS) {
      const cardW = 110;
      const cardH = 80;

      const container = this.add.container(loc.x, loc.y);

      // Card shadow
      const shadow = this.add.rectangle(3, 3, cardW, cardH, 0x000000, 0.3);
      shadow.setOrigin(0.5);

      // Card (cream paper)
      const card = this.add.rectangle(0, 0, cardW, cardH, 0xfaf3e0);
      card.setOrigin(0.5);
      card.setStrokeStyle(1, 0xc9b99a);

      // Location icon
      const icon = this.add.text(0, -16, loc.icon, {
        fontSize: '22px',
      }).setOrigin(0.5);

      // Location name
      const label = this.add.text(0, 10, loc.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#3e2712',
      }).setOrigin(0.5);

      // Cost
      const locData = this.dataService.dateLocations[loc.key];
      const costText = this.add.text(0, 28, `$${locData.cost}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#7a5c3a',
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
        card.setFillStyle(0xfaf3e0);
        card.setStrokeStyle(1, 0xc9b99a);
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

      container.add([shadow, card, icon, label, costText, zone]);
    }

    // ── Phone button (sticky note style) ──
    const phoneZone = this.add.zone(width - 60, height - 115, 100, 44);
    phoneZone.setInteractive({ useHandCursor: true });
    this.add.rectangle(width - 60, height - 115, 100, 44, 0xd4e6f1);
    this.add.rectangle(width - 60, height - 115, 100, 44).setStrokeStyle(1, 0x8aaabb);
    this.add.text(width - 60, height - 115, '📱 Teléfono', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#2c3e50',
    }).setOrigin(0.5);
    phoneZone.on('pointerdown', () => {
      this.scene.start('PhoneScene');
    });

    // ── Advance day button (sticky note style) ──
    const skipZone = this.add.zone(width / 2, height - 115, 140, 44);
    skipZone.setInteractive({ useHandCursor: true });
    this.add.rectangle(width / 2, height - 115, 140, 44, 0xf5e6cc);
    this.add.rectangle(width / 2, height - 115, 140, 44).setStrokeStyle(1, 0xc9b99a);
    this.add.text(width / 2, height - 115, '⏭ Avanzar día', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#5a3e1b',
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
    const msg = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ff6b6b',
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
