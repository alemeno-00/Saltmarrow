/* Complete cohesive biome renderer: one new kit owns every environment layer. */
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
const eligible=L=>!!L&&!L.town&&!L.interior&&!!kits[canonical(L.bio)];
const images=new Map(),frames=new Map(),cache=new Map(),errors=[];
const sources=Object.fromEntries(Object.keys(kits).map(b=>[b,`assets/biomes/${b}-v3.png`]));
const layout={floor:0,cracked:1,accent:2,water:3,deepWater:4,pit:5,stairs:6,bridge:7,wall:8,wornWall:9,cap:10,door:11,openDoor:12,gate:13,openGate:14,rubble:15,chest:16,chestOpen:17,crate:18,barrel:19,brazier:20,brazierCold:21,coffin:22,coffinOpen:23,lever:24,leverOn:25,bell:26,lamp:27,support:28,shaft:29,foliage:30,bones:31,arch:32,saint:33,core:34,structure:35,cart:36,pod:37,crystal:38,shroom:39};
let ready=Promise.resolve();
if(typeof document!=='undefined')ready=Promise.all(Object.entries(sources).map(([bio,url])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{if(im.width!==512||im.height!==320)errors.push(`${bio}: invalid cohesive atlas`);else images.set(bio,im);cache.clear();resolve()};im.onerror=()=>{errors.push(`Unable to load ${url}`);resolve()};im.src=url})));
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function frame(bio,id){const key=bio+':'+id;if(frames.has(key))return frames.get(key);const im=images.get(bio);if(!im)return null;const c=canvas(64,64),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,id%8*64,Math.floor(id/8)*64,64,64,0,0,64,64);frames.set(key,c);return c}
function stamp(g,bio,id,x,y,w,h){const im=frame(bio,id);if(im)g.drawImage(im,Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function material(L,x,y,w=64){if(!eligible(L))return null;const i=y*w+x,d=L.decal?.[i];if(d===7||d===11)return 4;
 const room=(L.rooms||[]).find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
 // Most of a room shares one quiet material. Accents belong to edges and room functions.
 if(room){const edge=Math.min(x-room.x,room.x+room.w-1-x,y-room.y,room.y+room.h-1-y);if(edge===0&&hash(Math.floor(x/3),Math.floor(y/3),7)%3===0)return 2;if(room.theme==='burial'||room.theme==='shrine')return 1}
 if(L.map&&[i-w,i+w,i-1,i+1].some(j=>L.map[j]===4))return 3;
 return hash(Math.floor(x/9),Math.floor(y/9),13)%7===0?1:0;
}
function baseFloor(bio,v,phase){const key=`floor:${bio}:${v}:${phase}`;if(cache.has(key))return cache.get(key);const c=canvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle=kits[bio].p[0];g.fillRect(0,0,32,32);
 const id=v===4?7:v===2?2:v===1?1:0,im=frame(bio,id);if(im){g.drawImage(im,(phase%2)*32,Math.floor(phase/2)*32,32,32,0,0,32,32);g.fillStyle='rgba(5,16,23,.28)';g.fillRect(0,0,32,32);if(v===3){g.fillStyle='rgba(10,41,47,.2)';g.fillRect(0,0,32,32)}}
 if(images.has(bio))cache.set(key,c);return c;
}
function surface(bio,v,phase=0,edges=0,neighbors=[]){const key=[bio,v,phase,edges,...neighbors].join(':');if(cache.has(key))return cache.get(key);const c=canvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(baseFloor(bio,v,phase),0,0);
 for(const[side,bit]of [[0,1],[1,2],[2,4],[3,8]])if(edges&bit){const n=neighbors[side]??v;if(n===v)continue;g.save();g.beginPath();for(let j=0;j<16;j++){const d=2+hash(j,phase,bit)%4;if(side===0)g.rect(j*2,0,2,d);if(side===1)g.rect(32-d,j*2,d,2);if(side===2)g.rect(j*2,32-d,2,d);if(side===3)g.rect(0,j*2,d,2)}g.clip();g.globalAlpha=.5;g.drawImage(baseFloor(bio,n,phase),0,0);g.restore()}
 if(images.has(bio))cache.set(key,c);return c;
}
function floorAt(L,x,y,w){const v=material(L,x,y,w),neighbors=[];let edges=0;for(const[dx,dy,bit]of[[0,-1,1],[1,0,2],[0,1,4],[-1,0,8]]){const n=L.map[(y+dy)*w+x+dx]===1?material(L,x+dx,y+dy,w):v;neighbors.push(n);if(n!==v)edges|=bit}return surface(canonical(L.bio),v,(x&1)+2*(y&1),edges,neighbors)}
function tile(L,t,x,y,wf,{w=64}={}){if(!eligible(L))return null;const bio=canonical(L.bio),c=canvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;
 if(t===1)return floorAt(L,x,y,w);const deep=t===4&&[y*w+x-w,y*w+x+w,y*w+x-1,y*w+x+1].every(i=>L.map[i]===4),key=`tile:${bio}:${t}:${x&1}:${y&1}:${material(L,x,y,w)}:${deep}`;if(cache.has(key))return cache.get(key);if(images.has(bio))cache.set(key,c);g.fillStyle=kits[bio].p[0];g.fillRect(0,0,32,32);
 if(t===0||t===7){g.fillStyle='#101a22';g.fillRect(0,0,32,32);if(t===7){g.fillStyle=kits[bio].p[3];for(let j=0;j<8;j++)g.fillRect(13+j%3,j*4,1,4)}return c}
 const ids={2:11,3:12,4:3,5:5,6:6,8:15,11:13,12:14};if(ids[t]!=null){let id=ids[t];if(t===4&&[y*w+x-w,y*w+x+w,y*w+x-1,y*w+x+1].every(i=>L.map[i]===4))id=4;stamp(g,bio,id,0,0,32,32);return c}
 g.drawImage(floorAt(L,x,y,w),0,0);if(t===9)stamp(g,bio,30,0,0,32,32);if(t===13)stamp(g,bio,31,0,0,32,32);
 if(t===10){g.strokeStyle=kits[bio].p[3];g.lineWidth=1;for(const[a,b]of[[2,2],[29,3],[27,29],[3,27]]){g.beginPath();g.moveTo(16,16);g.lineTo(a,b);g.stroke()}for(let k=0;k<3;k++){const p=6+k*4;g.strokeRect(p,p,32-p*2,32-p*2)}}return c;
}
function wall(g,L,x,y,front,w){if(!eligible(L))return false;const bio=canonical(L.bio),base=(y+1)*32,height=front?12:48,im=frame(bio,8);const i=y*w+x,exposed=[i-w,i+w,i-1,i+1].some(j=>L.map[j]!=null&&![0,5,7].includes(L.map[j]));if(!exposed){g.save();g.fillStyle='#101a22';g.fillRect(x*32,y*32,32,32);g.restore();return true}g.save();g.imageSmoothingEnabled=false;g.fillStyle=kits[bio].p[0];g.fillRect(x*32,base-height,32,height);
 if(im){if(front)g.drawImage(im,0,0,64,24,x*32,base-height,32,height);else g.drawImage(im,0,0,64,64,x*32,base-height,32,height)}
 g.fillStyle='rgba(3,11,17,.2)';g.fillRect(x*32,base-height,32,height);g.fillStyle=kits[bio].p[0];g.fillRect(x*32,base-2,32,2);
 if(L.map[y*w+x]===7){g.fillStyle=kits[bio].p[0];for(let j=0;j<9;j++)g.fillRect(x*32+13+j%3,base-height+j*5,2,5)}
 const d=L.decal?.[y*w+x];if(!front&&d>=30){const id=d===30?27:d===31?31:d===34?39:d===36?28:d===37?38:35;stamp(g,bio,id,x*32+5,base-31,22,29)}g.restore();return true;
}
function protectedAt(L,i){return L.decal?.[i]||L.weak?.[i]||L.fire?.[i]||L.spore?.[i]||L.gas?.[i]||L.oil?.[i]||L.smoke?.[i]}
function dressing(g,L,tiles,{w,visible}){if(!eligible(L))return false;const bio=canonical(L.bio),p=kits[bio].p;g.save();g.imageSmoothingEnabled=false;
 for(const{x,y,i}of tiles){if([0,5,7].includes(L.map[i]))continue;const xx=x*32,yy=y*32,d=L.decal?.[i];g.globalAlpha=visible[i]?1:.4;
 if(d){const ids={2:30,5:15,6:38,10:20,12:30,14:18,16:31,18:30,19:39};if(ids[d]!=null){g.globalAlpha*=.65;stamp(g,bio,ids[d],xx+4,yy+8,24,20)}
 if(d===7){g.fillStyle=p[1];for(let j=2;j<32;j+=8)g.fillRect(xx,yy+j,32,3);g.fillStyle=p[3];g.fillRect(xx+7,yy,1,32);g.fillRect(xx+24,yy,1,32)}
 if(d===3){g.globalAlpha*=.45;stamp(g,bio,3,xx+4,yy+15,24,11)}
 if(d===4||d===20){g.fillStyle='#673b35';for(let j=0;j<4;j++)g.fillRect(xx+5+j*5,yy+10+j%2*6,3,4)}
 if(d===15){g.fillStyle=p[0];g.fillRect(xx+5,yy+5,22,22);g.fillStyle=p[2];for(let j=8;j<27;j+=4)g.fillRect(xx+j,yy+5,1,22)}
 if(d===17){g.strokeStyle=p[3];g.lineWidth=1;g.strokeRect(xx+7,yy+7,18,18);g.beginPath();g.moveTo(xx+16,yy+4);g.lineTo(xx+16,yy+28);g.moveTo(xx+4,yy+16);g.lineTo(xx+28,yy+16);g.stroke()}
 if(d===9){g.fillStyle=p[4];g.fillRect(xx+12,yy,8,32)}
 }
 // Contact shading belongs to the same kit, rather than legacy AO/decal canvases.
 g.globalAlpha=(visible[i]?1:.4)*.3;g.fillStyle=p[0];if(y>0&&[0,7].includes(L.map[i-w]))g.fillRect(xx,yy,32,3);if(x>0&&[0,7].includes(L.map[i-1]))g.fillRect(xx,yy,2,32);
 }g.restore();return true;
}
const objectCells={crate:18,barrel:19,keg:19,cart:36,support:28,statue:33,crystal:38,pod:37,shroom:39,bell:26,lamp:27,shaft:29,shrine:33,altar:33,coffin:22,chest:16,lever:24,brazier:20,gibbet:28,grave:31,trap:29,sewergrate:29,passage:29,encounter:33,cabinet:16,urn:19,sack:19,reliquary:33,ritualcandle:20,vaultdoor:13,valve:24,jack:28,plever:24,plaque:9,chandelier:27,sluice:13,boulder:15,charge:18};
const characterObjects=new Set(['corpse','merchant','captive','rival']);
function objectCell(o){if(o.type==='chest')return o.open||o.searched?17:16;if(o.type==='coffin')return o.open||o.searched?23:22;if(o.type==='lever'||o.type==='plever')return o.on?25:24;if(o.type==='brazier'||o.type==='ritualcandle')return o.lit?20:21;if(o.type==='door')return o.closed?11:12;return objectCells[o.type]??18}
function object(g,L,o){if(!eligible(L)||characterObjects.has(o.type))return false;const bio=canonical(L.bio),id=objectCell(o),x=Math.round((o.rx??o.x)*32),y=Math.round((o.ry??o.y)*32),h=[26,27,28,33].includes(id)?40:29;
 g.save();g.imageSmoothingEnabled=false;if(o.used)g.globalAlpha*=.45;stamp(g,bio,id,x+1,y+32-h,30,h);
 if(o.type==='valve'){g.strokeStyle=kits[bio].p[4];g.lineWidth=2;g.beginPath();g.arc(x+16,y+17,9,0,Math.PI*2);g.stroke()}
 if(o.type==='trap'){g.fillStyle=o.armed?'#c28b5a':kits[bio].p[1];g.fillRect(x+5,y+22,22,2)}
 if(o.type==='plaque'||o.type==='plever'){g.fillStyle=kits[bio].p[3];for(let j=0;j<3;j++)g.fillRect(x+10+j*4,y+9+(j+(o.sym||0))%3*3,2,3)}
 if(o.type==='keg'){g.fillStyle='#a34c3b';g.fillRect(x+5,y+18,22,3)}
 if(o.type==='charge'){g.fillStyle='#bda373';g.fillRect(x+10,y+15,12,10);g.fillStyle='#eac381';g.fillRect(x+21,y+11,2,3);g.font='10px monospace';g.fillText(Math.ceil(o.fuse||0),x+3,y+10)}
 g.restore();return true;
}
function loot(g,L,it){if(!eligible(L))return false;const bio=canonical(L.bio),p=kits[bio].p,x=it.x*32,y=it.y*32;g.save();g.imageSmoothingEnabled=false;
 if(it.kind==='gear')stamp(g,bio,16,x+8,y+17,16,13);
 else if(it.kind==='charge'){g.fillStyle=p[4];g.fillRect(x+11,y+19,12,9);g.fillStyle=p[3];g.fillRect(x+19,y+15,2,5)}
 else if(['gold','silver'].includes(it.kind)){g.fillStyle=it.kind==='gold'?'#c49c54':p[3];g.fillRect(x+10,y+24,13,3);g.fillRect(x+13,y+21,7,3);g.fillStyle=p[0];g.fillRect(x+15,y+24,1,2)}
 else{g.fillStyle=p[3];g.fillRect(x+14,y+15,5,3);g.fillStyle=['draught','tonic'].includes(it.kind)?'#678f84':p[2];g.fillRect(x+11,y+19,11,10);g.fillStyle=p[0];g.fillRect(x+14,y+21,5,2)}g.restore();return true;
}
const recipes={};for(const bio of Object.keys(kits)){const center=bio==='crypt'?34:bio==='mine'?34:bio==='fungal'?34:34;recipes[bio]=[
 [[32,14,0,68,48],[39,0,22,28,26],[39,68,22,28,26]],
 [[center,19,5,58,43],[28,0,3,22,45],[28,74,3,22,45]],
 [[bio==='fungal'?39:bio==='crypt'?33:bio==='mine'?38:36,19,5,58,43],[32,0,0,28,48],[32,68,0,28,48]],
 [[35,16,2,64,46],[bio==='crypt'?31:bio==='sewer'?13:39,0,17,29,31],[bio==='crypt'?31:bio==='sewer'?13:39,67,17,29,31]],
 [[33,28,0,40,48],[32,0,0,33,48],[32,63,0,33,48]]
 ]}
function focal(g,bio,id){g.save();g.imageSmoothingEnabled=false;for(let x=0;x<96;x+=32)stamp(g,bio,8,x,0,32,48);for(const[cell,x,y,w,h]of recipes[bio][id%5])stamp(g,bio,cell,x,y,w,h);g.restore()}
let installed=false;
function install(){if(installed)return;const U=root.SaltmarrowSurfaces,E=root.SaltmarrowEnvironment,R=root.SaltmarrowRooms,C=root.SaltmarrowScenes;if(!U||!E||!R)return;installed=true;
 const oldGet=U.get;U.get=(L,t,x,y,o)=>eligible(L)?(t===o.types.floor?floorAt(L,x,y,o.w):null):oldGet(L,t,x,y,o);
 const oldWall=U.wall;U.wall=(g,L,x,y,front,w)=>eligible(L)?wall(g,L,x,y,front,w):oldWall(g,L,x,y,front,w);
 const oldWallDetail=E.drawWall;E.drawWall=(g,L,x,y,o)=>{if(!eligible(L))return oldWallDetail(g,L,x,y,o)};
 const oldGround=R.ground;R.ground=(g,L,tiles,o)=>{if(!eligible(L))return oldGround(g,L,tiles,o)};
 const oldDraw=E.draw;E.draw=(g,L,tiles,o)=>{if(!eligible(L))return oldDraw(g,L,tiles,o);const bio=canonical(L.bio),active=new Set(tiles.map(t=>t.i)),busy=new Set([...o.actors,...(L.objs||[]),...(L.items||[]),...(L.traps||[])].map(a=>Math.round(a.y)*o.w+Math.round(a.x)));g.save();g.imageSmoothingEnabled=false;for(const d of E.plan(L,o.w,o.h,o.types).deposits){if(!active.has(d.i)||busy.has(d.i)||protectedAt(L,d.i))continue;g.globalAlpha=o.visible[d.i]?.85:.3;stamp(g,bio,bio==='fungal'?39:bio==='crypt'?31:bio==='mine'?38:35,d.x*32+3,d.y*32,26,18)}g.restore()};
 const oldFocal=R.drawFocal;R.drawFocal=(g,L,d,o)=>{if(!eligible(L))return oldFocal(g,L,d,o);for(let dx=0;dx<3;dx++){const i=d.y*o.w+d.x+dx;if(L.map[i]!==0||L.decal?.[i]||!L.seen[i]||!L.seen[i+o.w])return}if(o.actors.some(a=>a.x>=d.x-1&&a.x<=d.x+3&&a.y>=d.y-1&&a.y<=d.y))return;const rs=R.entries(L,o.w,Math.floor(L.map.length/o.w)),id=Math.max(0,rs.findIndex(r=>r.x===d.x&&r.y===d.y))%5;g.save();g.translate(d.x*32,(d.y+1)*32-48);focal(g,canonical(L.bio),id);g.restore()};
 if(C){const oldEntries=C.entries,oldLights=C.lights;C.entries=(L,...a)=>eligible(L)?[]:oldEntries(L,...a);C.lights=(L,...a)=>eligible(L)?[]:oldLights(L,...a)}
}
const api={kits,canonical,eligible,material,surface,tile,wall,dressing,object,loot,objectCell,layout,focal,install,ready,errors,images,recipes,sources,frame,protectedAt};root.SaltmarrowBiomes=api;
if(typeof module==='object'&&module.exports)module.exports=api;else install();
})(typeof globalThis!=='undefined'?globalThis:this);
