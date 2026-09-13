import Phaser from 'phaser';
import type { VictoryType } from '../types/game';
import { Button } from '../components/Button';
import { deleteSave } from '../models/SaveSystem';
import { addDesk, addPaper, addLabel, COLORS, FONTS } from '../theme';

interface GameOverData {
  victoryType: VictoryType;
  partnerName?: string;
}

const ENDINGS: Record<VictoryType, {
  title: string;
  icon: string;
  color: string;
  bgColor: number;
  lines: string[];
}> = {
  V1: {
    title: 'VICTORIA — Amor Verdadero',
    icon: '💒',
    color: '#ff69b4',
    bgColor: 0x2a1a2a,
    lines: [
      'Encontraste el amor de tu vida.',
      'La relación superó todos los obstáculos.',
      'La Reina Falsa fue derrotada.',
      'Feliz para siempre... ¿o no?',
    ],
  },
  V2: {
    title: 'VICTORIA — Orgullo Personal',
    icon: '🏳️‍🌈',
    color: '#ff69b4',
    bgColor: 0x1a2a2a,
    lines: [
      'Tu Puntos Gay superaron el umbral.',
      'Descubriste tu verdadera identidad.',
      'La Reina Falsa no pudo contigo.',
      'Libertad total. Viví tu verdad.',
    ],
  },
  D1: {
    title: 'DERROTA — Quiebre Emocional',
    icon: '💔',
    color: '#ff4444',
    bgColor: 0x2a1a1a,
    lines: [
      'Tu ánimo tocó el fondo.',
      'No pudiste más con la presión.',
      'La Reina Falsa ganó esta vez.',
      '¿Volverás a intentarlo?',
    ],
  },
  D2: {
    title: 'DERROTA — Infidelidad Descubierta',
    icon: '🔪',
    color: '#ff4444',
    bgColor: 0x2a1a1a,
    lines: [
      'Tu pareja se enteró de todo.',
      'La confianza se rompió para siempre.',
      'La Reina Falsa lo orquestó todo.',
      'Game over, corazón roto.',
    ],
  },
  D3: {
    title: 'DERROTA — Estancamiento',
    icon: '⏰',
    color: '#ff8844',
    bgColor: 0x2a1a1a,
    lines: [
      'Meses sin progreso en ninguna relación.',
      'La rutina te consumió.',
      'La Reina Falsa no necesitó hacer nada.',
      'El tiempo jugó en tu contra.',
    ],
  },
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData): void {
    const { width, height } = this.cameras.main;
    const victoryType = data.victoryType ?? 'D1';
    const ending = ENDINGS[victoryType];

    // Delete save on game over
    deleteSave();

    // ── Wooden desk background ──
    addDesk(this, width, height);

    // ── Main document (official looking) ──
    const docW = 520;
    const docH = 440;
    const docX = width / 2;
    const docY = height / 2 - 10;

    addPaper(this, docX, docY, docW, docH);

    // ── Red CONFIDENTIAL stamp (rotated) ──
    const stampW = 200;
    const stampH = 30;
    const stamp = this.add.rectangle(docX + 80, docY - 140, stampW, stampH);
    stamp.setStrokeStyle(3, ending.bgColor === 0x2a1a2a ? 0xff69b4 : 0xff4444);
    stamp.setRotation(-0.2);

    const stampLabel = ending.bgColor === 0x2a1a2a ? 'APROBADO' : 'CONFIDENCIAL';
    const stampText = this.add.text(docX + 80, docY - 140, stampLabel, {
      fontFamily: FONTS.TITLE,
      fontSize: '12px',
      color: ending.bgColor === 0x2a1a2a ? '#ff69b4' : '#ff4444',
    }).setOrigin(0.5);
    stampText.setRotation(-0.2);

    // ── Icon ──
    this.add.text(docX, docY - 100, ending.icon, {
      fontSize: '40px',
    }).setOrigin(0.5);

    // ── Title ──
    this.add.text(docX, docY - 55, ending.title, {
      fontFamily: FONTS.TITLE,
      fontSize: '13px',
      color: ending.color,
      wordWrap: { width: docW - 60 },
      align: 'center',
    }).setOrigin(0.5);

    // ── Separator ──
    this.add.rectangle(docX, docY - 30, 400, 1, 0xccc0b0);

    // ── Partner name (if applicable) ──
    let textStartY = docY - 10;
    if (data.partnerName) {
      addLabel(this, docX, textStartY, `Relación: ${data.partnerName}`, {
        fontSize: 14,
        bold: true,
        color: '#8a2a4a',
        align: 'center',
      }).setOrigin(0.5);
      textStartY += 25;
    }

    // ── Ending text lines ──
    ending.lines.forEach((line, i) => {
      this.add.text(docX, textStartY + i * 28, line, {
        fontFamily: FONTS.BODY,
        fontSize: '13px',
        color: '#3e2712',
        wordWrap: { width: docW - 80 },
        align: 'center',
      }).setOrigin(0.5);
    });

    // ── Stats footer ──
    const statsY = docY + docH / 2 - 55;
    this.add.rectangle(docX, statsY - 10, 400, 1, 0xccc0b0);

    addLabel(this, docX, statsY + 10, `Resultado: ${victoryType}`, {
      fontSize: 13,
      color: '#8a7a6a',
      align: 'center',
    }).setOrigin(0.5);

    // ── "Volver a empezar" button ──
    const restartBtn = new Button(
      this,
      width / 2,
      height - 55,
      'Volver a empezar',
      280,
      50,
      COLORS.accentPurple,
      '13px',
    );
    restartBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}