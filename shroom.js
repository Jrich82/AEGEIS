// ============== HYMNCAPS: communion with the mycelial Choir ==============
// Pale caps fruit where the singing is loudest. Eat one: heal a little, see a
// TRUE thing (the visions persist across runs), and trip for 12 turns —
// the Choir lends its voice (+2 spell power, you sense the living through
// walls) and takes its tax (+1 Corruption per turn). Then the grey comedown.
// Loads after the engine; wraps, edits nothing.

var trip=0, tripDown=0, visionIdx=0;
try{ visionIdx = parseInt(localStorage.getItem("aegisVision")||"0",10)||0; }catch(e){}

var TRIPLINES={
  onset:[
    "The cap dissolves like a word you almost remember, and the floor begins to keep time with your pulse.",
    "Somewhere below, a thousand mouths notice you at once.",
    "The walls take a slow breath in, and forget to let it out."
  ],
  during:[
    "Threads of pale light run beneath the stone, and every thread ends in a face.",
    "You watch yourself take the next step half a second before you take it.",
    "Something in the mycelium hums your name in your mother's voice, almost correctly."
  ],
  down:[
    "The Choir withdraws by inches, leaving fingerprints on the inside of your skull.",
    "Color returns to the world the way blood returns to a numb limb — wrong, then worse, then ordinary."
  ]
};

function tripCls(on,downer){
  var mp=document.getElementById("map"); if(!mp) return;
  if(on){ mp.classList.add("tripping"); mp.classList.remove("comedown"); }
  else if(downer){ mp.classList.remove("tripping"); mp.classList.add("comedown"); }
  else { mp.classList.remove("tripping"); mp.classList.remove("comedown"); }
}

function eatCap(){
  if (gameOver) return;
  var i=inventory.indexOf("Hymncap");
  if (i<0){ dmSay("You carry no Hymncap. They fruit where the singing is loudest — pale, glowing, patient."); return; }
  inventory.splice(i,1);
  player.hp=Math.min(player.maxHp,player.hp+6);
  if (trip>0){
    gainCorr(10); trip=12;
    dmSay("You go deeper. The Choir closes over your head like water.","log-trip");
  } else {
    gainCorr(4); trip=12; tripDown=0;
    dmSay(pick(TRIPLINES.onset),"log-trip");
  }
  var v=WORLD.visions[Math.min(visionIdx,WORLD.visions.length-1)];
  visionIdx++; try{ localStorage.setItem("aegisVision",String(visionIdx)); }catch(e){}
  dmSay("VISION — "+v,"log-trip");
  if (typeof sfxMutation==="function") sfxMutation();
  tripCls(true,false);
  renderInv(); renderStats(); render();
}

// sense the living through walls while tripping
function tripPaint(){
  if (trip<=0) return;
  var mp=document.getElementById("map"); if(!mp||!mp.children||!mp.children.length) return;
  for (var i=0;i<enemies.length;i++){
    var e=enemies[i]; if(e.hp<=0) continue;
    if (visible.has(e.x+","+e.y)) continue;
    var t=mp.children[e.y*N+e.x]; if(t&&t.classList) t.classList.add("choirsight");
  }
}

(function(){
  // caps fruit on every floor (1 guaranteed + 35% second, not on the boss floor)
  var _si=spawnItems; spawnItems=function(){
    _si();
    if (depth>=MAXD) return;
    var n=1+(Math.random()<0.35?1:0);
    var p=spawnCells.filter(function(c){ return !enemyAt(c.x,c.y)&&!itemAt(c.x,c.y); });
    shuffle(p);
    for (var i=0;i<n&&i<p.length;i++) items.push({x:p[i].x,y:p[i].y,name:"Hymncap",symbol:"$"});
  };
  var _sc=spawnChests; spawnChests=function(){ _sc(); chests.forEach(function(c){ if(!c.opened&&Math.random()<0.10) c.loot="Hymncap"; }); };
  // click a Hymncap to eat it
  var _use=useItem; useItem=function(n){ if(n==="Hymncap"){ eatCap(); return; } _use(n); };
  // 'eat' works in the console too
  var _run=runCommand; runCommand=function(raw){
    var s=(raw||"").trim().toLowerCase();
    if (s==="eat"||s==="eat cap"||s==="eat hymncap"||s==="commune with the caps"){ echoUser(raw); eatCap(); return; }
    _run(raw);
  };
  // the trip lends, then takes
  var _sp=spellPower; spellPower=function(){ return Math.max(0,_sp() + (trip>0?2:0) - (tripDown>0?2:0)); };
  var _et=enemyTurn; enemyTurn=function(){
    _et();
    if (gameOver) return;
    if (trip>0){
      trip--; gainCorr(1);
      if (trip>0 && trip%4===0) dmSay(pick(TRIPLINES.during),"log-trip");
      if (trip===0){ tripDown=3; tripCls(false,true); dmSay(pick(TRIPLINES.down),"log-trip"); }
    } else if (tripDown>0){
      tripDown--;
      if (tripDown===0) tripCls(false,false);
    }
  };
  var _r=render; render=function(){ _r(); tripPaint(); };
  var _qr=qudReset; qudReset=function(){ _qr(); trip=0; tripDown=0; tripCls(false,false); };
})();
