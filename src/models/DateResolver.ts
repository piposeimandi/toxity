import type { GameState } from '../types/game';
import type { Candidate, Location, DialogueOption } from '../types/data';
import { clamp } from '../utils/math';
import { addRelation, advanceRelation, setPartnerHealth, syncPartnerHealth } from './RelationSystem';
import { maybeTriggerInfidelity } from './InfidelitySystem';
import { getSabotageChance } from './QueenAI';

/**
 * Calculate base chance for a date at a given location.
 * Factors: location risk, player stats (labia, appearance, confidence, mood).
 */
export function calculateBaseChance(state: GameState, loc: Location): number {
  const riskBonus: Record<string, number> = {
    low: 10,
    medium: 0,
    high: -10,
    extreme: -20,
  };
  const bonus = riskBonus[loc.risk] ?? 0;
  const base = 40 + bonus
    + Math.floor(state.labia / 4)
    + Math.floor(state.appearance / 6)
    + Math.floor(state.confidence / 5)
    + Math.floor(state.mood / 8);
  return Math.max(5, Math.min(95, base));
}

export interface DateResult {
  success: boolean;
  sabotaged: boolean;
  stageChanged: boolean;
  newStage: string | null;
}

/**
 * Resolve a date with a candidate at a location using a dialogue option.
 * Returns the result for the scene to display.
 */
export function resolveDate(
  state: GameState,
  candidate: Candidate,
  loc: Location,
  dialogue: DialogueOption,
  baseChance: number,
): DateResult {
  // Infidelity check
  const dumped = maybeTriggerInfidelity(state, candidate.name);
  if (dumped) {
    return { success: false, sabotaged: false, stageChanged: false, newStage: null };
  }

  // Apply mood cost
  state.mood = clamp(state.mood - dialogue.moodCost, 0, 100);

  // Calculate total chance
  let chance = Math.max(5, Math.min(95, baseChance + dialogue.bonus));

  // Safe locations: no sabotage
  if (loc.safe || loc.risk === 'low') {
    const roll = Math.random() * 100;
    if (roll < chance) {
      return resolveDateSuccess(state, candidate, loc);
    } else {
      return resolveDateFail(state, candidate, loc);
    }
  }

  // Check sabotage
  const sabotageChance = getSabotageChance(loc);
  let queenWillSabotage = false;
  if (Math.random() * 100 < sabotageChance) {
    const pgFactor = Math.max(0.5, 1 - (state.pg / 12));
    if (Math.random() < pgFactor) {
      queenWillSabotage = true;
    }
  }

  if (queenWillSabotage) {
    return resolveDateSabotage(state, candidate);
  }

  // Normal resolution
  const roll = Math.random() * 100;
  if (roll < chance) {
    return resolveDateSuccess(state, candidate, loc);
  } else {
    return resolveDateFail(state, candidate, loc);
  }
}

function resolveDateSuccess(state: GameState, candidate: Candidate, loc: Location): DateResult {
  const rel = addRelation(state, candidate);
  const prevStage = rel.stage;
  rel.healthPoints = Math.min(100, (rel.healthPoints ?? 5) + 10);
  rel.dates++;
  const newStage = advanceRelation(state, rel);

  state.mood = clamp(state.mood + 10, 0, 100);
  state.daysWithoutDates = 0;
  state.consecutiveMen = 0;
  state.labia = clamp(state.labia + 2, 0, 100);

  state.dateLog.push({
    week: state.week,
    candidate: candidate.name,
    location: loc.key,
    success: true,
  });

  state.history.push({
    week: state.week,
    day: state.day,
    candidate: candidate.name,
    location: loc.key,
    result: 'success',
  });

  return {
    success: true,
    sabotaged: false,
    stageChanged: newStage !== null,
    newStage,
  };
}

function resolveDateFail(state: GameState, candidate: Candidate, loc: Location): DateResult {
  state.mood = clamp(state.mood - 10, 0, 100);

  state.dateLog.push({
    week: state.week,
    candidate: candidate.name,
    location: loc.key,
    success: false,
  });

  state.history.push({
    week: state.week,
    day: state.day,
    candidate: candidate.name,
    location: loc.key,
    result: 'fail',
  });

  return { success: false, sabotaged: false, stageChanged: false, newStage: null };
}

function resolveDateSabotage(state: GameState, candidate: Candidate): DateResult {
  state.pg++;
  state.mood = clamp(state.mood - 15, 0, 100);

  state.history.push({
    week: state.week,
    day: state.day,
    candidate: candidate.name,
    location: 'sabotage',
    result: 'sabotaged',
  });

  return { success: false, sabotaged: true, stageChanged: false, newStage: null };
}
