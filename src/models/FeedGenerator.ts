import type { GameState } from '../types/game';
import type { Candidate } from '../types/data';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';
import { getRelationProgressText, getAvailableKnownPeople, findRelationById } from './RelationSystem';

export interface FeedEvent {
  type: 'pending_invite' | 'known_person' | 'location_hint' | 'ambient';
  text: string;
  relId?: string;
  locationKey?: string;
}

const dataService = new DataService(gameData);

/**
 * Generate feed events for the phone screen.
 * Shows: pending invite, known people, location hints, ambient events.
 */
export function generateFeedEvents(state: GameState): FeedEvent[] {
  const events: FeedEvent[] = [];

  // Pending invite
  if (state.pendingInvite) {
    const invRel = findRelationById(state, state.pendingInvite.relId);
    const invLoc = dataService.dateLocations[state.pendingInvite.locKey];
    if (invRel && invLoc) {
      const txts = dataService.inviteTexts.length > 0
        ? dataService.inviteTexts
        : ['¿Nos vemos en {lugar}? 😏'];
      let t = pick(txts);
      t = t.replace('{nombre}', invRel.name).replace('{lugar}', invLoc.name);
      events.push({
        type: 'pending_invite',
        relId: invRel.id,
        locationKey: state.pendingInvite.locKey,
        text: t,
      });
    } else {
      state.pendingInvite = null;
    }
  }

  // Known people (1-3 random)
  const knownPeople = getAvailableKnownPeople(state);
  const shuffled = knownPeople.sort(() => Math.random() - 0.5);
  const numKnown = Math.min(shuffled.length, Math.floor(Math.random() * 3) + 1);
  for (let i = 0; i < numKnown; i++) {
    const rel = shuffled[i];
    const stageLabel = getRelationProgressText(rel);
    events.push({
      type: 'known_person',
      text: `Seguir saliendo con ${rel.name} — ${stageLabel}`,
    });
  }

  // Location hint (30% chance)
  if (Math.random() < 0.3) {
    const locs = Object.keys(dataService.dateLocations).filter(
      k => dataService.dateLocations[k].mapVisible !== false && k !== 'app'
    );
    if (locs.length > 0) {
      const loc = pick(locs);
      events.push({
        type: 'location_hint',
        locationKey: loc,
        text: `Alguien te recomienda ir al ${dataService.dateLocations[loc].name} hoy.`,
      });
    }
  }

  // Ambient event (25% chance)
  if (Math.random() < 0.25) {
    events.push({
      type: 'ambient',
      text: pick(dataService.ambientEvents),
    });
  }

  return events;
}
