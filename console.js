// ====================== THE TRANSMIT CONSOLE ======================
// Parses what JON types into HERMES and acts on the world.

function transmit(){
  var i = document.getElementById("input");
  var v = i.value; i.value = "";
  if (!v.trim()) return;
  runCommand(v);
}

function escapeHtml(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function echoUser(t){
  var m=document.getElementById("messages");
  var d=document.createElement("div");
  d.style.margin="6px 0 2px"; d.style.color="#888";
  d.innerHTML="&gt; "+escapeHtml(t); m.appendChild(d); m.scrollTop=m.scrollHeight;
}
function norm(s){ return s.toLowerCase().trim().replace(/\s+/g," "); }
function has(p,s){ return s.indexOf(p)===0; }

function runCommand(raw){
  echoUser(raw);
  if (gameOver){ dmSay("The link is severed, JON. RE-LINK AEGIS to descend again."); return; }
  var s = norm(raw);
  if (!s) return;
  // pending level-up choice
  if (typeof choiceQueue!=="undefined" && choiceQueue.length){
    var cm = s.match(/^(?:choose\s*)?([1-3])$/);
    if (cm){ applyChoice(parseInt(cm[1],10)); return; }
  }
  // exploration
  if (s==="look"||s==="examine"||s==="l"||s==="x"){ dmLook(); return; }
  if (s==="listen"||s==="hear"){ dmListen(); return; }
  if (s==="recall"||s==="map"||s==="where"){ doRecall(); return; }
  if (has("search",s)||s==="forage"||has("look for",s)){ doSearch(); return; }
  // interactions
  if (has("use",s)){ doUse(s); return; }
  if (s==="unlock"||s==="key"){ doUseKey(); return; }
  if (has("force",s)||has("pry",s)||has("break",s)||has("smash",s)){ doForce(); return; }
  if (has("open",s)||s==="loot"||s==="take"||s==="grab"){ doOpen(); return; }
  // weapons & magic
  if (has("cast",s)){ doCast(s); return; }
  if (has("equip",s)||has("wield",s)){ doEquip(s); return; }
  if (s==="spells"||s==="rites"){ dmSay("Rites of the Static Choir: 'cast lance' (ranged bolt) and 'cast drain' (adjacent, heals you). Each raises Corruption."); return; }
  // rituals
  if (has("pray",s)||has("kneel",s)){ doPray(); return; }
  if (has("commune",s)||has("listen to the choir",s)){ doCommune(); return; }
  if (has("sacrifice",s)||has("offer",s)){ doSacrifice(); return; }
  // freeform / lore
  freeform(s);
}

// ---------- helpers ----------
function chestNear(){
  for (var i=0;i<chests.length;i++){
    var c=chests[i];
    if (Math.abs(c.x-player.x)+Math.abs(c.y-player.y) <= 1) return c;
  }
  return null;
}
function hasItem(n){ return inventory.indexOf(n)>=0; }
function takeKey(){ var i=inventory.indexOf("Corroded Key"); if(i>=0) inventory.splice(i,1); }
function addItem(n){
  inventory.push(n);
  if (n==="Vial of Ichor"){ var h=roll(1,6)+2; player.hp=Math.min(player.maxHp,player.hp+h); }
  renderInv(); renderStats();
}
function dirTo(tx,ty){
  var dx=tx-player.x, dy=ty-player.y;
  return Math.abs(dy)>Math.abs(dx) ? (dy<0?"north":"south") : (dx<0?"west":"east");
}

// ---------- exploration ----------
function doRecall(){
  if (visible.has(stairs.x+","+stairs.y) || DM.stairsAnnounced)
    dmSay("By my telemetry, the stair lies "+dirTo(stairs.x,stairs.y)+" of you.","log-descend");
  else
    dmSay("I haven't mapped the stair yet. Walk. I'll know it the moment you see it.");
  dmSay("Explored: "+seen.size+" tiles of this floor.");
}
function doSearch(){
  if (chestNear()){ dmSay("There's a container right here. Try: open chest."); return; }
  var id = roomId(player.x,player.y);
  var kind = id!=="hall" ? kindFor(id) : null;
  var chance = kind==="shrine" ? 0.5 : (kind==="archive"?0.3:0.16);
  if (Math.random() < chance){
    if (kind==="shrine" && Math.random()<0.6){
      WORLD.secretFind.forEach(function(l){ dmSay(l,"log-loot"); });
      addItem("Faded Sigil");
    } else {
      var L = pick(["Rusty Coin","Bone Shard","Vial of Ichor","Corroded Key"]);
      addItem(L); dmSay("Your search turns up: "+L+".","log-loot");
      if (WORLD.loot[L]) dmSay(WORLD.loot[L],"log-loot");
    }
  } else {
    dmSay(pick(["Nothing but dust and the patient dead.","You find nothing. The Vaults keep their own.","Empty. Keep moving, RICO."]));
  }
}

// ---------- chests ----------
function openChest(c){
  c.opened = true; c.locked = false;
  if (WEAPONS[c.loot]){ dmSay("The chest holds a weapon.","log-loot"); maybeEquip(c.loot); render(); return; }
  inventory.push(c.loot);
  dmSay("The chest yields: "+c.loot+".","log-loot");
  if (WORLD.loot[c.loot]) dmSay(WORLD.loot[c.loot],"log-loot");
  if (c.loot==="Vial of Ichor"){ var h=roll(1,6)+2; player.hp=Math.min(player.maxHp,player.hp+h); }
  renderInv(); renderStats(); render();
}
function doOpen(){
  var c = chestNear();
  if (!c){ dmSay("Nothing here to open. Stand beside a chest first."); return; }
  if (c.opened){ dmSay("That one's already emptied."); return; }
  if (c.locked){ dmSay("Locked. 'use key' if you have one — or 'force' it and pay in blood."); return; }
  openChest(c);
}
function doUseKey(){
  var c = chestNear();
  if (!c || c.opened){ dmSay("No locked container in reach."); return; }
  if (!c.locked){ dmSay("It isn't locked. Just 'open' it."); return; }
  if (!hasItem("Corroded Key")){ dmSay("You hold no key. Find a Corroded Key, or 'force' it."); return; }
  takeKey();
  dmSay("The corroded key bites, turns, and crumbles to flakes. The lock gives.","log-loot");
  openChest(c);
}
function doForce(){
  var c = chestNear();
  if (!c || c.opened){ dmSay("Nothing here to force."); return; }
  var dmg = roll(1,4);
  player.hp = Math.max(0, player.hp - dmg);
  dmSay("You wrench it open. The effort tears something ("+dmg+" vitality).","log-hurt");
  flash(); renderStats();
  if (player.hp <= 0){ render(); die(); return; }
  openChest(c);
}

// ---------- rituals ----------
function ritualBlocked(){
  if (DM.ritualUsed){ dmSay(pick(WORLD.rituals.spent)); return true; }
  return false;
}
function doPray(){
  if (ritualBlocked()) return;
  DM.ritualUsed = true;
  dmSay(pick(WORLD.rituals.pray),"log-loot");
  var h = roll(1,6)+3; player.hp = Math.min(player.maxHp, player.hp + h);
  dmSay("Vitality answers: +"+h+". The Choir keeps the receipt.","log-loot");
  gainCorr(4); render();
}
function doCommune(){
  if (ritualBlocked()) return;
  DM.ritualUsed = true;
  dmSay(pick(WORLD.rituals.commune),"log-win");
  for (var y=0;y<N;y++) for (var x=0;x<N;x++) seen.add(x+","+y);
  dmSay("The floor unfolds in your skull. You see all of its shape now.","log-descend");
  var h = roll(1,4); player.hp = Math.min(player.maxHp, player.hp + h);
  gainCorr(9); render();
}
function doSacrifice(){
  var cost = 40;
  if (echo < cost){ dmSay("An offering costs "+cost+" Echo. You carry "+echo+"."); return; }
  echo -= cost; document.getElementById("echo").innerText = echo;
  dmSay(pick(WORLD.rituals.sacrifice),"log-loot");
  player.maxHp += 2; player.hp = player.maxHp;
  dmSay("The Aegis hardens. Maximum vitality +2, and you are made whole.","log-loot");
  gainCorr(2); renderStats(); render();
}

// ---------- freeform / easter eggs ----------
function freeform(s){
  var keys = Object.keys(WORLD.eggs);
  for (var i=0;i<keys.length;i++){
    if (s.indexOf(keys[i]) >= 0){
      dmSay(WORLD.eggs[keys[i]].replace(/^HERMES:\s*/,""));
      return;
    }
  }
  dmSay(pick([
    "I parse no action in that. Verbs I answer to: look, search, open, use key, listen, pray, commune, sacrifice.",
    "The Vaults don't answer questions, JON. They answer footsteps.",
    "Noted. It changes nothing down here. Move.",
    "I am the wire in your skull, not a confessor. Onward, RICO."
  ]));
}
