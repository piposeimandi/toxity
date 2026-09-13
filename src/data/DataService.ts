import type Phaser from 'phaser';
import type { Candidate, Location, DialogueOption, StalkEvent, GameData } from '../types/data';

export class DataService {
  private data: GameData;

  constructor(data: GameData) {
    this.data = data;
  }

  get femaleCandidates(): Candidate[] {
    return this.data.femaleCandidates;
  }

  get maleCandidates(): Candidate[] {
    return this.data.maleCandidates;
  }

  get dateLocations(): Record<string, Location> {
    return this.data.dateLocations;
  }

  get dialogueOptions(): DialogueOption[] {
    return this.data.dialogueOptions;
  }

  get sabotageMessages(): string[] {
    return this.data.sabotageMessages;
  }

  get gaslightingEvents(): string[] {
    return this.data.gaslightingEvents;
  }

  get stalkEvents(): StalkEvent[] {
    return this.data.stalkEvents;
  }

  get weekSummaryGags(): string[] {
    return this.data.weekSummaryGags;
  }

  get ambientEvents(): string[] {
    return this.data.ambientEvents;
  }

  get successTexts(): Record<string, string[]> {
    return this.data.successTexts;
  }

  get failTexts(): Record<string, string[]> {
    return this.data.failTexts;
  }

  get stageAdvanceTexts(): Record<string, string[]> {
    return this.data.stageAdvanceTexts;
  }

  get queenDefeatTexts(): Record<string, string> {
    return this.data.queenDefeatTexts;
  }

  get inviteTexts(): string[] {
    return this.data.inviteTexts;
  }

  get maleEncounterNames(): string[] {
    return this.data.maleEncounterNames;
  }

  get gymSoloTexts(): string[] {
    return this.data.gymSoloTexts;
  }

  get gymFriendTexts(): string[] {
    return this.data.gymFriendTexts;
  }

  get gymHarasserTexts(): string[] {
    return this.data.gymHarasserTexts;
  }

  get gymInterestTexts(): string[] {
    return this.data.gymInterestTexts;
  }

  get relHealthThresholds(): { novio: number; familia: number } {
    return this.data.relHealthThresholds;
  }

  get infidelityRisk(): number {
    return this.data.infidelityRisk;
  }

  get queenSabotageChance(): number {
    return this.data.queenSabotageChance;
  }

  get queenSabotagePenalty(): { major: number; minor: number } {
    return this.data.queenSabotagePenalty;
  }

  get appProfilesPerVisit(): number {
    return this.data.appProfilesPerVisit;
  }

  get casualEncounterChance(): number {
    return this.data.casualEncounterChance;
  }

  get messageChance(): number {
    return this.data.messageChance;
  }

  getLocationCandidates(locKey: string): Candidate[] {
    const loc = this.data.dateLocations[locKey];
    if (!loc) return [];
    const genderThreshold = loc.genderRatio;
    const allCandidates: Candidate[] = [
      ...this.data.femaleCandidates.map(c => ({ ...c, gender: 'female' as const })),
      ...this.data.maleCandidates.map(c => ({ ...c, gender: 'male' as const })),
    ];
    const filtered = allCandidates.filter(() => Math.random() < genderThreshold);
    return filtered.length > 0 ? filtered : allCandidates.slice(0, 3);
  }

  /** Derives a stable Phaser texture key from a randomuser photo URL. */
  getPhotoKey(c: Candidate): string {
    const m = c.photo.match(/med\/(women|men)\/(\d+)\.jpg$/);
    if (!m) return '';
    return `photo-${m[1]}-${m[2]}`;
  }

  /** Local path for the photo (served from public/photos). */
  getPhotoPath(c: Candidate): string {
    const m = c.photo.match(/med\/(women|men)\/(\d+)\.jpg$/);
    if (!m) return '';
    return `photos/${m[1]}/${m[2]}.jpg`;
  }

  /** Registers every unique candidate photo as a Phaser texture. */
  loadAllPhotos(scene: Phaser.Scene): void {
    const seen = new Set<string>();
    const all: Candidate[] = [...this.data.femaleCandidates, ...this.data.maleCandidates];
    for (const c of all) {
      const key = this.getPhotoKey(c);
      if (key && !seen.has(key)) {
        seen.add(key);
        scene.load.image(key, this.getPhotoPath(c));
      }
    }
  }
}
