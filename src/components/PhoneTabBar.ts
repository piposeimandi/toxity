import Phaser from 'phaser';
import { FONTS } from '../theme';

export type PhoneTab = 'contacts' | 'messages' | 'app';

const TABS: { key: PhoneTab; label: string; icon: string }[] = [
  { key: 'contacts', label: 'Contactos', icon: '👤' },
  { key: 'messages', label: 'Mensajes', icon: '💬' },
  { key: 'app', label: 'App Citas', icon: '💘' },
];

/**
 * Tab bar for the phone scene. 3 tabs: Contacts / Messages / App.
 */
export class PhoneTabBar extends Phaser.GameObjects.Container {
  private tabs: { zone: Phaser.GameObjects.Zone; bg: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text; key: PhoneTab }[] = [];
  private activeTab: PhoneTab = 'contacts';

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y);

    const tabWidth = width / TABS.length;
    const tabHeight = 44;

    TABS.forEach((tab, i) => {
      const tx = i * tabWidth + tabWidth / 2;
      const isActive = tab.key === this.activeTab;

      const bg = scene.add.rectangle(tx, 0, tabWidth, tabHeight, isActive ? 0x6c63ff : 0x1d140d);
      bg.setOrigin(0.5);
      bg.setStrokeStyle(1, 0x000000, 0.25);

      const label = scene.add.text(tx, 0, `${tab.icon} ${tab.label}`, {
        fontFamily: FONTS.BODY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: isActive ? '#ffffff' : '#8a7a6a',
      });
      label.setOrigin(0.5);

      const zone = scene.add.zone(tx, 0, tabWidth, tabHeight);
      zone.setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        this.setActiveTab(tab.key);
        this.emit('tab-change', tab.key);
      });

      this.tabs.push({ zone, bg, label, key: tab.key });
      this.add([bg, label, zone]);
    });

    scene.add.existing(this);
  }

  setActiveTab(tab: PhoneTab): void {
    this.activeTab = tab;
    this.tabs.forEach(t => {
      const isActive = t.key === tab;
      t.bg.setFillStyle(isActive ? 0x6c63ff : 0x1d140d);
      t.label.setColor(isActive ? '#ffffff' : '#8a7a6a');
    });
  }

  getActiveTab(): PhoneTab {
    return this.activeTab;
  }
}