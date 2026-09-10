/* ui.js — Renderizado y manipulación del DOM: pantallas, feed, candidatas,
   resultados, game over, resumen semanal, panel de debug y utilidades.
   Depende de las funciones y datos en data.js y game.js. */

var debugOpen=false;
function photoHtml(src,name){return src?'<img class="candidate-photo" src="'+src+'" alt="'+name+'" onerror="this.style.display=\'none\'">':'';}

function log(msg,cls){var el=document.getElementById('console-log');var d=document.createElement('div');d.className='log-line'+(cls?' '+cls:'');d.textContent=msg;el.appendChild(d);el.scrollTop=el.scrollHeight;}
function showScreen(id){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});var el=document.getElementById('screen-'+id);if(el)el.classList.add('active');updateStatusBar();}
function updateStatusBar(){
document.getElementById('s-week').textContent=G.week;
document.getElementById('s-day').textContent=G.day;
document.getElementById('s-money').textContent=G.money;
document.getElementById('s-mood').textContent=G.mood;
var relEl=document.getElementById('s-relation');
if(G.partner){
  var rel=findRelationById(G.partner);
  if(rel){
    var hp=(rel.healthPoints!==undefined?rel.healthPoints:(G.healthPoints||0));
    relEl.textContent=rel.name+' — '+hp+'/100 ['+getRelStageText(hp)+']';
  }else{
    relEl.textContent='Sin relacion';
  }
}else if(G.relations.length>0){
  relEl.textContent='Conocidos: '+G.relations.length+' (sin pareja)';
}else{
  relEl.textContent='Sin relacion';
}
document.getElementById('status-bar').style.display=G.gameOver?'none':'flex';
}
function getMoodLevel(){
if(G.mood>=70)return'high';
if(G.mood>=30)return'medium';
return'low';
}
/* Etapa de la relación según puntos de salud (umbrales de REL_HEALTH_THRESHOLDS). */
function getRelStageText(pts){
pts=pts||0;
var novioT=40,famT=70;
if(typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS){
  if(REL_HEALTH_THRESHOLDS.novio)novioT=REL_HEALTH_THRESHOLDS.novio;
  if(REL_HEALTH_THRESHOLDS.familia)famT=REL_HEALTH_THRESHOLDS.familia;
}
if(pts>=famT)return'Familia';
if(pts>=novioT)return'Novios';
if(pts>=20)return'Saliendo';
return'Conociendo';
}
function getCheapestLocationCost(){
var min=99999;
var keys=Object.keys(DATE_LOCATIONS);
for(var i=0;i<keys.length;i++){
var c=DATE_LOCATIONS[keys[i]].cost;
if(c<min)min=c;
}
return min;
}
function showMap(){
if(G.gameOver)return;
showScreen('map');
var container=document.getElementById('map-locations');
container.innerHTML='';
var keys=Object.keys(DATE_LOCATIONS);
keys.forEach(function(key){
var loc=DATE_LOCATIONS[key];
var canAfford=G.money>=loc.cost;
var costText=canAfford?'$'+loc.cost:'$'+loc.cost+' (necesitas $'+(loc.cost-G.money)+' mas)';
var btnText=canAfford?'📍 Ir al '+loc.name:'Sin plata para '+loc.name;
var card=document.createElement('div');
card.className='location-card fade-in';
card.innerHTML='<div class="info"><div class="name">'+loc.icon+' '+loc.name+(canAfford?'':' <span style="color:var(--danger)">[BLOQUEADO]</span>')+(loc.safe?' <span style="color:var(--success)">[REFUGIO]</span>':'')+'</div><div class="desc">'+loc.desc+' | Riesgo: '+loc.riskLabel+'</div><div class="desc" style="margin-top:4px">'+costText+'</div></div><div><button '+(canAfford?'':'disabled')+' onclick="goToLocationFromMap(\''+key+'\')">'+btnText+'</button></div>';
container.appendChild(card);
});
}
function goToLocationFromMap(locKey){
var loc=DATE_LOCATIONS[locKey];
if(G.money<loc.cost){
log('No tenes plata para ir al '+loc.name+'. Necesitas $'+loc.cost+'.','danger');
showMap();
return;
}
if(locKey==='gym'){
goToGym();
}else{
goToLocation(locKey);
}
}
function showFeed(){
if(G.gameOver)return;
showScreen('feed');
var container=document.getElementById('feed-content');
container.innerHTML='';
var events=generateFeedEvents();
var dayName=getDayName(G.day);
var header=document.createElement('div');
header.className='feed-item fade-in';
header.innerHTML='<div class="time">'+dayName+' - Semana '+G.week+', Dia '+G.day+'</div>';
container.appendChild(header);
events.forEach(function(ev){
var item=document.createElement('div');
item.className='feed-item fade-in';
if(ev.type==='known_person'){
  var rel=ev.relation;
  var cheapestCost=getCheapestLocationCost();
  var canAfford=G.money>=cheapestCost;
  var costNote=canAfford?'':' <span style="color:var(--dim)">(necesitas al menos $'+cheapestCost+')</span>';
  item.innerHTML='<div class="time">💞 Conocido — '+getRelationLabel(rel)+'</div>'+photoHtml(rel.photo,rel.name)+'<div class="text">'+ev.text+'</div><div class="actions"><button '+(canAfford?'':'disabled')+' onclick="goToDateKnown(\''+rel.id+'\')">'+(canAfford?'💞 Volver a ver a '+rel.name:'Sin plata para salir'+costNote)+'</button></div>';
}else if(ev.type==='date_opportunity'){
var canAfford=ev.candidate&&true;
var cheapestCost=getCheapestLocationCost();
canAfford=G.money>=cheapestCost;
var costNote=canAfford?'':' <span style="color:var(--dim)">(necesitas al menos $'+cheapestCost+')</span>';
item.innerHTML='<div class="time">✨ Oportunidad</div>'+photoHtml(ev.candidate.photo,ev.candidate.name)+'<div class="text">'+ev.text+'</div><div class="actions"><button '+(canAfford?'':'disabled')+' onclick="goToDate(\''+ev.candidate.name+'\')">'+(canAfford?'💘 Ir a ver a '+ev.candidate.name:'Sin plata para salir'+costNote)+'</button></div>';
}else if(ev.type==='location_hint'){
var loc=DATE_LOCATIONS[ev.location];
var canAfford=G.money>=loc.cost;
var costNote=canAfford?'':' <span style="color:var(--dim)">(necesitas $'+loc.cost+')</span>';
item.innerHTML='<div class="time">📍 Sugerencia</div><div class="text">'+ev.text+'</div><div class="actions"><button '+(canAfford?'':'disabled')+' onclick="goToLocation(\''+ev.location+'\')">'+(canAfford?'📍 Ir al '+loc.name:'Sin plata para '+loc.name+costNote)+'</button></div>';
}else{
item.innerHTML='<div class="time">Tu vida</div><div class="text">'+ev.text+'</div>';
}
container.appendChild(item);
});
var moodLevel=getMoodLevel();
if(moodLevel==='low'){
var warn=document.createElement('div');
warn.className='feed-item fade-in';
warn.innerHTML='<div class="time" style="color:var(--danger)">Estado de animo bajo</div><div class="text" style="color:var(--danger)">Tu animo esta por el piso. Necesitas descansar o hablar con alguien. Las opciones arriesgadas no van a funcionar bien ahora.</div>';
container.appendChild(warn);
}
if(G.daysWithoutDates>=2){
var warn=document.createElement('div');
warn.className='feed-item fade-in';
warn.innerHTML='<div class="time" style="color:var(--danger)">Alerta</div><div class="text" style="color:var(--danger)">Llevas '+G.daysWithoutDates+' dias sin salir. Tu animo se esta deteriorando.</div>';
container.appendChild(warn);
}
if(G.partner){
  var prel=findRelationById(G.partner);
  if(prel){
    var php=(prel.healthPoints!==undefined?prel.healthPoints:(G.healthPoints||0));
    var hItem=document.createElement('div');
    hItem.className='feed-item fade-in';
    var hHtml='<div class="time">💞 Salud relación</div><div class="text">Tu relación con '+prel.name+': '+php+'/100 ['+getRelStageText(php)+']';
    if(G.weeksWithoutProgress>0){
      hHtml+='<br>Lleva '+G.weeksWithoutProgress+' semana(s) sin progresar.';
    }
    hHtml+='</div>';
    var gate=((typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40);
    var risk=((typeof INFIDELITY_RISK!=='undefined')?INFIDELITY_RISK:40);
    if(G.healthPoints>=gate){
      hHtml+='<div class="text" style="color:var(--danger)">⚠️ Tenés pareja ('+prel.name+'). Salir con alguien nuevo tiene '+risk+'% de riesgo de que se entere por cita.</div>';
    }
    hItem.innerHTML=hHtml;
    container.appendChild(hItem);
  }
}
updateDebug();
}
function showCandidateDate(c,loc){
showScreen('date');
document.getElementById('date-title').textContent='Cita en '+loc.name;
var container=document.getElementById('date-content');
var difficultyBonus=0;
if(loc.risk==='low')difficultyBonus=10;
else if(loc.risk==='medium')difficultyBonus=0;
else if(loc.risk==='high')difficultyBonus=-10;
else difficultyBonus=-20;
var baseChance=40+difficultyBonus+(G.labia/4)+(G.appearance/6)+(G.confidence/5)+(G.mood/8);
baseChance=Math.max(5,Math.min(95,baseChance));
var riskBadge='';
var badgeCls=loc.risk==='low'?'easy':loc.risk==='medium'?'medium':loc.risk==='high'?'hard':'extreme';
riskBadge='<span class="badge '+badgeCls+'">Riesgo: '+loc.riskLabel+'</span>';
container.innerHTML='<div class="candidate fade-in"><div class="name">'+photoHtml(c.photo,c.name)+c.name+' '+riskBadge+'</div><div class="traits">'+c.traits+' | '+c.personality+'</div><div class="desc">Chance de exito estimado: ~'+Math.round(baseChance)+'%</div></div><div class="dialogue-options" id="dialogue-opts"></div>';
var _pr=G.partner?findRelationById(G.partner):null;
var _gate=((typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40);
var _risk=((typeof INFIDELITY_RISK!=='undefined')?INFIDELITY_RISK:40);
if(_pr&&c.name!==_pr.name&&G.healthPoints>=_gate){
container.innerHTML+='<div class="candidate fade-in" style="border-color:var(--danger)"><div class="text" style="color:var(--danger)">⚠️ ADVERTENCIA: Tenés pareja ('+_pr.name+', '+G.healthPoints+'/100). Si seguís saliendo con alguien más, hay '+_risk+'% de riesgo de que se entere.</div></div>';
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
btn.onclick=function(){resolveDate(c,loc,d,baseChance);};
}
opts.appendChild(btn);
});
G.currentCandidate=c;
G.currentLocation=loc;
G.currentBaseChance=baseChance;
}
function showManResult(loc){
showScreen('result');
var c=MALE_CANDIDATES[Math.floor(Math.random()*MALE_CANDIDATES.length)];
var container=document.getElementById('result-content');
log('HOMBRE GAY: Te cruzaste con '+c.name+'. Algo no cerro...','danger');
G.money-=0;
G.daysWithoutDates++;
G.history.push({type:'gay_encounter',name:c.name,week:G.week,day:G.day});
saveGame();
container.innerHTML='<div class="result-box info fade-in"><h2 style="color:var(--fg)">Algo no cerro...</h2>'+photoHtml(c.photo,c.name)+'<p style="margin:10px 0;line-height:1.6">Te cruzaste con '+c.name+' en el '+loc.name+'. Hablaron un rato pero algo no se sentia bien. La vibe era... diferente.</p><p style="font-style:italic;margin-top:10px;color:var(--dim)">Perdiste el dia y el dinero. No sabes bien que paso.</p></div><button onclick="advanceDay()">Continuar</button>';
}
function showGymResult(type,text,changes,healthNote){
showScreen('result');
var container=document.getElementById('result-content');
var title='';
var borderColor='';
var icon='';
if(type==='training'){
title='Entrenamiento';
borderColor='var(--success)';
icon='💪';
}else if(type==='friend'){
title='Social';
borderColor='var(--accent)';
icon='🤝';
}else if(type==='harasser'){
title='Situacion rara...';
borderColor='var(--danger)';
icon='⚠️';
}
var changesHtml='';
if(changes&&changes.length>0){
changesHtml='<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:8px">';
for(var i=0;i<changes.length;i++){
var changeColor=changes[i].change.indexOf('+')===0?'var(--success)':'var(--danger)';
changesHtml+='<div style="font-size:12px;margin:2px 0"><span style="color:var(--dim)">'+changes[i].stat+':</span> <span style="color:'+changeColor+'">'+changes[i].change+'</span></div>';
}
changesHtml+='</div>';
}
var healthHtml='';
if(healthNote){
healthHtml='<div style="margin-top:8px;font-size:12px;color:var(--dim);font-style:italic">💞 '+healthNote+'</div>';
}
container.innerHTML='<div class="result-box fade-in" style="border-color:'+borderColor+'"><h2 style="color:'+borderColor+'">'+icon+' '+title+'</h2><p style="margin:10px 0;line-height:1.6">'+text+'</p>'+changesHtml+healthHtml+'</div><button onclick="advanceDay()">Continuar</button>';
}
function showGameOver(type,partnerName){
showScreen('gameover');
var container=document.getElementById('gameover-content');
document.getElementById('console-log').style.display='none';
var html='';
switch(type){
case'victory_family':
html='<div style="text-align:center;margin-top:80px"><h1 style="color:var(--success)">VICTORIA</h1><h2>Formaste una familia</h2><p style="margin:20px 0;color:var(--dim)">'+(partnerName||'Alguien')+' y vos, en una casita con olor a pan. Despues de todo el drama, encontraste tu lugar.</p><p style="font-style:italic;margin-top:10px">No es perfecto, pero es de ustedes. Es familia.</p></div>';
break;
case'victory_conquest':
html='<div style="text-align:center;margin-top:80px"><h1 style="color:var(--success)">VICTORIA</h1><h2>El Salado logro rehacer su vida</h2><p style="margin:20px 0;color:var(--dim)">Con '+G.totalConquests+' conquistas, te reinventaste. La Reina puede coronarse tranquila: vos ya tenes tu propia corona.</p></div>';
break;
case'victory_pg':
html='<div style="text-align:center;margin-top:80px"><h1 style="color:var(--accent)">VICTORIA OCULTA</h1><h2>El Salado es la Verdadera Reina</h2><p style="margin:20px 0;color:var(--dim)">Sin aviso, sin explicacion. Llegaste a '+G.pg+' Puntos Gay. La Reina no contaba con esto.</p><p style="font-style:italic;margin-top:10px">"Al parecer, yo era el problema todo el tiempo." - La Reina</p></div>';
break;
case'defeat_queen_family':
html='<div style="text-align:center;margin-top:80px"><h1 style="color:var(--danger)">DERROTA</h1><h2>La Reina formo familia</h2><p style="margin:20px 0;color:var(--dim)">'+(QUEEN_DEFEAT_TEXTS.familia||'La Reina formo familia antes que vos.')+'</p><p style="font-style:italic;margin-top:10px">"Gracias por todo, mi rey. Ahora reina yo."</p></div>';
break;
case'defeat_isolation':
html='<div style="text-align:center;margin-top:80px"><h1 style="color:var(--danger)">DERROTA</h1><h2>El Salado se aislo</h2><p style="margin:20px 0;color:var(--dim)">Tres semanas sin ver a nadie. Tu animo llego a cero. Te encerraste y la Reina gano por default.</p><p style="font-style:italic;margin-top:10px">"Siempre supe que no podias sin mi." - La Reina</p></div>';
break;
case'defeat_suffocation':
html='<div style="text-align:center;margin-top:80px"><h1 style="color:var(--danger)">DERROTA</h1><h2>Asfixia</h2><p style="margin:20px 0;color:var(--dim)">Ocho semanas sin progresar. Tu relación se estancó y la Reina ganó por desgaste.</p><p style="font-style:italic;margin-top:10px">"Que triste. Yo al menos intento." - La Reina</p></div>';
break;
case'defeat_dumped':
html='<div style="text-align:center;margin-top:80px"><h1 style="color:var(--danger)">DERROTA</h1><h2>Te dejaron</h2><p style="margin:20px 0;color:var(--dim)">La salud de tu relación llegó a 0. Te deprimiste, te dejó, o ambas cosas a la vez.</p><p style="font-style:italic;margin-top:10px">"Sabía que no podías sin mí. Ni conmigo, parece." - La Reina</p></div>';
break;
}
html+='<div style="margin-top:40px;text-align:center"><button onclick="location.reload()">Volver a empezar</button></div>';
container.innerHTML=html;
}
function updateDebug(){
if(!debugOpen)return;
var el=document.getElementById('debug-content');
var html='';
html+='<div class="debug-entry"><b>PG:</b> '+G.pg+' / 7</div>';
html+='<div class="debug-entry"><b>Relaciones:</b> '+G.relations.length+'</div>';
if(G.partner){
  var pRel=findRelationById(G.partner);
  if(pRel){
    html+='<div class="debug-entry"><b>Pareja:</b> '+pRel.name+' — '+getRelationProgressText(pRel)+'</div>';
  }else{
    html+='<div class="debug-entry"><b>Pareja:</b> (ID: '+G.partner+', no encontrada)</div>';
  }
}else{
  html+='<div class="debug-entry"><b>Pareja:</b> Ninguna</div>';
}
html+='<div class="debug-entry"><b>Family done:</b> '+(G.familyDone?'SI':'NO')+'</div>';
html+='<div class="debug-entry"><b>Salud relación:</b> '+(G.healthPoints||0)+'/100 ['+getRelStageText(G.healthPoints||0)+']</div>';
html+='<div class="debug-entry"><b>Semanas sin progreso:</b> '+(G.weeksWithoutProgress||0)+'</div>';
html+='<div class="debug-entry"><b>Reina salud:</b> '+((G.queenRelation&&G.queenRelation.healthPoints)||0)+'/100</div>';
html+='<div class="debug-entry" style="margin-top:6px;border-top:1px solid var(--border);padding-top:6px"><b>Reina:</b> '+G.queenRelation.stage+' ('+G.queenRelation.dates+'/'+REL_STAGE_THRESHOLDS.familia+')</div>';
html+='<div class="debug-entry" style="margin-top:6px"><b>Dates log:</b></div>';
G.dateLog.slice(-8).forEach(function(d){
  html+='<div class="debug-entry">'+(d.success?'OK':'FALLA')+' — '+d.name+' W'+d.week+'D'+d.day+'</div>';
});
html+='<div class="debug-entry" style="margin-top:6px;border-top:1px solid var(--border);padding-top:6px"><b>Relaciones detalle:</b></div>';
G.relations.forEach(function(r){
  html+='<div class="debug-entry">'+r.name+' — '+getRelationProgressText(r)+' ('+r.dates+' citas)</div>';
});
html+='<div class="debug-entry" style="margin-top:6px;border-top:1px solid var(--border);padding-top:6px"><b>Semanas s/conquista:</b> '+G.weeksWithoutConquests+'</div>';
html+='<div class="debug-entry"><b>Dias s/salir:</b> '+G.daysWithoutDates+'</div>';
html+='<div class="debug-entry"><b>Hombres consecutivos:</b> '+G.consecutiveMen+'</div>';
html+='<div class="debug-entry"><b>Animo:</b> '+G.mood+'</div>';
html+='<div class="debug-entry"><b>Animos nivel:</b> '+getMoodLevel()+'</div>';
html+='<div class="debug-entry"><b>Dinero:</b> $'+G.money+'</div>';
html+='<div class="debug-entry" style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px"><b>Gym mode:</b> '+(G.gymLastEvent||'ninguno')+'</div>';
html+='<div class="debug-entry" style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px"><b>Log de la Reina:</b></div>';
G.queensLogs.slice(-10).forEach(function(l){
html+='<div class="debug-entry">'+l.type+' - W'+l.week+(l.stage?' ['+l.stage+']':'')+(l.pg?' PG:'+l.pg:'')+(l.note?' ['+l.note+']':'')+'</div>';
});
html+='<div class="debug-entry" style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px"><b>Historial:</b></div>';
G.history.slice(-10).forEach(function(h){
html+='<div class="debug-entry">'+h.type+' - '+(h.name||'-')+' - W'+h.week+'D'+h.day+(h.stage?' ['+h.stage+']':'')+'</div>';
});
el.innerHTML=html;
}
function toggleDebug(){
debugOpen=!debugOpen;
var panel=document.getElementById('debug-panel');
panel.classList.toggle('open',debugOpen);
if(debugOpen)updateDebug();
}
document.addEventListener('keydown',function(e){
if(e.key==='d'||e.key==='D')toggleDebug();
});
(function(){
var newGameBtn=document.querySelector('#screen-start button.success');
var continueBtn=document.getElementById('btn-continue');
if(newGameBtn)newGameBtn.disabled=true;
continueBtn.disabled=true;
loadGameData().then(function(){
if(newGameBtn)newGameBtn.disabled=false;
var hasSave=localStorage.getItem('reinaFalsaSave');
if(hasSave)continueBtn.disabled=false;
});
})();
