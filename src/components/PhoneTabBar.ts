import Phaser from 'phaser';

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

      const bg = scene.add.rectangle(tx, 0, tabWidth, tabHeight, isActive ? 0x4a90d9 : 0x2a2a4a);
      bg.setOrigin(0.5);

      const label = scene.add.text(tx, 0, `${tab.icon} ${tab.label}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: isActive ? '#ffffff' : '#888888',
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
      t.bg.setFillStyle(isActive ? 0x4a90d9 : 0x2a2a4a);
      t.label.setColor(isActive ? '#ffffff' : '#888888');
    });
  }

  getActiveTab(): PhoneTab {
    return this.activeTab;
  }
}
