/* ui.js — Renderizado y manipulación del DOM: pantallas, feed, candidatas,
   resultados, game over, resumen semanal, panel de debug y utilidades.
   Depende de las funciones y datos en data.js y game.js. */

var debugOpen=false;
function photoHtml(src,name){return src?'<img class="candidate-photo" src="'+src+'" alt="'+name+'" onerror="this.style.display=\'none\'">':'';}
function queenPortrait(size){
  size=size||40;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="'+size+'" height="'+size+'" style="display:inline-block;vertical-align:middle;margin-right:6px;border-radius:50%;border:2px solid #daa520">'
    +'<defs><linearGradient id="qbg'+size+'" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#2a1a3e"/><stop offset="100%" style="stop-color:#1a0a2e"/></linearGradient>'
    +'<linearGradient id="qcrown'+size+'" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#ffd700"/><stop offset="100%" style="stop-color:#daa520"/></linearGradient></defs>'
    +'<rect width="120" height="120" fill="url(#qbg'+size+')" rx="8"/>'
    +'<ellipse cx="60" cy="55" rx="35" ry="40" fill="#1a1a2e"/><path d="M25 55 Q25 95 40 100 L40 60 Z" fill="#1a1a2e"/><path d="M95 55 Q95 95 80 100 L80 60 Z" fill="#1a1a2e"/>'
    +'<ellipse cx="60" cy="58" rx="22" ry="25" fill="#d4a574"/>'
    +'<ellipse cx="52" cy="52" rx="4" ry="3" fill="#fff"/><ellipse cx="68" cy="52" rx="4" ry="3" fill="#fff"/>'
    +'<circle cx="53" cy="52" r="2" fill="#2a1a3e"/><circle cx="69" cy="52" r="2" fill="#2a1a3e"/>'
    +'<circle cx="53.5" cy="51.5" r="0.8" fill="#fff"/><circle cx="69.5" cy="51.5" r="0.8" fill="#fff"/>'
    +'<path d="M47 47 Q52 44 57 47" stroke="#1a1a2e" stroke-width="1.5" fill="none"/>'
    +'<path d="M63 47 Q68 44 73 47" stroke="#1a1a2e" stroke-width="1.5" fill="none"/>'
    +'<path d="M52 68 Q60 73 68 68" stroke="#c44569" stroke-width="2" fill="#c44569"/>'
    +'<path d="M38 38 L42 28 L48 35 L54 22 L60 35 L66 22 L72 35 L78 28 L82 38 Z" fill="url(#qcrown'+size+')" />'
    +'<circle cx="42" cy="28" r="2" fill="#ff6b6b"/><circle cx="60" cy="22" r="2.5" fill="#4ecdc4"/><circle cx="78" cy="28" r="2" fill="#ff6b6b"/>'
    +'<rect x="55" y="78" width="10" height="8" fill="#d4a574"/>'
    +'<path d="M35 86 Q60 82 85 86 L85 100 Q60 96 35 100 Z" fill="#2a1a3e"/>'
    +'</svg>';
}

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
  var infidelityWarning='';
  var _kpr=G.partner?findRelationById(G.partner):null;
  var _gate=((typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40);
  var _krisk=((typeof INFIDELITY_RISK!=='undefined')?INFIDELITY_RISK:40);
  if(_kpr&&rel.id!==_kpr.id&&G.healthPoints>=_gate){
    infidelityWarning='<div class="text" style="color:var(--danger);margin-top:4px">⚠️ Riesgo: '+_krisk+'% de infidelidad — si tu pareja se entere, perdés salud o te deja.</div>';
  }
  item.innerHTML='<div class="time">💞 Conocido — '+getRelationProgressText(rel)+'</div>'+photoHtml(rel.photo,rel.name)+'<div class="text">'+ev.text+'</div>'+infidelityWarning+'<div class="actions"><button '+(canAfford?'':'disabled')+' onclick="goToDateKnown(\''+rel.id+'\')">'+(canAfford?'💞 Volver a ver a '+rel.name:'Sin plata para salir'+costNote)+'</button></div>';
}else if(ev.type==='pending_invite'){
  var irel=findRelationById(ev.relId);
  var iloc=DATE_LOCATIONS[ev.locationKey];
  if(irel&&iloc){
    var canAffordInv=G.money>=iloc.cost;
    var costNoteInv=canAffordInv?'':' <span style="color:var(--dim)">(necesitas $'+iloc.cost+')</span>';
    var inviteWarning='';
    var _ipr=G.partner?findRelationById(G.partner):null;
    var _igate=((typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40);
    var _irisk=((typeof INFIDELITY_RISK!=='undefined')?INFIDELITY_RISK:40);
    if(_ipr&&irel.id!==_ipr.id&&G.healthPoints>=_igate){
      inviteWarning='<div class="text" style="color:var(--danger);margin-top:4px">⚠️ Riesgo: '+_irisk+'% de infidelidad — si tu pareja se entere, perdés salud o te deja.</div>';
    }
    item.innerHTML='<div class="time">💬 Te escribió '+irel.name+'</div>'+photoHtml(irel.photo,irel.name)+'<div class="text">'+ev.text+'</div><div class="text" style="color:var(--dim)">Te propone: '+iloc.icon+' '+iloc.name+' ($'+iloc.cost+')</div>'+inviteWarning+'<div class="actions"><button '+(canAffordInv?'':'disabled')+' onclick="acceptInvite()">Aceptar plan'+costNoteInv+'</button><button onclick="declineInvite()">Rechazar</button></div>';
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
html+='<div class="candidate fade-in"><div class="time">✨ Nuevo match en la app</div><div class="name">'+photoHtml(p.photo,p.name)+p.name+'</div><div class="traits">'+p.traits+' | '+p.personality+'</div><div class="actions"><button '+(canAffordAny?'':'disabled')+' onclick="requestDateFromApp(\''+p.id+'\')">'+(canAffordAny?'💘 Pedir cita a '+p.name:'Sin plata para salir (necesitas al menos $'+cheapestCost+')')+'</button></div></div>';
}
html+='<button onclick="showFeed()">Volver</button>';
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
tabs.innerHTML='<button'+(tab==='contactos'?' class="active"':'')+' onclick="showPhone(\'contactos\')"><span class="tab-icon">👥</span><span class="tab-label">Contactos</span></button>'
+'<button'+(tab==='mensajes'?' class="active"':'')+' onclick="showPhone(\'mensajes\')"><span class="tab-icon">💬</span><span class="tab-label">Mensajes</span></button>'
+'<button'+(tab==='app'?' class="active"':'')+' onclick="showPhone(\'app\')"><span class="tab-icon">📱</span><span class="tab-label">App</span></button>';
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
var queenHtml=(h.type==='sabotage')?'<div style="display:flex;align-items:center;margin-bottom:6px">'+queenPortrait(32)+'</div>':'';
html+='<div class="message-card fade-in'+(h.type==='sabotage'?' queen-sabotage':'')+'"><div class="time">Semana '+h.week+', Día '+h.day+'</div>'+queenHtml+'<div class="text">'+txt+'</div></div>';
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
var _cpr=G.partner?findRelationById(G.partner):null;
var _cgate=((typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40);
var _crisk=((typeof INFIDELITY_RISK!=='undefined')?INFIDELITY_RISK:40);
var _isPartner=_cpr&&r.id===_cpr.id;
var _canDate=_cpr&&!_isPartner&&G.healthPoints>=_cgate;
var _warn=_canDate?'<div class="desc" style="color:var(--danger)">⚠️ '+_crisk+'% infidelidad</div>':'';
html+='<div class="contact-card fade-in">'+photoHtml(r.photo,r.name)+'<div class="info"><div class="name">'+r.name+'</div><div class="desc">'+getRelationProgressText(r)+'</div>'+_warn+'</div><div><button onclick="showPhoneInvitePicker(\''+r.id+'\')">'+(_isPartner?'💞 Pareja':'💞 Invitar')+'</button></div></div>';
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
document.getElementById('phone-tabs').innerHTML='<button onclick="showPhone(\'contactos\')"><span class="tab-icon">👥</span><span class="tab-label">Contactos</span></button>'
+'<button onclick="showPhone(\'mensajes\')"><span class="tab-icon">💬</span><span class="tab-label">Mensajes</span></button>'
+'<button onclick="showPhone(\'app\')"><span class="tab-icon">📱</span><span class="tab-label">App</span></button>';
var container=document.getElementById('phone-content');
var _ipr2=G.partner?findRelationById(G.partner):null;
var _igate2=((typeof REL_HEALTH_THRESHOLDS!=='undefined'&&REL_HEALTH_THRESHOLDS&&REL_HEALTH_THRESHOLDS.novio)||40);
var _irisk2=((typeof INFIDELITY_RISK!=='undefined')?INFIDELITY_RISK:40);
var _inviteWarn2='';
if(_ipr2&&rel.id!==_ipr2.id&&G.healthPoints>=_igate2){
  _inviteWarn2='<div class="candidate fade-in" style="border-color:var(--danger)"><div class="text" style="color:var(--danger)">⚠️ Tenés pareja ('+findRelationById(_ipr2.id).name+', '+G.healthPoints+'/100). Si invitás a '+rel.name+', hay '+_irisk2+'% de riesgo de que se entere.</div></div>';
}
var html=_inviteWarn2+'<div class="candidate fade-in">'+photoHtml(rel.photo,rel.name)+'<div class="text">¿A dónde invitás a '+rel.name+'? ('+getRelationProgressText(rel)+')</div></div>';
var keys=Object.keys(DATE_LOCATIONS).filter(function(k){return DATE_LOCATIONS[k].mapVisible!==false && k!=='app';});
for(var i=0;i<keys.length;i++){
var loc=DATE_LOCATIONS[keys[i]];
var canAfford=G.money>=loc.cost;
html+='<div class="location-card fade-in"><div class="info"><div class="name">'+loc.icon+' '+loc.name+'</div><div class="desc">$'+loc.cost+' | Riesgo: '+loc.riskLabel+'</div></div><div><button '+(canAfford?'':'disabled')+' onclick="goToDateKnownAtLocation(\''+rel.id+'\',\''+keys[i]+'\')">'+(canAfford?'💞 Invitar':'Sin plata')+'</button></div></div>';
}
html+='<button onclick="showPhone(\'contactos\')">Volver a contactos</button>';
container.innerHTML=html;
}
/* Selector de lugar para concretar una cita desde la app.
   Reutiliza el mismo patrón que showPhoneInvitePicker. */
function showAppLocationPicker(candidateId){
if(G.gameOver)return;
var c=findCandidateById(candidateId);
if(!c){showFeed();return;}
showScreen('date');
document.getElementById('date-title').textContent='Elegí el lugar para '+c.name;
var container=document.getElementById('date-content');
var html='<div class="candidate fade-in">'+photoHtml(c.photo,c.name)+'<div class="text">¿Dónde salís con '+c.name+'? Elegí el lugar: costo, riesgo y estrategia son tu decisión.</div></div>';
var keys=Object.keys(DATE_LOCATIONS).filter(function(k){return DATE_LOCATIONS[k].mapVisible!==false && k!=='app';});
for(var i=0;i<keys.length;i++){
var loc=DATE_LOCATIONS[keys[i]];
var canAfford=G.money>=loc.cost;
html+='<div class="location-card fade-in"><div class="info"><div class="name">'+loc.icon+' '+loc.name+'</div><div class="desc">$'+loc.cost+' | Riesgo: '+loc.riskLabel+'</div><div class="desc">'+loc.desc+'</div></div><div><button '+(canAfford?'':'disabled')+' onclick="goToDate(\''+candidateId+'\',\'app\',\''+keys[i]+'\')">'+(canAfford?'💘 Salir con '+c.name:'Sin plata ($'+loc.cost+')')+'</button></div></div>';
}
html+='<button onclick="showFeed()">Volver</button>';
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
html='<div style="text-align:center;margin-top:80px">'+queenPortrait(80)+'<h1 style="color:var(--danger)">DERROTA</h1><h2>La Reina formo familia</h2><p style="margin:20px 0;color:var(--dim)">'+(QUEEN_DEFEAT_TEXTS.familia||'La Reina formo familia antes que vos.')+'</p><p style="font-style:italic;margin-top:10px">"Gracias por todo, mi rey. Ahora reina yo."</p></div>';
break;
case'defeat_isolation':
html='<div style="text-align:center;margin-top:80px">'+queenPortrait(80)+'<h1 style="color:var(--danger)">DERROTA</h1><h2>El Salado se aislo</h2><p style="margin:20px 0;color:var(--dim)">Tres semanas sin ver a nadie. Tu animo llego a cero. Te encerraste y la Reina gano por default.</p><p style="font-style:italic;margin-top:10px">"Siempre supe que no podias sin mi." - La Reina</p></div>';
break;
case'defeat_suffocation':
html='<div style="text-align:center;margin-top:80px">'+queenPortrait(80)+'<h1 style="color:var(--danger)">DERROTA</h1><h2>Asfixia</h2><p style="margin:20px 0;color:var(--dim)">Ocho semanas sin progresar. Tu relación se estancó y la Reina ganó por desgaste.</p><p style="font-style:italic;margin-top:10px">"Que triste. Yo al menos intento." - La Reina</p></div>';
break;
case'defeat_dumped':
html='<div style="text-align:center;margin-top:80px">'+queenPortrait(80)+'<h1 style="color:var(--danger)">DERROTA</h1><h2>Te dejaron</h2><p style="margin:20px 0;color:var(--dim)">La salud de tu relación llegó a 0. Te deprimiste, te dejó, o ambas cosas a la vez.</p><p style="font-style:italic;margin-top:10px">"Sabía que no podías sin mí. Ni conmigo, parece." - La Reina</p></div>';
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
