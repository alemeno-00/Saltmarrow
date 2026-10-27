/* Packed, transparent sprite frames. Every pose is authored in the source atlas. */
(function(root){
 'use strict';
 const ids=['ashenPenitent','censerWitch','reliquaryKeeper','hollowCantor','facelessSaint'];
 const atlases=[...ids,'facelessSaint2','facelessSaint3'];
 const states=['idle','move','attack','hurt','death'];
 const frames={},ready=[];
 if(typeof Image!=='undefined')for(const id of atlases){
  const img=new Image();ready.push(new Promise((resolve,reject)=>{img.onload=()=>{frames[id]=states.map((_,r)=>Array.from({length:4},(_,c)=>{const cv=document.createElement('canvas');cv.width=cv.height=128;cv.getContext('2d').drawImage(img,c*128,r*128,128,128,0,0,128,128);return cv}));resolve()};img.onerror=()=>reject(Error('Missing Hollow Faith atlas: '+id))}));img.src='assets/hollow-faith/'+id+'.png';
 }
 function frame(e,now,reduced){const phase=e.type==='facelessSaint'?(e.dead?e.hollowPhase||1:Math.max(e.hollowPhase||1,e.stam<=e.max/3?3:e.stam<=e.max*2/3?2:1)):1;
  const key=e.type==='facelessSaint'&&phase>1?e.type+phase:e.type;
  const atlas=frames[key];if(!atlas)return null;let row=0,t=now+(Number(e.id)||0)*71;
  if(e.dead){row=4;t=Math.max(0,now-(e.hollowDeathAt??now));return atlas[row][reduced?3:Math.min(3,Math.floor(t/160))]}
  if(!reduced&&e.hitT&&now-e.hitT<320){row=3;t=now-e.hitT}
  else if(e.hollowChant||e.hollowMark){row=2;t=now}
  else if(!reduced&&e.attackT&&now-e.attackT<480){row=2;t=now-e.attackT}
  else if(!reduced&&e.rx!=null&&(Math.abs(e.rx-e.x)>.035||Math.abs(e.ry-e.y)>.035))row=1;
  return atlas[row][reduced?0:Math.floor(t/(row===0?280:120))%4];
 }
 root.SaltmarrowHollowSprites={ids,atlases,states,frames,ready:Promise.all(ready),frame};
})(globalThis);
