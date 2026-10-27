/* Room identity, edge banks and clear aisles. Generation only; no new loot or hazards. */
(function(root){
'use strict';
const VERSION=1,images=new Map(),errors=[];
const names={loading:'Loading bay',burial:'Burial chamber',nest:'Fungal nest',pump:'Pump room'};
const movable={loading:new Set(['crate','barrel','keg','cart']),burial:new Set(['coffin','statue']),nest:new Set(['shroom','pod']),pump:new Set(['crate','barrel'])};
function kindOf(L,r){if(L.town||L.tutorial||r.chapel||r.bell||r.vault||r.w<7||r.h<5||['chasm','shrine','crystals'].includes(r.theme))return null;return({mine:'loading',crypt:'burial',abbey:'burial',fungal:'nest',drowned:'pump',sewer:'pump'})[L.bio]||null}
function aisle(r,x,y){return Math.abs(x-r.cx)<=1||y===r.cy}
function reach(L,w,h,start,blockedTypes){
 const d=new Int32Array(w*h).fill(-1),blocked=new Set((L.objs||[]).filter(o=>blockedTypes.has(o.type)).map(o=>o.y*w+o.x)),q=[start.y*w+start.x];d[q[0]]=0;
 for(let k=0;k<q.length;k++){const i=q[k],x=i%w,y=Math.floor(i/w);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy,j=yy*w+xx;if(xx<0||yy<0||xx>=w||yy>=h||d[j]>=0||blocked.has(j)||[0,5,7].includes(L.map[j]))continue;d[j]=d[i]+1;q.push(j)}}return d;
}
function accessible(d,w,h,o){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const x=o.x+dx,y=o.y+dy;if(x>=0&&y>=0&&x<w&&y<h&&d[y*w+x]>=0)return true}return false}
function focal(L,r,w,h){
 const options=[];for(let y=Math.max(1,r.y-1);y<r.y+r.h-1;y++)for(let x=r.x;x<=r.x+r.w-3;x++){
  let safe=true;for(let dx=0;dx<3;dx++){const i=y*w+x+dx;if(L.map[i]!==0||L.decal?.[i]||L.map[i+w]!==1||L.secrets?.some(s=>s.face===i)||L.objs?.some(o=>o.x===x+dx&&o.y===y))safe=false}
  if(safe)options.push({x,y,w:3,depth:y+1.03});
 }options.sort((a,b)=>Math.abs(a.x+1-r.cx)+Math.abs(a.y-r.y+1)*3-Math.abs(b.x+1-r.cx)-Math.abs(b.y-r.y+1)*3||a.x-b.x);return options[0]||null;
}
function describe(L,w,h){return(L.rooms||[]).map((r,id)=>{const kind=kindOf(L,r);return kind?{id,kind,name:names[kind],x:r.x,y:r.y,w:r.w,h:r.h,cx:r.cx,cy:r.cy,focal:focal(L,r,w,h),moved:[]}:null}).filter(Boolean)}
function apply(L,w,h,{hero,blocked=[]}){
 if(L.town||L.tutorial)return null;if(L.roomComposition?.version===VERSION)return L.roomComposition;
 const blockedTypes=new Set(blocked),base=reach(L,w,h,hero,blockedTypes),required=new Set((L.objs||[]).filter(o=>accessible(base,w,h,o)).map(o=>o.id));
 const rooms=describe(L,w,h),protect=new Set([hero,...(L.mons||[]),...(L.npcs||[]),...(L.items||[]),...(L.traps||[])].map(o=>o.y*w+o.x));
 const nearProtected=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(protect.has((y+dy)*w+x+dx))return true;return false};
 for(const r of rooms){
  const list=(L.objs||[]).filter(o=>o.x>=r.x&&o.x<r.x+r.w&&o.y>=r.y&&o.y<r.y+r.h&&movable[r.kind].has(o.type)&&!o.puz&&!o.key&&o.note==null&&!o.who&&!o.uniq&&!o.fuse&&!o.trap).slice(0,6);
  for(let k=0;k<list.length;k++){const o=list[k];if(o.type==='cart'&&L.decal?.[o.y*w+o.x]===7)continue;
   const tx=k%2?r.x+r.w-2:r.x+1,ty=r.kind==='pump'?r.y+r.h-2:r.y+1+Math.floor(k/2),candidates=[];
   for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
    const i=y*w+x;if(L.map[i]!==1||L.decal?.[i]||L.weak?.[i]||L.gas?.[i]||L.oil?.[i]||aisle(r,x,y)||nearProtected(x,y)||L.objs.some(q=>q!==o&&q.x===x&&q.y===y))continue;
    if(r.focal&&y===r.focal.y+1&&x>=r.focal.x&&x<r.focal.x+3)continue;
    let nearSpecial=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=L.map[(y+dy)*w+x+dx];if(t!==0&&t!==1)nearSpecial=true}if(nearSpecial)continue;
    candidates.push({x,y,score:Math.abs(tx-x)+Math.abs(ty-y)});
   }candidates.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);
   const old={x:o.x,y:o.y};for(const at of candidates.slice(0,12)){if(at.x===old.x&&at.y===old.y)break;o.x=at.x;o.y=at.y;
    const d=reach(L,w,h,hero,blockedTypes),occupied=new Set(L.objs.filter(q=>blockedTypes.has(q.type)).map(q=>q.y*w+q.x));let safe=true;
    for(let i=0;i<base.length;i++)if(base[i]>=0&&!occupied.has(i)&&d[i]<0){safe=false;break}
    if(safe)for(const q of L.objs)if(required.has(q.id)&&!accessible(d,w,h,q)){safe=false;break}
    if(safe){if(o.rx!=null)o.rx=o.x;if(o.ry!=null)o.ry=o.y;r.moved.push({id:o.id,from:old,to:{x:o.x,y:o.y}});break}o.x=old.x;o.y=old.y;
   }
  }
 }
 return L.roomComposition={version:VERSION,rooms};
}
let ready=Promise.resolve();
if(typeof document!=='undefined')ready=new Promise(resolve=>{const atlas=new Image();atlas.onload=()=>{try{
 for(const[kind,id]of Object.keys(names).map((k,i)=>[k,i])){const cw=atlas.width/2,ch=atlas.height/2,raw=document.createElement('canvas');raw.width=cw;raw.height=ch;const rg=raw.getContext('2d');rg.drawImage(atlas,id%2*cw,Math.floor(id/2)*ch,cw,ch,0,0,cw,ch);const pixels=rg.getImageData(0,0,cw,ch).data;let x0=cw,y0=ch,x1=0,y1=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[(y*cw+x)*4+3]>100){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
  const c=document.createElement('canvas');c.width=96;c.height=48;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(raw,x0,y0,x1-x0+1,y1-y0+1,0,0,96,48);images.set(kind,c);
 }
 }catch(e){errors.push(e.message)}resolve()};atlas.onerror=()=>{errors.push('Unable to load assets/flat/room-focals.webp');resolve()};atlas.src='assets/flat/room-focals.webp'});
function compositions(L,w,h){return L.town||L.tutorial?[]:L.roomComposition?.rooms||describe(L,w,h)}
function entries(L,w,h){return compositions(L,w,h).filter(r=>r.focal).map(r=>({...r.focal,kind:r.kind,room:r.id}))}
function drawFocal(g,L,d,{w,actors=[]}){if(actors.some(a=>a.x>=d.x-1&&a.x<=d.x+3&&a.y>=d.y-1&&a.y<=d.y))return;for(let dx=0;dx<3;dx++){const i=d.y*w+d.x+dx;if(L.map[i]!==0||L.decal?.[i]||!L.seen[i]||!L.seen[i+w])return}const im=images.get(d.kind);if(!im)return;g.save();g.drawImage(im,d.x*32,(d.y+1)*32-48);g.restore()}
function ground(g,L,tiles,{w,h,actors=[],visible}){
 if(L.town||L.tutorial)return;const rs=compositions(L,w,h),busy=new Set([...actors,...L.objs,...L.items,...(L.traps||[])].map(o=>o.y*w+o.x));g.save();
 const r=(x,y,a,b,col)=>{g.fillStyle=col;g.fillRect(x,y,a,b)};
 for(const{x,y,i}of tiles){if(L.map[i]!==1||L.decal?.[i]||L.weak?.[i]||L.fire?.[i]||L.spore?.[i]||L.smoke?.[i]||busy.has(i))continue;const c=rs.find(c=>x>=c.x&&x<c.x+c.w&&y>=c.y&&y<c.y+c.h);if(!c)continue;g.globalAlpha=visible[i]?.28:.1;const xx=x*32,yy=y*32,bank=!aisle(c,x,y);
  if(c.kind==='loading'){if(!bank){r(xx+4,yy+21,24,2,'#8b7b57');r(xx+8,yy+23,14,1,'#4c513d')}else{r(xx+3,yy+7,23,3,'#222e2d');r(xx+5,yy+11,19,1,'#665b42')}}
  else if(c.kind==='burial'){if(bank){r(xx+3,yy+5,24,3,'#1c2c30');r(xx+5,yy+8,20,1,'#86806a')}else{r(xx+7,yy+4,18,1,'#9a947c');r(xx+7,yy+5,1,20,'#555e54');r(xx+24,yy+7,1,17,'#555e54')}}
  else if(c.kind==='nest'&&bank){for(let j=0;j<4;j++){r(xx+2+j*6,yy+7+j%2*3,7,2,'#6c815b');r(xx+4+j*6,yy+10+j%2*3,2,5,'#3b634f')}}
  else if(c.kind==='pump'){if(bank){r(xx+2,yy+4,28,3,'#1e3e43');r(xx+6,yy+7,20,1,'#69847c')}else if(y%2===0){for(let j=0;j<5;j++)r(xx+7+j*4,yy+9,2,13,'#617876')}}
 }g.restore();
}
const api={VERSION,names,kindOf,aisle,describe,apply,reach,accessible,entries,drawFocal,ground,ready,errors,images};root.SaltmarrowRooms=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
