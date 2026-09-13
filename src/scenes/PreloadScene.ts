import Phaser from 'phaser';
import { gameData } from '../data/gameData';
import { DataService } from '../data/DataService';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Validate data.json loaded correctly
    const dataService = new DataService(gameData);

    // Store data service in registry for other scenes
    this.registry.set('dataService', dataService);

    // Validate required fields
    const requiredFields = [
      'femaleCandidates',
      'maleCandidates',
      'dateLocations',
      'dialogueOptions',
    ];

    const missing = requiredFields.filter(f => !(gameData as unknown as Record<string, unknown>)[f]);
    if (missing.length > 0) {
      const errorText = this.add.text(width / 2, height / 2, `Error: missing data: ${missing.join(', ')}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#ff4444',
      });
      errorText.setOrigin(0.5);
      return;
    }

    const readyText = this.add.text(width / 2, height / 2, `Datos cargados: ${dataService.femaleCandidates.length} candidatas, ${dataService.maleCandidates.length} candidatos`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#88ff88',
    });
    readyText.setOrigin(0.5);

    this.time.delayedCall(600, () => {
      this.scene.start('MenuScene');
    });
  }
}
