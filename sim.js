// ============== EMERGENT SIM: water & fire ==============
// The Vaults react. Water pools conduct your static — through every foe
// standing in them, and through YOU if you're wading. Pyrokinesis ignites
// the ground; fire burns whatever stands in it, spreads, gutters out.
// Loads last; wraps, edits nothing.

var hazards = {};   // "x,y" -> "water"
var fires = {};     // "x,y" -> turns of life left

function hazardAt(x,y){ if (fires[x+","+y]) return "fire"; return hazards[x+","+y]||null; }

function genWater(){
  hazards = {}; fires = {};
  var pools = 2 + Math.floor(Math.random()*2);
  for (var p=0;p<pools;p++){
    if (!spawnCells.length) break;
    var c = spawnCells[Math.floor(Math.random()*spawnCells.length)];
    var size = 3 + Math.floor(Math.random()*4), frontier=[{x:c.x,y:c.y}], placed=0;
    while (frontier.length && placed<size){
      var t = frontier.shift(), k = t.x+","+t.y;
      if (hazards[k] || isWall(t.x,t.y)) continue;
      hazards[k]="water"; placed++;
      [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){ if (Math.random()<0.7) frontier.push({x:t.x+d[0],y:t.y+d[1]}); });
    }
  }
}

function waterRegion(x,y){
  var seenW={}, q=[[x,y]], out=[];
  while (q.length){
    var p=q.shift(), k=p[0]+","+p[1];
    if (seenW[k] || hazards[k]!=="water") continue;
    seenW[k]=1; out.push({x:p[0],y:p[1]});
    q.push([p[0]+1,p[1]],[p[0]-1,p[1]],[p[0],p[1]+1],[p[0],p[1]-1]);
  }
  return out;
}

function setFire(x,y,life){
  if (isWall(x,y)) return;
  if (hazards[x+","+y]==="water") return;
  fires[x+","+y] = life||4;
}

function fireTick(){
  var keys = Object.keys(fires); if (!keys.length) return;
  keys.forEach(function(k){
    var xy=k.split(","), x=+xy[0], y=+xy[1];
    var e=enemyAt(x,y);
    if (e){ e.hp=Math.max(0,e.hp-3); floatDmg(x,y,3,"#ff7a2a"); if(e.hp<=0) onKill(e); }
    if (player.x===x && player.y===y && !gameOver){
      player.hp=Math.max(0,player.hp-3);
      log("The fire chews at you (3).","log-hurt"); floatDmg(x,y,3,"#ff7a2a"); flash();
    }
  });
  if (player.hp<=0 && !gameOver) die();
  var next={};
  Object.keys(fires).forEach(function(k){
    var t=fires[k]-1; if (t>0) next[k]=t;
    var xy=k.split(","), x=+xy[0], y=+xy[1];
    if (Object.keys(fires).length<12 && Math.random()<0.22){
      var ds=[[0,1],[0,-1],[1,0],[-1,0]], d=ds[Math.floor(Math.random()*4)];
      var nx=x+d[0], ny=y+d[1];
      if (!isWall(nx,ny) && hazards[nx+","+ny]!=="water" && !fires[nx+","+ny]) next[nx+","+ny]=3;
    }
  });
  fires=next;
}

function conduct(tx,ty){
  var reg=waterRegion(tx,ty); if (!reg.length) return;
  var bonus=spellPower(), hit=0;
  reg.forEach(function(t){
    var e=enemyAt(t.x,t.y);
    if (e && e.hp>0){ e.hp=Math.max(0,e.hp-bonus); floatDmg(t.x,t.y,bonus,"#6cf"); if(e.hp<=0) onKill(e); hit++; }
  });
  var pin=reg.some(function(t){ return t.x===player.x && t.y===player.y; });
  if (pin){
    var half=Math.ceil(bonus/2);
    player.hp=Math.max(0,player.hp-half);
    log("The charge finds YOU in the water ("+half+").","log-hurt"); flash();
    if (player.hp<=0 && !gameOver) die();
  }
  if (hit||pin) dmSay("The water sings with static — the charge arcs through everything it touches.","log-damage");
}

function paintHazards(){
  var mp=document.getElementById("map"); if (!mp||!mp.children||!mp.children.length) return;
  function paint(k,cls){
    if (!seen.has(k)) return;
    var xy=k.split(","), idx=(+xy[1])*N+(+xy[0]);
    var t=mp.children[idx]; if (t&&t.classList) t.classList.add(cls);
  }
  Object.keys(hazards).forEach(function(k){ paint(k,"water"); });
  Object.keys(fires).forEach(function(k){ paint(k,"firet"); });
}

(function(){
  var _nfm=newFloorMap; newFloorMap=function(){ _nfm(); genWater(); };
  var _et=enemyTurn;    enemyTurn=function(){ _et(); if(!gameOver) fireTick(); };
  var _cl=castLance;    castLance=function(){ var t=nearestVisibleEnemy(); _cl(); if(t && hazards[t.x+","+t.y]==="water") conduct(t.x,t.y); };
  var _mc=mutCast;      mutCast=function(w){ var t=(w==="pyro"&&typeof ownsMut==="function"&&ownsMut("Pyrokinesis"))?nearestVis():null; _mc(w); if(w==="pyro"&&t) setFire(t.x,t.y,4); };
  var _r=render;        render=function(){ _r(); paintHazards(); };
})();
