import type { GameState } from '../types/game';

const SAVE_KEY = 'reinaFalsaSave';
const SAVE_VERSION = 1;

interface SaveData {
  version: number;
  state: GameState;
  timestamp: number;
}

/**
 * Serialize GameState to localStorage.
 */
export function saveGame(state: GameState): void {
  const data: SaveData = {
    version: SAVE_VERSION,
    state,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

/**
 * Deserialize GameState from localStorage. Returns null if no save exists
 * or if the save is invalid.
 */
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as SaveData;
    if (!data || typeof data !== 'object' || !data.state) return null;

    // Migrate if needed
    const state = migrateIfNeeded(data);
    return state;
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
}

/**
 * Delete save from localStorage.
 */
export function deleteSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.error('Failed to delete save:', e);
  }
}

/**
 * Check if a save exists.
 */
export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Get save metadata without fully loading.
 */
export function getSaveInfo(): { week: number; day: number; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as SaveData;
    if (!data || !data.state) return null;

    return {
      week: data.state.week,
      day: data.state.day,
      timestamp: data.timestamp,
    };
  } catch {
    return null;
  }
}

/**
 * Ensure all fields exist on a loaded state, filling defaults for missing ones.
 */
function migrateIfNeeded(data: SaveData): GameState {
  const state = data.state;

  // Fill defaults for any missing fields (forward-compatible migration)
  const defaults: Record<string, unknown> = {
    week: 1,
    day: 1,
    money: 100,
    labia: 10,
    appearance: 10,
    confidence: 10,
    mood: 70,
    pg: 0,
    consecutiveMen: 0,
    daysWithoutDates: 0,
    history: [],
    queensLogs: [],
    gymLastEvent: '',
    lastGymResetWeek: null,
    gameOver: false,
    victory: null,
    relations: [],
    partner: null,
    familyDone: false,
    queenRelation: { healthPoints: 0 },
    dateLog: [],
    healthPoints: 0,
    weeksWithoutProgress: 0,
    pendingInvite: null,
  };

  for (const [key, defaultValue] of Object.entries(defaults)) {
    if ((state as unknown as Record<string, unknown>)[key] === undefined) {
      (state as unknown as Record<string, unknown>)[key] = defaultValue;
    }
  }

  return state;
}
