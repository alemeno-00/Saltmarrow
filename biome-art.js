/* Authored native-pixel dungeon kit. All art stays inside existing render footprints. */
(function(root){
'use strict';
const kits={
 sewer:{floors:['wet brick','fractured brick','slime bed','flood silt','rust grate'],landmarks:['Pumping station','Collapsed tunnel','Drowned workshop','Giant drainage gate','Flooded shrine'],p:['#172c31','#30484a','#52645b','#8d9b7c','#986346']},
 fungal:{floors:['fungal soil','moss bed','root mesh','spore carpet','colonised rock'],landmarks:['Fungal cathedral','Mycelial heart','Mushroom forest','Spore lake','Fungal throne'],p:['#142e30','#294c43','#497461','#8dc7b3','#ceca90']},
 crypt:{floors:['worn flagstone','fractured tomb','burial slab','grave dust','wax stone'],landmarks:['Ossuary','Saint tomb','Bone chapel','Wall of skulls','Funeral hall'],p:['#20272d','#41484a','#72756b','#b7b39b','#d3ad71']},
 mine:{floors:['salt crust','excavated rock','crystal seam','salt dust','mine track'],landmarks:['Crystal cathedral','Collapsed shaft','Salt pillar','Workers camp','Buried saint'],p:['#242f37','#485658','#788c8b','#b5cbc2','#e1e3c7']}
};
const canonical=b=>b==='drowned'?'sewer':b;
const hash=(x,y,s=0)=>{let n=Math.imul(x+17,374761393)^Math.imul(y+31,668265263)^s;n=Math.imul(n^(n>>>13),1274126177);return(n^(n>>>16))>>>0};
const eligible=L=>!L.town&&!L.interior&&!L.tutorial&&kits[canonical(L.bio)];
function material(L,x,y){const k=eligible(L);if(!k)return null;return hash(Math.floor(x/4),Math.floor(y/4),canonical(L.bio).length)%5}
const cache=new Map();
function surface(bio,v,seed,edges){const key=[bio,v,seed,edges].join(':');if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),p=kits[bio].p;
 const r=(x,y,w,h,col)=>{g.fillStyle=typeof col==='number'?p[col]:col;g.fillRect(x,y,w,h)};
 r(0,0,32,32,0);
 if(bio==='sewer'||bio==='crypt'){
  for(let j=0;j<4;j++){const x=j%2*17,y=Math.floor(j/2)*17;r(x+1,y+1,15,15,1);r(x+2,y+1,12,1,2);r(x+3,y+4,7,1,bio==='crypt'?'#4c5351':'#3b5351')}
  if(v===1){r(7+seed,4,1,13,0);r(8+seed,16,5,1,0);r(12+seed,17,1,9,0)}
  if(bio==='sewer'&&(v===0||v===3)){r(2,22,27,5,'#213d42');r(5,21,20,1,'#567778');r(12,25,13,1,'#36585c')}
  if(bio==='sewer'&&v===4){r(4,5,24,22,'#282d2b');for(let x=6;x<28;x+=4){r(x,6,1,19,4);r(x+1,6,1,19,'#59665c')}r(4,5,24,1,2)}
  if(bio==='crypt'&&v===2){r(6,3,20,26,0);r(7,4,18,24,1);r(15,8,2,13,2);r(11,11,10,2,2)}
  if(bio==='crypt'&&v===4){r(3,3,7,3,3);r(6,5,5,6,2);r(9,10,4,2,2)}
 }else{
  for(let j=0;j<6;j++){const n=hash(j,seed,41),x=n%25,y=(n>>>8)%26;r(x,y,7,3,1);r(x+2,y+3,4,2,1);r(x,y,5,1,2)}
  if(bio==='fungal'){
   for(let j=0;j<(v===2?6:3);j++){const x=(j*7+seed)%27,y=4+j*4;r(x,y,2,8,2);r(x+1,y+6,6,1,2);if(v===3)r(x+3,y+3,1,1,3)}
   if(v===4){for(let j=0;j<3;j++){const x=5+j*9,y=8+j%2*11;r(x,y,1,5,2);r(x-2,y-1,5,2,3);r(x-1,y-2,3,1,4)}}
   if(v===1){r(1,17,27,5,'#36583e');r(4,14,19,3,'#3e6246')}
  }else{
   if(v===1){r(2,5,16,9,1);r(3,5,13,1,2);r(20,17,10,12,1);r(21,17,7,1,2);r(12,6,1,18,0);r(13,23,7,1,0)}
   if(v===4){r(7,0,2,32,2);r(23,0,2,32,2);for(let y=3;y<32;y+=9)r(4,y,24,2,'#4f4640')}
   else for(let j=0;j<(v===2?5:2);j++){const x=3+j*5,y=7+(j+seed)%4*4;r(x,y,2,7,2);r(x,y,1,4,3);r(x+2,y+4,3,1,3)}
  }
 }
 if((bio==='sewer'&&v===2)||(bio==='crypt'&&v===3)||(bio==='mine'&&v===3))for(let j=0;j<6;j++){const n=hash(j,seed,9);r(n%28,(n>>>8)%29,4,2,bio==='sewer'?'#47583b':2)}
 // Shared dark seam and sparse stepped fringes bind adjacent material fields.
 for(const[bit,x,y,ww,hh]of[[1,0,0,32,2],[2,30,0,2,32],[4,0,30,32,2],[8,0,0,2,32]])if(edges&bit){r(x,y,ww,hh,1);for(let j=0;j<8;j++){if(bit===1||bit===4)r(j*4,y+(bit===1?2:-1),2,1,2);else r(x+(bit===8?2:-1),j*4,1,2,2)}}
 for(let j=0;j<10;j++){const n=hash(j,seed,v+13),x=n%30,y=(n>>>9)%30;r(x,y,1,1,1);if(n%3===0)r(x+1,y,1,1,2)}
 cache.set(key,c);return c;
}
function focal(g,bio,id){const p=kits[bio].p,r=(x,y,w,h,c)=>{g.fillStyle=typeof c==='number'?p[c]:c;g.fillRect(x,y,w,h);if(w>=8&&h>=6){g.fillStyle=p[0];g.fillRect(x,y+h-1,w,1);g.fillRect(x+w-1,y+1,1,h-1);g.fillStyle=p[2];g.fillRect(x+1,y,w-2,1);for(let yy=y+4;yy<y+h-2;yy+=6){g.fillStyle=typeof c==='number'?p[Math.max(0,c-1)]:p[1];g.fillRect(x+1,yy,w-2,1);for(let xx=x+4+(yy%2)*3;xx<x+w-2;xx+=9)g.fillRect(xx,yy-3,1,3)}}},skull=(x,y)=>{r(x,y,5,5,3);r(x+1,y+2,1,1,0);r(x+3,y+2,1,1,0);r(x+1,y+5,3,1,2)},crystal=(x,y,h)=>{r(x+2,y,3,h,3);r(x,y+4,2,h-4,2);r(x+5,y+6,3,h-6,1);r(x+2,y,1,h,4)},cap=(x,y,w)=>{r(x+Math.floor(w/2)-1,y,3,15,2);r(x+2,y-5,w-4,2,3);r(x,y-3,w,4,2);r(x+3,y-3,w-6,1,4)};
 r(1,39,94,9,0);r(3,38,90,2,2);
 if(bio==='sewer'){
  r(5,9,86,28,1);r(5,8,86,2,2);
  if(id===0||id===2){for(const x of [10,37,70]){r(x,5,8,32,4);r(x+1,6,2,30,2);r(x-3,18,14,3,4)}r(39,19,12,10,0);r(43,16,3,16,3);r(37,22,15,2,3);if(id===2){r(11,31,65,3,4);r(17,25,3,6,2)}}
  if(id===1){for(let j=0;j<9;j++)r(8+j*9,15+j%3*7,11,9,j%2?2:0);r(20,8,3,25,4);r(20,8,50,3,4)}
  if(id===3){r(19,5,58,32,0);for(let x=22;x<77;x+=7)r(x,8,3,29,4);r(16,5,64,3,2);r(16,30,64,3,2)}
  if(id===4){r(28,3,40,33,0);r(30,4,3,31,2);r(63,4,3,31,2);r(44,12,8,23,3);r(39,19,18,3,3)}
  r(6,40,84,3,'#284b50');r(12,40,28,1,'#78918b');
 }else if(bio==='fungal'){
  for(let j=0;j<7;j++){r(6+j*13,28-j%3*4,2,14,2);r(6+j*13,40,10,1,3)}
  if(id===0){cap(6,17,28);cap(62,17,28);cap(29,7,38)}
  if(id===1){for(let j=0;j<5;j++)r(32+j*3,9-j%2*3,20-j*4,25+j%2*3,2);r(41,13,12,15,3);r(45,14,3,10,4)}
  if(id===2)for(let j=0;j<6;j++)cap(4+j*14,13+j%3*7,18);
  if(id===3){r(9,28,78,9,2);r(15,29,65,2,3);for(let j=0;j<12;j++)r(13+j*6,12+j%4*4,1,1,4)}
  if(id===4){cap(20,10,56);r(32,20,5,18,2);r(60,20,5,18,2);r(33,29,31,5,3)}
 }else if(bio==='crypt'){
  r(6,7,84,30,1);for(let j=0;j<7;j++){r(8+j*12,7,1,30,2)}
  if(id===0||id===3){for(let y=11;y<35;y+=9)for(let x=10;x<86;x+=9)skull(x,y);if(id===0){r(34,23,28,14,0);skull(45,26)}}
  if(id===1){r(24,23,48,14,2);r(27,21,42,3,3);r(44,11,8,10,3);r(39,14,18,2,3);r(28,29,40,1,1)}
  if(id===2){r(29,6,38,31,0);for(const x of [25,65])for(let y=8;y<35;y+=8)skull(x,y);r(46,13,3,20,3);r(39,19,17,3,3)}
  if(id===4){for(const x of [9,63])for(const y of [16,27]){r(x,y,24,4,2);r(x+2,y+4,2,5,1);r(x+20,y+4,2,5,1)}r(39,10,18,23,2);r(42,8,12,3,3)}
  for(const x of [8,84]){r(x,30,2,7,3);r(x,27,2,3,4)}
 }else{
  if(id===0){crystal(13,10,28);crystal(35,0,38);crystal(53,5,33);crystal(76,14,24)}
  if(id===1){r(10,3,5,35,'#70614e');r(80,3,5,35,'#70614e');r(10,3,75,5,'#988873');for(let j=0;j<8;j++)r(17+j*9,20+j%3*5,12,10,2)}
  if(id===2){crystal(39,0,39);crystal(48,10,29);crystal(29,19,20)}
  if(id===3){r(7,19,32,17,'#665d4d');r(10,17,26,3,'#a99b7d');r(56,22,30,13,1);r(54,21,34,3,2);r(58,35,5,4,0);r(79,35,5,4,0);r(65,8,2,14,2);r(58,8,16,2,3)}
  if(id===4){r(21,25,54,11,2);r(25,23,46,3,3);skull(43,17);crystal(29,11,25);crystal(62,8,28)}
 }
}
let installed=false;
function install(){if(installed)return;const U=root.SaltmarrowSurfaces,E=root.SaltmarrowEnvironment,R=root.SaltmarrowRooms;if(!U||!E||!R)return;installed=true;
 const oldGet=U.get;U.get=function(L,t,x,y,o){if(!eligible(L)||t!==o.types.floor||L.bld?.[y*o.w+x])return oldGet(L,t,x,y,o);const v=material(L,x,y);let edges=0;for(const[dx,dy,b]of[[0,-1,1],[1,0,2],[0,1,4],[-1,0,8]])if(L.map[(y+dy)*o.w+x+dx]===o.types.floor&&material(L,x+dx,y+dy)!==v)edges|=b;return surface(canonical(L.bio),v,hash(x,y)%4,edges)};
 const oldWall=E.drawWall;E.drawWall=function(g,L,x,y,o){if(!eligible(L))return oldWall(g,L,x,y,o);if(o.front||L.map[y*o.w+x]!==o.types.wall||L.map[(y+1)*o.w+x]!==o.types.floor||L.decal?.[y*o.w+x])return;const bio=canonical(L.bio),p=kits[bio].p,n=hash(x,y)%5,xx=x*32,yy=(y+1)*32-48;g.save();g.translate(xx,yy);const r=(x,y,w,h,c)=>{g.fillStyle=typeof c==='number'?p[c]:c;g.fillRect(x,y,w,h)};r(0,3,32,43,1);for(let j=0;j<4;j++){r(0,8+j*10,32,1,0);r((j%2)*16,8+j*10,1,10,0)}r(1,3,30,2,2);
 if(bio==='sewer'){if(n<2){r(12,4,7,38,4);r(11,12,9,3,2);r(11,30,9,3,2)}else if(n===2){r(5,13,22,26,0);for(let j=7;j<27;j+=4)r(j,15,1,23,2)}else{for(let j=0;j<5;j++)r(3+j*6,25+j%2*4,2,18-j%2*4,'#405538')}}
 if(bio==='fungal'){if(n===3){r(4,12,24,27,0);for(let j=0;j<6;j++)r(7+j*3,18+j%3*6,2,4,3)}for(let j=0;j<(n===4?2:3);j++){r(3+j*10,6+j*7,2,36-j*7,2);r(1+j*10,21+j*5,8,3,3);r(2+j*10,20+j*5,5,1,4)}}
 if(bio==='crypt'){if(n<3){r(6,10,20,29,0);r(5,9,22,2,2);for(let j=0;j<3;j++){r(9+j*5,26,4,5,3);r(10+j*5,28,1,1,0)}r(7,33,18,2,2)}else{r(14,12,3,22,3);r(8,18,16,3,3)}}
 if(bio==='mine'){if(n<2){r(2,4,4,40,'#6b5a46');r(26,4,4,40,'#6b5a46');r(2,7,28,4,'#91816a')}else for(let j=0;j<4;j++){r(6+j*5,15+j*3,3,20-j*3,2);r(6+j*5,15+j*3,1,15-j*2,3)}}r(0,44,32,4,0);g.restore()};
 const oldDraw=E.draw;E.draw=function(g,L,tiles,o){if(!eligible(L))return oldDraw(g,L,tiles,o);const bio=canonical(L.bio),p=kits[bio].p,active=new Set(tiles.map(t=>t.i)),busy=new Set([...o.actors,...(L.objs||[]),...(L.items||[]),...(L.traps||[])].map(a=>Math.round(a.y)*o.w+Math.round(a.x)));g.save();g.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,c)=>{g.fillStyle=typeof c==='number'?p[c]:c;g.fillRect(x,y,w,h)};
 for(const d of E.plan(L,o.w,o.h,o.types).deposits){if(!active.has(d.i)||busy.has(d.i)||L.decal?.[d.i]||L.weak?.[d.i]||L.fire?.[d.i]||L.spore?.[d.i]||L.gas?.[d.i])continue;g.globalAlpha=o.visible[d.i]?.85:.3;const x=d.x*32,y=d.y*32,n=d.seed%5;rect(x+3,y+15,26,3,0);
 if(bio==='sewer'){if(n<2){rect(x+4,y+7,24,6,4);rect(x+7,y+6,3,8,2);rect(x+23,y+6,3,8,2)}else if(n===2){rect(x+6,y+3,20,12,0);for(let j=0;j<5;j++)rect(x+8+j*3,y+4,1,10,2)}else{rect(x+7,y+8,13,6,1);rect(x+9,y+7,10,1,4);rect(x+23,y+4,2,11,2);rect(x+20,y+7,8,2,4)}}
 if(bio==='fungal'){for(let j=0;j<3;j++){const xx=x+7+j*8,yy=y+5+j%2*4;rect(xx,yy,2,11-j%2*4,2);rect(xx-3,yy-2,8,3,3);rect(xx-2,yy-3,5,1,4)}if(n===4){rect(x+11,y+5,9,10,2);rect(x+13,y+4,5,2,3)}}
 if(bio==='crypt'){if(n<2){rect(x+5,y+4,22,11,1);rect(x+7,y+3,18,2,2);rect(x+15,y+6,2,7,3);rect(x+12,y+8,8,1,3)}else if(n===2){rect(x+4,y+9,24,3,2);rect(x+6,y+12,2,4,1);rect(x+24,y+12,2,4,1)}else{for(let j=0;j<3;j++){rect(x+5+j*8,y+6,5,5,3);rect(x+6+j*8,y+8,1,1,0);rect(x+8+j*8,y+8,1,1,0);rect(x+6+j*8,y+11,3,1,2)}}}
 if(bio==='mine'){if(n<2){for(let j=0;j<4;j++){rect(x+4+j*6,y+8-j%2*4,4,8+j%2*4,2);rect(x+5+j*6,y+6-j%2*4,2,10+j%2*4,3)}}else if(n===2){rect(x+5,y+5,23,9,1);rect(x+4,y+4,25,2,2);rect(x+7,y+14,4,3,0);rect(x+22,y+14,4,3,0)}else{rect(x+6,y+4,2,12,2);rect(x+2,y+4,11,2,3);rect(x+17,y+8,11,3,'#7a6a52');rect(x+19,y+6,7,2,2)}}
 }
 for(const {x,y,i}of tiles){if(L.map[i]!==o.types.floor||L.decal?.[i]||busy.has(i)||L.weak?.[i]||L.fire?.[i]||L.spore?.[i]||L.gas?.[i])continue;const n=hash(x,y,37);if(n%11)continue;g.globalAlpha=o.visible[i]?.22:.07;const phase=o.reduced?0:Math.floor(o.now/900+n%4)%3;if(bio==='fungal'){rect(x*32+8,y*32+7-phase,1,1,3);rect(x*32+21,y*32+16-phase,1,1,4)}else if(bio==='sewer'){rect(x*32+5,y*32+23,21,1,2);rect(x*32+9+phase,y*32+25,8,1,3)}else if(bio==='mine'){rect(x*32+7,y*32+22,13,1,2);rect(x*32+23,y*32+12,1,1,3)}else{rect(x*32+8,y*32+19,8,1,2);rect(x*32+10,y*32+18,1,3,3)}}g.restore()};
 const oldFocal=R.drawFocal;R.drawFocal=function(g,L,d,o){if(!eligible(L))return oldFocal(g,L,d,o);for(let dx=0;dx<3;dx++){const i=d.y*o.w+d.x+dx;if(L.map[i]!==0||L.decal?.[i]||!L.seen[i]||!L.seen[i+o.w])return}if(o.actors.some(a=>a.x>=d.x-1&&a.x<=d.x+3&&a.y>=d.y-1&&a.y<=d.y))return;const rooms=R.entries(L,o.w,Math.floor(L.map.length/o.w)),id=Math.max(0,rooms.findIndex(r=>r.x===d.x&&r.y===d.y))%5;g.save();g.translate(d.x*32,(d.y+1)*32-48);focal(g,canonical(L.bio),id);g.restore()};
}
root.SaltmarrowBiomes={kits,canonical,eligible,material,surface,focal,install};if(typeof module==='object'&&module.exports)module.exports=root.SaltmarrowBiomes;else install();
})(typeof globalThis!=='undefined'?globalThis:this);
