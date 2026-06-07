// ============== PROCEDURAL MAPS (always connected) ==============
// Rooms carved in sequence, each linked to the previous by an L-corridor,
// so the whole floor is one connected network. Sets global `map`,
// `spawnCells`, and the player's start.

function genMap(){
  var g=[]; for (var y=0;y<N;y++){ g[y]=[]; for (var x=0;x<N;x++) g[y][x]=1; }
  function room(rx,ry,rw,rh){ for(var y=ry;y<ry+rh;y++) for(var x=rx;x<rx+rw;x++){ if(x>0&&x<N-1&&y>0&&y<N-1) g[y][x]=0; } }
  function hcorr(x1,x2,y){ for(var x=Math.min(x1,x2);x<=Math.max(x1,x2);x++){ if(x>0&&x<N-1&&y>0&&y<N-1) g[y][x]=0; } }
  function vcorr(y1,y2,x){ for(var y=Math.min(y1,y2);y<=Math.max(y1,y2);y++){ if(x>0&&x<N-1&&y>0&&y<N-1) g[y][x]=0; } }
  var rooms=[], cnt=6+Math.floor(Math.random()*4);
  for (var i=0;i<cnt;i++){
    var rw=3+Math.floor(Math.random()*4), rh=3+Math.floor(Math.random()*4);
    var rx=1+Math.floor(Math.random()*(N-2-rw)), ry=1+Math.floor(Math.random()*(N-2-rh));
    room(rx,ry,rw,rh);
    var cx=rx+(rw>>1), cy=ry+(rh>>1);
    if (rooms.length){
      var p=rooms[rooms.length-1];
      if (Math.random()<0.5){ hcorr(p.cx,cx,p.cy); vcorr(p.cy,cy,cx); }
      else { vcorr(p.cy,cy,p.cx); hcorr(p.cx,cx,cy); }
    }
    rooms.push({cx:cx,cy:cy});
  }
  return { grid:g, start:rooms[0] };
}

function newFloorMap(){
  var m=genMap();
  map=m.grid;
  player.x=m.start.cx; player.y=m.start.cy;
  spawnCells=[];
  for (var y=1;y<N-1;y++) for (var x=1;x<N-1;x++){
    if (map[y][x]===0 && !(x===player.x&&y===player.y)) spawnCells.push({x:x,y:y});
  }
}

function farthestCell(){
  var best=spawnCells[0]||{x:player.x,y:player.y}, bd=-1;
  for (var i=0;i<spawnCells.length;i++){
    var c=spawnCells[i], d=Math.abs(c.x-player.x)+Math.abs(c.y-player.y);
    if (d>bd){ bd=d; best=c; }
  }
  return best;
}
