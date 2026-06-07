// ============== QUD CORE: attributes + mutations ==============
// Five attributes feed everything; leveling offers a pick-1-of-3 choice;
// the Choir's corruption literally reshapes you — mutations, passive and active.

var stats = { might:2, agility:1, toughness:2, will:1, ego:1 };
var mutations = {};      // name -> true
var choiceQueue = [];    // pending level-up choices (arrays of 3 options)

var MUTATIONS = {
  "Carapace":   { type:"passive", desc:"chitinous plating — take 2 less damage from every hit" },
  "Quills":     { type:"passive", desc:"barbed hide — melee attackers take 2 damage" },
  "Two Hearts": { type:"passive", desc:"a second pulse — +8 max vitality" },
  "Horns":      { type:"passive", desc:"bone crown — +2 melee damage" },
  "Phase":      { type:"active",  desc:"'cast phase' — blink to a nearby tile (Corruption +4)" },
  "Mind Static":{ type:"active",  desc:"'cast mind' — stun the nearest foe, scales with Ego (Corruption +5)" },
  "Pyrokinesis":{ type:"active",  desc:"'cast pyro' — scorch the nearest foe, scales with Will/Ego (Corruption +5)" }
};

function qudReset(){
  stats = { might:2, agility:1, toughness:2, will:1, ego:1 };
  mutations = {}; choiceQueue = [];
  recompStats(); player.hp = player.maxHp;
}
function ownsMut(n){ return !!mutations[n]; }
function recompStats(){
  player.maxHp = 16 + stats.toughness*4 + (ownsMut("Two Hearts")?8:0);
  if (player.hp > player.maxHp) player.hp = player.maxHp;
}
function meleeBonus(){ return stats.might + (ownsMut("Horns")?2:0); }
function spellPower(){ return stats.will + Math.ceil(stats.ego/2); }
function dodgeChance(){ return Math.min(40, stats.agility*5)/100; }
function incomingDmg(a){ if(a<=0) return 0; return Math.max(1, a - (ownsMut("Carapace")?2:0)); }

function addMutation(n){
  if (mutations[n]) return;
  mutations[n] = true; gainCorr(5);
  dmSay("Your flesh remembers something it never was. MUTATION: "+n+".","log-win");
  if (n==="Two Hearts") recompStats();
}

// ---- level-up: the Choir offers change (pick 1 of 3) ----
var ATTRS = [["might","Might (+melee damage)"],["agility","Agility (+dodge)"],["toughness","Toughness (+max vitality)"],["will","Will (+spell power)"],["ego","Ego (+mutation power)"]];
function grantLevel(){
  player.hp = Math.min(player.maxHp, player.hp+6);
  var a = ATTRS.slice(); shuffle(a);
  var opts = [
    { kind:"stat", stat:a[0][0], label:"+1 "+a[0][1] },
    { kind:"stat", stat:a[1][0], label:"+1 "+a[1][1] }
  ];
  var unowned = Object.keys(MUTATIONS).filter(function(m){ return !mutations[m]; });
  if (unowned.length){
    var mn = unowned[Math.floor(Math.random()*unowned.length)];
    opts.push({ kind:"mut", name:mn, label:"MUTATION: "+mn+" — "+MUTATIONS[mn].desc });
  } else {
    opts.push({ kind:"stat", stat:a[2][0], label:"+1 "+a[2][1] });
  }
  choiceQueue.push(opts);
  if (choiceQueue.length===1) promptChoice();
}
function promptChoice(){
  var o = choiceQueue[0]; if(!o) return;
  dmSay("[ATTUNEMENT] LEVEL "+level+". The Choir offers change — click one (or type 1, 2, 3):","log-win");
  for (var i=0;i<o.length;i++)
    log("<span class=\"pick\" onclick=\"applyChoice("+(i+1)+")\">"+(i+1)+") "+o[i].label+"</span>","log-loot");
}

// ---- clickable spell hotbar (rendered every stats refresh) ----
function renderHotbar(){
  var hb=document.getElementById("hotbar"); if(!hb) return;
  var b=[
    ["Lance","cast lance","ranged bolt — Corruption +4"],
    ["Drain","cast drain","bite an adjacent foe, heal yourself — Corruption +5"],
    ["Nova","cast nova","strike everything in sight — Corruption +6"],
    ["Ward","cast ward","knit your wounds — Corruption +3"]
  ];
  if (ownsMut("Phase"))       b.push(["Phase","cast phase","blink to a nearby tile — Corruption +4"]);
  if (ownsMut("Mind Static")) b.push(["Mind","cast mind","stun the nearest foe — Corruption +5"]);
  if (ownsMut("Pyrokinesis")) b.push(["Pyro","cast pyro","scorch the nearest foe — Corruption +5"]);
  hb.innerHTML=b.map(function(x){
    return "<button class=\"hot\" title=\""+x[2]+"\" onclick=\"runCommand('"+x[1]+"');this.blur()\">"+x[0]+"</button>";
  }).join("");
}
function applyChoice(n){
  var o = choiceQueue[0]; if(!o) return false;
  var c = o[n-1]; if(!c) return false;
  if (c.kind==="stat"){
    stats[c.stat]++;
    if (c.stat==="toughness"){ recompStats(); player.hp=Math.min(player.maxHp,player.hp+4); }
    dmSay("The Aegis re-forges you. "+c.label+".","log-loot");
  } else {
    addMutation(c.name);
  }
  choiceQueue.shift(); recompStats(); renderStats();
  if (choiceQueue.length) promptChoice();
  else dmSay("The change settles into your bones.","log-system");
  return true;
}

// ---- active mutations (cast via the console) ----
function nearestVis(){
  var b=null, bd=999;
  for (var i=0;i<enemies.length;i++){ var e=enemies[i];
    if (e.hp<=0 || !visible.has(e.x+","+e.y)) continue;
    var d=Math.abs(e.x-player.x)+Math.abs(e.y-player.y);
    if (d<bd){ bd=d; b=e; } }
  return b;
}
function mutCast(which){
  if (gameOver) return;
  if (which==="phase"){
    if (!ownsMut("Phase")){ dmSay("Your body holds no such talent. (Mutations come with levels.)"); return; }
    var open=[]; for (var y=1;y<N-1;y++) for (var x=1;x<N-1;x++){
      if (!isWall(x,y) && !enemyAt(x,y) && !(x===player.x&&y===player.y) && Math.abs(x-player.x)+Math.abs(y-player.y)<=5) open.push({x:x,y:y}); }
    if (!open.length){ dmSay("Nowhere to phase to."); return; }
    var t=open[Math.floor(Math.random()*open.length)];
    player.x=t.x; player.y=t.y;
    dmSay("Reality stutters — you blink across the dark.","log-descend");
    gainCorr(4); render(); enemyTurn(); render(); dmTick(); return;
  }
  if (which==="mind"){
    if (!ownsMut("Mind Static")){ dmSay("Your mind holds no such static. (Mutations come with levels.)"); return; }
    var e=nearestVis(); if(!e){ dmSay("No mind near enough to seize."); return; }
    e.skip=(e.skip||0)+2+Math.floor(stats.ego/2); e.intent=null;
    dmSay("Mind Static floods the "+e.name+" — it seizes, locked mid-thought.","log-loot");
    gainCorr(5); render(); enemyTurn(); render(); dmTick(); return;
  }
  if (which==="pyro"){
    if (!ownsMut("Pyrokinesis")){ dmSay("No fire answers. (Mutations come with levels.)"); return; }
    var e2=nearestVis(); if(!e2){ dmSay("Nothing to burn."); return; }
    var dmg=spellPower()+roll(1,6);
    e2.hp=Math.max(0,e2.hp-dmg); floatDmg(e2.x,e2.y,dmg,"#ff7a2a");
    dmSay("Pyrokinesis sears the "+e2.name+" ("+dmg+").","log-damage");
    gainCorr(5); if(e2.hp<=0) onKill(e2);
    render(); enemyTurn(); render(); dmTick(); return;
  }
}
