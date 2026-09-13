import Phaser from 'phaser';
import { gameData } from '../data/gameData';
import { DataService } from '../data/DataService';
import { addDesk, addPaper, COLORS, FONTS } from '../theme';

interface ValidationStep {
  name: string;
  ok: boolean;
  detail: string;
}

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const dataService = new DataService(gameData);
    dataService.loadAllPhotos(this);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // ── Warm desk background ──
    addDesk(this, width, height);

    // ── "Data validator" printout paper ──
    const termW = 500;
    const termH = 400;
    const termX = width / 2;
    const termY = height / 2;

    addPaper(this, termX, termY, termW, termH);

    // Title bar (pixel font only here)
    this.add.rectangle(termX, termY - termH / 2 + 15, termW - 8, 30, COLORS.paperEdge);
    this.add.text(termX, termY - termH / 2 + 15, '▸ TOXITY — DATA VALIDATOR', {
      fontFamily: FONTS.TITLE,
      fontSize: '10px',
      color: '#3d2a16',
    }).setOrigin(0.5);

    // ── Run validation steps with animation ──
    const steps = this.validateData();
    const startY = termY - termH / 2 + 55;
    const lineHeight = 22;

    steps.forEach((step, i) => {
      this.time.delayedCall(i * 180, () => {
        const icon = step.ok ? '✓' : '✗';
        const color = step.ok ? '#1f7a4a' : '#d43a34';
        const statusColor = step.ok ? '#2a5a3a' : '#a02620';

        // Step line
        this.add.text(termX - 220, startY + i * lineHeight, `${icon} ${step.name}`, {
          fontFamily: FONTS.BODY,
          fontSize: '13px',
          fontStyle: 'bold',
          color,
        });

        // Detail
        this.add.text(termX + 220, startY + i * lineHeight, step.detail, {
          fontFamily: FONTS.BODY,
          fontSize: '13px',
          color: statusColor,
        }).setOrigin(1, 0);
      });
    });

    // ── Summary after all steps ──
    const allOk = steps.every(s => s.ok);
    const summaryY = startY + steps.length * lineHeight + 20;

    this.time.delayedCall(steps.length * 180 + 200, () => {
      // Separator
      this.add.rectangle(termX, summaryY - 5, termW - 40, 1, COLORS.paperEdge);

      if (allOk) {
        const dataService = new DataService(gameData);
        this.registry.set('dataService', dataService);

        this.add.text(termX, summaryY + 10, `✓ ${dataService.femaleCandidates.length} candidatas, ${dataService.maleCandidates.length} candidatos cargados`, {
          fontFamily: FONTS.BODY,
          fontSize: '13px',
          color: '#1f7a4a',
        }).setOrigin(0.5);

        this.add.text(termX, summaryY + 30, 'Todos los sistemas operativos.', {
          fontFamily: FONTS.BODY,
          fontSize: '13px',
          color: '#2a6a62',
        }).setOrigin(0.5);

        // Blinking "press any key" style
        const readyText = this.add.text(termX, summaryY + 60, '▸ Presioná para continuar...', {
          fontFamily: FONTS.BODY,
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#6c63ff',
        }).setOrigin(0.5);

        this.tweens.add({
          targets: readyText,
          alpha: { from: 0.4, to: 1 },
          duration: 500,
          yoyo: true,
          repeat: -1,
        });

        // Auto-advance or click
        this.input.once('pointerdown', () => {
          this.scene.start('MenuScene');
        });
        this.time.delayedCall(1500, () => {
          this.scene.start('MenuScene');
        });
      } else {
        const failed = steps.filter(s => !s.ok).map(s => s.name).join(', ');
        this.add.text(termX, summaryY + 10, `✗ Error: ${failed}`, {
          fontFamily: FONTS.BODY,
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#d43a34',
        }).setOrigin(0.5);

        this.add.text(termX, summaryY + 30, 'No se pudo cargar el juego.', {
          fontFamily: FONTS.BODY,
          fontSize: '13px',
          color: '#a02620',
        }).setOrigin(0.5);
      }
    });
  }

  private validateData(): ValidationStep[] {
    const steps: ValidationStep[] = [];

    const d = gameData as unknown as Record<string, unknown>;

    // Check femaleCandidates
    const fc = d.femaleCandidates;
    steps.push({
      name: 'femaleCandidates',
      ok: Array.isArray(fc) && fc.length > 0,
      detail: Array.isArray(fc) ? `${(fc as unknown[]).length} entries` : 'MISSING',
    });

    // Check maleCandidates
    const mc = d.maleCandidates;
    steps.push({
      name: 'maleCandidates',
      ok: Array.isArray(mc) && mc.length > 0,
      detail: Array.isArray(mc) ? `${(mc as unknown[]).length} entries` : 'MISSING',
    });

    // Check dateLocations
    const dl = d.dateLocations;
    steps.push({
      name: 'dateLocations',
      ok: typeof dl === 'object' && dl !== null,
      detail: typeof dl === 'object' && dl !== null ? `${Object.keys(dl as object).length} locations` : 'MISSING',
    });

    // Check dialogueOptions
    const dopt = d.dialogueOptions;
    steps.push({
      name: 'dialogueOptions',
      ok: Array.isArray(dopt) && dopt.length > 0,
      detail: Array.isArray(dopt) ? `${(dopt as unknown[]).length} options` : 'MISSING',
    });

    // Check weekSummaryGags
    const gags = d.weekSummaryGags;
    steps.push({
      name: 'weekSummaryGags',
      ok: Array.isArray(gags) && gags.length > 0,
      detail: Array.isArray(gags) ? `${(gags as unknown[]).length} gags` : 'MISSING',
    });

    return steps;
  }
}