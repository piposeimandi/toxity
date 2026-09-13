#!/usr/bin/env node
/*
 * Dependency-free smoke checks for Toxity's static game data and the core
 * relationship race. This deliberately models only the documented weekly
 * rules, so it can run in Node without a DOM or browser storage.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dataPath = path.join(__dirname, '..', 'data', 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const failures = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateCandidates() {
  const groups = [
    ['femaleCandidates', data.femaleCandidates, true],
    ['maleCandidates', data.maleCandidates, false]
  ];
  const ids = new Set();

  for (const [groupName, candidates, requiresAppeal] of groups) {
    check(Array.isArray(candidates) && candidates.length > 0, `${groupName} must not be empty`);
    for (const candidate of candidates || []) {
      check(isNonEmptyString(candidate.id), `${groupName}:${candidate.name || '(unnamed)'} needs a stable id`);
      check(!ids.has(candidate.id), `candidate id is duplicated: ${candidate.id}`);
      ids.add(candidate.id);
      check(isNonEmptyString(candidate.name), `candidate ${candidate.id} needs a display name`);
      check(isNonEmptyString(candidate.traits), `candidate ${candidate.id} needs traits`);
      check(isNonEmptyString(candidate.personality), `candidate ${candidate.id} needs a personality`);
      check(isNonEmptyString(candidate.photo), `candidate ${candidate.id} needs a photo`);
      if (requiresAppeal) {
        check(Number.isFinite(candidate.appeal) && candidate.appeal >= 0 && candidate.appeal <= 100,
          `candidate ${candidate.id} appeal must be between 0 and 100`);
      }
    }
  }

  // Names are presentation text, not identity. A duplicate name is fine once
  // every profile has a distinct id (for example, the two Santiagos).
  check(ids.size === (data.femaleCandidates || []).length + (data.maleCandidates || []).length,
    'every candidate must have a globally unique id');
  check(ids.size >= data.appProfilesPerVisit,
    'the app must have enough distinct candidates to fill one profile page');
}

function validateLocations() {
  const locations = data.dateLocations || {};
  const entries = Object.entries(locations);
  const allowedRisks = new Set(['low', 'medium', 'high', 'extreme']);
  const visible = entries.filter(([, location]) => location.mapVisible !== false);

  check(entries.length >= 2, 'at least one physical location and the app are required');
  check(locations.app && locations.app.mapVisible === false, 'the app must be configured as non-map location');
  check(visible.length >= 9, 'the map must expose at least nine physical locations');
  check(visible.some(([, location]) => location.risk === 'low'), 'at least one low-risk physical location is required');
  check(visible.some(([, location]) => location.cost <= 10), 'at least one affordable physical location is required');
  check(new Set(visible.map(([, location]) => location.risk)).size >= 3,
    'physical locations should offer at least three risk levels');
  check(new Set(visible.map(([, location]) => location.cost)).size >= 4,
    'physical locations should offer meaningful cost choices');

  for (const [key, location] of entries) {
    check(location.key === key, `location ${key} must repeat its key for text lookup`);
    check(isNonEmptyString(location.name), `location ${key} needs a name`);
    check(isNonEmptyString(location.icon), `location ${key} needs an icon`);
    check(isNonEmptyString(location.desc), `location ${key} needs a description`);
    check(isNonEmptyString(location.riskLabel), `location ${key} needs a risk label`);
    check(allowedRisks.has(location.risk), `location ${key} has an unsupported risk level`);
    check(Number.isFinite(location.cost) && location.cost >= 0, `location ${key} cost must be non-negative`);
    check(Number.isFinite(location.genderRatio) && location.genderRatio >= 0 && location.genderRatio <= 1,
      `location ${key} genderRatio must be between 0 and 1`);
  }
}

function validateRules() {
  const thresholds = data.relHealthThresholds || {};
  check(Number.isFinite(thresholds.novio) && Number.isFinite(thresholds.familia), 'relationship thresholds must be numbers');
  check(thresholds.novio > 5 && thresholds.novio < thresholds.familia && thresholds.familia <= 100,
    'relationship thresholds must be ordered between 5 and 100');
  check(Number.isFinite(data.queenSabotageChance) && data.queenSabotageChance >= 0 && data.queenSabotageChance <= 70,
    'queenSabotageChance must be a percentage compatible with the remaining minor/fail outcomes');
  check(data.queenSabotagePenalty && data.queenSabotagePenalty.major >= data.queenSabotagePenalty.minor,
    'major sabotage penalty must not be smaller than the minor penalty');
  check(Array.isArray(data.dialogueOptions) && data.dialogueOptions.length > 0, 'at least one dialogue option is required');
  check((data.dialogueOptions || []).some((option) => option.moodCost === 0 && option.bonus > 0),
    'a positive, no-mood-cost dialogue option is required for a recoverable route');
}

// Small deterministic PRNG: test results do not depend on the host's random
// generator. It is intentionally a rules-level model, not a UI test.
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function simulateSafeRoute(seed) {
  const random = makeRandom(seed);
  const family = data.relHealthThresholds.familia;
  const majorChance = data.queenSabotageChance;
  const major = data.queenSabotagePenalty.major;
  const minor = data.queenSabotagePenalty.minor;
  let playerHealth = 5;
  let queenHealth = 5;
  let mood = 50;

  // The intended strong route: a low-risk date, default stats, and the
  // highest no-cost dialogue. Its chance is clamped to 95% in game.js.
  const successChance = 95;
  for (let week = 1; week <= 40; week += 1) {
    const success = random() * 100 < successChance;
    if (success) {
      mood = Math.min(100, mood + 10);
      playerHealth = Math.min(100, playerHealth + (mood >= 70 ? 15 : 10));
    } else {
      mood = Math.max(0, mood - 10);
      playerHealth = Math.max(0, playerHealth - 3);
    }

    // Matches endWeek(): health update, Queen turn, then victory before defeat.
    if (random() * 100 < 60) {
      queenHealth = Math.min(100, queenHealth + 5);
    } else {
      const sabotageRoll = random() * 100;
      if (sabotageRoll < majorChance) playerHealth = Math.max(0, playerHealth - major);
      else if (sabotageRoll < majorChance + 30) playerHealth = Math.max(0, playerHealth - minor);
    }
    if (playerHealth >= family) return 'player';
    if (queenHealth >= family || playerHealth <= 0) return 'queen';
  }
  return 'timeout';
}

function validateBalance() {
  const family = data.relHealthThresholds.familia;
  const bestCasePlayerWeeks = 1 + Math.ceil((family - 15) / 15);
  const fastestQueenWeeks = Math.ceil((family - 5) / 5);
  check(bestCasePlayerWeeks < fastestQueenWeeks,
    `a perfect player route (${bestCasePlayerWeeks} weeks) must outrun the Queen (${fastestQueenWeeks} weeks)`);

  let playerWins = 0;
  let queenWins = 0;
  let timeouts = 0;
  const runs = 2000;
  for (let seed = 1; seed <= runs; seed += 1) {
    const result = simulateSafeRoute(seed);
    if (result === 'player') playerWins += 1;
    else if (result === 'queen') queenWins += 1;
    else timeouts += 1;
  }
  const winRate = playerWins / runs;
  check(timeouts === 0, 'safe-route simulations must resolve within 40 weeks');
  check(winRate >= 0.55,
    `safe-route player win rate is too low (${(winRate * 100).toFixed(1)}%; expected at least 55%)`);
  return { runs, playerWins, queenWins, timeouts, winRate, bestCasePlayerWeeks, fastestQueenWeeks };
}

validateCandidates();
validateLocations();
validateRules();
const balance = validateBalance();

if (failures.length) {
  console.error(`FAIL: ${failures.length} of ${checks} checks failed.`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${checks} data/rule checks.`);
  console.log(`Safe-route model: ${balance.playerWins}/${balance.runs} player wins (${(balance.winRate * 100).toFixed(1)}%), ${balance.queenWins} Queen wins, ${balance.timeouts} timeouts.`);
  console.log(`Best-case family race: player ${balance.bestCasePlayerWeeks} weeks; Queen ${balance.fastestQueenWeeks} weeks.`);
}
