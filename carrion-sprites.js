(function(root){'use strict';
const ids=['marrowgnaw','bloatcarrier','sinewStalker','broodShepherd','carrionMatriarch'];
const frames={},pending=[];
if(typeof Image!=='undefined')for(const id of [...ids,'broodEgg','broodParasite','carrionMatriarch-phase2','carrionMatriarch-phase3']){const im=new Image();pending.push(new Promise((resolve,reject)=>{im.onload=()=>{frames[id]=Array.from({length:5},(_,r)=>Array.from({length:4},(_,c)=>{const cv=document.createElement('canvas');cv.width=cv.height=80;cv.getContext('2d').drawImage(im,c*80,r*80,80,80,0,0,80,80);return cv}));resolve()};im.onerror=()=>reject(Error('Carrion atlas unavailable: '+id))}));im.src='assets/carrion-brood/'+id+'.png';}
function frame(e,now,reduced){const phase=e.type==='carrionMatriarch'?SaltmarrowCarrion.phase(e):1;const rows=frames[e.type+(phase>1?'-phase'+phase:'')];if(!rows)return null;let r=0,t=now+(Number(e.id)||0)*79;
 if(e.dead)return rows[4][reduced?3:Math.min(3,Math.floor((now-e.broodDeathAt)/160))];
 if(e.hitT&&now-e.hitT<320){r=3;t=now-e.hitT}else if(e.broodMark||e.broodEgg){r=2}else if(e.attackT&&now-e.attackT<480){r=2;t=now-e.attackT}else if(e.rx!=null&&(Math.abs(e.rx-e.x)>.035||Math.abs(e.ry-e.y)>.035))r=1;
 return rows[r][reduced?0:Math.floor(t/(r===0?260:120))%4];}
root.SaltmarrowCarrionSprites={ids,frames,ready:Promise.all(pending),frame};
})(globalThis);
