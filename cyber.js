// ============== CYBERNETICS: find & install, budgeted by CHROME ==============
// The True Kin path: augments are FOUND (chests, elites), not grown.
// Install them permanently — if your Chrome capacity can take the load.
// Loads after game.js; wraps existing functions so no other file changes.

var CYBER = {
  "Dermal Plating": { cost:15, desc:"subdermal armor — take 1 less damage from every hit" },
  "Reflex Booster": { cost:12, desc:"wired nerves — +10% dodge" },
  "Power Claw":     { cost:15, desc:"hydraulic grip — +2 melee damage" },
  "Cortex Shunt":   { cost:12, desc:"overclocked mind — +2 spell power" },
  "Subdermal Cell": { cost:10, desc:"backup organ — +6 max vitality" }
};
var installed = {}, chromeUsed = 0;

function hasCyber(n){ return !!installed[n]; }
function pickCyber(){
  var ks = Object.keys(CYBER).filter(function(k){ return !installed[k]; });
  if (!ks.length) ks = Object.keys(CYBER);
  return ks[Math.floor(Math.random()*ks.length)];
}
function installCyber(n){
  var c = CYBER[n]; if (!c) return;
  var i = inventory.indexOf(n); if (i<0) return;
  if (installed[n]){ dmSay("A "+n+" is already bolted into you. One per body."); return; }
  if (chromeUsed + c.cost > chrome){
    dmSay("Not enough CHROME capacity. "+n+" needs "+c.cost+" — you're at "+chromeUsed+"/"+chrome+".","log-hurt");
    return;
  }
  inventory.splice(i,1);
  installed[n] = true; chromeUsed += c.cost;
  dmSay("The Aegis opens your flesh and bolts the "+n+" into place. CYBERNETIC online — "+c.desc+".","log-win");
  if (typeof sfxMutation==="function") sfxMutation();
  if (n==="Subdermal Cell") recompStats();
  renderInv(); renderStats();
}

// ---- wire effects + acquisition by wrapping (no edits elsewhere) ----
(function(){
  // effects ride the qud helpers
  var _dodge=dodgeChance;   dodgeChance=function(){ return Math.min(0.5, _dodge() + (hasCyber("Reflex Booster")?0.10:0)); };
  var _melee=meleeBonus;    meleeBonus=function(){ return _melee() + (hasCyber("Power Claw")?2:0); };
  var _spell=spellPower;    spellPower=function(){ return _spell() + (hasCyber("Cortex Shunt")?2:0); };
  var _inc=incomingDmg;     incomingDmg=function(a){ var v=_inc(a); if(v>0 && hasCyber("Dermal Plating")) v=Math.max(1,v-1); return v; };
  var _recomp=recompStats;  recompStats=function(){ _recomp(); if(hasCyber("Subdermal Cell")){ player.maxHp+=6; if(player.hp>player.maxHp)player.hp=player.maxHp; } };
  // clicking a cybernetic in inventory installs it
  var _use=useItem;         useItem=function(n){ if(CYBER[n]){ installCyber(n); return; } _use(n); };
  // chests at depth 2+ sometimes hold an augment; elites sometimes drop one
  var _chests=spawnChests;  spawnChests=function(){ _chests(); if(depth>=2){ chests.forEach(function(c){ if(Math.random()<0.18) c.loot=pickCyber(); }); } };
  var _kill=onKill;         onKill=function(e){ var elite=e.elite, x=e.x, y=e.y; _kill(e); if(elite && Math.random()<0.25 && !itemAt(x,y)) items.push({x:x,y:y,name:pickCyber(),symbol:"$"}); };
  // reset with the run
  var _reset=qudReset;      qudReset=function(){ _reset(); installed={}; chromeUsed=0; };
  // panel: show installed augments + Chrome load
  var _stats=renderStats;   renderStats=function(){
    _stats();
    var cv=document.getElementById("cyberVal");
    if(cv){ var ks=Object.keys(installed); cv.innerText = ks.length ? ks.join(", ") : "(none installed)"; }
    var cb=document.getElementById("chromeBar"); if(cb) cb.style.width=Math.min(100,(chromeUsed/chrome*100))+"%";
    var ct=document.getElementById("chromeText"); if(ct) ct.innerText=chromeUsed+"/"+chrome;
    var cvh=document.getElementById("chromeVal"); if(cvh) cvh.innerText=chromeUsed+"/"+chrome;
  };
})();
