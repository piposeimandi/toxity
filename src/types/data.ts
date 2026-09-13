export interface Candidate {
  name: string;
  traits: string;
  personality: string;
  appeal?: number;
  photo: string;
}

export interface Location {
  name: string;
  cost: number;
  genderRatio: number;
  risk: 'low' | 'medium' | 'high' | 'extreme';
  riskLabel: string;
  desc: string;
  key: string;
  safe?: boolean;
  icon: string;
  mapVisible?: boolean;
}

export interface DialogueOption {
  text: string;
  bonus: number;
  moodCost: number;
}

export interface StalkEvent {
  text: string;
  givesPG: boolean;
}

export interface GameData {
  relHealthThresholds: { novio: number; familia: number };
  infidelityRisk: number;
  queenSabotageChance: number;
  queenSabotagePenalty: { major: number; minor: number };
  appProfilesPerVisit: number;
  casualEncounterChance: number;
  messageChance: number;
  inviteTexts: string[];
  stageAdvanceTexts: Record<string, string[]>;
  queenDefeatTexts: Record<string, string>;
  femaleCandidates: Candidate[];
  maleCandidates: Candidate[];
  dateLocations: Record<string, Location>;
  dialogueOptions: DialogueOption[];
  sabotageMessages: string[];
  gaslightingEvents: string[];
  stalkEvents: StalkEvent[];
  weekSummaryGags: string[];
  ambientEvents: string[];
  successTexts: Record<string, string[]>;
  failTexts: Record<string, string[]>;
  maleEncounterNames: string[];
  gymSoloTexts: string[];
  gymFriendTexts: string[];
  gymHarasserTexts: string[];
  gymInterestTexts: string[];
}
