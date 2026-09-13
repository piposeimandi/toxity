import Phaser from 'phaser';
import type { GameState } from '../types/game';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';

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

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.add.text(width / 2, 40, 'MAPA DEL MUNDO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    // Day + Week info
    this.add.text(width / 2, 70, `Semana ${this.state.week} — ${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'][this.state.day - 1]}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Location hotspots
    for (const loc of MAP_LOCATIONS) {
      const container = this.add.container(loc.x, loc.y);

      const rect = this.add.rectangle(0, 0, 160, 120, loc.color);
      rect.setOrigin(0.5);
      rect.setStrokeStyle(2, 0xffffff);

      const icon = this.add.text(0, -20, loc.icon, {
        fontSize: '28px',
      }).setOrigin(0.5);

      const label = this.add.text(0, 15, loc.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#ffffff',
      }).setOrigin(0.5);

      const locData = this.dataService.dateLocations[loc.key];
      const costText = this.add.text(0, 35, `$${locData.cost}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#ffcc00',
      }).setOrigin(0.5);

      const zone = this.add.zone(0, 0, 160, 120);
      zone.setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => rect.setFillStyle(loc.color + 0x222222));
      zone.on('pointerout', () => rect.setFillStyle(loc.color));
      zone.on('pointerdown', () => {
        if (this.state.money < locData.cost) {
          this.showMessage('No tenés plata suficiente', width / 2, height - 60);
          this.time.delayedCall(1200, () => {
            this.state.mood = Math.max(0, this.state.mood - 3);
            this.state.day += 1;
            this.state.daysWithoutDates += 1;
            this.registry.set('gameState', this.state);
            this.scene.restart();
          });
          return;
        }
        this.state.money -= locData.cost;
        this.registry.set('gameState', this.state);
        this.scene.start('LocationScene', { locKey: loc.key });
      });

      container.add([rect, icon, label, costText, zone]);
    }

    // Phone button
    const phoneZone = this.add.zone(width - 60, height - 40, 100, 50);
    phoneZone.setInteractive({ useHandCursor: true });
    this.add.rectangle(width - 60, height - 40, 100, 50, 0x333355);
    this.add.text(width - 60, height - 40, '📱 Teléfono', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00ccff',
    }).setOrigin(0.5);
    phoneZone.on('pointerdown', () => {
      this.scene.start('PhoneScene');
    });

    // Advance day button (skip action)
    const skipZone = this.add.zone(width / 2, height - 40, 140, 40);
    skipZone.setInteractive({ useHandCursor: true });
    this.add.rectangle(width / 2, height - 40, 140, 40, 0x555555);
    this.add.text(width / 2, height - 40, '⏭ Avanzar día', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#cccccc',
    }).setOrigin(0.5);
    skipZone.on('pointerdown', () => {
      this.state.mood = Math.max(0, this.state.mood - 3);
      this.state.day += 1;
      this.state.daysWithoutDates += 1;
      if (this.state.day > 7) {
        this.registry.set('gameState', this.state);
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
