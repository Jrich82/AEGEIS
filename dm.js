// ====================== HERMES — THE DM ENGINE ======================
// Reads game globals (player, corruption, depth, enemies, items, stairs,
// inventory, killCount, visible) and narrates. Voice frays with Corruption.

var DM = { kinds:{}, seenRooms:new Set(), stairsAnnounced:false, lastId:null };
var GLYPH = "▓▒░§¥Ø†×#%".split("");

function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

// Corruption visually rots HERMES's words.
function corrupt(t){
  if (corruption < 25) return t;
  var p = corruption < 60 ? (corruption-25)/300 : (corruption-25)/120;
  var o = "";
  for (var i=0;i<t.length;i++){
    var c = t.charAt(i);
    if (c !== " " && Math.random() < p) o += GLYPH[Math.floor(Math.random()*GLYPH.length)];
    else o += c;
  }
  return o;
}

// HERMES speaks. Tier prefix at high corruption.
function dmSay(text, cls){
  var tier = corruption>=60 ? 2 : (corruption>=25 ? 1 : 0);
  var head = tier===2 ? "H▓RM▒S// " : (tier===1 ? "HERM▒S// " : "HERMES// ");
  log("<span style='color:#5fd8e0'>"+head+"</span>"+corrupt(text), cls||"log-system");
}

function dmIntro(){
  WORLD.intro.forEach(function(l){ dmSay(l,"log-system"); });
}

// Which 3x3 room block a coord is in ("hall" if in a corridor).
function bandOf(v){ if(v>=3&&v<=5)return 0; if(v>=9&&v<=11)return 1; if(v>=15&&v<=17)return 2; return -1; }
function roomId(x,y){ var bx=bandOf(x),by=bandOf(y); return (bx<0||by<0)?"hall":("r"+bx+by); }

function dmFloorReset(){
  DM.kinds = {}; DM.seenRooms = new Set(); DM.stairsAnnounced = false; DM.lastId = null;
  DM.ritualUsed = false;
}
function kindFor(id){
  if(!DM.kinds[id]) DM.kinds[id] = pick(WORLD.roomKinds);
  return DM.kinds[id];
}

// Things JON can sense in the current field of view.
function scanView(){
  var es=[], it=[], st=false;
  for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.hp>0&&visible.has(e.x+","+e.y))es.push(e.name);}
  for(var j=0;j<items.length;j++){var t=items[j];if(visible.has(t.x+","+t.y))it.push(t.name);}
  if(visible.has(stairs.x+","+stairs.y)) st=true;
  return {enemies:es, items:it, stairs:st};
}

// Called after every move: narrate new rooms, halls, and the first stair sighting.
function dmTick(){
  var id = roomId(player.x, player.y);
  if (id !== DM.lastId){
    if (id === "hall"){
      var r = Math.random();
      if (r < 0.35) dmSay(pick(WORLD.hall));
      else if (r < 0.50) dmVoice();
    } else if (!DM.seenRooms.has(id)){
      DM.seenRooms.add(id);
      if (id === "r00" && depth === 1){
        WORLD.firstRoom.forEach(function(l){ dmSay(l); });
      } else {
        dmSay(pick(WORLD.rooms[kindFor(id)]));
      }
    }
    DM.lastId = id;
  }
  if (!DM.stairsAnnounced && visible.has(stairs.x+","+stairs.y)){
    DM.stairsAnnounced = true;
    dmSay(pick(WORLD.stairsSeen),"log-descend");
  }
}

// 'look' / 'examine'
function dmLook(){
  var id = roomId(player.x, player.y);
  if (id === "hall") dmSay(pick(WORLD.hall));
  else dmSay(pick(WORLD.rooms[kindFor(id)]));
  var s = scanView();
  if (s.stairs) dmSay("The stair down is within sight.","log-descend");
  if (s.enemies.length) dmSay("Contacts: "+s.enemies.join(", ")+".","log-hurt");
  if (s.items.length) dmSay("You see: "+s.items.join(", ")+".","log-loot");
  if (!s.enemies.length && !s.items.length && !s.stairs) dmSay("Nothing here but you and me, RICO.");
}

// 'listen'
function dmListen(){
  var near=0, names={};
  for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.hp<=0)continue;
    var d=Math.abs(e.x-player.x)+Math.abs(e.y-player.y);
    if(d<=7){near++;names[e.name]=1;}}
  if(!near){ dmSay("You hold still. Only the Choir, far off, and your own pulse."); return; }
  dmSay("You listen. "+near+" thing"+(near>1?"s move":" moves")+" in the dark: "+Object.keys(names).join(", ")+".","log-hurt");
  var any=Object.keys(names)[0];
  if(WORLD.enemyLore[any] && Math.random()<0.6) dmSay(WORLD.enemyLore[any]);
}

// Event hooks fired by the engine.
function dmKill(name){
  if (Math.random() < 0.55){
    var lore = WORLD.enemyLore[name];
    if (lore && Math.random()<0.5) dmSay(lore);
    else dmSay(pick([
      "One less voice for the Choir to borrow.",
      "It folds. The Vaults note the vacancy.",
      "Dead. Or closer to it than it was. Good.",
      "You harvest the Echo of its ending."
    ]));
  }
}
function dmLoot(name){
  if (WORLD.loot[name]) dmSay(WORLD.loot[name],"log-loot");
}
function dmDescend(){
  dmSay(WORLD.descend[depth] || "Down. The seal closes overhead. No way back but through.","log-descend");
}

// HERMES talks to himself. What he says depends on how much of him is left.
function dmVoice(){
  var pool = corruption>=60 ? WORLD.voice.fraying : (corruption>=25 ? WORLD.voice.noticing : WORLD.voice.clean);
  dmSay(pick(pool));
}

// Assemble a personalized ending.
function dmEpilogue(win){
  var tier = corruption>=60 ? 2 : (corruption>=25 ? 1 : 0);
  var key  = tier===2 ? "lost" : (tier===1 ? "tainted" : "clean");
  var body, kills = (typeof killCount==="number") ? killCount : 0;
  if (win) body = WORLD.endWin[key];
  else     body = WORLD.endDie[key];
  var stat = "Depth "+depth+" • Echo "+echo+" • Relics "+inventory.length+" • Corruption "+corruption+" • Kills "+kills;
  return body + "\n\n" + stat;
}
