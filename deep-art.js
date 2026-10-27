/* Approved painted room modules + independent gameplay layers. No rejected biome atlas. */
(function(root){'use strict';
const keys=['sewer','fungal','crypt','mine'],images=new Map(),worlds=new WeakMap(),props=new Map(),tiles=new Map(),errors=[];
const eligible=L=>!!L?.deepLayout&&!L.town&&!L.interior,art=L=>L.deepLayout.art;
const sources=Object.fromEntries([...keys,'backgrounds','props'].map(k=>[k,`assets/deep-reset/${k}.webp`]));
let loaded=false,ready=Promise.resolve();if(typeof document!=='undefined')ready=Promise.all(Object.entries(sources).map(([k,url])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images.set(k,im);resolve()};im.onerror=()=>{errors.push('Unable to load '+url);resolve()};im.src=url}))).then(()=>{loaded=images.size===6});
const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
function prop(bio,id){const key=bio+id;if(props.has(key))return props.get(key);const im=images.get('props');if(!im)return null;const row=keys.indexOf(bio)*2+Math.floor(id/8),c=make(64,64),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,id%8*64,row*64,64,64,0,0,64,64);props.set(key,c);return c}
function stamp(g,bio,id,x,y,w,h){const im=prop(bio,id);if(im)g.drawImage(im,Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function floorTile(L,x,y){const bio=art(L),phase=(x&1)+2*(y&1),key=bio+':'+phase;if(tiles.has(key))return tiles.get(key);const im=images.get(bio),c=make(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#54575a';g.fillRect(0,0,32,32);if(im){const fy=bio==='fungal'?7:9;g.drawImage(im,8*32+(x&1)*32,fy*32+(y&1)*32,32,32,0,0,32,32);tiles.set(key,c)}return c}
function buildWorld(L,w,h){if(worlds.has(L))return worlds.get(L);const c=make(w*32,h*32),g=c.getContext('2d'),bio=art(L),bg=images.get('backgrounds'),room=images.get(bio);g.imageSmoothingEnabled=false;g.fillStyle='#07121d';g.fillRect(0,0,c.width,c.height);
 if(bg){const k=keys.indexOf(bio);g.drawImage(bg,k%2*768,Math.floor(k/2)*512,768,512,0,0,c.width,c.height);g.fillStyle='rgba(2,8,15,.45)';g.fillRect(0,0,c.width,c.height)}
 if(room){g.save();g.globalCompositeOperation='lighten';for(const m of L.deepLayout.modules)g.drawImage(room,m.variant%2*768,Math.floor(m.variant/2)*512,768,512,m.x*32,m.y*32,768,512);g.restore();
 // Opaque floor planes stop distant scenery from showing through playable ground.
 const base=L.deepLayout.base||L.map;g.save();g.beginPath();for(const m of L.deepLayout.modules)for(let y=m.y;y<m.y+16;y++)for(let x=m.x;x<m.x+24;x++)if(![0,5,7].includes(base[y*w+x]))g.rect(x*32,y*32,32,32);g.clip();for(const m of L.deepLayout.modules)g.drawImage(room,m.variant%2*768,Math.floor(m.variant/2)*512,768,512,m.x*32,m.y*32,768,512);g.restore()}
 const map=L.deepLayout.base||L.map,bridge=L.deepLayout.bridge;for(let i=0;i<map.length;i++)if(bridge[i]){const x=i%w,y=Math.floor(i/w);g.fillStyle='#0d1a22';g.fillRect(x*32,y*32+8,32,32);g.drawImage(floorTile(L,x,y),x*32,y*32);
 for(const[dx,dy]of[[0,1],[0,-1],[-1,0],[1,0]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h||map[ny*w+nx]!==5)continue;g.fillStyle='#14252e';if(dx)g.fillRect(x*32+(dx>0?29:0),y*32,3,32);else g.fillRect(x*32,y*32+(dy>0?29:0),32,3);g.fillStyle='#85908b';if(dx)g.fillRect(x*32+(dx>0?29:1),y*32,1,32);else g.fillRect(x*32,y*32+(dy>0?29:1),32,1);if((x+y)%3===0){g.fillStyle='#172832';g.fillRect(x*32+(dx>0?27:dx<0?0:13),y*32+(dy>0?24:dy<0?-5:8),5,13)}}}
 if(loaded)worlds.set(L,c);return c}
function ground(g,L,{w,h}){if(!eligible(L))return false;g.save();g.imageSmoothingEnabled=false;g.drawImage(buildWorld(L,w,h),0,0);g.restore();return true}
function memory(L,w){const out=Array.from(L.seen),modules=L.deepLayout.modules;for(let i=0;i<out.length;i++)if(L.map[i]===5)out[i]=1;
 for(const m of modules){let discovered=false;for(let y=m.floorY;y<m.floorY+3&&!discovered;y++)for(let x=3;x<=20;x++)if(L.seen[(m.y+y)*w+m.x+x]){discovered=true;break}if(!discovered)continue;for(let y=m.y;y<m.y+16;y++)for(let x=m.x;x<m.x+24;x++){const i=y*w+x;if(L.map[i]===0)out[i]=2}}return out}
function tile(L,t,x,y,wf,{w=63}={}){if(!eligible(L))return null;const bio=art(L),key='material:'+bio+':'+t+':'+(x&1)+':'+(y&1);if(tiles.has(key))return tiles.get(key);const c=make(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(floorTile(L,x,y),0,0);
 if(t===4){const water=images.get('sewer');if(water){g.save();g.globalAlpha=.76;g.drawImage(water,1100+(x&1)*16,721+(y&1)*4,32,24,0,0,32,32);g.restore()}else{g.fillStyle='rgba(23,58,69,.65)';g.fillRect(0,0,32,32)}}
 if(t===5){g.fillStyle='#07131d';g.fillRect(0,0,32,32)}
 if(t===6){g.fillStyle='#07131d';g.fillRect(3,3,26,26);stamp(g,bio,13,1,1,30,30)}
 if(t===2||t===11){g.fillStyle='#111f28';g.fillRect(4,0,24,32);g.fillStyle='#8a7655';for(let j=6;j<28;j+=5)g.fillRect(j,0,2,32)}
 if(t===3||t===12){g.fillStyle='#14232b';g.fillRect(2,0,3,32);g.fillRect(27,0,3,32)}
 if(t===0||t===7){g.fillStyle='#21333d';g.fillRect(0,0,32,32);g.fillStyle='#4e6067';g.fillRect(0,0,32,2);if(t===7){g.fillStyle='#080f17';for(let j=0;j<8;j++)g.fillRect(13+j%3,j*4,2,4)}}
 if(t===8)stamp(g,bio,12,5,8,24,22);if(t===9)stamp(g,bio,14,1,0,30,32);
 if(t===10){g.strokeStyle='#a4b8b2';g.lineWidth=1;for(const[a,b]of[[2,2],[30,3],[29,30],[3,29]]){g.beginPath();g.moveTo(16,16);g.lineTo(a,b);g.stroke()}g.strokeRect(7,7,18,18)}
 if(t===13){g.fillStyle='#b1aa8d';g.fillRect(6,20,20,2);g.fillRect(10,11,2,16)}if(loaded)tiles.set(key,c);return c}
function changedTile(g,L,x,y,{w}){const i=y*w+x,t=L.map[i],base=L.deepLayout.base?.[i];if(t===base&&[0,1,5].includes(t))return;if(t===5){const bg=images.get('backgrounds'),k=keys.indexOf(art(L)),h=L.map.length/w;g.fillStyle='#07121d';g.fillRect(x*32,y*32,32,32);if(bg){g.drawImage(bg,k%2*768+x/w*768,Math.floor(k/2)*512+y/h*512,768/w,512/h,x*32,y*32,32,32);g.fillStyle='rgba(2,8,15,.45)';g.fillRect(x*32,y*32,32,32)}return}g.drawImage(tile(L,t,x,y,0,{w}),x*32,y*32)}
const human=new Set(['corpse','captive','merchant','rival','dying']),ids={crate:2,barrel:3,keg:3,cart:2,coffin:6,chest:0,lever:8,plever:8,bell:10,lamp:11,brazier:4,support:12,jack:12,shaft:13,sewergrate:13,passage:13,crystal:14,shroom:14,pod:15,shrine:6,statue:12,cabinet:0,urn:3,sack:3,reliquary:6,ritualcandle:4,vaultdoor:12,valve:8,plaque:0,chandelier:11,sluice:12,boulder:12,trap:13,remains:6,charge:2};
function objectCell(o){if(o.type==='coffin')return o.open?7:6;if(o.type==='chest')return o.open||o.searched?1:0;if(o.type==='lever'||o.type==='plever')return o.on?9:8;if(o.type==='brazier'||o.type==='ritualcandle')return o.lit?4:5;return ids[o.type]??2}
function object(g,L,o){if(!eligible(L)||human.has(o.type))return false;const bio=art(L),x=Math.round((o.rx??o.x)*32),y=Math.round((o.ry??o.y)*32),id=objectCell(o),height=[10,11,12].includes(id)?44:30;g.save();g.imageSmoothingEnabled=false;g.fillStyle='rgba(2,7,12,.7)';g.fillRect(x+3,y+28,26,4);if(o.used||o.searched)g.globalAlpha*=.55;stamp(g,bio,id,x+1,y+32-height,30,height);
 if(o.type==='shrine'&&!o.used){stamp(g,bio,11,x+4,y-9,12,31)}if(o.type==='keg'){g.fillStyle='#a9583c';g.fillRect(x+4,y+19,24,3)}
 if(o.type==='charge'){g.fillStyle='#e5b767';g.font='10px monospace';g.fillText(Math.ceil(o.fuse||0),x+4,y+12)}
 if(o.type==='trap'){g.fillStyle=o.armed?'#ddab68':'#5b6568';g.fillRect(x+5,y+25,22,2)}g.restore();return true}
function loot(g,L,it){if(!eligible(L))return false;const x=it.x*32,y=it.y*32;g.save();g.imageSmoothingEnabled=false;if(it.kind==='gear')stamp(g,art(L),0,x+9,y+18,14,12);else{g.fillStyle=it.kind==='gold'?'#d0a65e':'#a6c1b8';g.fillRect(x+12,y+22,10,6);g.fillRect(x+15,y+18,4,4)}g.restore();return true}
function lights(L,w){return L.deepLayout.modules.flatMap(m=>[2,21].map(dx=>({x:(m.x+dx+.5)*32,y:(m.y+m.floorY+.5)*32,i:(m.y+m.floorY)*w+m.x+dx})))}
function install(){const E=root.SaltmarrowEnvironment,R=root.SaltmarrowRooms,C=root.SaltmarrowScenes,U=root.SaltmarrowSurfaces;if(!E||!C||!U)return;
 for(const[api,key]of[[E,'draw'],[E,'drawWall'],[R,'ground'],[R,'drawFocal']]){if(!api)continue;const old=api[key];api[key]=function(g,L,...a){if(!eligible(L))return old.call(this,g,L,...a)}}
 for(const[api,key]of[[C,'entries'],[R,'entries']]){if(!api)continue;const old=api[key];api[key]=(L,...a)=>eligible(L)?[]:old(L,...a)}const oldLights=C.lights;C.lights=(L,w,...a)=>eligible(L)?lights(L,w):oldLights(L,w,...a);
}
const api={eligible,art,ready,errors,images,prop,ground,memory,tile,changedTile,object,loot,objectCell,previewWorld:buildWorld,dressing:(g,L)=>eligible(L),install};root.SaltmarrowDeepArt=api;if(typeof module==='object'&&module.exports)module.exports=api;else install();
})(typeof globalThis!=='undefined'?globalThis:this);
