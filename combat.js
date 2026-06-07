// ============== TACTICAL COMBAT: archetypes, telegraphs, juice ==============
// Enemies declare their NEXT action; the engine renders it as a red threat tile,
// then executes it on the following player turn — so deaths are earned, not random.

var AIMAP = { g:"chaser", s:"chaser", r:"chaser", w:"shooter", i:"shooter", h:"charger", d:"exploder", t:"chaser", C:"chaser" };
function aiFor(symbol){ return AIMAP[symbol] || "chaser"; }

function stepToward(e, tx, ty, away){
  var dx=tx-e.x, dy=ty-e.y, hor=Math.abs(dx)>Math.abs(dy);
  var sx=dx>0?1:(dx<0?-1:0), sy=dy>0?1:(dy<0?-1:0);
  if (away){ sx=-sx; sy=-sy; }
  function step(ax,ay){ if(!isWall(ax,ay)&&!enemyAt(ax,ay)&&!(ax===player.x&&ay===player.y)){ e.x=ax; e.y=ay; return true; } return false; }
  if (hor){ if(step(e.x+sx,e.y)) return; step(e.x,e.y+sy); }
  else    { if(step(e.x,e.y+sy)) return; step(e.x+sx,e.y); }
}

function clearLine(x1,y1,x2,y2){
  if (x1===x2){ var s=y1<y2?1:-1; for(var y=y1+s;y!==y2;y+=s){ if(isWall(x1,y)) return false; } return true; }
  if (y1===y2){ var t=x1<x2?1:-1; for(var x=x1+t;x!==x2;x+=t){ if(isWall(x,y1)) return false; } return true; }
  return false;
}

function computeIntent(e){
  var ai=e.ai||"chaser", d=Math.abs(e.x-player.x)+Math.abs(e.y-player.y);
  if (ai==="shooter"){
    if (d>=2 && d<=4 && clearLine(e.x,e.y,player.x,player.y))
      return {type:"shoot",tx:player.x,ty:player.y,threat:[{x:player.x,y:player.y}]};
    if (d<=1) return {type:"move",away:true};
    return {type:"move"};
  }
  if (ai==="charger"){
    if ((e.x===player.x||e.y===player.y) && d>=2 && d<=6 && clearLine(e.x,e.y,player.x,player.y)){
      var sx=player.x>e.x?1:(player.x<e.x?-1:0), sy=player.y>e.y?1:(player.y<e.y?-1:0);
      var path=[], cx=e.x+sx, cy=e.y+sy;
      while(!(cx===player.x&&cy===player.y)){ path.push({x:cx,y:cy}); cx+=sx; cy+=sy; }
      path.push({x:player.x,y:player.y});
      return {type:"charge",sx:sx,sy:sy,threat:path};
    }
    return {type:"move"};
  }
  if (ai==="exploder"){
    if (d<=1){ var ts=[{x:e.x,y:e.y}], ds=[[0,-1],[0,1],[-1,0],[1,0]]; for(var i=0;i<4;i++) ts.push({x:e.x+ds[i][0],y:e.y+ds[i][1]}); return {type:"explode",threat:ts}; }
    return {type:"move"};
  }
  if (d===1) return {type:"melee",tx:player.x,ty:player.y,threat:[{x:player.x,y:player.y}]};
  return {type:"move"};
}

function hitPlayer(amt,label){
  if (Math.random()<dodgeChance()){ log("You twist aside — "+label.toLowerCase().replace("the ","the ")+" misses.","log-move"); floatDmg(player.x,player.y,"dodge","#6cf"); return false; }
  amt=incomingDmg(amt);
  player.hp=Math.max(0,player.hp-amt);
  log(label+" for "+amt+".","log-hurt");
  floatDmg(player.x,player.y,amt,"#ff5555"); shake(); flash();
  return true;
}

function executeIntent(e){
  var it=e.intent; if(!it) return;
  if (it.type==="move"){ stepToward(e,player.x,player.y,it.away); return; }
  if (it.type==="melee"){
    if (player.x===it.tx&&player.y===it.ty){
      var landed=hitPlayer(roll(e.dmg[0],e.dmg[1])+e.dmg[2],"The "+e.name+" strikes you");
      if (landed && ownsMut("Quills")){ e.hp=Math.max(0,e.hp-2); floatDmg(e.x,e.y,2,"#9f9"); log("Your quills bite back.","log-damage"); if(e.hp<=0) onKill(e); }
    }
    else log("The "+e.name+" strikes where you stood.","log-move");
    return;
  }
  if (it.type==="shoot"){
    if (player.x===it.tx&&player.y===it.ty){ hitPlayer(roll(e.dmg[0],e.dmg[1])+e.dmg[2],"The "+e.name+"'s shot finds you"); }
    else log("The "+e.name+" looses a bolt into empty dark.","log-move");
    return;
  }
  if (it.type==="charge"){
    var cx=e.x, cy=e.y, hit=false;
    for (var s=0;s<6;s++){ var nx=cx+it.sx, ny=cy+it.sy; if(isWall(nx,ny))break; if(nx===player.x&&ny===player.y){hit=true;break;} if(enemyAt(nx,ny))break; cx=nx; cy=ny; }
    e.x=cx; e.y=cy;
    if (hit) hitPlayer(Math.ceil((roll(e.dmg[0],e.dmg[1])+e.dmg[2])*1.5),"The "+e.name+" barrels into you");
    return;
  }
  if (it.type==="explode"){
    log("The "+e.name+" bursts apart!","log-hurt");
    if (Math.abs(e.x-player.x)+Math.abs(e.y-player.y)<=1) hitPlayer(roll(2,6)+2,"The blast tears you");
    e.hp=0;
    return;
  }
}

function combatEnemyTurn(){
  // boss splits at half health
  enemies.forEach(function(e){
    if (e.hp>0 && e.isBoss && !e.phase && e.hp<=e.maxHp/2){
      e.phase=1; dmSay("The Choirmaster splits its voice — the dead rise to sing with it.","log-death");
      for (var s=0;s<2;s++){ var fc=spawnCells[Math.floor(Math.random()*spawnCells.length)];
        if (fc && !enemyAt(fc.x,fc.y) && !(fc.x===player.x&&fc.y===player.y))
          enemies.push({x:fc.x,y:fc.y,name:"Choir-Thrall",symbol:"t",ai:"chaser",intent:null,color:"#9a8aba",hp:8,maxHp:8,dmg:[1,4,1]}); }
    }
  });
  enemies.forEach(function(e){ if(e.hp<=0) return; if(e.skip>0){ e.skip--; log("The "+e.name+" is locked in static.","log-move"); return; } executeIntent(e); });
  enemies.forEach(function(e){ if(e.hp>0) e.intent=null; });
}

function threatTiles(){
  var set={};
  for (var i=0;i<enemies.length;i++){
    var e=enemies[i]; if(e.hp<=0||!visible.has(e.x+","+e.y)) continue;
    if (!e.intent) e.intent=computeIntent(e);
    var th=e.intent.threat; if(th){ for(var j=0;j<th.length;j++) set[th[j].x+","+th[j].y]=1; }
  }
  return set;
}

// ---- juice ----
function floatDmg(gx,gy,txt,color){
  var fx=document.getElementById("fx"), mp=document.getElementById("map"); if(!fx||!mp) return;
  var s=document.createElement("div"); s.className="float";
  s.style.left=(mp.offsetLeft+8+gx*23+3)+"px"; s.style.top=(mp.offsetTop+6+gy*23)+"px";
  s.style.color=color||"#fff"; s.textContent=txt;
  fx.appendChild(s); setTimeout(function(){ if(s.parentNode) s.parentNode.removeChild(s); },650);
}
function shake(){ var m=document.getElementById("map"); if(!m)return; m.classList.add("shake"); setTimeout(function(){ m.classList.remove("shake"); },260); }
