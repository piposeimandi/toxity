import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // TODO: Import and validate data.json schema in Phase 1
    // import gameData from '../data/data.json';
    // this.registry.set('gameData', gameData);

    const readyText = this.add.text(width / 2, height / 2, 'Listo', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#88ff88',
    });
    readyText.setOrigin(0.5);

    this.time.delayedCall(400, () => {
      this.scene.start('MenuScene');
    });
  }
}
