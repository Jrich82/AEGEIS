// ============== FULL KEYBOARD + MOUSE PLAY ==============
// 1-7 cast · 1-3 answer level-up choices · Q drink vial · E/Space interact
// (open/unlock chests, else search) · V force a lock · Z/X/C rites · R re-link.
// The console becomes optional flavor. Loads LAST — overrides hotbar + fx metrics.

function hotbarActions(){
  var a=[["Lance","cast lance"],["Drain","cast drain"],["Nova","cast nova"],["Ward","cast ward"]];
  if (ownsMut("Phase"))       a.push(["Phase","cast phase"]);
  if (ownsMut("Mind Static")) a.push(["Mind","cast mind"]);
  if (ownsMut("Pyrokinesis")) a.push(["Pyro","cast pyro"]);
  return a;
}

// overrides the qud.js hotbar: numbered spells + an action row
function renderHotbar(){
  var hb=document.getElementById("hotbar"); if(!hb) return;
  var a=hotbarActions();
  var row1=a.map(function(x,i){
    return "<button class=\"hot\" onclick=\"runCommand('"+x[1]+"');this.blur()\"><span class=\"key\">"+(i+1)+"</span>"+x[0]+"</button>";
  }).join("");
  var vials=0; for(var i=0;i<inventory.length;i++) if(inventory[i]==="Vial of Ichor") vials++;
  var row2=
    "<button class=\"hot act\" onclick=\"uiVial();this.blur()\"><span class=\"key\">Q</span>Vial ×"+vials+"</button>"+
    "<button class=\"hot act\" onclick=\"doInteract();this.blur()\"><span class=\"key\">E</span>Interact</button>"+
    "<button class=\"hot act\" onclick=\"runCommand('force');this.blur()\"><span class=\"key\">V</span>Force</button>"+
    "<button class=\"hot act\" onclick=\"runCommand('pray');this.blur()\"><span class=\"key\">Z</span>Pray</button>"+
    "<button class=\"hot act\" onclick=\"runCommand('commune');this.blur()\"><span class=\"key\">X</span>Commune</button>"+
    "<button class=\"hot act\" onclick=\"runCommand('sacrifice');this.blur()\"><span class=\"key\">C</span>Sacrifice</button>";
  hb.innerHTML="<div class=\"hrow\">"+row1+"</div><div class=\"hrow\">"+row2+"</div>";
}

function uiVial(){
  if (inventory.indexOf("Vial of Ichor")>=0) useItem("Vial of Ichor");
  else dmSay("No vials left to drink.");
}
function doInteract(){
  var c=chestNear();
  if (c && !c.opened){
    if (!c.locked){ doOpen(); return; }
    if (hasItem("Corroded Key")){ doUseKey(); return; }
    dmSay("Locked, and you hold no key. Force it (V) and pay in blood, or find a Corroded Key.");
    return;
  }
  doSearch();
}

// damage numbers repositioned for the larger tiles
function floatDmg(gx,gy,txt,color){
  var fx=document.getElementById("fx"), mp=document.getElementById("map"); if(!fx||!mp) return;
  var s=document.createElement("div"); s.className="float";
  s.style.left=(mp.offsetLeft+9+gx*27+5)+"px"; s.style.top=(mp.offsetTop+7+gy*27)+"px";
  s.style.color=color||"#fff"; s.textContent=txt;
  fx.appendChild(s); setTimeout(function(){ if(s.parentNode) s.parentNode.removeChild(s); },650);
}

// keep the vial count live
(function(){
  var _rs=renderStats; renderStats=function(){ _rs(); renderHotbar(); };
})();

// the keymap
document.addEventListener("keydown", function(e){
  if (document.activeElement===document.getElementById("input")) return;
  var k=(e.key||"").toLowerCase();
  if (gameOver){ if (k==="r"){ restartGame(); e.preventDefault(); } return; }
  if (/^[1-9]$/.test(e.key)){
    var n=parseInt(e.key,10);
    if (typeof choiceQueue!=="undefined" && choiceQueue.length){
      if (n<=3){ applyChoice(n); e.preventDefault(); }
      return;
    }
    var a=hotbarActions();
    if (a[n-1]){ runCommand(a[n-1][1]); e.preventDefault(); }
    return;
  }
  if (k==="q"){ uiVial(); e.preventDefault(); return; }
  if (k==="e" || e.key===" "){ doInteract(); e.preventDefault(); return; }
  if (k==="v"){ runCommand("force"); e.preventDefault(); return; }
  if (k==="z"){ runCommand("pray"); e.preventDefault(); return; }
  if (k==="x"){ runCommand("commune"); e.preventDefault(); return; }
  if (k==="c"){ runCommand("sacrifice"); e.preventDefault(); return; }
});
