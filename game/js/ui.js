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
/* Etapa de la relación según puntos de salud (umbrales de REL_HEALTH_THRESHOLDS).
   Única verdad: >=familia=Familia, >=novio=Novios, >5=Saliendo, resto=Conociendo. */
function getRelStageText(pts){
pts=pts||0;
var novioT=40,famT=70;
if(typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS){
  if(REL_HEALTH_THRESHOLDS.novio)novioT=REL_HEALTH_THRESHOLDS.novio;
  if(REL_HEALTH_THRESHOLDS.familia)famT=REL_HEALTH_THRESHOLDS.familia;
}
if(pts>=famT)return'Familia';
if(pts>=novioT)return'Novios';
if(pts>5)return'Saliendo';
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
var keys=Object.keys(DATE_LOCATIONS).filter(function(k){return DATE_LOCATIONS[k].mapVisible!==false && k!=='app';});
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
  item.innerHTML='<div class="time">💞 Conocido — '+getRelationProgressText(rel)+'</div>'+photoHtml(rel.photo,rel.name)+'<div class="text">'+ev.text+'</div><div class="actions"><button '+(canAfford?'':'disabled')+' onclick="goToDateKnown(\''+rel.id+'\')">'+(canAfford?'💞 Volver a ver a '+rel.name:'Sin plata para salir'+costNote)+'</button></div>';
}else if(ev.type==='pending_invite'){
  var irel=findRelationById(ev.relId);
  var iloc=DATE_LOCATIONS[ev.locationKey];
  if(irel&&iloc){
    var canAffordInv=G.money>=iloc.cost;
    var costNoteInv=canAffordInv?'':' <span style="color:var(--dim)">(necesitas $'+iloc.cost+')</span>';
    item.innerHTML='<div class="time">💬 Te escribió '+irel.name+'</div>'+photoHtml(irel.photo,irel.name)+'<div class="text">'+ev.text+'</div><div class="text" style="color:var(--dim)">Te propone: '+iloc.icon+' '+iloc.name+' ($'+iloc.cost+')</div><div class="actions"><button '+(canAffordInv?'':'disabled')+' onclick="acceptInvite()">Aceptar plan'+costNoteInv+'</button><button onclick="declineInvite()">Rechazar</button></div>';
  }else{
    item.innerHTML='<div class="time">Tu vida</div><div class="text">Un mensaje se perdió en el camino...</div>';
  }
}else if(ev.type==='app_match'){
  var cheapestCost2=getCheapestLocationCost();
  var canAfford2=G.money>=cheapestCost2;
  var costNote2=canAfford2?'':' <span style="color:var(--dim)">(necesitas al menos $'+cheapestCost2+')</span>';
  item.innerHTML='<div class="time">✨ Nuevo match en la app</div>'+photoHtml(ev.candidate.photo,ev.candidate.name)+'<div class="text">'+ev.text+'</div><div class="actions"><button '+(canAfford2?'':'disabled')+' onclick="goToDate(\''+ev.candidate.name+'\',\'app\')">'+(canAfford2?'💘 Ir a ver a '+ev.candidate.name:'Sin plata para salir'+costNote2)+'</button></div>';
}else if(ev.type==='casual'){
  var cheapestCost3=getCheapestLocationCost();
  var canAfford3=G.money>=cheapestCost3;
  var costNote3=canAfford3?'':' <span style="color:var(--dim)">(necesitas al menos $'+cheapestCost3+')</span>';
  var cloc=DATE_LOCATIONS[ev.locationKey]?DATE_LOCATIONS[ev.locationKey].name:ev.locationKey;
  item.innerHTML='<div class="time">✨ Te cruzaste con alguien en el '+cloc+'</div>'+photoHtml(ev.candidate.photo,ev.candidate.name)+'<div class="text">'+ev.text+'</div><div class="actions"><button '+(canAfford3?'':'disabled')+' onclick="goToDate(\''+ev.candidate.name+'\',\'casual\')">'+(canAfford3?'💘 Ir a ver a '+ev.candidate.name:'Sin plata para salir'+costNote3)+'</button></div>';
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
if(G.relations.length===0&&!G.pendingInvite){
var empty=document.createElement('div');
empty.className='feed-item fade-in';
empty.innerHTML='<div class="time">📱 Todavía no conocés a nadie</div><div class="text">La App de Citas es la puerta de entrada: abrí el teléfono 📱 y mirá la pestaña App para ver perfiles nuevos.</div><div class="actions"><button onclick="showPhone(\'app\')">📱 Abrir la App</button></div>';
container.appendChild(empty);
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
function showCandidateDate(c,loc,opts){
showScreen('date');
document.getElementById('date-title').textContent='Cita en '+loc.name;
var container=document.getElementById('date-content');
var originBanner='';
if(opts&&opts.origin==='casual'){
originBanner='<div class="candidate fade-in"><div class="text">✨ Te cruzaste con alguien en el '+loc.name+'</div></div>';
}else if(opts&&opts.origin==='app'){
originBanner='<div class="candidate fade-in"><div class="text">✨ Nuevo match en la app</div></div>';
}
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
container.innerHTML=originBanner+'<div class="candidate fade-in"><div class="name">'+photoHtml(c.photo,c.name)+c.name+' '+riskBadge+'</div><div class="traits">'+c.traits+' | '+c.personality+'</div><div class="desc">Chance de exito estimado: ~'+Math.round(baseChance)+'%</div></div><div class="dialogue-options" id="dialogue-opts"></div>';
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
}
/* Perfiles de la app: ver NO crea contacto, solo concretar (requestDateFromApp). */
function showAppProfiles(profiles){
if(G.gameOver)return;
showScreen('date');
document.getElementById('date-title').textContent='App de Citas 📱';
var container=document.getElementById('date-content');
var html='<div class="candidate fade-in"><div class="text">Revisaste la app... Mirá tranqui: <b>ver perfiles no crea contacto</b>, solo queda en tus contactos si concretás la cita. Ojo: salir por acá te expone mucho.</div></div>';
if(!profiles||profiles.length===0){
html+='<div class="candidate fade-in"><div class="text">No hay perfiles nuevos por hoy. Ya conocés a todo el mundo, campeón.</div></div>';
html+='<button onclick="showFeed()">Volver</button>';
container.innerHTML=html;
return;
}
var cheapestCost=getCheapestLocationCost();
var canAffordAny=G.money>=cheapestCost;
for(var i=0;i<profiles.length;i++){
var p=profiles[i];
html+='<div class="candidate fade-in"><div class="time">✨ Nuevo match en la app</div><div class="name">'+photoHtml(p.photo,p.name)+p.name+'</div><div class="traits">'+p.traits+' | '+p.personality+'</div><div class="actions"><button '+(canAffordAny?'':'disabled')+' onclick="requestDateFromApp(\''+p.name+'\')">'+(canAffordAny?'💘 Pedir cita a '+p.name:'Sin plata para salir (necesitas al menos $'+cheapestCost+')')+'</button></div></div>';
}
html+='<button onclick="showFeed()">Volver</button>';
container.innerHTML=html;
}
/* Picker de conocidos en un lugar fijo: sin gente nueva. */
function showLocationKnownPicker(locKey){
if(G.gameOver)return;
var loc=DATE_LOCATIONS[locKey];
if(!loc){showFeed();return;}
showScreen('date');
document.getElementById('date-title').textContent=loc.icon+' '+loc.name;
var container=document.getElementById('date-content');
var known=getAvailableKnownPeople();
var html='';
if(known.length===0){
html+='<div class="candidate fade-in"><div class="text">Todavía no conocés a nadie. La App de Citas 📱 es la puerta de entrada: abrí el teléfono 📱 y mirá la pestaña App.</div></div><button onclick="showPhone(\'app\')">📱 Abrir la App</button>';
}else{
html+='<div class="candidate fade-in"><div class="text">Nadie nuevo por acá hoy. Pero podés invitar a alguien que ya conocés al '+loc.name+' ($'+loc.cost+').</div></div>';
for(var i=0;i<known.length;i++){
var r=known[i];
var canAfford=G.money>=loc.cost;
html+='<div class="candidate fade-in">'+photoHtml(r.photo,r.name)+'<div class="name">'+r.name+'</div><div class="traits">Saliendo: '+getRelationProgressText(r)+'</div><div class="actions"><button '+(canAfford?'':'disabled')+' onclick="goToDateKnownAtLocation(\''+r.id+'\',\''+locKey+'\')">'+(canAfford?'💞 Invitar al '+loc.name:'Sin plata ($'+loc.cost+')')+'</button></div></div>';
}
html+='<button onclick="showMap()">Volver al mapa</button>';
}
container.innerHTML=html;
}
/* 📱 Teléfono simulado: puerta de entrada a flujos EXISTENTES (no duplica lógica).
   tab = 'contactos' | 'mensajes' | 'app'. */
function showPhone(tab){
if(G.gameOver)return;
tab=tab||'contactos';
showScreen('phone');
document.getElementById('phone-title').textContent='📱 Teléfono';
var tabs=document.getElementById('phone-tabs');
tabs.innerHTML='<button'+(tab==='contactos'?' class="active"':'')+' onclick="showPhone(\'contactos\')">👥 Contactos</button>'
+'<button'+(tab==='mensajes'?' class="active"':'')+' onclick="showPhone(\'mensajes\')">💬 Mensajes</button>'
+'<button'+(tab==='app'?' class="active"':'')+' onclick="showPhone(\'app\')">📱 App</button>';
var container=document.getElementById('phone-content');
var html='';
if(tab==='mensajes'){
if(G.pendingInvite){
var irel=findRelationById(G.pendingInvite.relId);
var iloc=DATE_LOCATIONS[G.pendingInvite.locationKey];
if(irel&&iloc){
var txts=(typeof inviteTexts!=='undefined'&&inviteTexts&&inviteTexts.length)?inviteTexts:['¿Nos vemos en {lugar}? 😏'];
var t=txts[Math.floor(Math.random()*txts.length)];
t=t.split('{nombre}').join(irel.name).split('{lugar}').join(iloc.name);
var canAffordInv=G.money>=iloc.cost;
html+='<div class="message-card fade-in"><div class="time">💬 Te escribió '+irel.name+'</div>'+photoHtml(irel.photo,irel.name)+'<div class="text">'+t+'</div><div class="text" style="color:var(--dim)">Te propone: '+iloc.icon+' '+iloc.name+' ($'+iloc.cost+')</div><div class="actions"><button '+(canAffordInv?'':'disabled')+' onclick="acceptInvite()">Aceptar plan</button><button onclick="declineInvite()">Rechazar</button></div></div>';
}
}
var feed=G.history.slice(-10).reverse();
var shown=0;
for(var i=0;i<feed.length;i++){
var h=feed[i];
var txt='';
if(h.type==='sabotage'){txt='👑 La Reina arruinó tu cita con '+(h.name||'alguien')+'.';}
else if(h.type==='infidelity_caught'){txt='💔 Tu pareja se enteró de que salís con '+(h.name||'alguien')+' (-15 salud).';}
else if(h.type==='infidelity_dumped'){txt='💔 Tu pareja se enteró de que salís con '+(h.name||'alguien')+' y te dejó.';}
else if(h.type==='infidelity_safe'){txt='🤫 Saliste con '+(h.name||'alguien')+' sin que nadie se entere.';}
else if(h.type==='date_success'){txt='💞 Cita exitosa con '+(h.name||'alguien')+'.';}
else if(h.type==='date_fail'){txt='💔 No funcionó con '+(h.name||'alguien')+'.';}
else if(h.type==='gay_encounter'){txt='🌙 Te cruzaste con '+(h.name||'alguien')+' y la vibe era rara.';}
if(txt){
html+='<div class="message-card fade-in"><div class="time">Semana '+h.week+', Día '+h.day+'</div><div class="text">'+txt+'</div></div>';
shown++;
}
}
if(!G.pendingInvite&&shown===0){
html+='<div class="candidate fade-in"><div class="text">Sin mensajes. Salí, conocé gente, y que suene ese teléfono... 📱</div></div>';
}
html+='<button onclick="showFeed()">Volver</button>';
}else if(tab==='app'){
html+='<div class="candidate fade-in"><div class="text">La puerta de entrada: 4 perfiles nuevos por visita. Ojo, la Reina también mira la app... 👑</div></div>';
html+='<div class="actions"><button onclick="visitApp()">Abrir App de Citas 📱</button></div>';
html+='<button onclick="showFeed()">Volver</button>';
}else{
if(!G.relations||G.relations.length===0){
html+='<div class="candidate fade-in"><div class="text">Todavía no conocés a nadie. Andá a la pestaña App 📱 para hacer match.</div></div>';
}else{
for(var j=0;j<G.relations.length;j++){
var r=G.relations[j];
html+='<div class="contact-card fade-in">'+photoHtml(r.photo,r.name)+'<div class="info"><div class="name">'+r.name+'</div><div class="desc">'+getRelationProgressText(r)+'</div></div><div><button onclick="showPhoneInvitePicker(\''+r.id+'\')">💞 Invitar</button></div></div>';
}
}
html+='<button onclick="showFeed()">Volver</button>';
}
container.innerHTML=html;
}
/* Selector de lugar para invitar a un conocido desde el teléfono.
   Al elegir, reutiliza goToDateKnownAtLocation (sin duplicar lógica de citas). */
function showPhoneInvitePicker(relId){
if(G.gameOver)return;
var rel=findRelationById(relId);
if(!rel){showPhone('contactos');return;}
showScreen('phone');
document.getElementById('phone-title').textContent='💞 Invitar a '+rel.name;
document.getElementById('phone-tabs').innerHTML='<button onclick="showPhone(\'contactos\')">👥 Contactos</button>'
+'<button onclick="showPhone(\'mensajes\')">💬 Mensajes</button>'
+'<button onclick="showPhone(\'app\')">📱 App</button>';
var container=document.getElementById('phone-content');
var html='<div class="candidate fade-in">'+photoHtml(rel.photo,rel.name)+'<div class="text">¿A dónde invitás a '+rel.name+'? ('+getRelationProgressText(rel)+')</div></div>';
var keys=Object.keys(DATE_LOCATIONS).filter(function(k){return DATE_LOCATIONS[k].mapVisible!==false && k!=='app';});
for(var i=0;i<keys.length;i++){
var loc=DATE_LOCATIONS[keys[i]];
var canAfford=G.money>=loc.cost;
html+='<div class="location-card fade-in"><div class="info"><div class="name">'+loc.icon+' '+loc.name+'</div><div class="desc">$'+loc.cost+' | Riesgo: '+loc.riskLabel+'</div></div><div><button '+(canAfford?'':'disabled')+' onclick="goToDateKnownAtLocation(\''+rel.id+'\',\''+keys[i]+'\')">'+(canAfford?'💞 Invitar':'Sin plata')+'</button></div></div>';
}
html+='<button onclick="showPhone(\'contactos\')">Volver a contactos</button>';
container.innerHTML=html;
}
function showManResult(loc){showScreen('result');
var c=MALE_CANDIDATES[Math.floor(Math.random()*MALE_CANDIDATES.length)];
var container=document.getElementById('result-content');
log('HOMBRE GAY: Te cruzaste con '+c.name+'. Algo no cerro...','danger');
/* Saliste igual: el encuentro fallido no cuenta como aislamiento. */
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
html+='<div class="debug-entry"><b>Reina salud:</b> '+((G.queenRelation&&G.queenRelation.healthPoints)||0)+'/100 ['+getRelStageText((G.queenRelation&&G.queenRelation.healthPoints)||0)+']</div>';
html+='<div class="debug-entry" style="margin-top:6px"><b>Dates log:</b></div>';
G.dateLog.slice(-8).forEach(function(d){
  html+='<div class="debug-entry">'+(d.success?'OK':'FALLA')+' — '+d.name+' W'+d.week+'D'+d.day+'</div>';
});
html+='<div class="debug-entry" style="margin-top:6px;border-top:1px solid var(--border);padding-top:6px"><b>Relaciones detalle:</b></div>';
G.relations.forEach(function(r){
  html+='<div class="debug-entry">'+r.name+' — '+getRelationProgressText(r)+'</div>';
});
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
