import type { GameState } from '../types/game';
import type { Candidate, Location } from '../types/data';
import { DataService } from '../data/DataService';
import { gameData } from '../data/gameData';
import { pick } from '../utils/math';
import { addRelation } from './RelationSystem';

export interface LocationVisitResult {
  type: 'encounter' | 'no_candidate' | 'gym' | 'app' | 'casual' | 'male_encounter';
  candidate?: Candidate;
  eventText?: string;
  stats?: { mood: number; confidence: number; appearance: number };
}

const dataService = new DataService(gameData);

/**
 * Resolve a location visit. Returns what happens at the location.
 */
export function resolveLocation(state: GameState, locKey: string): LocationVisitResult {
  const loc = dataService.dateLocations[locKey];
  if (!loc) {
    return { type: 'no_candidate', eventText: 'Ese lugar no existe.' };
  }

  // App: special flow
  if (locKey === 'app') {
    return { type: 'app' };
  }

  // Gym: safe haven
  if (locKey === 'gym') {
    return resolveGym(state, loc);
  }

  // Gender ratio check for male encounter
  const isMan = Math.random() > loc.genderRatio;
  if (isMan) {
    state.consecutiveMen++;
    const gayChance = Math.min(0.9, 0.2 + 0.3 * Math.max(0, state.consecutiveMen - 1));
    if (Math.random() < gayChance) {
      return resolveMaleEncounter(state, loc);
    }
  } else {
    state.consecutiveMen = 0;
  }

  // Casual encounter: bar/cafe/parque only (15% chance)
  if (locKey === 'bar' || locKey === 'cafe' || locKey === 'parque') {
    const casualChance = dataService.casualEncounterChance ?? 15;
    const unknowns = getNewCandidates(state);
    if (unknowns.length > 0 && Math.random() * 100 < casualChance) {
      const c = pick(unknowns);
      addRelation(state, c);
      return { type: 'casual', candidate: c };
    }
  }

  // No candidate found: ambient visit
  return resolveAmbient(state, loc);
}

function resolveGym(state: GameState, loc: Location): LocationVisitResult {
  state.daysWithoutDates = 0;
  state.gymLastEvent = '';

  const r = Math.random() * 100;
  const harasserChance = Math.min(60, 15 + state.pg * 6);
  const socialStart = 20;
  const harasserStart = Math.max(socialStart + 20, 100 - harasserChance);

  if (r < socialStart) {
    return resolveGymSolo(state);
  } else if (r < harasserStart) {
    return resolveGymSocial(state);
  } else {
    return resolveGymHarasser(state);
  }
}

function resolveGymSolo(state: GameState): LocationVisitResult {
  state.mood = Math.min(100, state.mood + 6);
  state.appearance = Math.min(100, state.appearance + 4);
  state.gymLastEvent = 'solo';

  // Cooldown: 1 reset per week
  if (state.lastGymResetWeek !== state.week) {
    state.weeksWithoutProgress = 0;
    state.lastGymResetWeek = state.week;
  }

  state.history.push({ week: state.week, day: state.day, candidate: 'gym', location: 'gym', result: 'success' });

  return {
    type: 'gym',
    eventText: pick(dataService.gymSoloTexts),
    stats: { mood: state.mood, confidence: state.confidence, appearance: state.appearance },
  };
}

function resolveGymSocial(state: GameState): LocationVisitResult {
  const maleInterest = state.pg >= 3 && Math.random() < 0.3;
  if (maleInterest && dataService.maleCandidates.length > 0) {
    return resolveGymFriendMale(state);
  }
  return resolveGymFriend(state);
}

function resolveGymFriend(state: GameState): LocationVisitResult {
  state.mood = Math.min(100, state.mood + 8);
  state.confidence = Math.min(100, state.confidence + 5);
  state.gymLastEvent = 'friend';

  state.history.push({ week: state.week, day: state.day, candidate: 'gym_friend', location: 'gym', result: 'success' });

  return {
    type: 'gym',
    eventText: pick(dataService.gymFriendTexts),
    stats: { mood: state.mood, confidence: state.confidence, appearance: state.appearance },
  };
}

function resolveGymFriendMale(state: GameState): LocationVisitResult {
  const c = pick(dataService.maleCandidates);
  state.mood = Math.min(100, state.mood + 3);
  state.gymLastEvent = 'friend_male';
  state.consecutiveMen++;

  state.history.push({ week: state.week, day: state.day, candidate: c.name, location: 'gym', result: 'success' });

  return {
    type: 'gym',
    eventText: pick(dataService.gymInterestTexts),
    stats: { mood: state.mood, confidence: state.confidence, appearance: state.appearance },
  };
}

function resolveGymHarasser(state: GameState): LocationVisitResult {
  state.mood = Math.max(0, state.mood - 5);
  state.appearance = Math.min(100, state.appearance + 3);
  state.gymLastEvent = 'harasser';

  state.history.push({ week: state.week, day: state.day, candidate: 'gym_harasser', location: 'gym', result: 'success' });

  return {
    type: 'gym',
    eventText: pick(dataService.gymHarasserTexts),
    stats: { mood: state.mood, confidence: state.confidence, appearance: state.appearance },
  };
}

function resolveAmbient(state: GameState, loc: Location): LocationVisitResult {
  state.mood = Math.min(100, state.mood + 2);
  state.daysWithoutDates = 0;

  state.history.push({ week: state.week, day: state.day, candidate: 'ambient', location: loc.key, result: 'success' });

  return {
    type: 'no_candidate',
    eventText: pick(dataService.ambientEvents),
  };
}

function resolveMaleEncounter(state: GameState, loc: Location): LocationVisitResult {
  const name = pick(dataService.maleEncounterNames);

  state.history.push({ week: state.week, day: state.day, candidate: name, location: loc.key, result: 'success' });

  return {
    type: 'male_encounter',
    eventText: `Te cruzaste con ${name}. Raro.`,
  };
}

/**
 * Get unknown candidates (not yet in relations) for app visits.
 */
export function getNewCandidates(state: GameState): Candidate[] {
  const known = new Set(state.relations.map(r => r.name));
  const all = [...dataService.femaleCandidates, ...dataService.maleCandidates];
  return all.filter(c => !known.has(c.name));
}

/**
 * Get app profiles: random unknown candidates (FEMALE + MALE).
 */
export function getAppProfiles(state: GameState, count: number): Candidate[] {
  const unknowns = getNewCandidates(state);
  const shuffled = unknowns.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
