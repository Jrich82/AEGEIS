// ============== CANVAS VAULT RENDERER ==============
// Replaces the CSS-grid dungeon with a crisp pixel canvas.
// HUD / combat / sim stay as they were. Loads LAST.

var TILE = 28;
var VAULT = {
  ready:false, canvas:null, ctx:null, pad:8,
  t:0, shake:0, hover:null, veins:{},
  lastW:0, lastH:0
};

function vaultHash(x,y){
  var n = ((x*73856093) ^ (y*19349663) ^ ((depth||1)*83492791)) >>> 0;
  return (n % 1000) / 1000;
}

function vaultPalette(){
  var d = Math.max(1, depth||1);
  var c = Math.min(1, (corruption||0)/100);
  var deep = (d-1)/4;
  return {
    void:"#070605",
    fog:"#0b0a0a",
    wallA: lerpHex("#3a2a1c","#2a2438", deep),
    wallB: lerpHex("#24180f","#16122a", deep),
    floorA: lerpHex("#161310","#12101a", deep),
    floorB: lerpHex("#0e0c0a","#0b0a14", deep),
    edge: lerpHex("#4a3422","#5a4a88", deep*0.7 + c*0.3),
    threat:"rgba(255,40,40,",
    water:"#0a1c30",
    waterHi:"#1c4a78",
    glow: c>0.45 ? "rgba(122,58,255,"+ (0.08+c*0.12) +")" : null
  };
}

function lerpHex(a,b,t){
  function h(s){ return [parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)]; }
  var A=h(a), B=h(b);
  var r=Math.round(A[0]+(B[0]-A[0])*t), g=Math.round(A[1]+(B[1]-A[1])*t), bl=Math.round(A[2]+(B[2]-A[2])*t);
  return "#"+[r,g,bl].map(function(v){ return ("0"+v.toString(16)).slice(-2); }).join("");
}

function vaultInit(){
  var wrap=document.getElementById("map");
  if (!wrap) return;
  wrap.innerHTML="";
  wrap.classList.add("vault-stage");
  var c=document.createElement("canvas");
  c.id="vault";
  wrap.appendChild(c);
  function layer(id, cls){
    var el=document.createElement("div");
    el.id=id; if(cls) el.className=cls;
    wrap.appendChild(el); return el;
  }
  layer("fx");
  layer("crt");
  layer("flash","flash");
  VAULT.canvas=c;
  VAULT.ctx=c.getContext("2d");
  VAULT.ready=true;
  c.addEventListener("click", vaultClick);
  c.addEventListener("mousemove", vaultHover);
  c.addEventListener("mouseleave", function(){ VAULT.hover=null; });
  window.addEventListener("resize", function(){ if (typeof render==="function") render(); });
  if (!VAULT._raf){ VAULT._raf=true; requestAnimationFrame(vaultTick); }
}

function vaultSize(){
  var wrap=document.getElementById("map");
  if (!wrap||!VAULT.canvas) return;
  var max = Math.min(wrap.clientWidth||620, 720);
  var pad = VAULT.pad;
  TILE = Math.max(18, Math.floor((max - pad*2) / N));
  var w = pad*2 + TILE*N;
  var h = pad*2 + TILE*N;
  if (VAULT.lastW!==w || VAULT.lastH!==h){
    VAULT.canvas.width=w;
    VAULT.canvas.height=h;
    VAULT.canvas.style.width=w+"px";
    VAULT.canvas.style.height=h+"px";
    VAULT.lastW=w; VAULT.lastH=h;
  }
  var fx=document.getElementById("fx"), crt=document.getElementById("crt"), fl=document.getElementById("flash");
  [fx,crt,fl].forEach(function(el){
    if(!el) return;
    el.style.left=VAULT.canvas.offsetLeft+"px";
    el.style.top=VAULT.canvas.offsetTop+"px";
    el.style.width=w+"px";
    el.style.height=h+"px";
  });
}

function vaultCell(ev){
  var r=VAULT.canvas.getBoundingClientRect();
  var sx=VAULT.canvas.width/r.width, sy=VAULT.canvas.height/r.height;
  var x=Math.floor(((ev.clientX-r.left)*sx - VAULT.pad) / TILE);
  var y=Math.floor(((ev.clientY-r.top)*sy - VAULT.pad) / TILE);
  if (x<0||y<0||x>=N||y>=N) return null;
  return {x:x,y:y};
}
function vaultClick(ev){
  var p=vaultCell(ev); if(!p) return;
  if (typeof move==="function") move(p.x,p.y);
}
function vaultHover(ev){
  VAULT.hover=vaultCell(ev);
  vaultPaintTarget();
}

function vaultPaintTarget(){
  var el=document.getElementById("targetVal"); if(!el) return;
  var p=VAULT.hover;
  if (!p || !seen.has(p.x+","+p.y) || !vis(p.x,p.y)){
    el.textContent="—";
    return;
  }
  var e=enemyAt(p.x,p.y);
  if (e){ el.textContent=e.name+"  "+e.hp+"/"+e.maxHp+(e.intent&&e.intent.type&&e.intent.type!=="move"?"  · "+e.intent.type:""); return; }
  var ch=chestAt(p.x,p.y);
  if (ch){ el.textContent=ch.opened?"empty chest":(ch.locked?"locked chest":"chest"); return; }
  var it=itemAt(p.x,p.y);
  if (it){ el.textContent=it.name; return; }
  if (stairs.x===p.x&&stairs.y===p.y){ el.textContent="stairs down"; return; }
  var hz=typeof hazardAt==="function"?hazardAt(p.x,p.y):null;
  if (hz){ el.textContent=hz; return; }
  el.textContent=isWall(p.x,p.y)?"ossuary wall":"vault floor";
}

function drawSpr(name, dx, dy, scale, alpha){
  var img=sprCanvas(name); if(!img) return;
  var g=VAULT.ctx;
  g.save();
  g.imageSmoothingEnabled=false;
  if (alpha!=null) g.globalAlpha=alpha;
  var s=scale||TILE;
  g.drawImage(img, dx, dy, s, s);
  g.restore();
}

function vaultDraw(){
  if (!VAULT.ready) vaultInit();
  if (!VAULT.ctx) return;
  vaultSize();
  var g=VAULT.ctx, pal=vaultPalette(), pad=VAULT.pad;
  var t=VAULT.t;
  g.imageSmoothingEnabled=false;
  g.save();
  if (VAULT.shake>0){
    g.translate((Math.random()*2-1)*VAULT.shake, (Math.random()*2-1)*VAULT.shake);
  }
  g.fillStyle=pal.void;
  g.fillRect(0,0,VAULT.canvas.width,VAULT.canvas.height);

  var TH = typeof threatTiles==="function" ? threatTiles() : {};
  var pulse = 0.45 + Math.sin(t/180)*0.35;

  for (var y=0;y<N;y++){
    for (var x=0;x<N;x++){
      var dx=pad+x*TILE, dy=pad+y*TILE;
      var k=x+","+y;
      if (!seen.has(k)){
        g.fillStyle=pal.fog;
        g.fillRect(dx,dy,TILE,TILE);
        continue;
      }
      var v=vis(x,y);
      var wall=isWall(x,y);
      if (wall){
        g.fillStyle = vaultHash(x,y)>0.55 ? pal.wallA : pal.wallB;
        g.fillRect(dx,dy,TILE,TILE);
        drawSpr("wall", dx, dy, TILE, v?0.85:0.35);
        g.strokeStyle="rgba(0,0,0,.45)";
        g.strokeRect(dx+0.5,dy+0.5,TILE-1,TILE-1);
      } else {
        g.fillStyle = vaultHash(x,y)>0.5 ? pal.floorA : pal.floorB;
        g.fillRect(dx,dy,TILE,TILE);
        drawSpr("floor", dx, dy, TILE, v?0.7:0.28);
        var seed=vaultHash(x,y+3);
        if (seed>0.82) drawSpr("vein", dx, dy, TILE, v?0.55:0.18);
        else if (seed<0.08) drawSpr("fungus", dx, dy, TILE, v?0.5:0.16);
      }
      if (!v){
        g.fillStyle="rgba(0,0,0,.52)";
        g.fillRect(dx,dy,TILE,TILE);
        continue;
      }
      var ld=Math.abs(x-player.x)+Math.abs(y-player.y);
      var dim = ld<=1?0: ld<=2?0.12: ld<=3?0.24: ld<=4?0.36:0.48;
      if (dim){ g.fillStyle="rgba(0,0,0,"+dim+")"; g.fillRect(dx,dy,TILE,TILE); }

      var hz=typeof hazardAt==="function"?hazardAt(x,y):null;
      if (hz==="water"){
        g.fillStyle="rgba(20,70,120,.42)";
        g.fillRect(dx,dy,TILE,TILE);
        drawSpr("water", dx, dy, TILE, 0.85);
        g.fillStyle="rgba(90,180,255,"+(0.08+Math.sin(t/220 + x+y)*0.06)+")";
        g.fillRect(dx,dy+TILE*0.55,TILE,TILE*0.45);
      } else if (hz==="fire"){
        g.fillStyle="rgba(180,50,10,.35)";
        g.fillRect(dx,dy,TILE,TILE);
        drawSpr("fire", dx, dy + Math.sin(t/90 + x)*2, TILE, 0.95);
      }

      if (TH[k] && !(player.x===x&&player.y===y)){
        g.strokeStyle=pal.threat + (0.4+pulse*0.55) + ")";
        g.lineWidth=2;
        g.strokeRect(dx+2,dy+2,TILE-4,TILE-4);
        g.fillStyle=pal.threat + (0.12+pulse*0.10) + ")";
        g.fillRect(dx+2,dy+2,TILE-4,TILE-4);
      }
    }
  }

  for (var y2=0;y2<N;y2++){
    for (var x2=0;x2<N;x2++){
      if (!vis(x2,y2)) continue;
      var px=pad+x2*TILE, py=pad+y2*TILE;
      var st=stairs.x===x2&&stairs.y===y2;
      var ch=chestAt(x2,y2);
      var it=itemAt(x2,y2);
      var e=enemyAt(x2,y2);
      var pl=player.x===x2&&player.y===y2;
      if (st && !pl && !e) drawSpr("stairs", px, py, TILE, 1);
      if (ch && !pl){
        drawSpr(ch.opened?"chest_open":(ch.locked?"chest_locked":"chest"), px, py, TILE, 1);
      }
      if (it && !pl && !ch){
        var bob=Math.sin(t/200 + x2)*2;
        drawSpr("loot", px, py+bob, TILE, 1);
      }
      if (e){
        var nm = SPRMAP[e.symbol] || "goblin";
        if (e.elite){
          g.save();
          g.shadowColor="#c11212";
          g.shadowBlur=10;
          drawSpr(nm, px, py, TILE, 1);
          g.restore();
        } else if (e.isBoss){
          g.save();
          g.shadowColor="#8a8aff";
          g.shadowBlur=16;
          drawSpr(nm, px, py, TILE, 1);
          g.restore();
        } else {
          drawSpr(nm, px, py, TILE, 1);
        }
        var ratio=Math.max(0,e.hp/e.maxHp);
        g.fillStyle="rgba(0,0,0,.65)";
        g.fillRect(px+3, py+TILE-5, TILE-6, 3);
        g.fillStyle=ratio>0.5?"#6dce6d":ratio>0.25?"#d4af37":"#c11212";
        g.fillRect(px+3, py+TILE-5, (TILE-6)*ratio, 3);
      }
      if (pl){
        g.save();
        g.shadowColor="#00f3ff";
        g.shadowBlur=12;
        drawSpr("player", px, py, TILE, 1);
        g.restore();
      }
    }
  }

  if (VAULT.hover && vis(VAULT.hover.x, VAULT.hover.y)){
    var hx=pad+VAULT.hover.x*TILE, hy=pad+VAULT.hover.y*TILE;
    g.strokeStyle="rgba(202,161,90,.7)";
    g.lineWidth=1;
    g.strokeRect(hx+1,hy+1,TILE-2,TILE-2);
  }

  var grd=g.createRadialGradient(
    pad+player.x*TILE+TILE/2, pad+player.y*TILE+TILE/2, TILE*2,
    pad+player.x*TILE+TILE/2, pad+player.y*TILE+TILE/2, TILE*8
  );
  grd.addColorStop(0,"rgba(0,0,0,0)");
  grd.addColorStop(1,"rgba(0,0,0,.42)");
  g.fillStyle=grd;
  g.fillRect(pad,pad,TILE*N,TILE*N);

  if (pal.glow){
    g.fillStyle=pal.glow;
    g.fillRect(pad,pad,TILE*N,TILE*N);
  }
  g.restore();
  vaultPaintTarget();
}

function vaultTick(now){
  VAULT.t = now||0;
  if (VAULT.shake>0) VAULT.shake = Math.max(0, VAULT.shake-0.35);
  if (VAULT.ready && !gameOver) vaultDraw();
  requestAnimationFrame(vaultTick);
}

function vaultFloat(gx,gy,txt,color){
  var fx=document.getElementById("fx"), c=VAULT.canvas;
  if (!fx||!c) return;
  var s=document.createElement("div");
  s.className="float";
  s.style.left=(VAULT.pad + gx*TILE + TILE/4)+"px";
  s.style.top=(VAULT.pad + gy*TILE)+"px";
  s.style.color=color||"#fff";
  s.textContent=txt;
  fx.appendChild(s);
  setTimeout(function(){ if(s.parentNode) s.parentNode.removeChild(s); },650);
}

(function(){
  render=function(){
    fov();
    if (!VAULT.ready) vaultInit();
    vaultDraw();
    renderInv();
    renderStats();
  };
  floatDmg=function(gx,gy,txt,color){ vaultFloat(gx,gy,txt,color); };
  shake=function(){ VAULT.shake=5; var m=document.getElementById("map"); if(m){ m.classList.add("shake"); setTimeout(function(){ m.classList.remove("shake"); },260); } };
  if (typeof paintHazards==="function"){
    paintHazards=function(){};
  }
})();
