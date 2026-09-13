import type { GameState } from '../types/game';
import type { PendingInvite } from '../types/game';
import { findRelationById, findRelation } from './RelationSystem';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';

const dataService = new DataService(gameData);

/**
 * Maybe generate an invite after a successful date.
 * 50% chance. Only 1 pending at a time.
 */
export function maybeGenerateInvite(state: GameState, candidateName: string): void {
  if (state.pendingInvite) return;

  const chance = dataService.messageChance ?? 50;
  if (Math.random() * 100 >= chance) return;

  const rel = findRelation(state, candidateName);
  if (!rel) return;

  const keys = Object.keys(dataService.dateLocations).filter(
    k => dataService.dateLocations[k].mapVisible !== false && k !== 'app'
  );
  if (!keys.length) return;

  const locKey = pick(keys);
  state.pendingInvite = { relId: rel.id, name: rel.name, locKey };
}

/**
 * Accept a pending invite. Returns the relation and location for date resolution.
 */
export function acceptInvite(state: GameState): { relId: string; locKey: string } | null {
  if (!state.pendingInvite) return null;

  const inv = state.pendingInvite;
  const rel = findRelationById(state, inv.relId);
  const loc = dataService.dateLocations[inv.locKey];

  if (!rel || !loc) {
    state.pendingInvite = null;
    return null;
  }

  if (state.money < loc.cost) {
    // Can't afford — invite stays pending
    return null;
  }

  state.money -= loc.cost;
  state.pendingInvite = null;
  return { relId: rel.id, locKey: inv.locKey };
}

/**
 * Decline a pending invite. No penalty.
 */
export function declineInvite(state: GameState): void {
  state.pendingInvite = null;
}
