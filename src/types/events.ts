import type { Candidate } from './data';
import type { Location } from './data';

export interface EnterLocationPayload {
  locKey: string;
}

export interface DateStartPayload {
  candidate: Candidate;
  loc: Location;
  baseChance: number;
}

export interface DateResultPayload {
  success: boolean;
  sabotage: boolean;
  candidateName: string;
  locKey: string;
}

export interface HudUpdatePayload {
  week: number;
  day: number;
  money: number;
  mood: number;
  partnerName: string | null;
  partnerHealth: number;
}

export interface GameOverPayload {
  victoryType: string;
  partnerName?: string;
}

export interface StartNewWeekPayload {
  // no extra data needed — reads from registry
}
