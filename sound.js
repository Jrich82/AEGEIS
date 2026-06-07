// ============== SOUND & ATMOSPHERE (fully synthesized, no files) ==============
// Web Audio SFX + a Choir drone that deepens with depth and Corruption.
// Loads LAST and wraps existing game functions, so no other file changes.

var AC=null, sndOn=true, sndMaster=null, droneA=null, droneB=null, droneGain=null, choirGain=null;

function audioInit(){
  if (AC || !sndOn) return;
  try{ AC = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
  sndMaster = AC.createGain(); sndMaster.gain.value = 0.20; sndMaster.connect(AC.destination);
  // the Vaults' drone
  droneGain = AC.createGain(); droneGain.gain.value = 0.030; droneGain.connect(sndMaster);
  var lp = AC.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=160; lp.connect(droneGain);
  droneA = AC.createOscillator(); droneA.type="sawtooth"; droneA.frequency.value=55;   droneA.connect(lp); droneA.start();
  droneB = AC.createOscillator(); droneB.type="sawtooth"; droneB.frequency.value=55.7; droneB.connect(lp); droneB.start();
  // the Choir (rises with Corruption)
  choirGain = AC.createGain(); choirGain.gain.value = 0.0; choirGain.connect(sndMaster);
  [110,164.8,221.5].forEach(function(f){
    var o=AC.createOscillator(); o.type="sine"; o.frequency.value=f;
    var g=AC.createGain(); g.gain.value=0.33; o.connect(g); g.connect(choirGain); o.start();
  });
  droneSet();
}
document.addEventListener("keydown", function(){ audioInit(); if(AC&&AC.state==="suspended")AC.resume(); });
document.addEventListener("pointerdown", function(){ audioInit(); if(AC&&AC.state==="suspended")AC.resume(); });

function toggleSound(){
  sndOn=!sndOn;
  if (sndOn && !AC) audioInit();
  if (sndMaster) sndMaster.gain.value = sndOn ? 0.20 : 0.0;
  var b=document.getElementById("sndBtn"); if(b) b.innerText = sndOn ? "♪ ON" : "♪ OFF";
}

function droneSet(){
  if (!AC) return;
  var t=AC.currentTime;
  var d=(typeof depth==="number")?depth:1, c=(typeof corruption==="number")?corruption:0;
  droneGain.gain.linearRampToValueAtTime(0.025 + d*0.008, t+0.8);
  droneA.frequency.linearRampToValueAtTime(55 - d*3, t+0.8);
  droneB.frequency.linearRampToValueAtTime(55.7 - d*3, t+0.8);
  choirGain.gain.linearRampToValueAtTime((c/100)*0.05, t+0.8);
}

function blip(f0,f1,dur,type,vol){
  if (!AC || !sndOn) return;
  var t=AC.currentTime;
  var o=AC.createOscillator(), g=AC.createGain();
  o.type=type||"square"; o.frequency.setValueAtTime(f0,t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(vol||0.2,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g); g.connect(sndMaster); o.start(t); o.stop(t+dur+0.02);
}
function noiseBurst(dur,vol,freq){
  if (!AC || !sndOn) return;
  var t=AC.currentTime, n=Math.floor(AC.sampleRate*dur);
  var buf=AC.createBuffer(1,n,AC.sampleRate), ch=buf.getChannelData(0);
  for (var i=0;i<n;i++) ch[i]=(Math.random()*2-1)*(1-i/n);
  var src=AC.createBufferSource(); src.buffer=buf;
  var f=AC.createBiquadFilter(); f.type="lowpass"; f.frequency.value=freq||900;
  var g=AC.createGain(); g.gain.value=vol||0.2;
  src.connect(f); f.connect(g); g.connect(sndMaster); src.start(t);
}
function arp(freqs,step,dur,type,vol){
  if (!AC || !sndOn) return;
  freqs.forEach(function(f,i){ setTimeout(function(){ blip(f,f*1.01,dur,type||"square",vol||0.15); }, i*step); });
}

// ---- sfx vocabulary ----
function sfxEnemyHit(){ blip(240,150,0.07,"square",0.22); noiseBurst(0.05,0.12,1400); }
function sfxKill(){ blip(320,40,0.22,"sawtooth",0.26); noiseBurst(0.12,0.18,700); }
function sfxHurt(){ blip(120,55,0.16,"sawtooth",0.3); noiseBurst(0.14,0.25,420); }
function sfxDodge(){ noiseBurst(0.07,0.13,2800); }
function sfxPickup(){ arp([660,880,1100],45,0.08,"square",0.14); }
function sfxChest(){ blip(95,70,0.13,"square",0.2); noiseBurst(0.08,0.12,500); }
function sfxLevel(){ arp([440,554,659,880],70,0.12,"square",0.16); }
function sfxMutation(){ blip(160,540,0.45,"sawtooth",0.16); blip(166,560,0.45,"sawtooth",0.12); }
function sfxCast(){ blip(780,1500,0.13,"sine",0.18); blip(784,1520,0.13,"sine",0.12); }
function sfxDescend(){ blip(85,32,0.7,"sine",0.4); noiseBurst(0.5,0.2,220); droneSet(); }
function sfxBoss(){ blip(60,55,0.8,"sawtooth",0.35); blip(90,82,0.8,"sawtooth",0.3); noiseBurst(0.6,0.25,300); }
function sfxDeath(){ blip(220,28,1.3,"sawtooth",0.32); noiseBurst(0.9,0.25,260); }
function sfxWin(){ arp([440,554,659,880,1108],120,0.3,"sine",0.2); }

// ---- wrap the game (must load after all other modules) ----
(function(){
  var _attack=attack;       attack=function(e){ sfxEnemyHit(); _attack(e); };
  var _onKill=onKill;       onKill=function(e){ sfxKill(); _onKill(e); };
  var _hitPlayer=hitPlayer; hitPlayer=function(a,l){ var landed=_hitPlayer(a,l); if(landed)sfxHurt(); else sfxDodge(); return landed; };
  var _pickup=pickup;       pickup=function(it){ sfxPickup(); _pickup(it); };
  var _openChest=openChest; openChest=function(c){ sfxChest(); _openChest(c); };
  var _useItem=useItem;     useItem=function(n){ sfxPickup(); _useItem(n); };
  var _grantLevel=grantLevel; grantLevel=function(){ sfxLevel(); _grantLevel(); };
  var _addMutation=addMutation; addMutation=function(n){ sfxMutation(); _addMutation(n); };
  var _descend=descend;     descend=function(){ _descend(); sfxDescend(); };
  var _spawnBoss=spawnBoss; spawnBoss=function(){ _spawnBoss(); sfxBoss(); };
  var _die=die;             die=function(){ sfxDeath(); _die(); };
  var _win=win;             win=function(){ sfxWin(); _win(); };
  var _gainCorr=gainCorr;   gainCorr=function(n){ _gainCorr(n); droneSet(); };
  var _castLance=castLance; castLance=function(){ sfxCast(); _castLance(); };
  var _castDrain=castDrain; castDrain=function(){ sfxCast(); _castDrain(); };
  var _castNova=castNova;   castNova=function(){ sfxCast(); _castNova(); };
  var _castWard=castWard;   castWard=function(){ sfxCast(); _castWard(); };
  var _mutCast=mutCast;     mutCast=function(w){ sfxCast(); _mutCast(w); };
})();
