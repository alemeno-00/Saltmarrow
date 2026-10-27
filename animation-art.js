/* Native pixel poses and death frames. Never changes simulation state or timing. */
(function(root){
'use strict';
const keys=['rat','cultist','wraith','ghoul','shambler'];
function sample(e,now,reduced){
 if(reduced)return {state:'idle',column:0};
 const hit=now-(e.hitT??-Infinity);if(hit>=0&&hit<170)return {state:'hurt',column:5};
 const action=e.pixelAction||(e.cast?{t0:e.cast.t0,dur:e.cast.dur}:e.attackT!=null?{t0:e.attackT,dur:480}:e.lunge?{t0:e.lunge.t0,dur:480}:null);
 if(action){const clock=now-Math.min(action.hold||0,Math.max(0,now-(action.impact??now)));const t=(clock-action.t0)/Math.max(1,action.dur);if(action.impact!=null&&now>=action.t0&&now<action.end)return {state:now<(action.windupEnd??action.impact)?'windup':now<action.impact+(action.hold||0)?'strike':'recover',column:now<(action.windupEnd??action.impact)?2:now<action.impact+(action.hold||0)?3:4};if(t>=0&&t<1)return {state:t<.28?'windup':t<.72?'strike':'recover',column:t<.28?2:t<.72?3:4}}
 if(Math.abs((e.rx??e.x)-e.x)+Math.abs((e.ry??e.y)-e.y)>.035)return {state:'walk',column:e.walkCycle!=null?e.walkCycle%2:Math.floor((now+(Number(e.id)||0)*71)/115)%2};
 return {state:'idle',column:0};
}
function deathIndex(elapsed,reduced){return reduced?5:Math.max(0,Math.min(5,Math.floor(elapsed/130)))}
const api={sample,deathIndex,duration:780};
if(typeof module==='object'&&module.exports)module.exports=api;
root.SaltmarrowAnimations=api;
if(typeof document==='undefined'||!root.SaltmarrowArt)return;
const A=root.SaltmarrowArt,baseReady=A.ready,baseFrame=A.frameAsset,actions={},deaths={},corpses={};
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const load=url=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{A.errors.push('Unable to load '+url);resolve(null)};im.src=url});
function sources(im,cols,rows){
 const sheet=canvas(im.width,im.height),sg=sheet.getContext('2d');sg.drawImage(im,0,0);const alpha=sg.getImageData(0,0,im.width,im.height).data;
 function cuts(n,size,score){const out=[0];for(let i=1;i<n;i++){const center=i*size/n,r=size/n*.25;let best=Math.round(center),cost=Infinity;for(let v=Math.ceil(center-r);v<=Math.floor(center+r);v++){const sum=score(v-1)+score(v)+score(v+1)+Math.abs(v-center)*.001;if(sum<cost){cost=sum;best=v}}out.push(best)}out.push(size);return out}
 const xs=cuts(cols,im.width,x=>{let n=0;for(let y=0;y<im.height;y++)if(alpha[(y*im.width+x)*4+3]>96)n++;return n});
 const bands=[];let start=-1,last=-1;for(let y=0;y<im.height;y++){let n=0;for(let x=0;x<im.width;x++)if(alpha[(y*im.width+x)*4+3]>96)n++;if(n>12){if(start<0)start=y;last=y}else if(start>=0&&y-last>6){if(last-start>im.height/rows*.12)bands.push([start,last]);start=-1}}if(start>=0)bands.push([start,last]);
 const bandCuts=bands.length===rows?[0,...bands.slice(1).map((b,i)=>Math.round((bands[i][1]+b[0])/2)),im.height]:null;
 const ys=Array.from({length:cols},(_,col)=>bandCuts||cuts(rows,im.height,y=>{let n=0;for(let x=xs[col];x<xs[col+1];x++)if(alpha[(y*im.width+x)*4+3]>96)n++;return n}));
 return Array.from({length:rows},(_,row)=>Array.from({length:cols},(_,col)=>{
 const left=xs[col],top=ys[col][row],w=xs[col+1]-left,h=ys[col][row+1]-top,c=canvas(w,h),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,left,top,w,h,0,0,w,h);
 const d=g.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>64){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
 if(x1<x0){A.errors.push('Empty animation cell '+row+','+col);return c}const out=canvas(x1-x0+1,y1-y0+1);out.getContext('2d').drawImage(c,x0,y0,out.width,out.height,0,0,out.width,out.height);return out;
 }))
}
function pose(source,factor,directional=false){const c=canvas(96,64),g=c.getContext('2d');g.imageSmoothingEnabled=false;const w=Math.round(source.width*factor),h=Math.round(source.height*factor);g.drawImage(source,Math.round((96-w)/2),64-h,w,h);return {image:c,source,white:null,directional,posed:true}}
function rows(im,cols,n,height=48,directional=false){return sources(im,cols,n).map(row=>{const factor=height/Math.max(row[0].height,row[1].height);return row.map(s=>pose(s,factor,directional))})}
A.ready=Promise.all([baseReady,
 load('assets/flat/actions.webp').then(im=>{if(im)rows(im,6,5).forEach((r,i)=>actions[keys[i]]=r)}),
 load('assets/flat/deaths.webp').then(im=>{if(im)rows(im,6,5).forEach((r,i)=>deaths[keys[i]]=r)}),
 load('assets/flat/hero-actions.webp').then(im=>{if(im)rows(im,6,4).forEach((r,i)=>actions[['shadow','storm','flag','occult'][i]]=r)}),
 load('assets/flat/miner-actions.webp').then(im=>{if(im)actions.riptide=rows(im,6,4,48,true)}),
 load('assets/flat/corpses.webp').then(im=>{if(!im)return;const names=A.specs.actors.keys.slice(16),cells=sources(im,8,4).flat();names.forEach((key,i)=>{const s=cells[i],height=A.actorHeight(key),width=['ghoul','shambler','horror','saint'].includes(key)?58:Math.max(30,height);corpses[key]=pose(s,width/s.width)})})
]).then(()=>A);
A.frameAsset=(key,e,now,reduced)=>{const state=sample(e,now,reduced);if(state.state!=='idle'&&actions[key]){if(key==='riptide'){const row=Math.abs(e.fy||0)>Math.abs(e.fx||0)?(e.fy<0?0:2):(e.fx<0?3:1);return actions[key][row][state.column]}return actions[key][state.column]}return baseFrame(key,e,now,reduced)};
const alias=key=>({mariner:'sailor',brinewraith:'wraith',admiral:'abbot'}[key]||key);
A.corpseAsset=key=>deaths[key]?.[5]||corpses[alias(key)]||null;
A.deathAsset=(key,elapsed,reduced)=>deaths[key]?.[deathIndex(elapsed,reduced)]||A.corpseAsset(key);
A.actionCounts=()=>({actions:Object.values(actions).reduce((n,r)=>n+(Array.isArray(r[0])?r.flat().length:r.length),0),deaths:Object.values(deaths).reduce((n,r)=>n+r.length,0),corpses:Object.keys(corpses).length});
A.deathFragments=(key,e,now)=>{const asset=A.frameAsset(key,e,now,false)||A.actor(key);if(!asset)return null;if(asset.fragments)return asset.fragments;
 const im=asset.image,g=im.getContext('2d'),d=g.getImageData(0,0,im.width,im.height).data,parts=[];
 for(let y=0;y<im.height;y+=8)for(let x=0;x<im.width;x+=8){let n=0;for(let yy=y;yy<Math.min(y+8,im.height);yy++)for(let xx=x;xx<Math.min(x+8,im.width);xx++)if(d[(yy*im.width+xx)*4+3]>96)n++;if(n<9)continue;const c=canvas(8,8);c.getContext('2d').drawImage(im,x,y,8,8,0,0,8,8);parts.push(c)}
 return asset.fragments=parts.slice(0,24);
};
})(typeof globalThis!=='undefined'?globalThis:this);
