/* Reference-led modular pixel-art kit. Rendering never mutates the simulation. */
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
function material(L,x,y){if(!eligible(L))return null;return hash(Math.floor(x/4),Math.floor(y/4),canonical(L.bio).length)%5}
const images=new Map(),frames=new Map(),cache=new Map(),errors=[];
const floorCells={sewer:[0,1,2,0,3],fungal:[0,1,2,3,0],crypt:[0,1,2,3,0],mine:[0,1,2,0,3]};
const sources=Object.fromEntries(Object.keys(kits).map(b=>[b,`assets/biomes/${b}-v2.png`]));
let ready=Promise.resolve();
if(typeof document!=='undefined')ready=Promise.all(Object.entries(sources).map(([bio,url])=>new Promise(resolve=>{
 const im=new Image();im.onload=()=>{if(im.width!==256||im.height!==256)errors.push(`${bio}: expected a packed 256px atlas`);else images.set(bio,im);cache.clear();resolve()};
 im.onerror=()=>{errors.push(`Unable to load ${url}`);resolve()};im.src=url;
})));
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function frame(bio,id){const key=bio+':'+id;if(frames.has(key))return frames.get(key);const im=images.get(bio);if(!im)return null;
 const c=canvas(64,64),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,id%4*64,Math.floor(id/4)*64,64,64,0,0,64,64);frames.set(key,c);return c;
}
function stamp(g,bio,id,x,y,w,h){const im=frame(bio,id);if(im)g.drawImage(im,Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function baseFloor(bio,v,seed){const key=`base:${bio}:${v}:${seed}`;if(cache.has(key))return cache.get(key);const c=canvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;
 g.fillStyle=kits[bio].p[0];g.fillRect(0,0,32,32);const im=frame(bio,floorCells[bio][v]);
 if(im){g.save();if(!(bio==='mine'&&v===4)){g.translate(16,16);g.rotate(seed*Math.PI/2);g.translate(-16,-16)}g.drawImage(im,0,0,32,32);g.restore();
 // Subdue floor detail; brighter unflattened highlights belong to actors and landmarks.
 g.fillStyle=bio==='fungal'?'rgba(6,22,23,.46)':bio==='mine'?'rgba(12,25,33,.43)':'rgba(7,18,24,.32)';g.fillRect(0,0,32,32);
 if(bio==='sewer'&&v===3){g.fillStyle='rgba(7,39,48,.42)';g.fillRect(0,0,32,32)}
 if(bio==='fungal'&&v===4){g.fillStyle='rgba(19,55,49,.25)';g.fillRect(0,0,32,32)}
 if(bio==='crypt'&&v===4){g.fillStyle='rgba(174,154,109,.08)';g.fillRect(0,0,32,32)}
 if(bio==='mine'&&v===3){g.fillStyle='rgba(182,197,187,.12)';g.fillRect(0,0,32,32)}
 }
 if(images.has(bio))cache.set(key,c);return c;
}
function surface(bio,v,seed=0,edges=0,neighbors=[]){const key=[bio,v,seed,edges,...neighbors].join(':');if(cache.has(key))return cache.get(key);const c=canvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(baseFloor(bio,v,seed),0,0);
 // Neighbour material bleeds through irregular clipped strips, rather than a dark grid outline.
 for(const[side,bit]of [[0,1],[1,2],[2,4],[3,8]])if(edges&bit){const n=neighbors[side]??v;if(n===v)continue;g.save();g.beginPath();for(let j=0;j<16;j++){const depth=1+hash(j,seed,bit)%4;if(side===0)g.rect(j*2,0,2,depth);if(side===1)g.rect(32-depth,j*2,depth,2);if(side===2)g.rect(j*2,32-depth,2,depth);if(side===3)g.rect(0,j*2,depth,2)}g.clip();g.globalAlpha=.48;g.drawImage(baseFloor(bio,n,seed),0,0);g.restore()}
 if(images.has(bio))cache.set(key,c);return c;
}
// Each landmark is assembled from individually reusable wall, machine, architecture and prop cells.
const recipes={
 sewer:[[[5,0,5,96,43],[12,20,1,49,47],[8,1,28,24,14],[9,72,22,22,23]],[[4,0,5,96,43],[13,20,0,56,48],[10,4,31,25,16],[10,70,33,24,15]],[[6,0,5,96,43],[13,2,0,37,48],[8,32,13,38,18],[10,56,27,36,21],[11,75,0,17,31]],[[4,0,5,96,43],[13,0,0,39,48],[14,24,0,48,48],[13,60,0,36,48]],[[5,0,5,96,43],[13,4,0,40,48],[15,24,0,48,48],[11,76,5,18,35]]],
 fungal:[[[5,0,5,96,43],[12,16,0,64,48],[9,0,12,31,36],[9,67,13,29,35]],[[5,0,5,96,43],[11,0,1,25,47],[13,22,0,52,48],[11,73,1,23,47]],[[4,0,5,96,43],[14,19,0,58,48],[9,0,5,32,43],[8,70,19,26,29]],[[5,0,5,96,43],[9,0,4,29,44],[9,67,4,29,44],[8,29,25,37,23]],[[5,0,5,96,43],[11,0,0,26,48],[15,24,0,48,48],[11,71,0,25,48]]],
 crypt:[[[4,0,5,96,43],[5,1,8,24,38],[12,24,0,48,48],[5,71,8,24,38]],[[4,0,5,96,43],[13,18,10,60,38],[11,0,12,22,36],[11,74,12,22,36]],[[7,0,5,96,43],[14,21,0,54,48],[11,0,17,22,31],[11,74,17,22,31]],[[5,0,2,32,46],[5,32,2,32,46],[5,64,2,32,46],[11,1,20,18,28],[11,78,20,18,28]],[[4,0,5,96,43],[15,28,0,40,48],[10,0,25,28,23],[10,68,25,28,23]]],
 mine:[[[5,0,5,96,43],[12,20,0,56,48],[11,0,15,27,33],[11,70,15,26,33]],[[7,0,5,96,43],[13,14,0,68,48],[10,1,27,29,21],[11,72,23,24,25]],[[4,0,5,96,43],[14,26,0,44,48],[11,0,22,31,26],[11,66,22,30,26]],[[6,0,5,96,43],[13,0,0,36,48],[9,31,13,31,35],[8,60,23,36,25],[10,37,27,25,21]],[[4,0,5,96,43],[15,24,0,48,48],[11,1,23,28,25],[11,69,23,27,25]]]
};
function focal(g,bio,id){g.save();g.imageSmoothingEnabled=false;g.fillStyle=kits[bio].p[0];g.fillRect(0,8,96,40);for(const [cell,x,y,w,h]of recipes[bio][id%5])stamp(g,bio,cell,x,y,w,h);
 if(bio==='fungal'&&id===3){g.fillStyle='#345e5a';g.fillRect(27,39,42,4);g.fillStyle='#6c9690';g.fillRect(32,39,31,1)}
 g.fillStyle='rgba(4,12,18,.25)';g.fillRect(0,46,96,2);g.restore()}
function protectedAt(L,i){return L.decal?.[i]||L.weak?.[i]||L.fire?.[i]||L.spore?.[i]||L.gas?.[i]||L.oil?.[i]||L.smoke?.[i]}
let installed=false;
function install(){if(installed)return;const U=root.SaltmarrowSurfaces,E=root.SaltmarrowEnvironment,R=root.SaltmarrowRooms;if(!U||!E||!R)return;installed=true;
 const oldGet=U.get;U.get=function(L,t,x,y,o){if(!eligible(L)||t!==o.types.floor||L.bld?.[y*o.w+x]||!images.has(canonical(L.bio)))return oldGet(L,t,x,y,o);const v=material(L,x,y),neighbors=[];let edges=0;for(const [dx,dy,bit]of [[0,-1,1],[1,0,2],[0,1,4],[-1,0,8]]){const n=L.map[(y+dy)*o.w+x+dx]===o.types.floor?material(L,x+dx,y+dy):v;neighbors.push(n);if(n!==v)edges|=bit}return surface(canonical(L.bio),v,hash(x,y)%4,edges,neighbors)};
 const oldWall=E.drawWall;E.drawWall=function(g,L,x,y,o){if(!eligible(L)||!images.has(canonical(L.bio)))return oldWall(g,L,x,y,o);if(o.front||L.map[y*o.w+x]!==o.types.wall||L.map[(y+1)*o.w+x]!==o.types.floor||L.decal?.[y*o.w+x]||L.bld?.[y*o.w+x])return;
 const bio=canonical(L.bio),n=hash(Math.floor(x/2),y)%4;g.save();g.imageSmoothingEnabled=false;stamp(g,bio,4+n,x*32,(y+1)*32-48,32,48);g.fillStyle='rgba(2,12,18,.14)';g.fillRect(x*32,(y+1)*32-48,32,48);g.fillStyle='#101f25';g.fillRect(x*32,(y+1)*32-2,32,2);g.restore()};
 const oldDraw=E.draw;E.draw=function(g,L,tiles,o){if(!eligible(L)||!images.has(canonical(L.bio)))return oldDraw(g,L,tiles,o);
 const bio=canonical(L.bio),active=new Set(tiles.map(t=>t.i)),busy=new Set([...o.actors,...(L.objs||[]),...(L.items||[]),...(L.traps||[])].map(a=>Math.round(a.y)*o.w+Math.round(a.x)));
 g.save();g.imageSmoothingEnabled=false;
 for(const d of E.plan(L,o.w,o.h,o.types).deposits){if(!active.has(d.i)||busy.has(d.i)||protectedAt(L,d.i))continue;g.globalAlpha=o.visible[d.i]?.9:.3;stamp(g,bio,8+d.seed%4,d.x*32+2,d.y*32,28,20)}
 for(const{x,y,i}of tiles){if(L.map[i]!==o.types.floor||busy.has(i)||protectedAt(L,i))continue;const n=hash(x,y,37);if(n%13)continue;g.globalAlpha=o.visible[i]?.18:.05;const phase=o.reduced?0:Math.floor(o.now/1000+n%4)%3;g.fillStyle=kits[bio].p[3];
 if(bio==='fungal'){g.fillRect(x*32+8,y*32+7-phase,1,1);g.fillRect(x*32+21,y*32+16-phase,1,1)}else if(bio==='sewer'){g.fillRect(x*32+5,y*32+23,21,1);g.fillRect(x*32+9+phase,y*32+25,8,1)}else if(bio==='mine'){g.fillRect(x*32+7,y*32+22,13,1)}else g.fillRect(x*32+8,y*32+19,8,1);
 }g.restore()};
 const oldFocal=R.drawFocal;R.drawFocal=function(g,L,d,o){if(!eligible(L)||!images.has(canonical(L.bio)))return oldFocal(g,L,d,o);for(let dx=0;dx<3;dx++){const i=d.y*o.w+d.x+dx;if(L.map[i]!==0||L.decal?.[i]||!L.seen[i]||!L.seen[i+o.w])return}if(o.actors.some(a=>a.x>=d.x-1&&a.x<=d.x+3&&a.y>=d.y-1&&a.y<=d.y))return;
 const rooms=R.entries(L,o.w,Math.floor(L.map.length/o.w)),id=Math.max(0,rooms.findIndex(r=>r.x===d.x&&r.y===d.y))%5;g.save();g.translate(d.x*32,(d.y+1)*32-48);focal(g,canonical(L.bio),id);g.restore()};
}
const api={kits,canonical,eligible,material,surface,focal,install,ready,errors,images,recipes,sources,frame,protectedAt};root.SaltmarrowBiomes=api;
if(typeof module==='object'&&module.exports)module.exports=api;else install();
})(typeof globalThis!=='undefined'?globalThis:this);
