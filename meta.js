// ============== THE ONE-MORE-RUN LOOP (meta-progression) ==============
// Every run banks Echo Residue — win or die. Residue milestones unlock NEW
// OPTIONS (weapons, mutations), never raw stats. Deaths show how close you came.
// 'daily' = everyone gets the same Vaults today. Loads last; wraps, edits nothing.

var META = { residue:0, bestDepth:0, runs:0, wins:0, unlocked:{} };
function metaLoad(){ try{ var s=localStorage.getItem("aegisMeta"); if(s){ var m=JSON.parse(s); if(m&&typeof m.residue==="number") META=m; } }catch(e){} }
function metaSave(){ try{ localStorage.setItem("aegisMeta",JSON.stringify(META)); }catch(e){} }

var META_WEAPONS = {
  "Thrumblade":      { d:[1,12] },
  "Veilbreaker Maul":{ d:[2,10] }
};
var META_MUTS = {
  "Echo Sense":  { type:"passive", desc:"you feel the stair's pull from the moment you arrive" },
  "Iron Marrow": { type:"passive", desc:"+12 max vitality" }
};
var MILESTONES = [
  { at:100, kind:"weapon", name:"Thrumblade",       blurb:"a blade tuned to the Choir's own frequency joins the drop pool" },
  { at:250, kind:"mut",    name:"Echo Sense",       blurb:"a new mutation enters the Choir's offers" },
  { at:450, kind:"weapon", name:"Veilbreaker Maul", blurb:"a seal-cracking maul joins the drop pool" },
  { at:700, kind:"mut",    name:"Iron Marrow",      blurb:"a new mutation enters the Choir's offers" }
];

function injectUnlocked(){
  MILESTONES.forEach(function(m){
    if (!META.unlocked[m.name]) return;
    if (m.kind==="weapon" && !WEAPONS[m.name]) WEAPONS[m.name]=META_WEAPONS[m.name];
    if (m.kind==="mut" && !MUTATIONS[m.name]) MUTATIONS[m.name]=META_MUTS[m.name];
  });
}
function applyUnlocks(){ // returns newly unlocked blurbs
  var fresh=[];
  MILESTONES.forEach(function(m){
    if (META.residue>=m.at && !META.unlocked[m.name]){
      META.unlocked[m.name]=true; fresh.push("UNLOCKED — "+m.name+": "+m.blurb);
    }
  });
  injectUnlocked();
  return fresh;
}
function nextUnlock(){
  for (var i=0;i<MILESTONES.length;i++){ if(!META.unlocked[MILESTONES[i].name]) return MILESTONES[i]; }
  return null;
}

function bankRun(won){
  var gain = depth*15 + killCount*2 + (won?100:0);
  META.residue += gain; META.runs++;
  if (won) META.wins++;
  var newBest = depth > META.bestDepth;
  if (newBest) META.bestDepth = depth;
  var fresh = applyUnlocks();
  metaSave();
  var lines = ["ECHO RESIDUE banked: +"+gain+" (lifetime "+META.residue+")"];
  if (newBest) lines.push("DEEPEST DESCENT YET — Depth "+depth);
  if (!won){
    var b=null; for (var i=0;i<enemies.length;i++){ if(enemies[i].isBoss){ b=enemies[i]; break; } }
    if (b && b.hp<b.maxHp && b.hp>0) lines.push("The Choirmaster stood at "+Math.ceil(b.hp/b.maxHp*100)+"% — you almost had it.");
  }
  fresh.forEach(function(f){ lines.push(f); });
  var nu=nextUnlock();
  if (nu) lines.push("Next unlock at "+nu.at+" Residue.");
  return lines.join("<br>");
}

// ---- daily seed ----
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
var _trueRandom = Math.random.bind(Math), dailyMode=false;
function startDaily(){
  var ds=new Date().toISOString().slice(0,10), seed=0;
  for (var i=0;i<ds.length;i++) seed=(seed*31+ds.charCodeAt(i))|0;
  Math.random=mulberry32(seed); dailyMode=true;
  restartGame();
  dmSay("[DAILY DESCENT "+ds+"] One seed, one Vault, for everyone today. Type 'normal' to leave.","log-win");
}
function endDaily(){
  Math.random=_trueRandom; dailyMode=false;
  restartGame();
  dmSay("Back to the wild, unseeded Vaults.","log-system");
}

// ---- wraps ----
(function(){
  metaLoad(); injectUnlocked();
  // unlocked weapons join drops
  var _pw=pickWeapon; pickWeapon=function(d){
    if (META.unlocked["Veilbreaker Maul"] && d>=3 && Math.random()<0.12) return "Veilbreaker Maul";
    if (META.unlocked["Thrumblade"] && Math.random()<0.15) return "Thrumblade";
    return _pw(d);
  };
  // Echo Sense: the stair is known from floor start
  var _ps=placeStairs; placeStairs=function(){ _ps(); if(typeof ownsMut==="function"&&ownsMut("Echo Sense")&&stairs.x>=0) seen.add(stairs.x+","+stairs.y); };
  // Iron Marrow: +12 max vitality (recompute the moment it's gained)
  var _rc=recompStats; recompStats=function(){ _rc(); if(ownsMut("Iron Marrow")){ player.maxHp+=12; if(player.hp>player.maxHp)player.hp=player.maxHp; } };
  var _am=addMutation; addMutation=function(n){ _am(n); if(n==="Iron Marrow") recompStats(); };
  // bank + near-miss on both endings
  var _die=die; die=function(){ var html=bankRun(false); _die(); var o=document.getElementById("overlaySub"); if(o) o.innerHTML+="<br><br>"+html; };
  var _win=win; win=function(){ var html=bankRun(true); _win(); var o=document.getElementById("overlaySub"); if(o) o.innerHTML+="<br><br>"+html; };
  // commands: daily / normal / legacy
  var _run=runCommand; runCommand=function(raw){
    var s=(raw||"").trim().toLowerCase();
    if (s==="daily"){ echoUser(raw); startDaily(); return; }
    if (s==="normal"||s==="unseeded"){ echoUser(raw); endDaily(); return; }
    if (s==="legacy"||s==="meta"||s==="residue"){
      echoUser(raw);
      dmSay("LEGACY — Residue "+META.residue+" · Runs "+META.runs+" · Wins "+META.wins+" · Deepest "+META.bestDepth+".","log-win");
      var ks=Object.keys(META.unlocked); dmSay("Unlocked: "+(ks.length?ks.join(", "):"nothing yet")+".","log-loot");
      var nu=nextUnlock(); if(nu) dmSay("Next unlock at "+nu.at+" Residue.","log-system");
      return;
    }
    _run(raw);
  };
})();
