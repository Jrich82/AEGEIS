// ============== EQUIPMENT SLOTS: weapon / armor / trinket ==============
// Armor soaks damage or sharpens dodges; trinkets push a build axis.
// Click anything in the inventory to equip it into its slot (old piece is stowed).
// Loads after the engine; wraps, edits nothing.

var ARMOR = {
  "Bone-Lattice Vest": { def:1, dodge:0,    desc:"-1 damage from every hit" },
  "Choir-Plate":       { def:2, dodge:0,    desc:"-2 damage from every hit" },
  "Veiled Shroud":     { def:0, dodge:0.07, desc:"+7% dodge" }
};
var TRINKETS = {
  "Choir Bell":   { spell:2, melee:0, hp:0, desc:"+2 spell power" },
  "Static Loop":  { spell:0, melee:2, hp:0, desc:"+2 melee damage" },
  "Marrow Charm": { spell:0, melee:0, hp:8, desc:"+8 max vitality" }
};
var armorEq = null, trinketEq = null;

function pickGear(){
  var pool = Object.keys(ARMOR).concat(Object.keys(TRINKETS));
  return pool[Math.floor(Math.random()*pool.length)];
}
function equipArmor(n){
  var i=inventory.indexOf(n); if(i<0) return;
  inventory.splice(i,1);
  if (armorEq) inventory.push(armorEq);
  armorEq=n;
  dmSay("You strap on the "+n+" — "+ARMOR[n].desc+".","log-loot");
  renderInv(); renderStats();
}
function equipTrinket(n){
  var i=inventory.indexOf(n); if(i<0) return;
  inventory.splice(i,1);
  if (trinketEq) inventory.push(trinketEq);
  trinketEq=n;
  dmSay("You bind the "+n+" to the Aegis — "+TRINKETS[n].desc+".","log-loot");
  recompStats(); renderInv(); renderStats();
}
function equipWeaponFromInv(n){
  var i=inventory.indexOf(n); if(i<0) return;
  inventory.splice(i,1);
  inventory.push(weapon.name);
  weapon={ name:n, d:WEAPONS[n].d, trait:WEAPONS[n].trait };
  dmSay("You ready the "+n+".","log-loot");
  renderInv(); renderStats();
}

(function(){
  // slot effects ride the existing helpers
  var _inc=incomingDmg;   incomingDmg=function(a){ var v=_inc(a); if(v>0&&armorEq) v=Math.max(1,v-ARMOR[armorEq].def); return v; };
  var _dg=dodgeChance;    dodgeChance=function(){ return Math.min(0.55, _dg() + (armorEq?ARMOR[armorEq].dodge:0)); };
  var _sp=spellPower;     spellPower=function(){ return _sp() + (trinketEq?TRINKETS[trinketEq].spell:0); };
  var _mb=meleeBonus;     meleeBonus=function(){ return _mb() + (trinketEq?TRINKETS[trinketEq].melee:0); };
  var _rc=recompStats;    recompStats=function(){ _rc(); if(trinketEq&&TRINKETS[trinketEq].hp){ player.maxHp+=TRINKETS[trinketEq].hp; if(player.hp>player.maxHp)player.hp=player.maxHp; } };
  var _qr=qudReset;       qudReset=function(){ armorEq=null; trinketEq=null; _qr(); };
  // click-to-equip everything
  var _use=useItem;       useItem=function(n){
    if (ARMOR[n]){ equipArmor(n); return; }
    if (TRINKETS[n]){ equipTrinket(n); return; }
    if (WEAPONS[n]){ equipWeaponFromInv(n); return; }
    _use(n);
  };
  // gear enters the world: chests + rare kill drops
  var _sc=spawnChests;    spawnChests=function(){ _sc(); chests.forEach(function(c){ if(!c.opened&&Math.random()<0.14) c.loot=pickGear(); }); };
  var _ok=onKill;         onKill=function(e){ var x=e.x,y=e.y,boss=e.isBoss; _ok(e); if(!boss&&Math.random()<0.06&&!itemAt(x,y)) items.push({x:x,y:y,name:pickGear(),symbol:"$"}); };
  // panel slots
  var _rs=renderStats;    renderStats=function(){
    _rs();
    var av=document.getElementById("armorVal");   if(av) av.innerText = armorEq||"—";
    var tv=document.getElementById("trinketVal"); if(tv) tv.innerText = trinketEq||"—";
  };
})();
