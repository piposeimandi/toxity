import Phaser from 'phaser';

/**
 * Text effect that reveals characters one by one.
 */
export class TypewriterText {
  private textObj: Phaser.GameObjects.Text;
  private fullText: string;
  private charIndex: number = 0;
  private timer: Phaser.Time.TimerEvent | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    style?: Phaser.Types.GameObjects.Text.TextStyle,
  ) {
    this.fullText = text;
    this.textObj = scene.add.text(x, y, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: 700 },
      ...style,
    });
    this.textObj.setOrigin(0.5);
  }

  start(scene: Phaser.Scene, speed: number = 30): void {
    this.charIndex = 0;
    this.textObj.setText('');
    this.timer = scene.time.addEvent({
      delay: speed,
      repeat: this.fullText.length - 1,
      callback: () => {
        this.charIndex++;
        this.textObj.setText(this.fullText.substring(0, this.charIndex));
      },
    });
  }

  skip(): void {
    if (this.timer) {
      this.timer.remove(false);
      this.timer = null;
    }
    this.textObj.setText(this.fullText);
  }

  isComplete(): boolean {
    return this.charIndex >= this.fullText.length;
  }

  destroy(): void {
    if (this.timer) {
      this.timer.remove(false);
    }
    this.textObj.destroy();
  }
}
