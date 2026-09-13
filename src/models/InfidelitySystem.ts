import type { GameState } from '../types/game';
import { findRelationById, setPartnerHealth } from './RelationSystem';

/**
 * Maybe trigger infidelity when dating someone other than partner.
 * 40% chance when partner health >= novio threshold (40) + dating another.
 * Then 30% dump roll → D2.
 * Returns true if player was dumped (game over).
 */
export function maybeTriggerInfidelity(state: GameState, targetName: string): boolean {
  const partnerRel = state.partner ? findRelationById(state, state.partner) : null;
  if (!partnerRel) return false;
  if (targetName && targetName === partnerRel.name) return false;

  const gate = 40; // novio threshold
  if (state.healthPoints < gate) return false;

  const risk = 40; // infidelityRisk
  if (Math.random() * 100 < risk) {
    if (Math.random() < 0.3) {
      // Dumped!
      setPartnerHealth(state, 0);
      state.history.push({
        week: state.week,
        day: state.day,
        candidate: targetName,
        location: 'infidelity',
        result: 'fail',
      });
      return true;
    }

    // Caught but not dumped: -15 health
    setPartnerHealth(state, state.healthPoints - 15);
    state.history.push({
      week: state.week,
      day: state.day,
      candidate: targetName,
      location: 'infidelity',
      result: 'fail',
    });
    return false;
  }

  // Safe
  state.history.push({
    week: state.week,
    day: state.day,
    candidate: targetName,
    location: 'infidelity_safe',
    result: 'success',
  });
  return false;
}
