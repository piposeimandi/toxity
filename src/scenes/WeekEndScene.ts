import Phaser from 'phaser';
import type { GameState } from '../types/game';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';
import { formatMoney } from '../utils/text';
import { Button } from '../components/Button';
import { renderQueenPortrait } from '../components/QueenPortrait';
import { updatePartnerHealthWeekly, findRelationById, getRelationProgressText } from '../models/RelationSystem';
import { queenTurn, type QueenTurnResult } from '../models/QueenAI';
import { generateWeekEvents, type WeekEvent } from '../models/EventSystem';
import { checkVictories, checkDefeats } from '../models/VictoryChecker';
import { addDesk, COLORS, FONTS } from '../theme';

export class WeekEndScene extends Phaser.Scene {
  private state!: GameState;
  private dataService!: DataService;

  constructor() {
    super({ key: 'WeekEndScene' });
  }

  create(): void {
    this.state = this.registry.get('gameState') as GameState;
    this.dataService = new DataService(gameData);

    const { width, height } = this.cameras.main;

    // === DESK / PAPERS AESTHETIC ===

    // Desk background (warm wood tone)
    addDesk(this, width, height);

    // Main paper stack (slightly rotated for realism)
    this.renderPaper(width / 2, height / 2 - 20, 500, 420, 0xf5f0e8, -1.5);
    // Second paper (peeking behind)
    this.renderPaper(width / 2 + 8, height / 2 - 12, 490, 410, 0xebe5d8, 0.8);
    // Third paper
    this.renderPaper(width / 2 - 5, height / 2 - 25, 495, 415, 0xf0ead8, -0.3);

    // Title on top paper
    this.add.text(width / 2, 55, 'RESUMEN SEMANAL', {
      fontFamily: FONTS.TITLE,
      fontSize: '14px',
      color: '#3d2a16',
    }).setOrigin(0.5);

    // Week line (like printed on paper)
    this.add.text(width / 2, 80, `Semana ${this.state.week} completada`, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#5a4a3a',
    }).setOrigin(0.5);

    // Separator line
    this.add.rectangle(width / 2, 100, 400, 1, 0xaaa090);

    // === PAPER CONTENT ===

    // Salary
    this.state.money += 80;
    this.renderPaperLine(width / 2, 125, `💵 Salario: +$80 → Total: ${formatMoney(this.state.money)}`, '#2a6a4a');

    // Stats
    this.renderPaperLine(width / 2, 155, `Ánimo: ${this.state.mood}`, '#5a4a3a');
    this.renderPaperLine(width / 2, 175, `Días sin citas: ${this.state.daysWithoutDates}`, '#5a4a3a');
    this.renderPaperLine(width / 2, 195, `PG (oculto): ${this.state.pg}`, '#8a7a6a');

    // Separator
    this.add.rectangle(width / 2, 220, 400, 1, 0xccc0b0);

    // Partner health
    if (this.state.partner) {
      const rel = findRelationById(this.state, this.state.partner);
      if (rel) {
        const stageText = getRelationProgressText(rel);
        this.renderPaperLine(width / 2, 245, `💕 ${rel.name} — ${stageText}`, '#8a2a4a');

        // Health bar on paper
        const barX = width / 2 - 100;
        const barY = 265;
        const barBg = this.add.rectangle(barX + 100, barY, 200, 10, 0xe8dcc8);
        barBg.setStrokeStyle(1, COLORS.paperEdge);
        const hpPct = rel.healthPoints / 100;
        const barColor = hpPct > 0.6 ? 0x4ecdc4 : hpPct > 0.3 ? 0xffaa00 : 0xff6b6b;
        this.add.rectangle(barX + 100, barY, 200 * hpPct, 10, barColor);

        if (this.state.weeksWithoutProgress > 0) {
          this.renderPaperLine(width / 2, 285, `⚠ ${this.state.weeksWithoutProgress} sem(s) sin progreso`, '#aa4a2a');
        }
      }
    } else if (this.state.relations.length > 0) {
      this.renderPaperLine(width / 2, 245, `Relación: ${this.state.relations.length} conocidos — sin pareja`, '#5a4a3a');
    } else {
      this.renderPaperLine(width / 2, 245, 'Relación: Sin relación', '#5a4a3a');
    }

    // Separator
    this.add.rectangle(width / 2, 310, 400, 1, 0xccc0b0);

    // === QUEEN AI TURN ===
    const queenResult = queenTurn(this.state);
    this.renderQueenResult(width / 2, 340, queenResult);

    // === WEEK EVENTS ===
    const weekEvents = generateWeekEvents(this.state);
    if (weekEvents.length > 0) {
      this.renderWeekEvents(width / 2, 400, weekEvents);
    }

    // Week gag (at bottom of paper)
    const gag = pick(this.dataService.weekSummaryGags);
    this.add.text(width / 2, height - 120, `"${gag}"`, {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#8a7a6a',
      wordWrap: { width: 400 },
      align: 'center',
    }).setOrigin(0.5);

    // Advance week
    this.state.day = 1;
    this.state.week += 1;

    // Check victories/defeats
    const victory = checkVictories(this.state);
    const defeat = checkDefeats(this.state);

    this.registry.set('gameState', this.state);

    // Continue or game over button
    if (victory || defeat) {
      const resultType = victory ?? defeat;
      const gameOverBtn = new Button(
        this,
        width / 2,
        height - 60,
        '→ Ver resultado',
        280,
        50,
        resultType && resultType.startsWith('V') ? COLORS.accentTeal : COLORS.danger,
        '13px',
      );
      gameOverBtn.on('pointerdown', () => {
        this.scene.start('GameOverScene', { victoryType: resultType });
      });
    } else {
      const continueBtn = new Button(
        this,
        width / 2,
        height - 60,
        '→ Semana siguiente',
        280,
        50,
        COLORS.accentPurple,
        '13px',
      );
      continueBtn.on('pointerdown', () => {
        this.scene.start('WorldScene');
      });
    }
  }

  private renderPaper(x: number, y: number, w: number, h: number, color: number, angle: number): void {
    const paper = this.add.rectangle(x, y, w, h, color);
    paper.setOrigin(0.5);
    paper.setRotation(angle * Math.PI / 180);
    paper.setStrokeStyle(1, 0xccbbaa);

    // Shadow effect
    const shadow = this.add.rectangle(x + 3, y + 3, w, h, 0x000000, 0.15);
    shadow.setOrigin(0.5);
    shadow.setRotation(angle * Math.PI / 180);
  }

  private renderPaperLine(x: number, y: number, text: string, color: string): void {
    this.add.text(x, y, text, {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color,
      wordWrap: { width: 420 },
      align: 'center',
    }).setOrigin(0.5);
  }

  private renderQueenResult(x: number, y: number, result: QueenTurnResult): void {
    // Queen portrait
    renderQueenPortrait(this, x - 140, y, 40);

    const icon = result.action === 'advance' ? '👑' : '⚔️';
    const color = result.action === 'advance' ? '#8a6a2a'
      : result.action.includes('major') ? '#aa2a2a'
      : result.action.includes('minor') ? '#aa6a2a'
      : '#4a8a4a';

    this.renderPaperLine(x + 20, y, `${icon} ${result.detail}`, color);
  }

  private renderWeekEvents(x: number, y: number, events: WeekEvent[]): void {
    events.forEach((evt, i) => {
      const icon = evt.type === 'stalk' ? '👁️'
        : evt.type === 'gaslight' ? '💭'
        : '👤';
      const color = evt.type === 'stalk' ? '#8a2a4a'
        : evt.type === 'gaslight' ? '#6a4a8a'
        : '#4a6a8a';

      this.renderPaperLine(x, y + i * 22, `${icon} ${evt.text}`, color);
    });
  }
}