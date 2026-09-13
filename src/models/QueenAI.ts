import type { GameState, QueenLog } from '../types/game';
import { setPartnerHealth, syncPartnerHealth } from './RelationSystem';

export interface QueenTurnResult {
  action: 'advance' | 'sabotage_major' | 'sabotage_minor' | 'sabotage_fail';
  detail: string;
  health?: number;
}

/**
 * Calculate sabotage chance for a location.
 * Safe locations = 0%. Risk mapped: low=15, medium=30, high=50, extreme=70.
 */
export function getSabotageChance(loc: { safe?: boolean; risk: string }): number {
  if (loc.safe) return 0;
  switch (loc.risk) {
    case 'low': return 15;
    case 'medium': return 30;
    case 'high': return 50;
    case 'extreme': return 70;
    default: return 30;
  }
}

/**
 * Queen AI turn. Called weekly during end-of-week.
 * 60%: advance own relationship (+5 health).
 * 40%: sabotage player (60% major -15, 30% minor -5, 10% fail).
 * If no player partner, always advances.
 */
export function queenTurn(state: GameState): QueenTurnResult {
  if (!state.queenRelation) {
    state.queenRelation = { healthPoints: 5 };
  }
  if (state.queenRelation.healthPoints == null) {
    state.queenRelation.healthPoints = 5;
  }

  // No partner → always advance
  if (!state.partner) {
    return queenAdvance(state);
  }

  const roll = Math.random() * 100;
  if (roll < 60) {
    return queenAdvance(state);
  } else {
    return queenSabotage(state);
  }
}

function queenAdvance(state: GameState): QueenTurnResult {
  state.queenRelation.healthPoints = Math.min(100, state.queenRelation.healthPoints + 5);
  const detail = `La Reina avanzó su propia relación (+5 salud, ahora ${state.queenRelation.healthPoints}/100).`;

  state.queensLogs.push({
    week: state.week,
    action: 'advance',
    detail,
  });

  return { action: 'advance', detail, health: state.queenRelation.healthPoints };
}

function queenSabotage(state: GameState): QueenTurnResult {
  const d = Math.random() * 100;
  const majorChance = 60;
  const major = 15;
  const minor = 5;

  if (d < majorChance) {
    setPartnerHealth(state, state.healthPoints - major);
    const detail = `La Reina SABOTEÓ tu relación (éxito mayor, -${major} salud, ahora ${state.healthPoints}/100).`;

    state.queensLogs.push({
      week: state.week,
      action: 'sabotage',
      detail,
    });

    return { action: 'sabotage_major', detail };
  } else if (d < majorChance + 30) {
    setPartnerHealth(state, state.healthPoints - minor);
    const detail = `La Reina saboteó tu relación (éxito menor, -${minor} salud, ahora ${state.healthPoints}/100).`;

    state.queensLogs.push({
      week: state.week,
      action: 'sabotage',
      detail,
    });

    return { action: 'sabotage_minor', detail };
  } else {
    const detail = 'La Reina intentó sabotearte pero falló. Su relación no avanzó esta semana.';

    state.queensLogs.push({
      week: state.week,
      action: 'fail',
      detail,
    });

    return { action: 'sabotage_fail', detail };
  }
}
