import type { GameState } from '../types/game';

/**
 * Advance the day by one. Decreases mood and increments daysWithoutDates.
 * Returns the updated state (pure function).
 */
export function advanceDay(state: GameState): GameState {
  const next = { ...state };
  next.day += 1;
  next.mood = Math.max(0, next.mood - 3);
  next.daysWithoutDates += 1;
  return next;
}

/**
 * End-of-week processing: salary +$80, increment week.
 * Returns the updated state.
 */
export function endWeek(state: GameState): GameState {
  const next = { ...state };
  next.money += 80;
  next.day = 1;
  next.week += 1;
  return next;
}

/**
 * Start a new week after end-of-week.
 * Resets day to 1, increments week, pays salary.
 */
export function startNewWeek(state: GameState): GameState {
  const next = { ...state };
  next.day = 1;
  next.week += 1;
  next.money += 80;
  return next;
}
