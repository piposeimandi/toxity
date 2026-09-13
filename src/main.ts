import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { WorldScene } from './scenes/WorldScene';
import { LocationScene } from './scenes/LocationScene';
import { DateScene } from './scenes/DateScene';
import { PhoneScene } from './scenes/PhoneScene';
import { WeekEndScene } from './scenes/WeekEndScene';
import { GameOverScene } from './scenes/GameOverScene';
import { HUDScene } from './scenes/HUDScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    WorldScene,
    LocationScene,
    DateScene,
    PhoneScene,
    WeekEndScene,
    GameOverScene,
    HUDScene,
  ],
};

const game = new Phaser.Game(config);

// Debug hook (dev only) — enables automated layout inspection via puppeteer
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__toxityGame = game;
}
