export type RelationStage = 'conocer' | 'citando' | 'novio' | 'familia';
export type VictoryType = 'V1' | 'V2' | 'D1' | 'D2' | 'D3';

export interface Relation {
  id: string;
  name: string;
  stage: RelationStage;
  dates: number;
  healthPoints: number;
  photo: string | null;
}

export interface HistoryEntry {
  week: number;
  day: number;
  candidate: string;
  location: string;
  result: 'success' | 'fail' | 'sabotaged';
  dialogue?: string;
}

export interface QueenLog {
  week: number;
  action: 'advance' | 'sabotage' | 'fail';
  detail: string;
}

export interface DateLogEntry {
  week: number;
  candidate: string;
  location: string;
  success: boolean;
}

export interface PendingInvite {
  relId: string;
  name: string;
  locKey: string;
}

export interface QueenRelation {
  healthPoints: number;
}

export interface GameState {
  week: number;
  day: number;
  money: number;
  labia: number;
  appearance: number;
  confidence: number;
  mood: number;
  pg: number;
  consecutiveMen: number;
  daysWithoutDates: number;
  history: HistoryEntry[];
  queensLogs: QueenLog[];
  gymLastEvent: string;
  lastGymResetWeek: number | null;
  gameOver: boolean;
  victory: VictoryType | null;
  relations: Relation[];
  partner: string | null;
  familyDone: boolean;
  queenRelation: QueenRelation;
  dateLog: DateLogEntry[];
  healthPoints: number;
  weeksWithoutProgress: number;
  pendingInvite: PendingInvite | null;
}
