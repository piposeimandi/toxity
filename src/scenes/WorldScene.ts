import Phaser from 'phaser';

/**
 * Stub scene — placeholder for Phase 1 (WorldMap with 4 location hotspots).
 * Shows a colored background + "Coming Soon" label and returns to Menu.
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    const label = this.add.text(width / 2, height / 2 - 20, 'WorldScene', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffcc00',
    });
    label.setOrigin(0.5);

    const hint = this.add.text(width / 2, height / 2 + 30, 'Proximamente...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#888888',
    });
    hint.setOrigin(0.5);

    // Return to menu after 2s
    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }
}
