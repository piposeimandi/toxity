import type { GameState, VictoryType } from '../types/game';

/**
 * Check victory conditions. Returns the VictoryType or null.
 * V1: partner stage reached 'familia' (health >= 70)
 * V2: PG >= 7 (surprise ending)
 */
export function checkVictories(state: GameState): VictoryType | null {
  // V1: family with partner
  if (state.partner) {
    const partnerRel = state.relations.find(r => r.id === state.partner);
    if (partnerRel && partnerRel.healthPoints >= 70) {
      return 'V1';
    }
  }

  // V2: PG surprise
  if (state.pg >= 7) {
    return 'V2';
  }

  return null;
}

/**
 * Check defeat conditions. Returns the VictoryType (D1-D3) or null.
 * D1: Queen reaches familia first
 * D2: isolation — daysWithoutDates >= 21 with mood <= 10, OR mood <= 0
 * D3: stagnation — weeksWithoutProgress >= 8
 */
export function checkDefeats(state: GameState): VictoryType | null {
  // D1: Queen reaches familia first
  if (state.queenRelation.healthPoints >= 70) {
    return 'D1';
  }

  // D2: isolation — no dates for 21 days with low mood
  if (state.daysWithoutDates >= 21 && state.mood <= 10) {
    return 'D2';
  }

  // D2: mood hits zero
  if (state.mood <= 0) {
    return 'D2';
  }

  // D3: stagnation
  if (state.weeksWithoutProgress >= 8) {
    return 'D3';
  }

  return null;
}
