import type { GameState } from '../types/game';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';

export interface WeekEvent {
  type: 'stalk' | 'gaslight' | 'male_encounter';
  text: string;
  givesPG?: boolean;
}

const dataService = new DataService(gameData);

/**
 * Generate weekly events: stalk (40%), gaslight (35%), male encounter (20%).
 * Stalk events may give PG.
 */
export function generateWeekEvents(state: GameState): WeekEvent[] {
  const events: WeekEvent[] = [];

  // Stalk event (40%)
  if (Math.random() < 0.4) {
    const evt = pick(dataService.stalkEvents);
    events.push({ type: 'stalk', text: evt.text, givesPG: evt.givesPG });
    if (evt.givesPG) {
      state.pg++;
    }
  }

  // Gaslight event (35%)
  if (Math.random() < 0.35) {
    const text = pick(dataService.gaslightingEvents);
    events.push({ type: 'gaslight', text });
  }

  // Male encounter (20%)
  if (Math.random() < 0.2) {
    const name = pick(dataService.maleEncounterNames);
    events.push({ type: 'male_encounter', text: `Te cruzaste con ${name}. Raro.` });
  }

  return events;
}

/**
 * Get a single ambient event for display.
 */
export function getAmbientEvent(): string {
  return pick(dataService.ambientEvents);
}
