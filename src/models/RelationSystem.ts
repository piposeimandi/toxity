import type { GameState, Relation, RelationStage } from '../types/game';
import type { Candidate } from '../types/data';

/**
 * Create a new relation or return existing one by name.
 * Sets photo from candidate data if available.
 */
export function addRelation(state: GameState, candidate: Candidate): Relation {
  const existing = state.relations.find(r => r.name === candidate.name);
  if (existing) return existing;

  const id = `rel_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const rel: Relation = {
    id,
    name: candidate.name,
    stage: 'conocer',
    dates: 0,
    healthPoints: 5,
    photo: candidate.photo ?? null,
  };

  state.relations.push(rel);
  return rel;
}

/**
 * Find a relation by name.
 */
export function findRelation(state: GameState, name: string): Relation | null {
  return state.relations.find(r => r.name === name) ?? null;
}

/**
 * Find a relation by ID.
 */
export function findRelationById(state: GameState, id: string): Relation | null {
  return state.relations.find(r => r.id === id) ?? null;
}

/**
 * Derive cosmetic stage from healthPoints (source of truth).
 * Thresholds: <=5 Conocer, 6-39 Citando, 40-69 Novio, 70+ Familia
 */
export function deriveStage(healthPoints: number, thresholds?: { novio: number; familia: number }): RelationStage {
  const hp = healthPoints ?? 5;
  const novioT = thresholds?.novio ?? 40;
  const famT = thresholds?.familia ?? 70;
  if (hp >= famT) return 'familia';
  if (hp >= novioT) return 'novio';
  if (hp > 5) return 'citando';
  return 'conocer';
}

/**
 * Advance a relation's stage based on health. Returns new stage if changed, null otherwise.
 * Sets partner if none exists.
 */
export function advanceRelation(state: GameState, rel: Relation): RelationStage | null {
  if (rel.healthPoints == null) rel.healthPoints = 5;
  if (!state.partner) state.partner = rel.id;

  const nStage = deriveStage(rel.healthPoints, state.relations.length > 0 ? undefined : undefined);
  if (nStage !== rel.stage) {
    rel.stage = nStage;
    syncPartnerHealth(state);
    return nStage;
  }
  syncPartnerHealth(state);
  return null;
}

/**
 * Sync G.healthPoints as mirror of active partner's health.
 */
export function syncPartnerHealth(state: GameState): void {
  const p = state.partner ? findRelationById(state, state.partner) : null;
  if (p) {
    if (p.healthPoints == null) p.healthPoints = 5;
    state.healthPoints = p.healthPoints;
  }
}

/**
 * Set partner health (clamped 0-100), syncing both ways.
 */
export function setPartnerHealth(state: GameState, val: number): number {
  val = Math.max(0, Math.min(100, val));
  state.healthPoints = val;
  const p = state.partner ? findRelationById(state, state.partner) : null;
  if (p) p.healthPoints = val;
  return val;
}

/**
 * Get progress text for a relation (stage + health).
 */
export function getRelationProgressText(rel: Relation): string {
  const hp = rel.healthPoints ?? 5;
  const stage = deriveStage(hp);
  const stageLabel = stage === 'familia' ? 'Familia'
    : stage === 'novio' ? 'Novio/a'
    : stage === 'citando' ? 'Citando'
    : 'Conocer';
  return `${stageLabel} (${hp}/100)`;
}

/**
 * Get available known people (not in familia stage).
 */
export function getAvailableKnownPeople(state: GameState): Relation[] {
  return state.relations.filter(r => r.stage !== 'familia');
}

/**
 * Update partner health weekly based on date log.
 * Success with partner: +10 (or +15 if mood >= 70).
 * Fail: -3.
 * Tracks weeksWithoutProgress.
 */
export function updatePartnerHealthWeekly(state: GameState): void {
  const partnerRel = state.partner ? findRelationById(state, state.partner) : null;
  if (!partnerRel) return;
  if (partnerRel.healthPoints == null) partnerRel.healthPoints = 5;
  state.healthPoints = partnerRel.healthPoints;

  const before = state.healthPoints;
  let hadSuccess = false;
  let hadFail = false;

  for (const d of state.dateLog) {
    if (d.week === state.week && d.candidate === partnerRel.name) {
      if (d.success) hadSuccess = true;
      else hadFail = true;
    }
  }

  if (hadSuccess) {
    if (state.mood >= 70) {
      setPartnerHealth(state, state.healthPoints + 15);
    } else {
      setPartnerHealth(state, state.healthPoints + 10);
    }
  } else if (hadFail) {
    setPartnerHealth(state, state.healthPoints - 3);
  }

  if (state.healthPoints !== before) {
    state.weeksWithoutProgress = 0;
  } else {
    state.weeksWithoutProgress++;
  }
}
