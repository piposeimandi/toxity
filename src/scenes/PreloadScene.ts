import Phaser from 'phaser';
import { gameData } from '../data/gameData';
import { DataService } from '../data/DataService';

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

    // ── Dark background ──
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    // Scanlines
    for (let i = 0; i < height; i += 3) {
      this.add.rectangle(width / 2, i, width, 1, 0x000000, 0.1);
    }

    // ── Terminal-style window ──
    const termW = 500;
    const termH = 400;
    const termX = width / 2;
    const termY = height / 2;

    this.add.rectangle(termX, termY, termW, termH, 0x111122);
    this.add.rectangle(termX, termY, termW - 4, termH - 4, 0x0a0a18);
    this.add.rectangle(termX, termY, termW - 8, termH - 8).setStrokeStyle(1, 0x222244);

    // Title bar
    this.add.rectangle(termX, termY - termH / 2 + 15, termW - 8, 30, 0x1a1a3a);
    this.add.text(termX, termY - termH / 2 + 15, '▸ TOXITY — DATA VALIDATOR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    // ── Run validation steps with animation ──
    const steps = this.validateData();
    const startY = termY - termH / 2 + 55;
    const lineHeight = 22;

    steps.forEach((step, i) => {
      this.time.delayedCall(i * 180, () => {
        const icon = step.ok ? '✓' : '✗';
        const color = step.ok ? '#4ecdc4' : '#ff6b6b';
        const statusColor = step.ok ? '#88ff88' : '#ff8888';

        // Step line
        this.add.text(termX - 220, startY + i * lineHeight, `${icon} ${step.name}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color,
        });

        // Detail
        this.add.text(termX + 220, startY + i * lineHeight, step.detail, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          color: statusColor,
        }).setOrigin(1, 0);
      });
    });

    // ── Summary after all steps ──
    const allOk = steps.every(s => s.ok);
    const summaryY = startY + steps.length * lineHeight + 20;

    this.time.delayedCall(steps.length * 180 + 200, () => {
      // Separator
      this.add.rectangle(termX, summaryY - 5, termW - 40, 1, 0x222244);

      if (allOk) {
        const dataService = new DataService(gameData);
        this.registry.set('dataService', dataService);

        this.add.text(termX, summaryY + 10, `✓ ${dataService.femaleCandidates.length} candidatas, ${dataService.maleCandidates.length} candidatos cargados`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#88ff88',
        }).setOrigin(0.5);

        this.add.text(termX, summaryY + 30, 'Todos los sistemas operativos.', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#4ecdc4',
        }).setOrigin(0.5);

        // Blinking "press any key" style
        const readyText = this.add.text(termX, summaryY + 60, '▸ Presioná para continuar...', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
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
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#ff4444',
        }).setOrigin(0.5);

        this.add.text(termX, summaryY + 30, 'No se pudo cargar el juego.', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#ff6b6b',
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
