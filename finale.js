// ============== THE RECOGNITION: the finale that knows you know ==============
// Eat all eight visions and the bottom of the world changes. The Choirmaster
// speaks — the only voice in the game that isn't HERMES — and killing it
// while knowing the truth earns the hidden third ending: THE LAST VERSE.
// Loads last; wraps, edits nothing.

var recognized = false;

function bossSay(text){
  log("<span style='color:#dfe3ff;text-shadow:0 0 6px #8a8aff'>CHOIRMASTER// </span><span class='log-bossvoice'>"+text+"</span>","log-death");
}

(function(){
  var _sb=spawnBoss; spawnBoss=function(){
    _sb();
    recognized = (typeof visionIdx==="number" && visionIdx>=8);
    if (recognized){
      bossSay("You ate the visions. Then you know whose face this is.");
      bossSay("I conducted you up the stairs myself, second draft. I sang you somewhere soft to forget.");
      bossSay("One of us is the original, and the Choir has stopped caring which. Shall we settle it?");
      dmSay("RICO. Whatever it says — the song ends with one voice left. Make it be yours.","log-hurt");
    }
  };
  var _win=win; win=function(){
    _win();
    if (recognized){
      var t=document.getElementById("overlayTitle");
      if (t) t.innerText="THE LAST VERSE";
      var o=document.getElementById("overlaySub");
      if (o) o.innerHTML =
        "You killed him knowing. The original JON folds like a closed hymnal, and the Choir does not mourn — it listens. "+
        "One voice left in the Bone Vaults. Whatever climbs the stairs now owns the name, and knows exactly what it paid for it."+
        "<br><br>"+o.innerHTML;
      if (typeof META!=="undefined"){ META.residue+=50; metaSave(); }
      if (o) o.innerHTML += "<br>THE TRUTH, BANKED: +50 Residue.";
    }
  };
  var _qr=qudReset; qudReset=function(){ _qr(); recognized=false; };
})();
