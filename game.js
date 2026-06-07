var N=21,MAXD=5;
var player={x:3,y:3,hp:20,maxHp:20},enemies=[],items=[],inventory=[];
var echo=312,corruption=19,chrome=47,depth=1,stairs={x:0,y:0};
var seen=new Set(),visible=new Set(),gameOver=false;
var chests=[],killCount=0,spawnCells=[];
var map=[];
function roll(c,s){var t=0;for(var i=0;i<c;i++)t+=Math.floor(Math.random()*s)+1;return t;}
function enemyType(){var T=[
{name:"Goblin Scavenger",symbol:"g",color:"#3d5a3d",hp:[1,6,3],dmg:[1,3,0]},
{name:"Bonewalker",symbol:"s",color:"#7a7a7a",hp:[1,8,2],dmg:[1,4,1]},
{name:"Wraith of the Veil",symbol:"w",color:"#9a6aba",hp:[2,6,3],dmg:[1,4,2]},
{name:"Plague Rat",symbol:"r",color:"#6a7a4a",hp:[1,4,2],dmg:[1,2,0]},
{name:"Rusted Husk",symbol:"h",color:"#9a6a3a",hp:[2,8,4],dmg:[1,6,1]},
{name:"Marrow Hound",symbol:"d",color:"#8a3a3a",hp:[1,6,2],dmg:[1,4,1]},
{name:"Signal Wraith",symbol:"i",color:"#3a8aaa",hp:[1,6,3],dmg:[1,5,1]}];
return T[Math.floor(Math.random()*T.length)];}
var CELLS=[{x:5,y:3},{x:15,y:3},{x:3,y:9},{x:17,y:9},{x:5,y:15},{x:15,y:15},{x:9,y:5},{x:11,y:11},{x:7,y:17},{x:13,y:17},{x:4,y:4},{x:16,y:4},{x:4,y:16},{x:16,y:16},{x:10,y:10},{x:9,y:9},{x:11,y:5},{x:5,y:11}];
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}}
var LOOT=["Rusty Coin","Bone Shard","Faded Sigil","Corroded Key","Vial of Ichor"];
function spawnEnemies(){enemies=[];var n=Math.min(6+depth*2,14);var p=spawnCells.slice();shuffle(p);for(var i=0;i<n&&i<p.length;i++){var c=p[i],t=enemyType(),h=roll(t.hp[0],t.hp[1])+t.hp[2]+(depth-1)*2;var e={x:c.x,y:c.y,name:t.name,symbol:t.symbol,color:t.color,hp:h,maxHp:h,dmg:t.dmg.slice(),ai:aiFor(t.symbol),intent:null};if(depth>=2&&Math.random()<.15){e.elite=true;e.name="Elite "+e.name;e.hp=e.maxHp=h*2;e.dmg[2]+=2;}enemies.push(e);}}
function spawnItems(){items=[];var p=spawnCells.filter(function(c){return!enemyAt(c.x,c.y);});shuffle(p);for(var i=0;i<4&&i<p.length;i++)items.push({x:p[i].x,y:p[i].y,name:LOOT[i%LOOT.length],symbol:"$"});}
function placeStairs(){stairs=farthestCell();}
function spawnBoss(){var f=farthestCell();var hp=55+depth*6;enemies=[{x:f.x,y:f.y,name:"The Choirmaster",symbol:"C",color:"#dfe3ff",hp:hp,maxHp:hp,dmg:[2,6,2],isBoss:true,phase:0,ai:"chaser",intent:null}];dmSay(WORLD.bossAppears,"log-death");}
function chestAt(x,y){return chests.find(function(c){return c.x===x&&c.y===y;});}
function spawnChests(){chests=[];var p=spawnCells.filter(function(c){return!enemyAt(c.x,c.y)&&!itemAt(c.x,c.y)&&!(c.x===stairs.x&&c.y===stairs.y);});shuffle(p);var n=depth>=3?3:2;for(var i=0;i<n&&i<p.length;i++){chests.push({x:p[i].x,y:p[i].y,locked:Math.random()<.5,opened:false,loot:(Math.random()<.45?pickWeapon(depth):LOOT[Math.floor(Math.random()*LOOT.length)])});}}
function isWall(x,y){if(x<0||x>=N||y<0||y>=N)return true;return map[y][x]===1;}
function enemyAt(x,y){return enemies.find(function(e){return e.x===x&&e.y===y&&e.hp>0;});}
function itemAt(x,y){return items.find(function(i){return i.x===x&&i.y===y;});}
function vis(x,y){return visible.has(x+","+y);}
function fov(){visible.clear();for(var y=0;y<N;y++)for(var x=0;x<N;x++){if(Math.abs(x-player.x)+Math.abs(y-player.y)<=5){var k=x+","+y;visible.add(k);seen.add(k);}}}
function render(){fov();var c=document.getElementById("map");c.innerHTML="";c.style.gridTemplateColumns="repeat("+N+",1fr)";var TH=threatTiles();
for(var y=0;y<N;y++)for(var x=0;x<N;x++){var t=document.createElement("div");t.className="tile";var v=vis(x,y);
if(!seen.has(x+","+y)){t.classList.add("unseen");t.textContent=" ";c.appendChild(t);continue;}
var e=enemyAt(x,y),it=itemAt(x,y),pl=player.x===x&&player.y===y,st=stairs.x===x&&stairs.y===y;
if(pl){t.classList.add("player");t.innerHTML=spr("player");}
else if(isWall(x,y)){t.classList.add("wall");}
else if(v&&e){t.classList.add("enemy");if(e.elite)t.classList.add("elite");if(e.isBoss)t.classList.add("boss");t.innerHTML=enemySprite(e.symbol);t.title=e.name+" ("+e.hp+"/"+e.maxHp+")";}
else if(st){t.classList.add("stairs");t.innerHTML=spr("stairs");t.title="Stairs down";}
else if(v&&chestAt(x,y)){var ch=chestAt(x,y);t.classList.add("chest");t.innerHTML=spr(ch.opened?"chest_open":(ch.locked?"chest_locked":"chest"));t.title=ch.opened?"empty chest":(ch.locked?"locked chest":"chest");}
else if(v&&it){t.classList.add("loot");t.innerHTML=spr("loot");t.title=it.name;}
else{t.classList.add("floor");}
if(v){var ld=Math.abs(x-player.x)+Math.abs(y-player.y);t.style.filter="brightness("+(ld<=1?1:ld<=2?.86:ld<=3?.72:ld<=4?.58:.46)+")";if(TH[x+","+y]&&!pl)t.classList.add("threat");}
else t.classList.add("memory");
(function(a,b){t.onclick=function(){move(a,b);};})(x,y);c.appendChild(t);}
renderInv();renderStats();}
function move(x,y){if(gameOver)return;if(isWall(x,y)||!vis(x,y))return;if(Math.abs(x-player.x)+Math.abs(y-player.y)!==1)return;
var e=enemyAt(x,y);if(e){attack(e);if(gameOver)return;enemyTurn();render();return;}
player.x=x;player.y=y;var it=itemAt(x,y);if(it)pickup(it);
if(player.x===stairs.x&&player.y===stairs.y){descend();return;}enemyTurn();render();dmTick();}
function pickup(it){items=items.filter(function(i){return!(i.x===it.x&&i.y===it.y);});if(WEAPONS[it.name]){maybeEquip(it.name);return;}inventory.push(it.name);log("You pick up: "+it.name,"log-loot");dmLoot(it.name);renderInv();}
function attack(e){var crit=Math.random()<.15,fd=(weaponRoll()+meleeBonus())*(crit?2:1);e.hp=Math.max(0,e.hp-fd);floatDmg(e.x,e.y,fd,crit?"#ffd060":"#fff");if(crit)shake();
if(weapon.trait==="drain"){player.hp=Math.min(player.maxHp,player.hp+2);}
if(weapon.trait==="cleave"){var hd=Math.ceil(fd/2);for(var ci=0;ci<enemies.length;ci++){var o=enemies[ci];if(o!==e&&o.hp>0&&Math.abs(o.x-player.x)+Math.abs(o.y-player.y)===1){o.hp=Math.max(0,o.hp-hd);if(o.hp<=0)onKill(o);}}}
if(e.hp<=0)onKill(e);
else log("You strike the "+e.name+" for "+fd+" damage"+(crit?" (CRIT!)":"")+".","log-damage");}
function enemyTurn(){if(gameOver)return;combatEnemyTurn();if(player.hp<=0)die();}
function descend(){depth++;document.getElementById("depth").innerText=depth;document.getElementById("depthHeader").innerText=depth;
var h=roll(1,6)+3;player.hp=Math.min(player.maxHp,player.hp+h);gainCorr(2);
seen.clear();visible.clear();newFloorMap();dmFloorReset();dmDescend();
if(depth>=MAXD){items=[];chests=[];stairs={x:-1,y:-1};spawnBoss();}
else{spawnEnemies();spawnItems();placeStairs();spawnChests();}
glitch();render();dmTick();}
function die(){gameOver=true;log("☠ The vaults claim you. AEGIS link severed.","log-death");var o=document.getElementById("overlay");o.classList.add("show","dead");document.getElementById("overlayTitle").innerText="YOU DIED";document.getElementById("overlaySub").innerHTML=dmEpilogue(false).replace(/\n/g,"<br>");}
function win(){gameOver=true;log("✪ You breach the final seal and escape the Bone Vaults.","log-win");var o=document.getElementById("overlay");o.classList.add("show","victory");document.getElementById("overlayTitle").innerText="ASCENDED";document.getElementById("overlaySub").innerHTML=dmEpilogue(true).replace(/\n/g,"<br>");}
function restartGame(){player={x:3,y:3,hp:20,maxHp:20};inventory=[];echo=312;corruption=19;chrome=47;depth=1;gameOver=false;killCount=0;rpgReset();qudReset();seen.clear();visible.clear();
document.getElementById("depth").innerText=depth;document.getElementById("depthHeader").innerText=depth;document.getElementById("echo").innerText=echo;
var o=document.getElementById("overlay");o.classList.remove("show","dead","victory");newFloorMap();spawnEnemies();spawnItems();placeStairs();spawnChests();dmFloorReset();render();log("[SYSTEM] AEGIS re-linked. The Vaults reset.","log-system");dmTick();}
function gainCorr(n){corruption=Math.min(100,corruption+n);if(Math.random()<.5)glitch();renderStats();}
function flash(){var f=document.getElementById("flash");f.classList.add("on");setTimeout(function(){f.classList.remove("on");},120);}
function glitch(){var m=document.getElementById("map"),t=document.getElementById("mapTitle");m.classList.add("glitch");t.classList.add("glitch");setTimeout(function(){m.classList.remove("glitch");t.classList.remove("glitch");},800);}
function renderStats(){document.getElementById("hpBar").style.width=Math.max(0,player.hp/player.maxHp*100)+"%";document.getElementById("hpText").innerText=player.hp+" / "+player.maxHp;
document.getElementById("corrBar").style.width=corruption+"%";document.getElementById("corrText").innerText=corruption;document.getElementById("corrVal").innerText=corruption;
document.getElementById("chromeBar").style.width=chrome+"%";document.getElementById("chromeText").innerText=chrome+"%";document.getElementById("chromeVal").innerText=chrome;
var lv=document.getElementById("levelVal");if(lv)lv.innerText=level;var wv=document.getElementById("weaponVal");if(wv)wv.innerText=weapon.name;
var sv=document.getElementById("statsVal");if(sv)sv.innerText="MIG "+stats.might+" · AGI "+stats.agility+" · TUF "+stats.toughness+" · WIL "+stats.will+" · EGO "+stats.ego;
var mv=document.getElementById("mutVal");if(mv){var mk=Object.keys(mutations);mv.innerText=mk.length?mk.join(", "):"(none yet)";}
renderHotbar();}
function renderInv(){var c=document.getElementById("inventory");if(!inventory.length){c.innerHTML='<div style="opacity:.5">(empty)</div>';return;}var ct={};inventory.forEach(function(i){ct[i]=(ct[i]||0)+1;});c.innerHTML=Object.keys(ct).map(function(n){return'<div class="inv-item" title="click to use" onclick="useItem(\''+n+'\')">&bull; '+n+(ct[n]>1?" &times;"+ct[n]:"")+"</div>";}).join("");}
function log(txt,cls){var m=document.getElementById("messages"),d=document.createElement("div");if(cls)d.className=cls;d.style.marginBottom="4px";d.innerHTML=txt;m.appendChild(d);m.scrollTop=m.scrollHeight;}
function sendMessage(){var i=document.getElementById("input"),m=document.getElementById("messages");if(!i.value.trim())return;var d=document.createElement("div");d.style.marginBottom="6px";d.style.color="#888";d.innerHTML="&gt; "+i.value;m.appendChild(d);setTimeout(function(){if(Math.random()<.35)log("The Vaults seem to listen...","log-system");},500);i.value="";m.scrollTop=m.scrollHeight;}
document.getElementById("input").addEventListener("keypress",function(e){if(e.key==="Enter")transmit();});
document.addEventListener("keydown",function(e){if(gameOver)return;if(document.activeElement===document.getElementById("input"))return;var dx=0,dy=0,k=e.key.toLowerCase();
if(k==="w"||e.key==="ArrowUp")dy=-1;if(k==="s"||e.key==="ArrowDown")dy=1;if(k==="a"||e.key==="ArrowLeft")dx=-1;if(k==="d"||e.key==="ArrowRight")dx=1;
if(dx||dy){move(player.x+dx,player.y+dy);e.preventDefault();}});
window.onload=function(){rpgReset();qudReset();newFloorMap();spawnEnemies();spawnItems();placeStairs();spawnChests();dmFloorReset();render();document.getElementById("echo").innerText=echo;dmIntro();dmTick();};
