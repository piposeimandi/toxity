import type { GameState } from '../types/game';

export function createDefaultState(): GameState {
  return {
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
}
