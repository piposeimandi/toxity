/* game.js — Lógica del juego: estado global G, funciones de la Reina
   (queenAdvanceWeek, getSabotageChance, resolveSabotage), condiciones
   de victoria/derrota, save/load, y resolución de citas.
   Puede llamar funciones de ui.js en tiempo de ejecución. */

var REL_STAGE_THRESHOLDS={citando:3,novio:5,familia:7};
var QUEEN_CHANCE_PER_WEEK=60;
var STAGE_ADVANCE_TEXTS={};
var QUEEN_ADVANCE_TEXTS={};
var QUEEN_DEFEAT_TEXTS={};

function loadRelConfig(){
  if(typeof DATA_LOADED!=='undefined'&&DATA_LOADED&&typeof relStageThresholds!=='undefined'){
    REL_STAGE_THRESHOLDS=relStageThresholds;
    QUEEN_CHANCE_PER_WEEK=queenChancePerWeek||60;
    STAGE_ADVANCE_TEXTS=stageAdvanceTexts||{};
    QUEEN_ADVANCE_TEXTS=queenAdvanceTexts||{};
    QUEEN_DEFEAT_TEXTS=queenDefeatTexts||{};
  }
}

var G={week:1,day:1,money:100,labia:50,appearance:50,confidence:50,mood:50,pg:0,queenProgress:0,queenNovio:0,consecutiveMen:0,daysWithoutDates:0,weeksWithoutConquests:0,totalConquests:0,consecutiveDaysNoDate:0,consecutiveDaysWithWomen:0,history:[],queensLogs:[],debugLog:[],gymLastEvent:'',gameOver:false,victory:null,relations:[],partner:null,familyDone:false,queenRelation:{stage:'conocer',dates:0},dateLog:[]};

function saveGame(){try{localStorage.setItem('reinaFalsaSave',JSON.stringify(G))}catch(e){log('Error al guardar: '+e,'danger')}}
function loadGame(){
if(!DATA_LOADED){log('Cargando datos del juego...','highlight');return;}
try{var s=localStorage.getItem('reinaFalsaSave');if(s){G=JSON.parse(s);G.gameOver=false;G.victory=null;if(!G.gymLastEvent)G.gymLastEvent='';migrateOldSave();loadRelConfig();log('Partida cargada correctamente.','success');showFeed();}}catch(e){log('Error al cargar: '+e,'danger')}
}
function newGame(){
if(!DATA_LOADED){log('Cargando datos del juego...','highlight');return;}
G={week:1,day:1,money:100,labia:50,appearance:50,confidence:50,mood:50,pg:0,queenProgress:0,queenNovio:0,consecutiveMen:0,daysWithoutDates:0,weeksWithoutConquests:0,totalConquests:0,consecutiveDaysNoDate:0,consecutiveDaysWithWomen:0,history:[],queensLogs:[],debugLog:[],gymLastEvent:'',gameOver:false,victory:null,relations:[],partner:null,familyDone:false,queenRelation:{stage:'conocer',dates:0},dateLog:[]};
loadRelConfig();
log('=== NUEVA PARTIDA ===','highlight');
log('Bienvenido, El Salado. Tu ex te esta observando.');
showFeed();
}
function migrateOldSave(){
  if(!G.relations){G.relations=[];}
  if(G.partner===undefined){G.partner=null;}
  if(G.familyDone===undefined){G.familyDone=false;}
  if(!G.queenRelation){G.queenRelation={stage:'conocer',dates:0};}
  if(!G.dateLog){G.dateLog=[];}
  if(!G.totalConquests){G.totalConquests=G.conquests||0;}
}
function getDayName(d){var days=['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];return days[(d-1)%7];}

function getOrCreateRelation(name){
  for(var i=0;i<G.relations.length;i++){
    if(G.relations[i].name===name)return G.relations[i];
  }
  var rel={id:'rel_'+Date.now()+'_'+Math.floor(Math.random()*1000),name:name,stage:'conocer',dates:0,isGay:false};
  G.relations.push(rel);
  return rel;
}
function findRelation(name){
  for(var i=0;i<G.relations.length;i++){
    if(G.relations[i].name===name)return G.relations[i];
  }
  return null;
}
function advanceRelation(rel){
  rel.dates++;
  if(rel.dates>=REL_STAGE_THRESHOLDS.familia&&rel.stage!=='familia'){
    rel.stage='familia';
    G.partner=rel.id;
    G.familyDone=true;
    return 'familia';
  }else if(rel.dates>=REL_STAGE_THRESHOLDS.novio&&rel.stage!=='novio'){
    rel.stage='novio';
    G.partner=rel.id;
    return 'novio';
  }else if(rel.dates>=REL_STAGE_THRESHOLDS.citando&&rel.stage!=='citando'){
    rel.stage='citando';
    G.partner=rel.id;
    return 'citando';
  }
  return null;
}
function getRelationLabel(rel){
  switch(rel.stage){
    case'conocer':return 'Conocido';
    case'citando':return 'Saliendo';
    case'novio':return 'Novios';
    case'familia':return 'Familia';
    default:return rel.stage;
  }
}
function getRelationProgressText(rel){
  var next=null;
  var current=rel.dates;
  if(rel.stage==='conocer')next=REL_STAGE_THRESHOLDS.citando;
  else if(rel.stage==='citando')next=REL_STAGE_THRESHOLDS.novio;
  else if(rel.stage==='novio')next=REL_STAGE_THRESHOLDS.familia;
  if(next!==null)return getRelationLabel(rel)+' ('+current+'/'+next+')';
  return getRelationLabel(rel);
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
saveGame();
showGymResult('training',text,[{stat:'Animo',change:'+6'},{stat:'Apariencia',change:'+4'}]);
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
saveGame();
showGymResult('friend',text,[{stat:'Animo',change:'+8'},{stat:'Confianza',change:'+5'}]);
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
container.innerHTML='<div class="candidate fade-in"><div class="name" style="color:var(--accent)">'+c.name+'</div><div class="traits">'+c.traits+' | '+c.personality+'</div><div class="desc">'+text+'</div></div><button onclick="advanceDay()">Continuar</button>';
}
function resolveGymHarasser(){
var c=GYM_HARASSER_TEXTS[Math.floor(Math.random()*GYM_HARASSER_TEXTS.length)];
G.mood-=5;if(G.mood<0)G.mood=0;
G.appearance+=3;if(G.appearance>100)G.appearance=100;
G.gymLastEvent='harasser';
log('GYM: El acosador apareció. (-5 animo, +3 apariencia)','highlight');
G.history.push({type:'gym_harasser',week:G.week,day:G.day});
saveGame();
showGymResult('harasser',c,[{stat:'Animo',change:'-5'},{stat:'Apariencia',change:'+3'}]);
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
G.consecutiveDaysNoDate++;
checkDefeats();advanceDay();
return;
}
G.money-=loc.cost;
G.consecutiveDaysNoDate=0;
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
  G.consecutiveDaysNoDate++;
  checkDefeats();advanceDay();
  return;
}
G.money-=loc.cost;
G.consecutiveDaysNoDate=0;
log('Gastaste $'+loc.cost+' y saliste con '+rel.name+'.','highlight');
showKnownPersonDate(rel,loc);
}

function resolveDate(c,loc,dialogue,chance){
chance+=dialogue.bonus;
G.mood-=dialogue.moodCost;
if(G.mood<0)G.mood=0;
chance=Math.max(5,Math.min(95,chance));
if(isLocationSafe(loc)){
var roll=Math.random()*100;
showScreen('result');
var container=document.getElementById('result-content');
if(roll<chance){
var rel=getOrCreateRelation(c.name);
var prevStage=rel.stage;
var newStage=advanceRelation(rel);
G.mood+=10;if(G.mood>100)G.mood=100;
G.daysWithoutDates=0;
G.consecutiveMen=0;
G.consecutiveDaysWithWomen++;
G.dateLog.push({name:c.name,week:G.week,day:G.day,success:true});
log('EXITO: Cita exitosa con '+c.name+'! ('+getRelationProgressText(rel)+')','success');
G.history.push({type:'date_success',name:c.name,week:G.week,day:G.day,stage:rel.stage,dates:rel.dates});
saveGame();
var resultHtml='<div class="result-box success fade-in"><h2>Cita exitosa!</h2><p>'+getSuccessText(c,loc)+'</p>';
resultHtml+='<p style="margin-top:10px">'+getRelationProgressText(rel)+' | +10 animo</p>';
if(newStage&&STAGE_ADVANCE_TEXTS[newStage]){
  var texts=STAGE_ADVANCE_TEXTS[newStage];
  var stageText=texts[Math.floor(Math.random()*texts.length)].replace('{name}',c.name);
  resultHtml+='<div style="margin-top:12px;padding:10px;border:1px solid var(--accent);background:var(--panel)"><b style="color:var(--accent)">Hitos:</b> '+stageText+'</div>';
}
resultHtml+='</div><button onclick="advanceDay()">Continuar</button>';
container.innerHTML=resultHtml;
checkVictories();
}else{
G.mood-=10;if(G.mood<0)G.mood=0;
G.daysWithoutDates++;
G.consecutiveDaysWithWomen=0;
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
var rel=getOrCreateRelation(c.name);
var prevStage=rel.stage;
var newStage=advanceRelation(rel);
G.mood+=10;if(G.mood>100)G.mood=100;
G.daysWithoutDates=0;
G.consecutiveMen=0;
G.consecutiveDaysWithWomen++;
G.dateLog.push({name:c.name,week:G.week,day:G.day,success:true});
log('EXITO: Cita exitosa con '+c.name+'! ('+getRelationProgressText(rel)+')','success');
G.history.push({type:'date_success',name:c.name,week:G.week,day:G.day,stage:rel.stage,dates:rel.dates});
saveGame();
var resultHtml='<div class="result-box success fade-in"><h2>Cita exitosa!</h2><p>'+getSuccessText(c,loc)+'</p>';
resultHtml+='<p style="margin-top:10px">'+getRelationProgressText(rel)+' | +10 animo</p>';
if(newStage&&STAGE_ADVANCE_TEXTS[newStage]){
  var texts=STAGE_ADVANCE_TEXTS[newStage];
  var stageText=texts[Math.floor(Math.random()*texts.length)].replace('{name}',c.name);
  resultHtml+='<div style="margin-top:12px;padding:10px;border:1px solid var(--accent);background:var(--panel)"><b style="color:var(--accent)">Hitos:</b> '+stageText+'</div>';
}
resultHtml+='</div><button onclick="advanceDay()">Continuar</button>';
container.innerHTML=resultHtml;
checkVictories();
}else{
G.mood-=10;if(G.mood<0)G.mood=0;
G.daysWithoutDates++;
G.consecutiveDaysWithWomen=0;
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
container.innerHTML='<div class="candidate fade-in"><div class="name">'+rel.name+' '+riskBadge+' '+stageBadge+'</div><div class="traits">Saliendo: '+getRelationProgressText(rel)+'</div><div class="desc">Chance de exito estimado: ~'+Math.round(baseChance)+'%</div></div><div class="dialogue-options" id="dialogue-opts"></div>';
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
G.currentCandidate=rel;
G.currentLocation=loc;
G.currentBaseChance=baseChance;
}

function resolveKnownDate(rel,loc,dialogue,chance){
chance+=dialogue.bonus;
G.mood-=dialogue.moodCost;
if(G.mood<0)G.mood=0;
chance=Math.max(5,Math.min(95,chance));
if(isLocationSafe(loc)){
var roll=Math.random()*100;
showScreen('result');
var container=document.getElementById('result-content');
if(roll<chance){
var prevStage=rel.stage;
var newStage=advanceRelation(rel);
G.mood+=10;if(G.mood>100)G.mood=100;
G.daysWithoutDates=0;
G.consecutiveMen=0;
G.consecutiveDaysWithWomen++;
G.dateLog.push({name:rel.name,week:G.week,day:G.day,success:true});
log('EXITO: Cita exitosa con '+rel.name+'! ('+getRelationProgressText(rel)+')','success');
G.history.push({type:'date_success',name:rel.name,week:G.week,day:G.day,stage:rel.stage,dates:rel.dates});
saveGame();
var resultHtml='<div class="result-box success fade-in"><h2>Cita exitosa!</h2><p>'+getSuccessText(rel,loc)+'</p>';
resultHtml+='<p style="margin-top:10px">'+getRelationProgressText(rel)+' | +10 animo</p>';
if(newStage&&STAGE_ADVANCE_TEXTS[newStage]){
  var texts=STAGE_ADVANCE_TEXTS[newStage];
  var stageText=texts[Math.floor(Math.random()*texts.length)].replace('{name}',rel.name);
  resultHtml+='<div style="margin-top:12px;padding:10px;border:1px solid var(--accent);background:var(--panel)"><b style="color:var(--accent)">Hitos:</b> '+stageText+'</div>';
}
resultHtml+='</div><button onclick="advanceDay()">Continuar</button>';
container.innerHTML=resultHtml;
checkVictories();
}else{
G.mood-=10;if(G.mood<0)G.mood=0;
G.daysWithoutDates++;
G.consecutiveDaysWithWomen=0;
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
var prevStage=rel.stage;
var newStage=advanceRelation(rel);
G.mood+=10;if(G.mood>100)G.mood=100;
G.daysWithoutDates=0;
G.consecutiveMen=0;
G.consecutiveDaysWithWomen++;
G.dateLog.push({name:rel.name,week:G.week,day:G.day,success:true});
log('EXITO: Cita exitosa con '+rel.name+'! ('+getRelationProgressText(rel)+')','success');
G.history.push({type:'date_success',name:rel.name,week:G.week,day:G.day,stage:rel.stage,dates:rel.dates});
saveGame();
var resultHtml='<div class="result-box success fade-in"><h2>Cita exitosa!</h2><p>'+getSuccessText(rel,loc)+'</p>';
resultHtml+='<p style="margin-top:10px">'+getRelationProgressText(rel)+' | +10 animo</p>';
if(newStage&&STAGE_ADVANCE_TEXTS[newStage]){
  var texts=STAGE_ADVANCE_TEXTS[newStage];
  var stageText=texts[Math.floor(Math.random()*texts.length)].replace('{name}',rel.name);
  resultHtml+='<div style="margin-top:12px;padding:10px;border:1px solid var(--accent);background:var(--panel)"><b style="color:var(--accent)">Hitos:</b> '+stageText+'</div>';
}
resultHtml+='</div><button onclick="advanceDay()">Continuar</button>';
container.innerHTML=resultHtml;
checkVictories();
}else{
G.mood-=10;if(G.mood<0)G.mood=0;
G.daysWithoutDates++;
G.consecutiveDaysWithWomen=0;
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
G.consecutiveDaysWithWomen=0;
var logMsg='SABOTAJE: La Reina arruino tu cita con '+c.name+'. (+1 PG oculto, -15 animo)';
log(logMsg,'danger');
G.queensLogs.push({type:'sabotage',target:c.name,week:G.week,day:G.day,pg:G.pg});
G.history.push({type:'sabotage',name:c.name,week:G.week,day:G.day});
saveGame();
container.innerHTML='<div class="result-box fail fade-in"><h2 style="color:var(--danger)">Sabotaje</h2><p style="margin:10px 0;line-height:1.6">'+msg+'</p><p style="font-style:italic;margin-top:10px">Tu ex se aseguro de que esto no funcionara.</p><p style="margin-top:10px">-15 animo</p></div><button onclick="advanceDay()">Continuar</button>';
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
G.consecutiveDaysNoDate++;
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
G.money+=40;
log('Cobro semanal: +$40. Total: $'+G.money,'success');
G.weeksWithoutConquests++;
if(hasProgressionTowardNoviazgo())G.weeksWithoutConquests=0;
queenAdvanceWeek();
generateWeekEvents();
var html='<div class="week-summary fade-in">';
html+='<h3>Semana '+G.week+' completada</h3>';
html+='<p style="margin:10px 0">Dinero: $'+G.money+' (cobro +$40)</p>';
html+='<p>Animo: '+G.mood+'</p>';
if(G.partner){
  var partnerRel=findRelationById(G.partner);
  if(partnerRel){
    html+='<p style="margin:10px 0;padding:8px;border:1px solid var(--accent);background:var(--panel)"><b>Tu relacion:</b> '+partnerRel.name+' — '+getRelationProgressText(partnerRel)+'</p>';
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
function hasProgressionTowardNoviazgo(){
  // La asfixia se resetea solo si hay progreso real hacia el noviazgo
  // (stage citando+). Tener conocidos sin avanzar NO detiene a la Reina.
  for(var i=0;i<G.relations.length;i++){
    if(G.relations[i].stage==='citando'||G.relations[i].stage==='novio'||G.relations[i].stage==='familia')return true;
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
function queenAdvanceWeek(){
  if(G.familyDone)return;
  var chance=QUEEN_CHANCE_PER_WEEK;
  var stage=G.queenRelation.stage;
  var dates=G.queenRelation.dates;
  var advance=false;
  if(stage==='familia')return;
  if(Math.random()*100<chance){
    advance=true;
  }
  if(advance){
    dates++;
    var prevStage=stage;
    var newStage=null;
    if(dates>=REL_STAGE_THRESHOLDS.familia&&stage!=='familia'){
      newStage='familia';
    }else if(dates>=REL_STAGE_THRESHOLDS.novio&&stage!=='novio'){
      newStage='novio';
    }else if(dates>=REL_STAGE_THRESHOLDS.citando&&stage!=='citando'){
      newStage='citando';
    }
    if(newStage){
      stage=newStage;
      log('La Reina avanzo a etapa: '+stage+' ('+dates+' citas)','danger');
      G.queensLogs.push({type:'stage_advance',stage:stage,dates:dates,week:G.week});
      if(QUEEN_ADVANCE_TEXTS[stage]){
        var texts=QUEEN_ADVANCE_TEXTS[stage];
        log(texts[Math.floor(Math.random()*texts.length)],'danger');
      }
    }else{
      log('La Reina tuvo una cita exitosa. Progreso: '+dates+' citas, etapa: '+stage,'danger');
      G.queensLogs.push({type:'progress',stage:stage,dates:dates,week:G.week});
    }
    G.queenRelation.stage=stage;
    G.queenRelation.dates=dates;
  }
  if(G.week>=4&&G.queenRelation.dates===0&&G.queenRelation.stage==='conocer'){
    G.queenRelation.dates=1;
    G.queenRelation.stage='conocer';
    log('La Reina se activo por inercia. Ya conoce a alguien.','danger');
    G.queensLogs.push({type:'progress',stage:'conocer',dates:1,week:G.week,note:'boost'});
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
function checkVictories(){
if(G.gameOver)return;
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
if(G.queenRelation.stage==='familia'&&G.queenRelation.dates>=REL_STAGE_THRESHOLDS.familia){
  G.gameOver=true;G.victory='D1';
  showGameOver('defeat_queen_family');
  return;
}
if(G.daysWithoutDates>=21&&G.mood<=10){
G.gameOver=true;G.victory='D2';
showGameOver('defeat_isolation');
return;
}
if(G.weeksWithoutConquests>=8){
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
