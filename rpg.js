// ============== RPG: levels, weapons, magic (kept simple) ==============
// Echo is XP. Cross a threshold -> auto level-up (more HP, harder hits).
// Weapons auto-equip when they're better. Two Rites you cast; both cost Corruption.

var level = 1;
var WEAPONS = {
  "Aegis Blade":      { d:[1,8] },   // starting blade
  "Rust Saber":       { d:[1,10] },
  "Bone Cleaver":     { d:[2,6] },
  "Choir-Iron Maul":  { d:[2,8] },
  "Veiledge":         { d:[1,6], trait:"drain" },   // heals you on hit
  "Cleaver of Tongues":{ d:[1,8], trait:"cleave" }   // also hits other adjacent foes
};
var weapon = { name:"Aegis Blade", d:[1,8] };

function rpgReset(){ level=1; weapon={ name:"Aegis Blade", d:[1,8] }; }
function weaponAvg(d){ return d[0]*(d[1]+1)/2; }
function weaponRoll(){ return roll(weapon.d[0], weapon.d[1]); }

// which weapon shows up as a drop at a given depth
function pickWeapon(depth){
  var pool = depth>=4 ? ["Choir-Iron Maul","Cleaver of Tongues","Veiledge"]
           : depth>=2 ? ["Bone Cleaver","Veiledge","Rust Saber"]
           : ["Rust Saber","Veiledge"];
  return pool[Math.floor(Math.random()*pool.length)];
}

// take a found weapon if it's better; otherwise stow it
function maybeEquip(name){
  var w = WEAPONS[name]; if(!w) return;
  if (weaponAvg(w.d) >= weaponAvg(weapon.d)){
    weapon = { name:name, d:w.d, trait:w.trait };
    dmSay("You take up the "+name+". It settles into your grip like it was waiting.","log-loot");
    renderStats();
  } else {
    inventory.push(name);
    dmSay("A "+name+" — but your "+weapon.name+" bites deeper. Stowed.","log-loot");
    renderInv();
  }
}

// 'equip <name>' — wield a stowed weapon
function doEquip(s){
  var name=null;
  for (var k in WEAPONS){
    var first=k.split(" ")[0].toLowerCase();
    if (s.indexOf(k.toLowerCase())>=0 || s.indexOf(first)>=0){ name=k; break; }
  }
  if (!name){
    var carried = inventory.filter(function(i){return WEAPONS[i];});
    dmSay("Equip what? You're wielding the "+weapon.name+". Stowed: "+(carried.join(", ")||"none")+".");
    return;
  }
  if (weapon.name===name){ dmSay("Already wielding the "+name+"."); return; }
  var idx=inventory.indexOf(name); if(idx>=0) inventory.splice(idx,1);
  weapon = { name:name, d:WEAPONS[name].d, trait:WEAPONS[name].trait };
  dmSay("You ready the "+name+".","log-loot");
  renderInv(); renderStats();
}

// Echo thresholds -> automatic level-ups
function checkLevel(){
  while (echo >= 300 + level*100){ level++; grantLevel(); }
}

// single place an enemy death is resolved (melee + spells both call this)
function onKill(e){
  if (e.isBoss){
    log("☠ The Choirmaster's song shatters into silence.","log-win");
    echo += 120; killCount++; document.getElementById("echo").innerText = echo;
    win(); return;
  }
  log("☠ You slay the "+e.name+"!","log-kill");
  echo += 12; killCount++;
  document.getElementById("echo").innerText = echo;
  dmKill(e.name);
  if (Math.random()<0.5 && !itemAt(e.x,e.y)){
    var drop = Math.random()<0.4 ? pickWeapon(depth) : LOOT[Math.floor(Math.random()*LOOT.length)];
    items.push({ x:e.x, y:e.y, name:drop, symbol:"$" });
  }
  if (Math.random()<0.3) gainCorr(1);
  checkLevel();
}

// ----- Magic: Rites of the Static Choir (Corruption-fueled) -----
function nearestVisibleEnemy(){
  var best=null, bd=999;
  for (var i=0;i<enemies.length;i++){
    var e=enemies[i]; if(e.hp<=0) continue;
    if (!visible.has(e.x+","+e.y)) continue;
    var d=Math.abs(e.x-player.x)+Math.abs(e.y-player.y);
    if (d<bd){ bd=d; best=e; }
  }
  return best;
}
function castLance(){
  var e=nearestVisibleEnemy();
  if (!e){ dmSay("Static Lance gutters out — nothing in sight to strike."); return; }
  var dmg=spellPower()+roll(1,6); e.hp=Math.max(0,e.hp-dmg); floatDmg(e.x,e.y,dmg,"#9ad8ff");
  dmSay("Static Lance screams across the dark into the "+e.name+" ("+dmg+").","log-damage");
  gainCorr(4);
  if (e.hp<=0) onKill(e);
  render(); enemyTurn(); render(); dmTick();
}
function castDrain(){
  var e=null;
  for (var i=0;i<enemies.length;i++){
    var x=enemies[i];
    if (x.hp>0 && Math.abs(x.x-player.x)+Math.abs(x.y-player.y)===1){ e=x; break; }
  }
  if (!e){ dmSay("Choir's Hunger finds nothing close enough to feed on."); return; }
  var dmg=spellPower()+roll(1,4); e.hp=Math.max(0,e.hp-dmg); floatDmg(e.x,e.y,dmg,"#c080ff");
  var heal=Math.ceil(dmg/2); player.hp=Math.min(player.maxHp,player.hp+heal);
  dmSay("Choir's Hunger bites the "+e.name+" for "+dmg+" and feeds "+heal+" back into you.","log-loot");
  gainCorr(5);
  if (e.hp<=0) onKill(e);
  render(); enemyTurn(); render(); dmTick();
}
function castNova(){
  var hit=0;
  for (var i=0;i<enemies.length;i++){
    var e=enemies[i];
    if (e.hp>0 && visible.has(e.x+","+e.y)){ var dmg=spellPower()+roll(1,4); e.hp=Math.max(0,e.hp-dmg); floatDmg(e.x,e.y,dmg,"#c080ff"); hit++; if(e.hp<=0) onKill(e); }
  }
  if (!hit){ dmSay("Choir-Nova flares against an empty dark."); return; }
  dmSay("Choir-Nova detonates outward — every visible foe convulses ("+hit+" struck).","log-damage");
  gainCorr(6); render(); enemyTurn(); render(); dmTick();
}
function castWard(){
  var h=spellPower()+roll(1,6); player.hp=Math.min(player.maxHp,player.hp+h);
  dmSay("You pull the Veil-ward close; static knits over your wounds (+"+h+" vitality).","log-loot");
  gainCorr(3); render(); enemyTurn(); render(); dmTick();
}
function doCast(s){
  if (gameOver) return;
  if (s.indexOf("lance")>=0 || s.indexOf("bolt")>=0) castLance();
  else if (s.indexOf("drain")>=0 || s.indexOf("hunger")>=0) castDrain();
  else if (s.indexOf("nova")>=0) castNova();
  else if (s.indexOf("ward")>=0 || s.indexOf("heal")>=0) castWard();
  else if (s.indexOf("phase")>=0 || s.indexOf("blink")>=0) mutCast("phase");
  else if (s.indexOf("mind")>=0 || s.indexOf("stun")>=0) mutCast("mind");
  else if (s.indexOf("pyro")>=0 || s.indexOf("fire")>=0 || s.indexOf("burn")>=0) mutCast("pyro");
  else dmSay("Rites: cast lance / drain / nova / ward. Mutations (if grown): cast phase / mind / pyro. All feed your Corruption.");
}

// ----- item use (vials etc.) -----
function useItem(name){
  if (gameOver) return;
  var i=inventory.indexOf(name); if(i<0) return;
  if (name==="Vial of Ichor"){
    inventory.splice(i,1);
    var h=roll(1,6)+3; player.hp=Math.min(player.maxHp,player.hp+h);
    dmSay("You break the vial and drink. The ichor knits your wounds (+"+h+" vitality).","log-loot");
    renderInv(); renderStats();
  } else if (name==="Corroded Key"){
    dmSay("A key is for locked things. Stand by a locked chest and 'use key'.");
  } else {
    dmSay("You turn the "+name+" over in your hand. Nothing happens — not yet.");
  }
}
function doUse(s){
  if (s.indexOf("ichor")>=0 || s.indexOf("vial")>=0 || s.indexOf("potion")>=0) useItem("Vial of Ichor");
  else if (s.indexOf("key")>=0) doUseKey();
  else dmSay("Use what? Try 'use ichor', or click an item in your inventory.");
}
