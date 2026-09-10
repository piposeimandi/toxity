/* data.js — Cargador de datos estáticos del juego desde data/data.json.
   Asigna los globals que game.js y ui.js esperan después del fetch. */

var FEMALE_CANDIDATES=[];
var MALE_CANDIDATES=[];
var DATE_LOCATIONS={};
var DIALOGUE_OPTIONS=[];
var SABOTAGE_MESSAGES=[];
var GASLIGHTING_EVENTS=[];
var STALK_EVENTS=[];
var WEEK_SUMMARY_GAGS=[];
var AMBIENT_EVENTS=[];
var SUCCESS_TEXTS={};
var FAIL_TEXTS={};
var MALE_ENCOUNTER_NAMES=[];
var GYM_SOLO_TEXTS=[];
var GYM_FRIEND_TEXTS=[];
var GYM_HARASSER_TEXTS=[];
var GYM_INTEREST_TEXTS=[];
var relStageThresholds={citando:3,novio:5,familia:7};
var queenChancePerWeek=60;
var relHealthThresholds={novio:40,familia:70};
var infidelityRisk=40;
var queenSabotageChance=60;
var queenSabotagePenalty={major:15,minor:5};
var queenChoicesPerWeek=2;
var stageAdvanceTexts={};
var queenAdvanceTexts={};
var queenDefeatTexts={};
var ACTION_ICONS={};
var DATA_LOADED=false;

function loadGameData(){
  return fetch('data/data.json')
    .then(function(response){
      if(!response.ok)throw new Error('HTTP '+response.status);
      return response.json();
    })
    .then(function(data){
      FEMALE_CANDIDATES=data.femaleCandidates;
      MALE_CANDIDATES=data.maleCandidates;
      DATE_LOCATIONS=data.dateLocations;
      DIALOGUE_OPTIONS=data.dialogueOptions;
      SABOTAGE_MESSAGES=data.sabotageMessages;
      GASLIGHTING_EVENTS=data.gaslightingEvents;
      STALK_EVENTS=data.stalkEvents;
      WEEK_SUMMARY_GAGS=data.weekSummaryGags;
      AMBIENT_EVENTS=data.ambientEvents;
      SUCCESS_TEXTS=data.successTexts;
      FAIL_TEXTS=data.failTexts;
      MALE_ENCOUNTER_NAMES=data.maleEncounterNames;
      GYM_SOLO_TEXTS=data.gymSoloTexts||[];
      GYM_FRIEND_TEXTS=data.gymFriendTexts||[];
      GYM_HARASSER_TEXTS=data.gymHarasserTexts||[];
      GYM_INTEREST_TEXTS=data.gymInterestTexts||[];
      relStageThresholds=data.relStageThresholds||{citando:3,novio:5,familia:7};
      queenChancePerWeek=data.queenChancePerWeek||60;
      relHealthThresholds=data.relHealthThresholds||{novio:40,familia:70};
      infidelityRisk=(data.infidelityRisk!==undefined)?data.infidelityRisk:40;
      queenSabotageChance=(data.queenSabotageChance!==undefined)?data.queenSabotageChance:60;
      queenSabotagePenalty=data.queenSabotagePenalty||{major:15,minor:5};
      queenChoicesPerWeek=(data.queenChoicesPerWeek!==undefined)?data.queenChoicesPerWeek:2;
      stageAdvanceTexts=data.stageAdvanceTexts||{};
      queenAdvanceTexts=data.queenAdvanceTexts||{};
      queenDefeatTexts=data.queenDefeatTexts||{};
      ACTION_ICONS=data.actionIcons||{};
      DATA_LOADED=true;
    })
    .catch(function(err){
      document.body.innerHTML='<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0a0a0a;color:#e0e0e0;font-family:monospace;text-align:center;padding:20px"><div><h2 style="color:#ff4444">Error al cargar datos del juego</h2><p style="margin:20px 0;color:#888">No se pudo cargar data/data.json</p><p style="color:#666">Si abris el juego con doble clic (file://), necesitas un servidor local:</p><code style="display:block;margin-top:10px;padding:10px;background:#1a1a1a;border:1px solid #333;border-radius:4px">python -m http.server 8090</code><p style="margin-top:10px;color:#666">Desde la carpeta <b>game/</b></p></div></div>';
    });
}

loadGameData();
