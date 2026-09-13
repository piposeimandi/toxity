import Phaser from 'phaser';
import type { GameState } from '../types/game';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { Button } from '../components/Button';
import { PhoneTabBar, type PhoneTab } from '../components/PhoneTabBar';
import { getAvailableKnownPeople, findRelationById, getRelationProgressText } from '../models/RelationSystem';
import { generateFeedEvents } from '../models/FeedGenerator';
import { getAppProfiles } from '../models/LocationResolver';
import { maybeGenerateInvite } from '../models/InviteSystem';
import { addRelation } from '../models/RelationSystem';
import { pick } from '../utils/math';
import { COLORS as ThemeColors, FONTS } from '../theme';

const PHONE = {
  bezel: 0x14100b,
  screenBg: 0x2b2016,
  headerBg: 0x1d140d,
  cardBg: 0x2e2217,
  accent: 0x6c63ff,
  danger: 0xe0564f,
  success: 0x2ec4b6,
  text: '#f7f1e3',
  dim: '#c9b8a5',
  muted: '#8a7a6a',
};

export class PhoneScene extends Phaser.Scene {
  private state!: GameState;
  private dataService!: DataService;
  private contentContainer!: Phaser.GameObjects.Container;
  private currentTab: PhoneTab = 'contacts';

  constructor() {
    super({ key: 'PhoneScene' });
  }

  create(): void {
    this.state = this.registry.get('gameState') as GameState;
    this.dataService = new DataService(gameData);

    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, ThemeColors.deskBrown);

    // Phone frame (modern smartphone look, layered rects)
    const phoneW = 380;
    const phoneH = 520;
    const phoneX = width / 2;
    const phoneY = height / 2 + 10;

    // Phone body (rounded rectangle effect: dark bezel)
    this.add.rectangle(phoneX, phoneY, phoneW, phoneH, PHONE.bezel);
    this.add.rectangle(phoneX + 2, phoneY + 2, phoneW - 4, phoneH - 4, PHONE.bezel);
    // Screen (lighter than the bezel)
    this.add.rectangle(phoneX, phoneY, phoneW - 4, phoneH - 4, PHONE.screenBg);
    this.add.rectangle(phoneX, phoneY, phoneW - 4, phoneH - 4).setStrokeStyle(1, ThemeColors.paperEdge, 0.18);

    // Notch / status bar
    this.add.rectangle(phoneX, phoneY - phoneH / 2 + 20, phoneW - 8, 40, PHONE.headerBg);
    this.add.rectangle(phoneX, phoneY - phoneH / 2 + 20, phoneW - 8, 2).setStrokeStyle(1, ThemeColors.paperEdge, 0.3);
    this.add.text(phoneX, phoneY - phoneH / 2 + 20, `📱 Toxity — Sem ${this.state.week}`, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      fontStyle: 'bold',
      color: PHONE.text,
    }).setOrigin(0.5);

    // Tab bar
    const tabBar = new PhoneTabBar(
      this,
      phoneX,
      phoneY - phoneH / 2 + 60,
      phoneW - 8,
    );

    // Content area
    this.contentContainer = this.add.container(phoneX, phoneY - phoneH / 2 + 110);

    // Back button
    const backBtn = new Button(
      this,
      phoneX,
      phoneY + phoneH / 2 - 30,
      '← Volver al mapa',
      200,
      36,
      ThemeColors.deskBrownDark,
      '13px',
    );
    backBtn.on('pointerdown', () => {
      this.scene.start('WorldScene');
    });

    // Tab change handler
    tabBar.on('tab-change', (tab: PhoneTab) => {
      this.currentTab = tab;
      this.renderTab();
    });

    // Render initial tab
    this.renderTab();
  }

  private renderTab(): void {
    this.contentContainer.removeAll(true);

    switch (this.currentTab) {
      case 'contacts':
        this.renderContacts();
        break;
      case 'messages':
        this.renderMessages();
        break;
      case 'app':
        this.renderApp();
        break;
    }
  }

  private renderContacts(): void {
    const known = getAvailableKnownPeople(this.state);

    // Pending invite banner
    if (this.state.pendingInvite) {
      const invRel = findRelationById(this.state, this.state.pendingInvite.relId);
      const invLoc = this.dataService.dateLocations[this.state.pendingInvite.locKey];
      if (invRel && invLoc) {
        const banner = this.add.rectangle(0, 10, 340, 70, 0x2a4a2a);
        banner.setOrigin(0.5);
        const bannerText = this.add.text(0, 0, `📨 ${invRel.name} te invita a ${invLoc.name}`, {
          fontFamily: FONTS.BODY,
          fontSize: '12px',
          color: '#a8e8a8',
          wordWrap: { width: 320 },
          align: 'center',
        }).setOrigin(0.5);

        const acceptBtn = new Button(this, -80, 35, '✓ Aceptar', 100, 28, PHONE.success, '11px');
        acceptBtn.on('pointerdown', () => {
          this.scene.start('WorldScene');
          // TODO: Wire invite acceptance to date flow
        });

        const declineBtn = new Button(this, 80, 35, '✗ Rechazar', 100, 28, PHONE.danger, '11px');
        declineBtn.on('pointerdown', () => {
          this.state.pendingInvite = null;
          this.registry.set('gameState', this.state);
          this.renderTab();
        });

        this.contentContainer.add([banner, bannerText, acceptBtn, declineBtn]);
      }
    }

    // Contact list
    const startY = this.state.pendingInvite ? 60 : 10;
    if (known.length === 0) {
      const empty = this.add.text(0, startY + 30, 'Sin contactos conocidos.\nVisitá la App de Citas o el mapa.', {
        fontFamily: FONTS.BODY,
        fontSize: '12px',
        color: PHONE.dim,
        align: 'center',
        wordWrap: { width: 300 },
      }).setOrigin(0.5);
      this.contentContainer.add(empty);
      return;
    }

    known.forEach((rel, i) => {
      const y = startY + i * 65 + 30;

      // Card background
      const card = this.add.rectangle(0, y, 340, 55, PHONE.cardBg);
      card.setOrigin(0.5);
      card.setStrokeStyle(1, ThemeColors.paperEdge, 0.22);

      // Name + stage
      const stageText = getRelationProgressText(rel);
      const nameText = this.add.text(-150, y - 12, rel.name, {
        fontFamily: FONTS.BODY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: PHONE.text,
      });
      const stageLabel = this.add.text(-150, y + 6, stageText, {
        fontFamily: FONTS.BODY,
        fontSize: '11px',
        color: PHONE.dim,
      });

      // Invite button
      const inviteBtn = new Button(this, 130, y, '📨 Invitar', 80, 28, PHONE.accent, '11px');
      inviteBtn.on('pointerdown', () => {
        if (this.state.pendingInvite) {
          // Already have pending invite
          return;
        }
        maybeGenerateInvite(this.state, rel.name);
        this.registry.set('gameState', this.state);
        this.renderTab();
      });

      this.contentContainer.add([card, nameText, stageLabel, inviteBtn]);
    });
  }

  private renderMessages(): void {
    const events = generateFeedEvents(this.state);

    if (events.length === 0) {
      const empty = this.add.text(0, 30, 'Sin mensajes nuevos.', {
        fontFamily: FONTS.BODY,
        fontSize: '12px',
        color: PHONE.dim,
      }).setOrigin(0.5);
      this.contentContainer.add(empty);
      return;
    }

    events.forEach((evt, i) => {
      const y = i * 70 + 30;

      const card = this.add.rectangle(0, y, 340, 60, PHONE.cardBg);
      card.setOrigin(0.5);
      card.setStrokeStyle(1, ThemeColors.paperEdge, 0.22);

      const icon = evt.type === 'pending_invite' ? '📨'
        : evt.type === 'known_person' ? '👤'
        : evt.type === 'location_hint' ? '📍'
        : '🌤️';

      const text = this.add.text(-150, y - 8, `${icon} ${evt.text}`, {
        fontFamily: FONTS.BODY,
        fontSize: '12px',
        color: PHONE.text,
        wordWrap: { width: 300 },
      });

      this.contentContainer.add([card, text]);
    });
  }

  private renderApp(): void {
    const profiles = getAppProfiles(this.state, 4);

    if (profiles.length === 0) {
      const empty = this.add.text(0, 30, 'Sin perfiles nuevos.\nTodos los candidatos ya son contactos.', {
        fontFamily: FONTS.BODY,
        fontSize: '12px',
        color: PHONE.dim,
        align: 'center',
        wordWrap: { width: 300 },
      }).setOrigin(0.5);
      this.contentContainer.add(empty);
      return;
    }

    // Tinder-style profile cards
    profiles.forEach((c, i) => {
      const y = i * 110 + 40;

      // Card
      const card = this.add.rectangle(0, y, 340, 95, PHONE.cardBg);
      card.setOrigin(0.5);
      card.setStrokeStyle(1, PHONE.accent, 0.6);

      // Photo (wooden frame + real image, fallback: first letter)
      const frameShadow = this.add.rectangle(-128, y + 2, 58, 58, 0x000000).setOrigin(0.5).setAlpha(0.3);
      const frame = this.add.rectangle(-130, y, 58, 58, 0x8a5a34).setOrigin(0.5);
      frame.setStrokeStyle(1, 0x5a3a1e);
      const avatar = this.add.rectangle(-130, y, 50, 50, ThemeColors.paper).setOrigin(0.5);
      const photoKey = this.dataService.getPhotoKey(c);
      let avatarContent: Phaser.GameObjects.GameObject = this.add.text(-130, y, c.name.charAt(0), {
        fontFamily: FONTS.BODY,
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#7a5c3a',
      }).setOrigin(0.5);
      if (photoKey && this.textures.exists(photoKey)) {
        avatarContent = this.add.image(-130, y, photoKey).setOrigin(0.5).setDisplaySize(48, 48);
      }

      // Info
      const nameText = this.add.text(-95, y - 20, c.name, {
        fontFamily: FONTS.BODY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: PHONE.text,
      });
      const traits = this.add.text(-95, y - 4, c.traits, {
        fontFamily: FONTS.BODY,
        fontSize: '11px',
        color: PHONE.dim,
        wordWrap: { width: 220 },
      });
      const personality = this.add.text(-95, y + 14, `${c.personality}`, {
        fontFamily: FONTS.BODY,
        fontSize: '11px',
        color: '#aaaaaa',
      });

      // Match button (creates contact + date)
      const matchBtn = new Button(this, 120, y, '💘 Match', 80, 28, ThemeColors.accentPink, '11px');
      matchBtn.on('pointerdown', () => {
        // Create contact and go to date
        addRelation(this.state, c);
        this.registry.set('gameState', this.state);
        // Start date at a random location
        const locKeys = Object.keys(this.dataService.dateLocations).filter(
          k => this.dataService.dateLocations[k].mapVisible !== false && k !== 'app'
        );
        const locKey = pick(locKeys);
        this.scene.start('LocationScene', { locKey });
      });

      this.contentContainer.add([card, frameShadow, frame, avatar, avatarContent, nameText, traits, personality, matchBtn]);
    });
  }
}