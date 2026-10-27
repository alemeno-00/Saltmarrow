/* Composed work areas occupy existing wall/building footprints; navigation is untouched. */
(function(root){
'use strict';
const plans=new WeakMap(),images=new Map();
function plan(L,w,h,types,buildings=[]){
 const out=[];
 if(L.town&&!L.interior){const b=buildings.find(b=>b.key==='smith');if(b){
  out.push({kind:'coal',x:b.x,y:b.y+b.h-1,w:2,h:1,depth:b.y+b.h+.01});
  out.push({kind:'quench',x:b.x+b.w-2,y:b.y+b.h-1,w:2,h:1,depth:b.y+b.h+.01});
 }}else if(L.bio==='mine'){
  for(const r of L.rooms||[]){if(r.w<7||r.h<5||r.chapel||r.bell||!['rect','pillar','octa'].includes(r.shape))continue;
   // Find an intact three-tile rear wall, away from authored wall clues and entrances.
   for(let x=r.x;x<=r.x+r.w-3;x++){
    const y=r.y-1;let safe=y>0;
    for(let dx=0;dx<3;dx++){const i=y*w+x+dx;if(L.map[i]!==types.wall||L.decal?.[i]||L.map[i+w]!==types.floor||L.objs?.some(o=>Math.abs(o.x-x-dx)<=1&&Math.abs(o.y-r.y)<=1))safe=false}
    if(!safe)continue;out.push({kind:r.theme==='rails'||r.theme==='storage'?'winch':'station',x,y,w:3,h:1,depth:y+1.02});break;
   }
  }
 }
 return out;
}
const errors=[];
const rectangles={coal:[40,80,750,450],quench:[830,170,700,370],station:[40,600,725,360],winch:[800,610,720,355]};
let ready=Promise.resolve();
if(typeof document!=='undefined')ready=new Promise(resolve=>{
 const atlas=new Image();atlas.onload=()=>{try{
  for(const[kind,[x,y,w,h]]of Object.entries(rectangles)){
   const c=document.createElement('canvas');c.width=kind==='coal'||kind==='quench'?64:96;c.height=Math.min(48,Math.round(c.width*h/w));
   const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(atlas,x,y,w,h,0,0,c.width,c.height);images.set(kind,c);
  }
 }catch(e){errors.push(e.message)}resolve()};atlas.onerror=()=>{errors.push('Unable to load assets/flat/workyards.webp');resolve()};atlas.src='assets/flat/workyards.webp';
});
function image(kind){return images.get(kind)||null}
function entries(L,w,h,types,buildings){let p=plans.get(L);if(!p){p=plan(L,w,h,types,buildings);plans.set(L,p)}return p}
function draw(g,L,d,{w,types,visible,actors=[]}){
 for(let dx=0;dx<d.w;dx++){const i=d.y*w+d.x+dx;if(L.map[i]!==types.wall||L.decal?.[i]||!L.seen?.[i]||(!L.town&&!L.seen?.[i+w]))return}
 // A foreground actor/telegraph never receives a new silhouette on its walkable tile.
 const seen=Array.from({length:d.w},(_,dx)=>visible[d.y*w+d.x+dx]).some(Boolean);
 g.save();g.globalAlpha*=seen?1:.4;
 const img=image(d.kind);if(!img){g.restore();return}g.drawImage(img,d.x*32,(d.y+1)*32-img.height);g.restore();
}
function lights(L,w,h,types,buildings){return entries(L,w,h,types,buildings).filter(d=>d.kind==='station'&&Array.from({length:d.w},(_,dx)=>{const i=d.y*w+d.x+dx;return L.map[i]===types.wall&&!L.decal?.[i]&&L.seen?.[i]&&L.seen?.[i+w]}).every(Boolean)).map(d=>({x:(d.x+.3)*32,y:(d.y+1.3)*32,i:(d.y+1)*w+d.x}))}
const api={plan,entries,draw,image,ready,errors,rectangles,lights};root.SaltmarrowScenes=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
