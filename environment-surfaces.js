/* Native 32px surface kit: spatial materials, not independent noisy tile variants. */
(function(root){
'use strict';
const hash=(x,y,s=0)=>{let n=Math.imul(x+17,374761393)^Math.imul(y+31,668265263)^s;n=Math.imul(n^(n>>>13),1274126177);return(n^(n>>>16))>>>0};
const cache=new Map(),fields=new WeakMap();
function district(x,y,buildings){
 if(y>=15&&y<=18)return 'road';
 for(const b of buildings){if(x>=b.x-1&&x<=b.x+b.w&&y>=b.y+b.h&&y<=b.y+b.h+2){if(Math.abs(x-b.dx)<=1)return 'paving';return b.key==='smith'?'cinders':b.key==='chapel'?'grass':'earth'}}
 if(x>=29&&x<=37&&y<=13)return 'grass';
 if(y===14||y===19)return 'verge';
 return y>=26||x<=8||x>=53?'grass':'earth';
}
function material(L,x,y,w,buildings=[]){
 if(L.interior)return null;
 if(L.town)return district(x,y,buildings);
 if(L.bio!=='mine')return null;
 const r=(L.rooms||[]).find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
 const n=hash(Math.floor(x/3),Math.floor(y/3),31)%7;
 if(r){const edge=Math.min(x-r.x,r.x+r.w-1-x,y-r.y,r.y+r.h-1-y);if(edge===0)return 'scree';if(r.theme==='rails'||r.theme==='storage'||r.theme==='camp')return 'workfloor';}
 return n<2?'bedrock':n===2?'scree':'mine-earth';
}
function tile(kind,v=0,edges=0){
 const key=kind+':'+v+':'+edges;if(cache.has(key))return cache.get(key);
 const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 const rand=(x,y)=>hash(x,y,v*91+kind.length*57);
 const earth=['earth','verge','cinders','mine-earth','workfloor','scree'].includes(kind);
 const base=kind==='grass'?'#25332c':kind==='bedrock'?'#343a3a':kind==='road'?'#48463c':kind==='paving'?'#41443f':kind==='cinders'?'#302d2b':kind==='workfloor'?'#3c362e':kind==='mine-earth'?'#393832':kind==='scree'?'#343633':'#3b3a30';
 r(0,0,32,32,base);
 if(kind==='road'||kind==='paving'){
  // Uneven small stones, with broad worn wheel tracks across the street.
  for(let y=0;y<32;y+=7)for(let x=-8;x<32;x+=11){const dx=x+(Math.floor(y/7)%2?5:0),n=rand(x,y);const cols=kind==='road'?['#505044','#555448','#46483f']:['#50544b','#494e47','#5a5b50'];r(dx+1,y+1,9,5,cols[n%3]);r(dx+2,y+1,6,1,'#626354');if(n%4===0)r(dx+7,y+4,2,1,base)}
  if(kind==='road')r(2+v*3,14,11,2,'#555347')
 }else if(kind==='bedrock'){
  // Large irregular plates, offset from tile boundaries, with fractures rather than brick mortar.
  const stones=[[0,0,19,12],[21,0,11,18],[0,14,13,18],[15,14,17,18]];
  for(let j=0;j<stones.length;j++){const[x,y,w,h]=stones[(j+v)%stones.length];r(x,y,w,h,['#414746','#3b4241','#454b48'][j%3]);r(x+2,y,w-4,1,'#5a6055');r(x+w-2,y+3,2,h-3,'#2c3433');r(x+4,y+4,6,1,'#4a514b')}
  r(12+v,5,1,12,'#252e2d');r(13+v,15,5,1,'#252e2d');
 }else{
  // Broad dirt/vegetation shapes. All rectangles use native integer pixels.
  for(let j=0;j<4;j++){const n=rand(j,7),x=n%22,y=(n>>>5)%25;const colors=kind==='grass'?['#2d3d30','#334333','#29392d']:kind==='cinders'?['#25292a','#393a33','#424137']:['#444438','#424034','#33372f'];r(x,y,8+n%5,3+n%3,colors[j%3]);r(x+2,y+3,6,1,colors[(j+1)%3])}
  if(kind==='grass')for(let j=0;j<9;j++){const n=rand(j,12),x=n%30,y=(n>>>5)%28;r(x,y,1,3,'#526047');r(x+1,y+1,1,2,'#3f513c')}
  if(earth)for(let j=0;j<(kind==='scree'?4:1);j++){const n=rand(j,3),x=n%27,y=(n>>>5)%28;r(x,y,4+n%4,2,'#4d5042');r(x,y,3,1,'#63624e');r(x+1,y+2,4,1,'#2b332f')}
  if(kind==='verge'){r(0,5,32,3,'#222e2c');r(0,4,32,1,'#6c6b56');for(let j=0;j<4;j++)r(j*8,2,6,2,'#53594a');r(3+v*2,17,18,3,'#263b3e');r(5+v*2,17,12,1,'#516260')}
  if(kind==='workfloor'){r(0,10,32,2,'#30322e');r(0,24,32,1,'#4a483b')}
 }
 // Feather material boundaries in irregular two-pixel steps rather than square patches.
 if(edges)for(let k=0;k<16;k++){const len=2+hash(k,v,17)%5;const col=kind==='grass'?'#384235':'#414338';if(edges&1)r(k*2,0,2,len,col);if(edges&2)r(32-len,k*2,len,2,col);if(edges&4)r(k*2,32-len,2,len,col);if(edges&8)r(0,k*2,len,2,col)}
 cache.set(key,c);return c;
}
function get(L,t,x,y,{w,types,buildings=[]}){
 if(t!==types.floor||L.interior||L.bld?.[y*w+x])return null;
 let field=fields.get(L);if(!field){field=Array.from({length:L.map.length},(_,i)=>material(L,i%w,Math.floor(i/w),w,buildings));fields.set(L,field)}
 const kind=field[y*w+x];if(!kind)return null;
 let edges=0;for(const[dx,dy,bit]of[[0,-1,1],[1,0,2],[0,1,4],[-1,0,8]])if(L.map[(y+dy)*w+x+dx]===types.floor&&field[(y+dy)*w+x+dx]!==kind)edges|=bit;
 return tile(kind,hash(x,y,13)%8,edges);
}
function wall(g,L,x,y,front,w){
 if(L.bio!=='mine'||L.map[y*w+x]!==0)return false;
 const exposed=front||L.map[(y+1)*w+x]===1||L.map[y*w+x-1]===1||L.map[y*w+x+1]===1;
 if(!exposed){g.fillStyle='#152322';g.fillRect(x*32,y*32,32,32);const n=hash(Math.floor(x/2),Math.floor(y/2),91);g.fillStyle='#1c2b28';g.fillRect(x*32,y*32+4+n%9,32,11);return true;}
 const xx=x*32,base=(y+1)*32,hh=front?12:54,n=hash(x,y,71),top=base-hh;
 g.save();const r=(a,b,c,d,col)=>{g.fillStyle=col;g.fillRect(xx+a,top+b,c,d)};
 r(0,0,32,hh,'#27342f');r(0,2,32,hh-2,'#3a4237');
 if(!front){r(0,0,7,5,'#3d4840');r(7,2,12,5,'#455047');r(19,0,13,4,'#3b463f');r(2,5,11,1,'#69705a');r(17,4,12,1,'#59644e');
  for(let j=0;j<3;j++){const yy=10+j*13+(n>>>j)%7,xx=2+(n>>>(j+3))%8;r(xx,yy,25-xx,2,'#29372f');r(xx+2,yy+2,18-xx,4,'#454b3d');for(let k=0;k<4;k++)r(xx+5+k,yy-5+k*3,2,3,'#26342e')}
 }else r(2,2,27,2,'#66705a');
 r(0,hh-5,32,5,'#172729');r(3,hh-7,23,2,'#283731');g.restore();return true;
}
const api={district,material,tile,get,wall,cacheSize:()=>cache.size};root.SaltmarrowSurfaces=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
