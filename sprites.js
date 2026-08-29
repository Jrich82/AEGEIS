// ====================== PIXEL SPRITES ======================
// 8x8 palette-string sprites, rendered to crisp canvases (and SVG fallback).
// '.' / ' ' = transparent.

var _chestRows = [
"........",
".mmmmmm.",
".wWWWWw.",
".wWmmWw.",
".mmLLmm.",
".wWLLWw.",
".wWWWWw.",
".oooooo."
];

var SPR = {

player:{ r:[
"..kkkk..",
".khhhhk.",
".kh..hk.",
".khcchk.",
".kaaaak.",
".karaak.",
".kaaaak.",
".ka..ak."
], p:{k:"#070709",h:"#2b3640",a:"#3a3f47",c:"#00f3ff",r:"#c11212"} },

goblin:{ r:[
"..oooo..",
".oggggo.",
".oeggeo.",
".oggggo.",
"ooggggoo",
".og..go.",
".o....o.",
"........"
], p:{o:"#0a0f0a",g:"#3d5a3d",e:"#bff15a"} },

bone:{ r:[
"..bbbb..",
".bBBBBb.",
".bdbbdb.",
".bbddbb.",
"..bbbb..",
".b.bb.b.",
"..bbbb..",
".b.bb.b."
], p:{b:"#cfcabd",B:"#eae6da",d:"#15161a"} },

wraith:{ r:[
"..pppp..",
".pPPPPp.",
".peppep.",
".pPPPPp.",
".pppppp.",
"p.pppp.p",
".p.pp.p.",
"..p..p.."
], p:{p:"#5a2a7a",P:"#8a4ab0",e:"#d9a6ff"} },

signal:{ r:[
"..cccc..",
".cCCCCc.",
".ceccec.",
".cCCCCc.",
".cccccc.",
"c.cccc.c",
".c.cc.c.",
"..c..c.."
], p:{c:"#1a4a55",C:"#3a8aaa",e:"#7ef6ff"} },

rat:{ r:[
"........",
"......tt",
".rrrr.t.",
"rRRRRr.t",
"rReRRrr.",
"rRRRRRr.",
".r.rr.r.",
"........"
], p:{r:"#6a7a4a",R:"#8a9a5a",e:"#c0ff60",t:"#4a5436"} },

husk:{ r:[
"..uuuu..",
".uUUUUu.",
".ueUUeu.",
".uUUUUu.",
"uuUccUuu",
"uUUccUUu",
".uU..Uu.",
".u....u."
], p:{u:"#6a4a2a",U:"#8a5a2a",c:"#ff7a2a",e:"#ffb060"} },

chest_locked:{ r:_chestRows, p:{m:"#b89048",w:"#5a3a1a",W:"#7a4a22",L:"#c11212",o:"#0a0805"} },
chest:{ r:_chestRows, p:{m:"#b89048",w:"#5a3a1a",W:"#7a4a22",L:"#caa15a",o:"#0a0805"} },

chest_open:{ r:[
".mmmmmm.",
".w....w.",
".wd..dw.",
".wddddw.",
".wWWWWw.",
".wWWWWw.",
".wWWWWw.",
".oooooo."
], p:{m:"#b89048",w:"#5a3a1a",W:"#7a4a22",d:"#15100a",o:"#0a0805"} },

stairs:{ r:[
"SSSSSSSS",
"ssssssss",
"ddSSSSSS",
"ddssssss",
"ddddSSSS",
"ddddssss",
"ddddddSS",
"ddddddss"
], p:{S:"#d8b07a",s:"#a8794a",d:"#090909"} },

loot:{ r:[
"...GG...",
"..GccG..",
"..GggG..",
".GggggG.",
".GggggG.",
"..GggG..",
"..GggG..",
"...gg..."
], p:{G:"#ffe6b0",c:"#fff6e0",g:"#d4af7a"} },

hound:{ r:[
"........",
".h....h.",
".hhhhhh.",
"hhe hhhh",
"hhhhhhhh",
".h.hh.h.",
".h.hh.h.",
"........"
], p:{h:"#8a3a3a",e:"#ffd060"} },

choirmaster:{ r:[
"..CCCC..",
".CwwwwC.",
".CeeeeC.",
".CwwwwC.",
"CCwwwwCC",
".CrwwrC.",
".Cw..wC.",
".C....C."
], p:{C:"#3a3a5a",w:"#cfd2ee",e:"#9aa0ff",r:"#c11212"} },

wall:{ r:[
"WwWwWwWw",
"wBbBbBbW",
"WbKbKbKw",
"wBbBbBbW",
"WwWwWwWw",
"wBbBbBbW",
"WbKbKbKw",
"wBbBbBbW"
], p:{W:"#3a2a1c",w:"#2a1c12",B:"#24180f",b:"#1a120c",K:"#4a3422"} },

floor:{ r:[
"ffffffff",
"fFf.fFff",
"ff.ffff.",
"f.fffFf.",
"ffff.fff",
"fFf.ffff",
"ff.ffFff",
"ffffffff"
], p:{f:"#12100e",F:"#1a1612",".":"#0c0a09"} },

vein:{ r:[
"........",
"...vv...",
"..vVvv..",
".vvVVvv.",
"..vVvv..",
"...v.v..",
"........",
"........"
], p:{v:"#4a2a55",V:"#7a4a88"} },

fungus:{ r:[
"........",
"...mm...",
"..mMMm..",
".mmMMmm.",
"..sMMs..",
"...ss...",
"...ss...",
"........"
], p:{m:"#3a5a2a",M:"#6a8a3a",s:"#2a3a1a"} },

water:{ r:[
"nnnnnnnn",
"nNnnnNnn",
"nnnNnnnn",
"nNnnnnNn",
"nnnnNnnn",
"nnNnnnNn",
"nNnnNnnn",
"nnnnnnnn"
], p:{n:"#0a1c30",N:"#163a5c"} },

fire:{ r:[
"...Y....",
"..YoY...",
".YorYo..",
".YorrY..",
"YorRroY.",
".YrRRrY.",
"..rRRr..",
"...rr..."
], p:{Y:"#ffe08a",o:"#ff9a2a",r:"#e05010",R:"#8a1808"} }

};

var SPRMAP = { g:"goblin", s:"bone", w:"wraith", r:"rat", h:"husk", d:"hound", i:"signal", t:"wraith", C:"choirmaster" };
var SPRITE_CACHE = {};
var SPRITE_CANVAS = {};

function spriteSVG(def){
  var rows=def.r, pal=def.p, n=rows.length, px="";
  for (var y=0;y<n;y++){
    var row=rows[y];
    for (var x=0;x<row.length;x++){
      var ch=row.charAt(x);
      if (ch==="."||ch===" ") continue;
      var col=pal[ch]; if(!col) continue;
      px += '<rect x="'+x+'" y="'+y+'" width="1.05" height="1.05" fill="'+col+'"/>';
    }
  }
  return '<svg viewBox="0 0 '+n+' '+n+'" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges">'+px+'</svg>';
}

function spr(name){
  if (SPRITE_CACHE[name]) return SPRITE_CACHE[name];
  var def = SPR[name]; if (!def) return "";
  return (SPRITE_CACHE[name] = spriteSVG(def));
}
function enemySprite(symbol){ return spr(SPRMAP[symbol] || "goblin"); }

function sprCanvas(name){
  if (SPRITE_CANVAS[name]) return SPRITE_CANVAS[name];
  var def = SPR[name]; if (!def) return null;
  var rows=def.r, pal=def.p, n=rows.length;
  var c=document.createElement("canvas");
  c.width=n; c.height=n;
  var g=c.getContext("2d");
  for (var y=0;y<n;y++){
    var row=rows[y];
    for (var x=0;x<row.length;x++){
      var ch=row.charAt(x);
      if (ch==="."||ch===" ") continue;
      var col=pal[ch]; if(!col) continue;
      g.fillStyle=col;
      g.fillRect(x,y,1,1);
    }
  }
  return (SPRITE_CANVAS[name]=c);
}
