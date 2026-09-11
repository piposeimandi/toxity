/* game.js — Lógica del juego: estado global G, turno de la Reina (queenTurn),
   condiciones de victoria/derrota, save/load, y resolución de citas.
   DISEÑO: la salud (healthPoints 0-100) es la ÚNICA fuente de verdad para
   progresión. El stage es solo etiqueta cosmética derivada de la salud.
   REGLA DE EMPATE: si jugador y Reina llegan a familia la misma semana,
   gana EL JUGADOR — por eso checkVictories() siempre corre ANTES que
   checkDefeats() en todos los paths. Puede llamar funciones de ui.js en
   tiempo de ejecución. */

var REL_HEALTH_THRESHOLDS={novio:40,familia:70};
var INFIDELITY_RISK=40;
var QUEEN_SABOTAGE_CHANCE=60;
var QUEEN_SABOTAGE_PENALTY={major:15,minor:5};
var STAGE_ADVANCE_TEXTS={};
var QUEEN_DEFEAT_TEXTS={};

function loadRelConfig(){
  if(typeof DATA_LOADED!=='undefined'&&DATA_LOADED){
    REL_HEALTH_THRESHOLDS=relHealthThresholds||{novio:40,familia:70};
    INFIDELITY_RISK=(typeof infidelityRisk!=='undefined')?infidelityRisk:40;
    QUEEN_SABOTAGE_CHANCE=(typeof queenSabotageChance!=='undefined')?queenSabotageChance:60;
    QUEEN_SABOTAGE_PENALTY=queenSabotagePenalty||{major:15,minor:5};
    STAGE_ADVANCE_TEXTS=stageAdvanceTexts||{};
    QUEEN_DEFEAT_TEXTS=queenDefeatTexts||{};
  }
}

var G={week:1,day:1,money:100,labia:50,appearance:50,confidence:50,mood:50,pg:0,consecutiveMen:0,daysWithoutDates:0,history:[],queensLogs:[],gymLastEvent:'',lastGymResetWeek:null,gameOver:false,victory:null,relations:[],partner:null,familyDone:false,queenRelation:{stage:'conocer',dates:0,healthPoints:5},dateLog:[],healthPoints:5,weeksWithoutProgress:0};

function saveGame(){try{localStorage.setItem('reinaFalsaSave',JSON.stringify(G))}catch(e){log('Error al guardar: '+e,'danger')}}
function loadGame(){
if(!DATA_LOADED){log('Cargando datos del juego...','highlight');return;}
try{
  var s=localStorage.getItem('reinaFalsaSave');
  if(s){
    G=JSON.parse(s);
    if(!G.gymLastEvent)G.gymLastEvent='';
    migrateOldSave();
    loadRelConfig();
    log('Partida cargada correctamente.','success');
    if(G.gameOver){
      // No resucitar partidas terminadas: se muestra el game over que trae el save.
      showSavedGameOver();
    }else{
      showFeed();
    }
  }
}catch(e){log('Error al cargar: '+e,'danger')}
}
/* Muestra la pantalla final que corresponde a una partida ya terminada
   (victory guarda el código V1/V2/D1/D2/D3 del save). */
function showSavedGameOver(){
  var v=G.victory;
  if(v==='V1'){
    var pr=G.partner?findRelationById(G.partner):null;
    showGameOver('victory_family',pr?pr.name:'alguien');
  }else if(v==='V2'){
    showGameOver('victory_pg');
  }else if(v==='D1'){
    showGameOver('defeat_queen_family');
  }else if(v==='D3'){
    showGameOver('defeat_suffocation');
  }else if(v==='D2'){
    if(G.partner&&G.healthPoints<=0){showGameOver('defeat_dumped');}
    else{showGameOver('defeat_isolation');}
  }else{
    showGameOver('defeat_isolation');
  }
}
function newGame(){
if(!DATA_LOADED){log('Cargando datos del juego...','highlight');return;}
G={week:1,day:1,money:100,labia:50,appearance:50,confidence:50,mood:50,pg:0,consecutiveMen:0,daysWithoutDates:0,history:[],queensLogs:[],gymLastEvent:'',lastGymResetWeek:null,gameOver:false,victory:null,relations:[],partner:null,familyDone:false,queenRelation:{stage:'conocer',dates:0,healthPoints:5},dateLog:[],healthPoints:5,weeksWithoutProgress:0};
loadRelConfig();
log('=== NUEVA PARTIDA ===','highlight');
log('Bienvenido, El Salado. Tu ex te esta observando.');
showFeed();
}
/* Migración campo-por-campo de saves viejos. Cada campo con default explícito
   (?? valorInicial) para evitar NaN/undefined. El stage del jugador y de la
   Reina es cosmético: se deriva de la salud, pero se inicializa por compat. */
function migrateOldSave(){
  if(!G.relations){G.relations=[];}
  if(G.partner===undefined){G.partner=null;}
  if(G.familyDone===undefined){G.familyDone=false;}
  if(!G.queenRelation){G.queenRelation={stage:'conocer',dates:0,healthPoints:5};}
  if(G.queenRelation.healthPoints===undefined||G.queenRelation.healthPoints===null){G.queenRelation.healthPoints=5;}
  if(G.queenRelation.stage===undefined){G.queenRelation.stage='conocer';}
  if(G.queenRelation.dates===undefined||G.queenRelation.dates===null){G.queenRelation.dates=0;}
  if(!G.dateLog){G.dateLog=[];}
  if(!G.history){G.history=[];}
  if(!G.queensLogs){G.queensLogs=[];}
  if(G.gymLastEvent===undefined){G.gymLastEvent='';}
  if(G.lastGymResetWeek===undefined){G.lastGymResetWeek=null;}
  if(G.gameOver===undefined){G.gameOver=false;}
  if(G.victory===undefined){G.victory=null;}
  if(G.week===undefined||G.week===null){G.week=1;}
  if(G.day===undefined||G.day===null){G.day=1;}
  if(G.money===undefined||G.money===null){G.money=100;}
  if(G.mood===undefined||G.mood===null){G.mood=50;}
  if(G.pg===undefined||G.pg===null){G.pg=0;}
  if(G.labia===undefined||G.labia===null){G.labia=50;}
  if(G.appearance===undefined||G.appearance===null){G.appearance=50;}
  if(G.confidence===undefined||G.confidence===null){G.confidence=50;}
  if(G.daysWithoutDates===undefined||G.daysWithoutDates===null){G.daysWithoutDates=0;}
  if(G.consecutiveMen===undefined||G.consecutiveMen===null){G.consecutiveMen=0;}
  if(G.healthPoints===undefined||G.healthPoints===null){G.healthPoints=5;}
  if(G.weeksWithoutProgress===undefined||G.weeksWithoutProgress===null){G.weeksWithoutProgress=0;}
  for(var i=0;i<G.relations.length;i++){
    var r=G.relations[i];
    if(r.healthPoints===undefined||r.healthPoints===null){r.healthPoints=5;}
    if(r.stage===undefined){r.stage='conocer';}
    if(r.dates===undefined||r.dates===null){r.dates=0;}
    if(r.photo===undefined){r.photo=null;}
    if(r.id===undefined){r.id='rel_'+Date.now()+'_'+i;}
    if(!r.photo){
      var found=null;
      if(typeof FEMALE_CANDIDATES!=='undefined'){
        for(var j=0;j<FEMALE_CANDIDATES.length;j++){
          if(FEMALE_CANDIDATES[j].name===r.name){found=FEMALE_CANDIDATES[j].photo;break;}
        }
      }
      if(!found&&typeof MALE_CANDIDATES!=='undefined'){
        for(var k=0;k<MALE_CANDIDATES.length;k++){
          if(MALE_CANDIDATES[k].name===r.name){found=MALE_CANDIDATES[k].photo;break;}
        }
      }
      if(found){r.photo=found;}
    }
    // Stage cosmético derivado de la salud (única verdad).
    r.stage=deriveStageFromHealth(r.healthPoints);
  }
  // Limpieza de contadores/campos muertos del sistema viejo.
  delete G.totalConquests;delete G.conquests;
  delete G.queenProgress;delete G.queenNovio;
  delete G.weeksWithoutConquests;
  delete G.consecutiveDaysNoDate;delete G.consecutiveDaysWithWomen;
  delete G.currentCandidate;delete G.currentLocation;delete G.currentBaseChance;
  delete G.debugLog;
  syncPartnerHealth();
}
function getDayName(d){var days=['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];return days[(d-1)%7];}

function getOrCreateRelation(name){
  for(var i=0;i<G.relations.length;i++){
    if(G.relations[i].name===name)return G.relations[i];
  }
  var rel={id:'rel_'+Date.now()+'_'+Math.floor(Math.random()*1000),name:name,stage:'conocer',dates:0,healthPoints:5};
  for(var j=0;j<FEMALE_CANDIDATES.length;j++){if(FEMALE_CANDIDATES[j].name===name){rel.photo=FEMALE_CANDIDATES[j].photo;break;}}
  if(!rel.photo){for(var j=0;j<MALE_CANDIDATES.length;j++){if(MALE_CANDIDATES[j].name===name){rel.photo=MALE_CANDIDATES[j].photo;break;}}}
  G.relations.push(rel);
  return rel;
}
function findRelation(name){
  for(var i=0;i<G.relations.length;i++){
    if(G.relations[i].name===name)return G.relations[i];
  }
  return null;
}
/* Stage cosmético derivado de la salud (umbrales de REL_HEALTH_THRESHOLDS).
   La salud es la ÚNICA fuente de verdad: este stage NUNCA decide victorias. */
function deriveStageFromHealth(hp){
  if(hp===undefined||hp===null){hp=5;}
  var novioT=(typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40;
  var famT=(typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.familia)||70;
  if(hp>=famT)return 'familia';
  if(hp>=novioT)return 'novio';
  if(hp>5)return 'citando';
  return 'conocer';
}
/* Avance del jugador SOLO por salud. Sincroniza el stage cosmético y setea
   la pareja si todavía no hay una. Devuelve el nuevo stage si cambió. */
function advanceRelation(rel){
  if(rel.healthPoints===undefined||rel.healthPoints===null){rel.healthPoints=5;}
  if(!G.partner){G.partner=rel.id;}
  var nStage=deriveStageFromHealth(rel.healthPoints);
  if(nStage!==rel.stage){
    rel.stage=nStage;
    syncPartnerHealth();
    return nStage;
  }
  syncPartnerHealth();
  return null;
}
/* Sistema de salud de relación (puntos 0-100).
   G.healthPoints es el espejo de la salud de la pareja activa (G.partner).
   Umbrales: novio 40, familia 70 (REL_HEALTH_THRESHOLDS). */
function getActivePartner(){
  if(!G.partner)return null;
  return findRelationById(G.partner);
}
function syncPartnerHealth(){
  var p=getActivePartner();
  if(p){
    if(p.healthPoints===undefined){p.healthPoints=5;}
    G.healthPoints=p.healthPoints;
  }
}
function setPartnerHealth(val){
  val=Math.max(0,Math.min(100,val));
  G.healthPoints=val;
  var p=getActivePartner();
  if(p){p.healthPoints=val;}
  return val;
}
/* Etiqueta y progreso SIEMPRE sobre salud (única verdad). */
function getRelationLabel(rel){
  var hp=(rel&&rel.healthPoints!==undefined&&rel.healthPoints!==null)?rel.healthPoints:5;
  return getRelStageText(hp);
}
function getRelationProgressText(rel){
  var hp=(rel&&rel.healthPoints!==undefined&&rel.healthPoints!==null)?rel.healthPoints:5;
  return getRelationLabel(rel)+' ('+hp+'/100)';
}
/* HTML del texto de primer encuentro (stageAdvanceTexts.first_meet) para la
   primera cita exitosa con alguien nuevo. Vacío si ya hubo éxito previo. */
function maybeFirstMeetHtml(name){
  for(var i=0;i<G.dateLog.length;i++){
    if(G.dateLog[i].name===name&&G.dateLog[i].success)return '';
  }
  if(typeof STAGE_ADVANCE_TEXTS!=='undefined'&&STAGE_ADVANCE_TEXTS&&STAGE_ADVANCE_TEXTS.first_meet&&STAGE_ADVANCE_TEXTS.first_meet.length){
    var arr=STAGE_ADVANCE_TEXTS.first_meet;
    var t=arr[Math.floor(Math.random()*arr.length)].replace('{name}',name);
    return '<div style="margin-top:12px;padding:10px;border:1px solid var(--accent);background:var(--panel)"><b style="color:var(--accent)">Primer encuentro:</b> '+t+'</div>';
  }
  return '';
}

function getAvailableKnownPeople(){
  var result=[];
  for(var i=0;i<G.relations.length;i++){
    var rel=G.relations[i];
    if(rel.stage!=='familia'){
      result.push(rel);
    }
  }
  return result;
}
function getNewCandidates(){
  var known={};
  for(var i=0;i<G.relations.length;i++){known[G.relations[i].name]=true;}
  var result=[];
  for(var i=0;i<FEMALE_CANDIDATES.length;i++){
    if(!known[FEMALE_CANDIDATES[i].name])result.push(FEMALE_CANDIDATES[i]);
  }
  return result;
}

function generateFeedEvents(){
var events=[];
var numEvents=Math.floor(Math.random()*3)+1;
var knownPeople=getAvailableKnownPeople();
var newCandidates=getNewCandidates();
var hasKnown=knownPeople.length>0;
var hasNew=newCandidates.length>0;
for(var i=0;i<numEvents;i++){
var r=Math.random();
if(hasKnown&&(!hasNew||r<0.4)){
  var rel=knownPeople[Math.floor(Math.random()*knownPeople.length)];
  var stageLabel=getRelationProgressText(rel);
  events.push({type:'known_person',relation:rel,text:'Seguir saliendo con '+rel.name+' — '+stageLabel});
}else if(hasNew){
  var c=newCandidates[Math.floor(Math.random()*newCandidates.length)];
  events.push({type:'date_opportunity',gender:'female',candidate:c,text:c.name+' fue vista por tu zona. '+c.traits+'.'});
}else{
  var c=FEMALE_CANDIDATES[Math.floor(Math.random()*FEMALE_CANDIDATES.length)];
  events.push({type:'date_opportunity',gender:'female',candidate:c,text:c.name+' fue vista por tu zona. '+c.traits+'.'});
}
if(i===numEvents-1&&Math.random()<0.3){
  var locs=Object.keys(DATE_LOCATIONS);
  var loc=locs[Math.floor(Math.random()*locs.length)];
  events.push({type:'location_hint',location:loc,text:'Alguien te recomienda ir al '+DATE_LOCATIONS[loc].name+' hoy.'});
}
}
if(Math.random()<0.25){
  events.push({type:'ambient',text:getAmbientEvent()});
}
return events;
}
function getAmbientEvent(){
return AMBIENT_EVENTS[Math.floor(Math.random()*AMBIENT_EVENTS.length)];
}
function goToLocation(locKey){
var loc=DATE_LOCATIONS[locKey];
if(G.money<loc.cost){
log('No tenes plata para ir al '+loc.name+'. Necesitas $'+loc.cost+'.','danger');
return;
}
G.money-=loc.cost;
log('Gastaste $'+loc.cost+' en el '+loc.name+'.','highlight');
var isMan=Math.random()>loc.genderRatio;
if(isMan){
G.consecutiveMen++;
var gayChance=0.2;
if(G.consecutiveMen>=2){gayChance+=0.3*(G.consecutiveMen-1);gayChance=Math.min(gayChance,0.9);}
if(Math.random()<gayChance){
showManResult(loc);
return;
}
var c=FEMALE_CANDIDATES[Math.floor(Math.random()*FEMALE_CANDIDATES.length)];
showCandidateDate(c,loc);
}else{
G.consecutiveMen=0;
var c=FEMALE_CANDIDATES[Math.floor(Math.random()*FEMALE_CANDIDATES.length)];
showCandidateDate(c,loc);
}
}
function isLocationSafe(loc){
return loc.safe===true||loc.risk==='low';
}
function goToGym(){
var loc=DATE_LOCATIONS.gym;
if(G.money<loc.cost){
log('No tenes plata para ir al gym. Necesitas $'+loc.cost+'.','danger');
return;
}
G.money-=loc.cost;
G.gymLastEvent='';
log('Gastaste $'+loc.cost+' en el Gimnasio. REFUGIO SEGURO.','success');
var r=Math.random()*100;
var harasserChance=15+G.pg*6;
harasserChance=Math.min(harasserChance,60);
var socialStart=20;
var harasserStart=Math.max(socialStart+20,100-harasserChance);
if(r<socialStart){
resolveGymSoloTraining();
}else if(r<harasserStart){
resolveGymSocial();
}else{
if(GYM_HARASSER_TEXTS.length>0){
resolveGymHarasser();
}else{
resolveGymSoloTraining();
}
}
}
function resolveGymSoloTraining(){
G.mood+=6;if(G.mood>100)G.mood=100;
G.appearance+=4;if(G.appearance>100)G.appearance=100;
G.gymLastEvent='solo';
var text=GYM_SOLO_TEXTS.length>0?GYM_SOLO_TEXTS[Math.floor(Math.random()*GYM_SOLO_TEXTS.length)]:'Entrenaste solo y te sentiste bien.';
log('GYM: Entrenamiento solo. (+6 animo, +4 apariencia)','success');
  G.history.push({type:'gym_solo',week:G.week,day:G.day});
  var healthNote='';
  // El gym-solo NO da salud: solo resetea el contador de estancamiento, y con
  // cooldown de 1 vez por semana (cierra el farm de gym).
  if(G.lastGymResetWeek!==G.week){
    G.weeksWithoutProgress=0;
    G.lastGymResetWeek=G.week;
    healthNote='El autocuidado te despejó (contador de estancamiento reseteado). Esta semana ya contó.';
    log('SALUD: '+healthNote,'success');
  }else{
    healthNote='Ya contaste el gym esta semana (cooldown: 1 reset por semana).';
  }
saveGame();
showGymResult('training',text,[{stat:'Animo',change:'+6'},{stat:'Apariencia',change:'+4'}],healthNote);
}
function resolveGymSocial(){
var maleInterest=G.pg>=3&&Math.random()<0.3;
if(maleInterest&&MALE_CANDIDATES.length>0){
resolveGymFriendMale();
}else{
resolveGymFriend();
}
}
function resolveGymFriend(){
G.mood+=8;if(G.mood>100)G.mood=100;
G.confidence+=5;if(G.confidence>100)G.confidence=100;
G.gymLastEvent='friend';
var text=GYM_FRIEND_TEXTS.length>0?GYM_FRIEND_TEXTS[Math.floor(Math.random()*GYM_FRIEND_TEXTS.length)]:'Pasaste un buen rato con un amigo del gym.';
log('GYM: Socializar con amigo. (+8 animo, +5 confianza)','success');
G.history.push({type:'gym_friend',week:G.week,day:G.day});
var friendHealthNote='';
if(getActivePartner()){
  friendHealthNote='Tu relación se estancó esta vez (sin cambios, '+G.healthPoints+'/100).';
}
saveGame();
showGymResult('friend',text,[{stat:'Animo',change:'+8'},{stat:'Confianza',change:'+5'}],friendHealthNote);
}
function resolveGymFriendMale(){
var c=MALE_CANDIDATES[Math.floor(Math.random()*MALE_CANDIDATES.length)];
var text=GYM_INTEREST_TEXTS.length>0?GYM_INTEREST_TEXTS[Math.floor(Math.random()*GYM_INTEREST_TEXTS.length)]:'Algo raro paso con un amigo del gym...';
G.mood+=3;if(G.mood>100)G.mood=100;
G.gymLastEvent='friend_male';
log('GYM: Amigo gay del gym. Te cruzaste con '+c.name+'. (+3 animo)','highlight');
G.consecutiveMen++;
G.history.push({type:'gym_friend_male',name:c.name,week:G.week,day:G.day});
saveGame();
showScreen('date');
document.getElementById('date-title').textContent='Algo raro en el gym...';
var container=document.getElementById('date-content');
container.innerHTML='<div class="candidate fade-in"><div class="name" style="color:var(--accent)">'+photoHtml(c.photo,c.name)+c.name+'</div><div class="traits">'+c.traits+' | '+c.personality+'</div><div class="desc">'+text+'</div></div><button onclick="advanceDay()">Continuar</button>';
}
function resolveGymHarasser(){
var c=GYM_HARASSER_TEXTS[Math.floor(Math.random()*GYM_HARASSER_TEXTS.length)];
G.mood-=5;if(G.mood<0)G.mood=0;
G.appearance+=3;if(G.appearance>100)G.appearance=100;
G.gymLastEvent='harasser';
log('GYM: El acosador apareció. (-5 animo, +3 apariencia)','highlight');
G.history.push({type:'gym_harasser',week:G.week,day:G.day});
var harasserHealthNote='';
if(getActivePartner()){
  harasserHealthNote='Tu relación se estancó esta vez (sin cambios, '+G.healthPoints+'/100).';
}
saveGame();
showGymResult('harasser',c,[{stat:'Animo',change:'-5'},{stat:'Apariencia',change:'+3'}],harasserHealthNote);
}

function goToDate(candidateName){
var c=null;
for(var i=0;i<FEMALE_CANDIDATES.length;i++){
if(FEMALE_CANDIDATES[i].name===candidateName){c=FEMALE_CANDIDATES[i];break;}
}
if(!c){log('No encontraste a esa persona.','danger');return;}
var locKey=Object.keys(DATE_LOCATIONS)[Math.floor(Math.random()*Object.keys(DATE_LOCATIONS).length)];
var loc=DATE_LOCATIONS[locKey];
if(G.money<loc.cost){
log('No tenes plata para salir. Necesitas $'+loc.cost+' minimo.','danger');
log('Te quedas en casa... otra vez.','danger');
G.daysWithoutDates++;
G.mood-=5;
if(G.mood<0)G.mood=0;
checkDefeats();advanceDay();
return;
}
G.money-=loc.cost;
log('Gastaste $'+loc.cost+' y fuiste al '+loc.name+'.','highlight');
showCandidateDate(c,loc);
}

function goToDateKnown(relationId){
var rel=null;
for(var i=0;i<G.relations.length;i++){
  if(G.relations[i].id===relationId){rel=G.relations[i];break;}
}
if(!rel){log('No encontraste a esa persona.','danger');return;}
var locKey=Object.keys(DATE_LOCATIONS)[Math.floor(Math.random()*Object.keys(DATE_LOCATIONS).length)];
var loc=DATE_LOCATIONS[locKey];
if(G.money<loc.cost){
  log('No tenes plata para salir con '+rel.name+'. Necesitas $'+loc.cost+' minimo.','danger');
  log('Te quedas en casa... otra vez.','danger');
  G.daysWithoutDates++;
  G.mood-=5;
  if(G.mood<0)G.mood=0;
  checkDefeats();advanceDay();
  return;
}
G.money-=loc.cost;
log('Gastaste $'+loc.cost+' y saliste con '+rel.name+'.','highlight');
showKnownPersonDate(rel,loc);
}

/* Infidelidad: salir con alguien más teniendo pareja con salud>=novio (40)
   dispara un dado de INFIDELITY_RISK% por cita de que se entere.
   Devuelve true si el juego terminó (te dejó -> D2). */
function maybeTriggerInfidelity(targetName){
  var partnerRel=getActivePartner();
  if(!partnerRel)return false;
  if(targetName&&targetName===partnerRel.name)return false;
  var gate=(REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40;
  if(G.healthPoints<gate)return false;
  var risk=INFIDELITY_RISK||40;
  if(Math.random()*100<risk){
    if(Math.random()<0.3){
      log('INFIDELIDAD: Tu pareja ('+partnerRel.name+') se enteró de que salís con alguien más. Te dejó.','danger');
      setPartnerHealth(0);
      G.history.push({type:'infidelity_dumped',name:targetName,week:G.week,day:G.day});
      saveGame();
      checkDefeats();
      return true;
    }
    setPartnerHealth(G.healthPoints-15);
    log('INFIDELIDAD: Tu pareja ('+partnerRel.name+') se enteró de que salís con alguien más (-15 salud, ahora '+G.healthPoints+'/100).','danger');
    G.history.push({type:'infidelity_caught',name:targetName,week:G.week,day:G.day});
    saveGame();
    return false;
  }
  log('Fuiste cuidadoso: saliste con '+targetName+' sin que '+partnerRel.name+' se entere.','highlight');
  G.history.push({type:'infidelity_safe',name:targetName,week:G.week,day:G.day});
  saveGame();
  return false;
}

function resolveDate(c,loc,dialogue,chance){
if(maybeTriggerInfidelity(c.name))return;
chance+=dialogue.bonus;
G.mood-=dialogue.moodCost;
if(G.mood<0)G.mood=0;
chance=Math.max(5,Math.min(95,chance));
if(isLocationSafe(loc)){
var roll=Math.random()*100;
showScreen('result');
var container=document.getElementById('result-content');
if(roll<chance){
var firstMeetHtml=maybeFirstMeetHtml(c.name);
var rel=getOrCreateRelation(c.name);
var prevStage=rel.stage;
var newStage=advanceRelation(rel);
G.mood+=10;if(G.mood>100)G.mood=100;
G.daysWithoutDates=0;
G.consecutiveMen=0;
G.dateLog.push({name:c.name,week:G.week,day:G.day,success:true});
log('EXITO: Cita exitosa con '+c.name+'! ('+getRelationProgressText(rel)+')','success');
G.history.push({type:'date_success',name:c.name,week:G.week,day:G.day,stage:rel.stage,dates:rel.dates});
saveGame();
var resultHtml='<div class="result-box success fade-in"><h2>Cita exitosa!</h2><p>'+getSuccessText(c,loc)+'</p>';
resultHtml+='<p style="margin-top:10px">'+getRelationProgressText(rel)+' | +10 animo</p>';
resultHtml+=firstMeetHtml;
if(newStage&&STAGE_ADVANCE_TEXTS[newStage]){
  var texts=STAGE_ADVANCE_TEXTS[newStage];
  var stageText=texts[Math.floor(Math.random()*texts.length)].replace('{name}',c.name);
  resultHtml+='<div style="margin-top:12px;padding:10px;border:1px solid var(--accent);background:var(--panel)"><b style="color:var(--accent)">Hitos:</b> '+stageText+'</div>';
}
resultHtml+='</div><button onclick="advanceDay()">Continuar</button>';
container.innerHTML=resultHtml;
// Empate: victoria antes que derrota.
checkVictories();
}else{
G.mood-=10;if(G.mood<0)G.mood=0;
G.daysWithoutDates++;
G.dateLog.push({name:c.name,week:G.week,day:G.day,success:false});
log('FRACASO: '+c.name+' no interesada. (-10 animo)','danger');
G.history.push({type:'date_fail',name:c.name,week:G.week,day:G.day});
saveGame();
container.innerHTML='<div class="result-box fail fade-in"><h2>No funciono</h2><p>'+getFailText(c,loc)+'</p><p style="margin-top:10px">-10 animo</p></div><button onclick="advanceDay()">Continuar</button>';
}
checkDefeats();
return;
}
var sabotageChance=getSabotageChance(loc);
var queenWillSabotage=false;
if(Math.random()*100<sabotageChance){
var pgFactor=Math.max(0.5,1-(G.pg/12));
if(Math.random()<pgFactor){queenWillSabotage=true;}
}
if(queenWillSabotage){
resolveSabotage(c,loc,dialogue);
return;
}
var roll=Math.random()*100;
showScreen('result');
var container=document.getElementById('result-content');
if(roll<chance){
var firstMeetHtml=maybeFirstMeetHtml(c.name);
var rel=getOrCreateRelation(c.name);
var prevStage=rel.stage;
var newStage=advanceRelation(rel);
G.mood+=10;if(G.mood>100)G.mood=100;
G.daysWithoutDates=0;
G.consecutiveMen=0;
G.dateLog.push({name:c.name,week:G.week,day:G.day,success:true});
log('EXITO: Cita exitosa con '+c.name+'! ('+getRelationProgressText(rel)+')','success');
G.history.push({type:'date_success',name:c.name,week:G.week,day:G.day,stage:rel.stage,dates:rel.dates});
saveGame();
var resultHtml='<div class="result-box success fade-in"><h2>Cita exitosa!</h2><p>'+getSuccessText(c,loc)+'</p>';
resultHtml+='<p style="margin-top:10px">'+getRelationProgressText(rel)+' | +10 animo</p>';
resultHtml+=firstMeetHtml;
if(newStage&&STAGE_ADVANCE_TEXTS[newStage]){
  var texts=STAGE_ADVANCE_TEXTS[newStage];
  var stageText=texts[Math.floor(Math.random()*texts.length)].replace('{name}',c.name);
  resultHtml+='<div style="margin-top:12px;padding:10px;border:1px solid var(--accent);background:var(--panel)"><b style="color:var(--accent)">Hitos:</b> '+stageText+'</div>';
}
resultHtml+='</div><button onclick="advanceDay()">Continuar</button>';
container.innerHTML=resultHtml;
// Empate: victoria antes que derrota.
checkVictories();
}else{
G.mood-=10;if(G.mood<0)G.mood=0;
G.daysWithoutDates++;
G.dateLog.push({name:c.name,week:G.week,day:G.day,success:false});
log('FRACASO: '+c.name+' no interesada. (-10 animo)','danger');
G.history.push({type:'date_fail',name:c.name,week:G.week,day:G.day});
saveGame();
container.innerHTML='<div class="result-box fail fade-in"><h2>No funciono</h2><p>'+getFailText(c,loc)+'</p><p style="margin-top:10px">-10 animo</p></div><button onclick="advanceDay()">Continuar</button>';
}
checkDefeats();
}

function showKnownPersonDate(rel,loc){
showScreen('date');
document.getElementById('date-title').textContent='Cita con '+rel.name+' en '+loc.name;
var container=document.getElementById('date-content');
var difficultyBonus=0;
if(loc.risk==='low')difficultyBonus=10;
else if(loc.risk==='medium')difficultyBonus=0;
else if(loc.risk==='high')difficultyBonus=-10;
else difficultyBonus=-20;
var baseChance=40+difficultyBonus+(G.labia/4)+(G.appearance/6)+(G.confidence/5)+(G.mood/8);
baseChance=Math.max(5,Math.min(95,baseChance));
var badgeCls=loc.risk==='low'?'easy':loc.risk==='medium'?'medium':loc.risk==='high'?'hard':'extreme';
var riskBadge='<span class="badge '+badgeCls+'">Riesgo: '+loc.riskLabel+'</span>';
var stageBadge='<span class="badge medium">'+getRelationLabel(rel)+'</span>';
container.innerHTML='<div class="candidate fade-in"><div class="name">'+photoHtml(rel.photo,rel.name)+rel.name+' '+riskBadge+' '+stageBadge+'</div><div class="traits">Saliendo: '+getRelationProgressText(rel)+'</div><div class="desc">Chance de exito estimado: ~'+Math.round(baseChance)+'%</div></div><div class="dialogue-options" id="dialogue-opts"></div>';
var _kpr=G.partner?findRelationById(G.partner):null;
var _kgate=(REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40;
var _krisk=INFIDELITY_RISK||40;
if(_kpr&&rel.id!==_kpr.id&&G.healthPoints>=_kgate){
container.innerHTML+='<div class="candidate fade-in" style="border-color:var(--danger)"><div class="text" style="color:var(--danger)">⚠️ ADVERTENCIA: Tenés pareja ('+_kpr.name+', '+G.healthPoints+'/100). Si seguís saliendo con alguien más, hay '+_krisk+'% de riesgo de que se entere.</div></div>';
}
var opts=document.getElementById('dialogue-opts');
var moodLevel=getMoodLevel();
DIALOGUE_OPTIONS.forEach(function(d,i){
var btn=document.createElement('button');
var isRisky=d.bonus>=14||d.moodCost>=8;
var isSafe=d.moodCost===0&&d.bonus<=10;
var disabled=false;
var extraLabel='';
if(moodLevel==='low'&&isRisky){
disabled=true;
extraLabel=' <span style="color:var(--danger)">[Animos muy bajos para esto]</span>';
}else if(moodLevel==='low'&&!isSafe){
disabled=true;
extraLabel=' <span style="color:var(--dim)">[Necesitas animo mejor]</span>';
}
btn.textContent=d.text+extraLabel;
btn.disabled=disabled;
if(!disabled){
btn.onclick=function(){resolveKnownDate(rel,loc,d,baseChance);};
}
 opts.appendChild(btn);
 });
}

function resolveKnownDate(rel,loc,dialogue,chance){
if(maybeTriggerInfidelity(rel.name))return;
chance+=dialogue.bonus;
G.mood-=dialogue.moodCost;
if(G.mood<0)G.mood=0;
chance=Math.max(5,Math.min(95,chance));
if(isLocationSafe(loc)){
var roll=Math.random()*100;
showScreen('result');
var container=document.getElementById('result-content');
if(roll<chance){
var firstMeetHtml=maybeFirstMeetHtml(rel.name);
var prevStage=rel.stage;
var newStage=advanceRelation(rel);
G.mood+=10;if(G.mood>100)G.mood=100;
G.daysWithoutDates=0;
G.consecutiveMen=0;
G.dateLog.push({name:rel.name,week:G.week,day:G.day,success:true});
log('EXITO: Cita exitosa con '+rel.name+'! ('+getRelationProgressText(rel)+')','success');
G.history.push({type:'date_success',name:rel.name,week:G.week,day:G.day,stage:rel.stage,dates:rel.dates});
saveGame();
var resultHtml='<div class="result-box success fade-in"><h2>Cita exitosa!</h2><p>'+getSuccessText(rel,loc)+'</p>';
resultHtml+='<p style="margin-top:10px">'+getRelationProgressText(rel)+' | +10 animo</p>';
resultHtml+=firstMeetHtml;
if(newStage&&STAGE_ADVANCE_TEXTS[newStage]){
  var texts=STAGE_ADVANCE_TEXTS[newStage];
  var stageText=texts[Math.floor(Math.random()*texts.length)].replace('{name}',rel.name);
  resultHtml+='<div style="margin-top:12px;padding:10px;border:1px solid var(--accent);background:var(--panel)"><b style="color:var(--accent)">Hitos:</b> '+stageText+'</div>';
}
resultHtml+='</div><button onclick="advanceDay()">Continuar</button>';
container.innerHTML=resultHtml;
// Empate: victoria antes que derrota.
checkVictories();
}else{
G.mood-=10;if(G.mood<0)G.mood=0;
G.daysWithoutDates++;
G.dateLog.push({name:rel.name,week:G.week,day:G.day,success:false});
log('FRACASO: Cita fallida con '+rel.name+'. (-10 animo)','danger');
G.history.push({type:'date_fail',name:rel.name,week:G.week,day:G.day});
saveGame();
container.innerHTML='<div class="result-box fail fade-in"><h2>No funciono</h2><p>'+getFailText(rel,loc)+'</p><p style="margin-top:10px">-10 animo</p></div><button onclick="advanceDay()">Continuar</button>';
}
checkDefeats();
return;
}
var sabotageChance=getSabotageChance(loc);
var queenWillSabotage=false;
if(Math.random()*100<sabotageChance){
var pgFactor=Math.max(0.5,1-(G.pg/12));
if(Math.random()<pgFactor){queenWillSabotage=true;}
}
if(queenWillSabotage){
resolveSabotage(rel,loc,dialogue);
return;
}
var roll=Math.random()*100;
showScreen('result');
var container=document.getElementById('result-content');
if(roll<chance){
var firstMeetHtml=maybeFirstMeetHtml(rel.name);
var prevStage=rel.stage;
var newStage=advanceRelation(rel);
G.mood+=10;if(G.mood>100)G.mood=100;
G.daysWithoutDates=0;
G.consecutiveMen=0;
G.dateLog.push({name:rel.name,week:G.week,day:G.day,success:true});
log('EXITO: Cita exitosa con '+rel.name+'! ('+getRelationProgressText(rel)+')','success');
G.history.push({type:'date_success',name:rel.name,week:G.week,day:G.day,stage:rel.stage,dates:rel.dates});
saveGame();
var resultHtml='<div class="result-box success fade-in"><h2>Cita exitosa!</h2><p>'+getSuccessText(rel,loc)+'</p>';
resultHtml+='<p style="margin-top:10px">'+getRelationProgressText(rel)+' | +10 animo</p>';
resultHtml+=firstMeetHtml;
if(newStage&&STAGE_ADVANCE_TEXTS[newStage]){
  var texts=STAGE_ADVANCE_TEXTS[newStage];
  var stageText=texts[Math.floor(Math.random()*texts.length)].replace('{name}',rel.name);
  resultHtml+='<div style="margin-top:12px;padding:10px;border:1px solid var(--accent);background:var(--panel)"><b style="color:var(--accent)">Hitos:</b> '+stageText+'</div>';
}
resultHtml+='</div><button onclick="advanceDay()">Continuar</button>';
container.innerHTML=resultHtml;
// Empate: victoria antes que derrota.
checkVictories();
}else{
G.mood-=10;if(G.mood<0)G.mood=0;
G.daysWithoutDates++;
G.dateLog.push({name:rel.name,week:G.week,day:G.day,success:false});
log('FRACASO: Cita fallida con '+rel.name+'. (-10 animo)','danger');
G.history.push({type:'date_fail',name:rel.name,week:G.week,day:G.day});
saveGame();
container.innerHTML='<div class="result-box fail fade-in"><h2>No funciono</h2><p>'+getFailText(rel,loc)+'</p><p style="margin-top:10px">-10 animo</p></div><button onclick="advanceDay()">Continuar</button>';
}
checkDefeats();
}

function getSabotageChance(loc){
if(isLocationSafe(loc))return 0;
switch(loc.risk){
case'low':return 15;case'medium':return 30;case'high':return 50;case'extreme':return 70;default:return 30;
}
}
function resolveSabotage(c,loc,dialogue){
showScreen('result');
var container=document.getElementById('result-content');
var msg=SABOTAGE_MESSAGES[Math.floor(Math.random()*SABOTAGE_MESSAGES.length)];
G.pg++;
G.mood-=15;if(G.mood<0)G.mood=0;
G.daysWithoutDates++;
var logMsg='SABOTAJE: La Reina arruino tu cita con '+c.name+'. (+1 PG oculto, -15 animo)';
log(logMsg,'danger');
G.queensLogs.push({type:'sabotage',target:c.name,week:G.week,day:G.day,pg:G.pg});
G.history.push({type:'sabotage',name:c.name,week:G.week,day:G.day});
saveGame();
container.innerHTML='<div class="result-box fail fade-in"><h2 style="color:var(--danger)">Sabotaje</h2><p style="margin:10px 0;line-height:1.6">'+msg+'</p><p style="font-style:italic;margin-top:10px">Tu ex se aseguro de que esto no funcionara.</p><p style="margin-top:10px">-15 animo</p></div><button onclick="advanceDay()">Continuar</button>';
// Empate: victoria antes que derrota.
checkVictories();
checkDefeats();
}
function getSuccessText(c,loc){
var arr=SUCCESS_TEXTS[loc.key]||SUCCESS_TEXTS.cafe;
var text=arr[Math.floor(Math.random()*arr.length)];
return text.replace('{name}',c.name);
}
function getFailText(c,loc){
var arr=FAIL_TEXTS[loc.key]||FAIL_TEXTS.cafe;
var text=arr[Math.floor(Math.random()*arr.length)];
return text.replace('{name}',c.name);
}
function passDay(){
if(G.gameOver)return;
G.daysWithoutDates++;
G.mood-=3;if(G.mood<0)G.mood=0;
log('Pasaste el dia en casa. (-3 animo)');
checkDefeats();
advanceDay();
}
function advanceDay(){
if(G.gameOver)return;
G.day++;
if(G.day>7){
endWeek();
}else{
showFeed();
}
}
function endWeek(){
showScreen('weekend');
var container=document.getElementById('weekend-content');
G.money+=80;
log('Cobro semanal: +$80. Total: $'+G.money,'success');
updatePartnerHealthWeekly();
queenTurn();
generateWeekEvents();
var html='<div class="week-summary fade-in">';
html+='<h3>🗓️ Semana '+G.week+' completada</h3>';
html+='<p style="margin:10px 0">Dinero: $'+G.money+' (cobro +$80)</p>';
html+='<p>Animo: '+G.mood+'</p>';
if(G.partner){
  var partnerRel=findRelationById(G.partner);
  if(partnerRel){
    html+='<p style="margin:10px 0;padding:8px;border:1px solid var(--accent);background:var(--panel)"><b>Tu relacion:</b> '+partnerRel.name+' — '+getRelationProgressText(partnerRel)+'</p>';
    html+='<p>Salud relación: '+G.healthPoints+'/100 ['+getRelStageText(G.healthPoints)+']</p>';
    if(G.weeksWithoutProgress>0){
      html+='<p style="color:var(--danger)">Lleva '+G.weeksWithoutProgress+' semana(s) sin progresar.</p>';
    }
  }else{
    html+='<p style="margin:10px 0">Relacion: Sin pareja</p>';
  }
}else if(G.relations.length>0){
  html+='<p style="margin:10px 0">Relacion: Conocidos ('+G.relations.length+') — sin pareja formal</p>';
}else{
  html+='<p style="margin:10px 0">Relacion: Sin relacion</p>';
}
html+='<p style="margin-top:15px;color:var(--dim);font-style:italic">'+WEEK_SUMMARY_GAGS[Math.floor(Math.random()*WEEK_SUMMARY_GAGS.length)]+'</p>';
html+='</div><button onclick="startNewWeek()">Iniciar Semana '+(G.week+1)+'</button>';
container.innerHTML=html;
// REGLA DE EMPATE: victoria antes que derrota — si ambos llegan a familia,
// gana EL JUGADOR.
checkVictories();
checkDefeats();
updateDebug();
}
function findRelationById(id){
  for(var i=0;i<G.relations.length;i++){
    if(G.relations[i].id===id)return G.relations[i];
  }
  return null;
}
/* Progreso real hacia el noviazgo = salud: true si alguna relación llegó a
   novios (healthPoints>=umbral de novio). Sin uso activo en el loop semanal
   (D3 usa weeksWithoutProgress); se mantiene como helper de salud. */
function hasProgressionTowardNoviazgo(){
  var gate=(REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40;
  for(var i=0;i<G.relations.length;i++){
    if(G.relations[i].healthPoints!==undefined&&G.relations[i].healthPoints!==null&&G.relations[i].healthPoints>=gate)return true;
  }
  return false;
}
function startNewWeek(){
if(G.gameOver)return;
G.week++;
G.day=1;
saveGame();
showFeed();
}
/* Salud semanal de la pareja activa (ÚNICA vía de progreso del jugador).
   Éxito con ella esta semana: +15 si ánimo>=70, +10 si no (SIN gate: el éxito
   siempre suma). Solo-fallo: -3. Si la salud cambió, weeksWithoutProgress=0. */
function updatePartnerHealthWeekly(){
  var partnerRel=getActivePartner();
  if(!partnerRel)return;
  if(partnerRel.healthPoints===undefined||partnerRel.healthPoints===null){partnerRel.healthPoints=5;}
  G.healthPoints=partnerRel.healthPoints;
  var before=G.healthPoints;
  var hadSuccess=false,hadFail=false;
  for(var i=0;i<G.dateLog.length;i++){
    var d=G.dateLog[i];
    if(d.week===G.week&&d.name===partnerRel.name){
      if(d.success){hadSuccess=true;}else{hadFail=true;}
    }
  }
  if(hadSuccess){
    if(G.mood>=70){
      setPartnerHealth(G.healthPoints+15);
      log('SALUD: Cita exitosa con '+partnerRel.name+' y buen ánimo. Tu relación ganó 15 puntos ('+G.healthPoints+'/100).','success');
    }else{
      setPartnerHealth(G.healthPoints+10);
      log('SALUD: Cita exitosa con '+partnerRel.name+'. Tu relación ganó 10 puntos ('+G.healthPoints+'/100).','success');
    }
  }else if(hadFail){
    setPartnerHealth(G.healthPoints-3);
    log('SALUD: Cita fallida con '+partnerRel.name+'. Tu relación perdió 3 puntos ('+G.healthPoints+'/100).','danger');
  }
  if(G.healthPoints!==before){G.weeksWithoutProgress=0;}
  else{G.weeksWithoutProgress++;}
}
/* Turno semanal de la Reina (SU ÚNICO track: solo salud, sin etapas/dates).
   60%: avanza su propia relación (+5 salud). Esa semana NO te afecta.
   40%: sabotea tu relación. Dado: éxito mayor (QUEEN_SABOTAGE_CHANCE=60%)
   resta major, éxito menor (30%) resta minor, falla (10%) nada.
   SI sabotea, esa semana NO avanza su relación. */
function queenTurn(){
  if(!G.queenRelation)return;
  if(G.queenRelation.healthPoints===undefined){G.queenRelation.healthPoints=5;}
  if(!getActivePartner()){
    G.queenRelation.healthPoints=Math.min(100,G.queenRelation.healthPoints+5);
    log('👑 La Reina avanzó su propia relación (+5 salud, ahora '+G.queenRelation.healthPoints+'/100). No tenés pareja a quien sabotear.','highlight');
    G.queensLogs.push({type:'queen_advance',health:G.queenRelation.healthPoints,week:G.week});
    return;
  }
  var roll=Math.random()*100;
  if(roll<60){
    G.queenRelation.healthPoints=Math.min(100,G.queenRelation.healthPoints+5);
    log('👑 La Reina avanzó su propia relación (+5 salud, ahora '+G.queenRelation.healthPoints+'/100). Esa semana no te saboteó.','highlight');
    G.queensLogs.push({type:'queen_advance',health:G.queenRelation.healthPoints,week:G.week});
  }else{
    var d=Math.random()*100;
    var major=(QUEEN_SABOTAGE_PENALTY&&QUEEN_SABOTAGE_PENALTY.major)||15;
    var minor=(QUEEN_SABOTAGE_PENALTY&&QUEEN_SABOTAGE_PENALTY.minor)||5;
    var majorChance=QUEEN_SABOTAGE_CHANCE||60;
    if(d<majorChance){
      setPartnerHealth(G.healthPoints-major);
      log('👑 La Reina SABOTEÓ tu relación (éxito mayor, -'+major+' salud, ahora '+G.healthPoints+'/100). Esa semana no avanzó la suya.','danger');
      G.queensLogs.push({type:'queen_sabotage_major',penalty:major,week:G.week});
    }else if(d<majorChance+30){
      setPartnerHealth(G.healthPoints-minor);
      log('👑 La Reina saboteó tu relación (éxito menor, -'+minor+' salud, ahora '+G.healthPoints+'/100). Esa semana no avanzó la suya.','danger');
      G.queensLogs.push({type:'queen_sabotage_minor',penalty:minor,week:G.week});
    }else{
      log('👑 La Reina intentó sabotearte pero falló. Su relación no avanzó esta semana.','success');
      G.queensLogs.push({type:'queen_sabotage_fail',week:G.week});
    }
  }
}
function generateWeekEvents(){
if(Math.random()<0.4){
var evt=STALK_EVENTS[Math.floor(Math.random()*STALK_EVENTS.length)];
log('EVENTO: '+evt.text,'highlight');
if(evt.givesPG){G.pg++;log('(+1 PG oculto por stalkeo)','danger');G.queensLogs.push({type:'stalker',pg:G.pg,week:G.week});}
}
if(Math.random()<0.35){
var evt=GASLIGHTING_EVENTS[Math.floor(Math.random()*GASLIGHTING_EVENTS.length)];
log('EVENTO: '+evt,'highlight');
}
if(Math.random()<0.2){
var name=MALE_ENCOUNTER_NAMES[Math.floor(Math.random()*MALE_ENCOUNTER_NAMES.length)];
log('HOMBRE APARECIDO: Te cruzaste con '+name+'. Raro.','danger');
}
}
/* REGLA DE EMPATE: esta función corre ANTES que checkDefeats() en todos los
   paths. Si jugador y Reina llegan a familia la misma semana, gana EL JUGADOR. */
function checkVictories(){
if(G.gameOver)return;
// V1 (ÚNICA vía): salud de alguna relación >= umbral de familia.
var famThreshold=(REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.familia)||70;
for(var i=0;i<G.relations.length;i++){
  if(G.relations[i].healthPoints!==undefined&&G.relations[i].healthPoints>=famThreshold){
    G.familyDone=true;
    if(!G.partner){G.partner=G.relations[i].id;G.healthPoints=G.relations[i].healthPoints;}
    break;
  }
}
if(G.familyDone){
  var partnerRel=findRelationById(G.partner);
  var partnerName=partnerRel?partnerRel.name:'alguien';
  G.gameOver=true;G.victory='V1';
  showGameOver('victory_family',partnerName);
  return;
}
if(G.pg>=7){
G.gameOver=true;G.victory='V2';
showGameOver('victory_pg');
return;
}
}
function checkDefeats(){
if(G.gameOver)return;
var famThreshold=(REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.familia)||70;
// D1 UNIFICADA: la Reina llegó a familia (SOLO salud>=70, sin vía por dates).
if(G.queenRelation&&G.queenRelation.healthPoints>=famThreshold){
  G.gameOver=true;G.victory='D1';
  showGameOver('defeat_queen_family');
  return;
}
// D2: salud de la relación en 0 (te deprimiste / te dejó)
if(G.partner&&G.healthPoints<=0){
  G.gameOver=true;G.victory='D2';
  showGameOver('defeat_dumped');
  return;
}
if(G.daysWithoutDates>=21&&G.mood<=10){
G.gameOver=true;G.victory='D2';
showGameOver('defeat_isolation');
return;
}
// D3 (ÚNICA vía de asfixia): 8 semanas sin subir salud de la relación.
if(G.weeksWithoutProgress>=8){
G.gameOver=true;G.victory='D3';
showGameOver('defeat_suffocation');
return;
}
if(G.mood<=0){
G.gameOver=true;G.victory='D2';
showGameOver('defeat_isolation');
return;
}
}
