/* Native-pixel directional atlases compiled from the approved Drowned concept. */
(function(root){
'use strict';
const TYPES=['saltleecher','mariner','bellbound','brinewraith','admiral'];
function direction(e){const sx=(e.fx||0)-(e.fy||0),sy=(e.fx||0)+(e.fy||0);return sy>=0?(sx>=0?0:3):(sx>=0?1:2)}
function pose(e,now,reduced){if(reduced)return 0;if(e.attackT!=null&&now-e.attackT>=0&&now-e.attackT<400)return 3;const moving=e.rx!=null&&(Math.abs(e.x-e.rx)>.035||Math.abs(e.y-e.ry)>.035);return moving?1+Math.floor(now/140)%2:0}
function create(doc,onready){const atlases={},errors=[];
 const ready=Promise.all(TYPES.map(type=>new Promise(resolve=>{const img=new Image();img.onload=()=>{const size=img.width/4;if(img.height!==img.width||size!==Math.floor(size)){errors.push(type+': invalid atlas');resolve();return}const frames=[],hurt=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++){const cv=doc.createElement('canvas');cv.width=cv.height=size;const cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(img,c*size,r*size,size,size,0,0,size,size);frames.push(cv);const h=doc.createElement('canvas');h.width=h.height=size;const hx=h.getContext('2d');hx.drawImage(cv,0,0);hx.globalCompositeOperation='source-atop';hx.fillStyle='rgba(238,209,182,.45)';hx.fillRect(0,0,size,size);hurt.push(h)}atlases[type]={frames,hurt,size};onready?.(type,frames[0]);resolve()};img.onerror=()=>{errors.push(type+': failed to load');resolve()};img.src='assets/drowned/'+type+'.png'})));
 function frame(e,now,reduced){const a=atlases[e.type];if(!a)return null;const index=direction(e)*4+pose(e,now,reduced),hit=!reduced&&e.hitT!=null&&now-e.hitT>=0&&now-e.hitT<170;return(hit?a.hurt:a.frames)[index]}
 return{frame,ready,errors,atlases};
}
root.SaltmarrowDrownedSprites={TYPES,direction,pose,create};
})(typeof globalThis==='undefined'?window:globalThis);
