/* Full-body miner poses. Owns baked-maul bodies only; other equipment keeps its renderer.
 * Contact clock comes from WEAPON_ACTIONS: t0, impact, hold, end, resolved.
 * No damage, movement costs, action spending or turn changes occur in this module.
 */
(function(root){
'use strict';
function sample(e,now,reduced,action){
 const facing=Math.abs(e.fy||0)>Math.abs(e.fx||0)?e.fy<0?'north':'south':e.fx<0?'west':'east';
 if(reduced)return{kind:'idle',frame:0,facing};
 if(action&&now>=action.t0&&(now<action.end||action.resolved===false)){
  const clock=action.resolved===false?Math.min(now,action.impact-.01):now;
  const lead=Math.max(1,action.impact-action.t0),hold=action.hold||0;
  const frame=clock<action.impact?Math.min(4,Math.floor((clock-action.t0)/lead*5)):clock<action.impact+hold?5:Math.min(7,6+Math.floor((clock-action.impact-hold)/Math.max(1,action.end-action.impact-hold)*2));
  return{kind:'attack',frame,facing};
 }
 const moving=Math.abs((e.rx??e.x)-e.x)+Math.abs((e.ry??e.y)-e.y)>.01;
 if(moving){const progress=e.walkStart!=null?Math.max(0,Math.min(1,(now-e.walkStart)/Math.max(1,e.walkDuration))):(now%290)/145;
  const cycle=((e.walkCycle||1)-1)*.5+progress*.5;return{kind:'walk',frame:Math.floor(cycle*8)%8,facing};}
 return{kind:'idle',frame:0,facing};
}
const api={sample,url:'assets/flat/miner-body-packed-v1.png'};
if(typeof module==='object'&&module.exports)module.exports=api;root.SaltmarrowMinerBody=api;
if(typeof document==='undefined'||!root.SaltmarrowArt)return;
const A=root.SaltmarrowArt,walk=[],attack=[];let loaded=false;
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function pack(im){
 const cw=112,ch=96;if(im.width!==cw*8||im.height!==ch*4)throw Error('Invalid full-body atlas dimensions');
 for(let row=0;row<4;row++)for(let col=0;col<8;col++){
  const c=canvas(cw,ch),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,col*cw,row*ch,cw,ch,0,0,cw,ch);
  const asset={image:c,source:c,white:null,directional:true,posed:true,fullBody:true,groundOffsetY:8,integratedWeapon:'maul',bodyFrame:col,bodyKind:row<2?'walk':'attack'};
  const list=row<2?walk:attack;if(!list[col])list[col]={};list[col][row%2?'west':'east']=asset;
 }
 loaded=true;
}
const before=A.ready;
A.ready=Promise.all([before,new Promise(resolve=>{const im=new Image();im.onload=()=>{try{pack(im)}catch(err){A.errors.push('Full-body poses: '+err.message)}resolve()};im.onerror=()=>{A.errors.push('Unable to load '+api.url);resolve()};im.src=api.url})]).then(()=>A);
A.fullBodyAsset=function(key,e,now,reduced,base,action){
 if(key!=='riptide'||base!=='maul')return null;
 const active=action&&now>=action.t0&&(now<action.end||action.resolved===false);
 if(active){const family=action.profile?.bodyFamily;if(family&&family!=='heavy'||!family&&!['smash','slam','uppercut','cavein'].includes(action.style))return null;}
 const state=sample(e,now,reduced,action);
 if(loaded&&(state.facing==='east'||state.facing==='west')){
  const list=state.kind==='walk'?walk:attack,index=state.kind==='idle'?0:state.frame;
  return list[index][state.facing];
 }
 // North/south keep the existing authored torso/leg/arm poses with their baked maul.
 const asset=A.frameAsset(key,e,now,reduced)||A.actor(key);return asset?{...asset,fullBody:true,integratedWeapon:'maul'}:null;
};
A.fullBodyCounts=()=>({walk:loaded?8:0,attack:loaded?8:0,directions:loaded?2:0});
})(typeof globalThis!=='undefined'?globalThis:this);
