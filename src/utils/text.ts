import type { RelationStage } from '../types/game';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/**
 * Get day name from day number (1-7).
 */
export function getDayName(day: number): string {
  return DAY_NAMES[day - 1] ?? `Día ${day}`;
}

/**
 * Get human-readable relation stage text.
 */
export function getRelStageText(stage: RelationStage): string {
  switch (stage) {
    case 'conocer': return 'Conocer';
    case 'citando': return 'Citando';
    case 'novio': return 'Novio/a';
    case 'familia': return 'Familia';
    default: return stage;
  }
}

/**
 * Format money with $ prefix.
 */
export function formatMoney(amount: number): string {
  return `$${amount}`;
}
