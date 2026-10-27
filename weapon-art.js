/* Native-pixel equipment and authored ability hand tracks. Presentation only. */
(function(root){
'use strict';
const profiles={};
// id, VFX, windup ms, recovery ms, anticipation [x,y,angle], contact, follow-through.
const rows=[
['undertow','smash',380,430,[-5,-12,-2.8],[12,5,.6],[7,8,1.1]],
['gaff','hook',330,490,[3,-3,-.6],[17,-2,0],[-5,3,-1.7]],
['breakwater','spin',400,500,[-8,0,-3],[15,0,3.1],[-4,4,5.5]],
['redtide','uppercut',460,540,[-4,12,1.9],[10,-14,-1.5],[4,-10,-2]],
['ironwake','smash',490,580,[-9,-9,-3.1],[16,7,.8],[12,10,1.3]],
['gutter','slash',270,330,[-4,-2,-2.2],[10,1,.3],[7,4,.8]],
['fishhook','dart',310,410,[-7,-5,-2.5],[15,-3,-.1],[4,2,.5]],
['knife','thrust',440,480,[-7,2,-.4],[17,-1,0],[11,1,.1]],
['inkcloud','scatter',300,390,[0,7,.4],[10,4,1.4],[2,6,.7]],
['eelstep','hamstring',240,350,[-6,8,-2],[5,10,.7],[1,4,-.7]],
['brinebolt','cast',390,440,[-4,-8,-2],[12,-6,-.4],[7,-3,-.8]],
['squall','gust',360,470,[-8,0,-1.7],[15,-5,-.2],[8,-2,-.5]],
['grasp','tendril',440,510,[10,-4,-.4],[-6,0,-1.7],[-9,4,-2]],
['staticlash','zap',470,540,[0,-17,-1.7],[5,-13,-1.2],[1,-5,-1.5]],
['waterspout','geyser',530,600,[0,6,.4],[0,-20,-1.6],[3,-12,-1.3]],
['scourge','whip',360,460,[-8,-7,-3],[16,0,.2],[7,8,1.5]],
['smite','throw',420,500,[-6,-10,-2.7],[15,-6,-.2],[9,2,.6]],
['penance','slash',420,520,[9,-12,-.4],[-9,-3,-3.5],[-3,6,-2.5]],
['litany','nova',480,550,[-5,-4,-2],[9,-11,-.7],[5,-4,-1]],
['martyr','pillar',590,690,[0,6,-1],[0,-22,-1.6],[0,-14,-1.5]],
['mindspike','spike',380,460,[-2,-8,-1.9],[13,-8,-.1],[7,-5,-.5]],
['gaze','gaze',460,530,[0,-10,-1.5],[4,-12,-1.4],[3,-8,-1.3]],
['veil','unravel',420,470,[9,2,.3],[-6,-10,-2.4],[-4,-5,-2]],
['unravel','unravel',510,590,[8,-6,-.5],[-9,-12,-2.8],[-7,-6,-2.3]],
['rend','rend',580,650,[-4,-18,-2.8],[11,8,1.4],[9,10,1.7]],
['lastlight','rebuke',540,610,[-3,-15,-1.8],[8,-19,-1.1],[5,-9,-1.3]],
['stormglass','fork',520,590,[4,-18,-1.3],[-3,-10,-2],[6,-5,-.8]],
['brandofsalt','brand',350,430,[-5,4,-1.8],[14,-2,0],[6,2,.4]],
['memoryleech','leech',490,570,[12,-9,-.3],[-7,-7,-2.2],[-4,3,-1.8]],
['quake','slam',530,620,[0,-21,-2.9],[9,13,1.6],[6,14,1.8]],
['headbutt','butt',300,420,[-8,2,-1.8],[-4,6,-1.4],[-6,3,-1.6]],
['chainlash','heave',480,560,[-9,9,1.5],[14,-10,-.7],[10,0,.2]],
['bloodrage','brand',390,500,[-3,5,-1.4],[-4,-6,-1.7],[-2,2,-1.3]],
['caveblow','cavein',610,700,[-5,-21,-3],[12,12,1.4],[10,14,1.6]],
['flurry','fan',410,520,[-9,-4,-3],[14,0,5.8],[4,6,7]],
['garrote','garrote',450,580,[11,-9,-.1],[-7,-5,-2.6],[-9,1,-2.8]],
['caltrops','scatter',330,440,[-4,8,.9],[15,8,.2],[6,9,.6]],
['venomdart','dart',390,490,[-6,-10,-2.8],[16,-5,-.1],[7,1,.4]],
['vanish','hamstring',370,450,[-7,11,2.4],[14,12,.5],[8,13,1]],
['hail','hail',560,630,[-2,-19,-1.8],[8,-17,-.8],[4,-10,-1.1]],
['forked','fork',450,510,[-9,-8,-2.3],[15,-9,-.2],[8,-6,-.6]],
['maelstrom','vortex',510,590,[-12,0,-3],[12,-10,3.5],[2,-8,5]],
['seafog','gust',440,500,[7,4,.4],[-9,2,-3],[-2,5,-1.7]],
['ballstorm','whirl',570,650,[11,-5,0],[-10,-13,-3.2],[-5,-6,-2.4]],
['brand','brand',430,530,[-6,-2,-1.9],[16,-3,0],[14,-2,.1]],
['pillar','pillar',600,690,[-4,-20,-1.9],[3,-23,-1.3],[2,-13,-1.5]],
['offering','leech',430,510,[2,7,.3],[-5,1,-2.2],[-3,5,-1.8]],
['rebuke','rebuke',470,570,[-8,-3,-2],[17,-4,-.1],[9,-1,-.4]],
['judgement','judge',650,740,[-7,-23,-3.1],[14,10,1.3],[12,15,1.7]],
['leech','leech',440,530,[14,-3,-.2],[-8,3,-2.4],[-5,5,-2]],
['whispers','whisper',550,620,[-4,-13,-2],[6,-16,-.9],[0,-9,-1.4]],
['hex','hex',410,490,[-8,-7,-2.4],[11,-10,-.6],[4,-6,-1]],
['mirror','gaze',500,580,[5,4,-.5],[3,-16,-1.5],[4,-12,-1.4]],
['rift','rift',620,710,[12,-12,-.2],[-12,-15,-3.2],[-8,-7,-2.8]],
['shift','thrust',200,280,[-2,0,-1.2],[3,1,-1],[0,0,-1.15]],
['shove','thrust',330,410,[-7,1,-1.5],[12,2,-.1],[6,3,-.5]],
['hide','gaze',340,420,[5,0,-.7],[-6,5,-2.6],[-3,4,-2]],
['defend','rebuke',400,500,[-4,2,-1.9],[0,-9,-1.5],[0,-7,-1.4]],
['dash','gust',220,300,[-6,3,-2],[6,5,.2],[1,3,-1]],
['breath','nova',480,580,[-2,4,-1.1],[1,-4,-1.4],[0,1,-1.2]],
['escape','garrote',410,490,[-8,3,-2.5],[10,-4,.2],[4,2,-.6]],
['stone','heave',320,400,[-6,-6,-2.4],[13,-4,-.2],[7,3,.4]],
['draught','leech',400,480,[0,6,-.5],[-3,-9,-2],[0,4,-1]],
['charge','scatter',470,550,[-2,8,.5],[6,14,1.2],[2,8,.7]],
['ink','scatter',350,440,[-5,7,.7],[12,5,1],[4,6,.6]],
['tea','whisper',440,520,[2,5,-.3],[-4,-8,-2.1],[-1,5,-1]],
['oil','throw',380,470,[-8,-8,-2.7],[15,-5,-.1],[8,4,.5]],
['shadowstep','rift',380,460,[9,3,.2],[-9,-8,-2.9],[-4,2,-2]],
['clapper','rebuke',520,600,[-5,-12,-2.5],[10,-15,-.6],[4,-7,-1.2]],
['camp','nova',500,600,[-2,10,.8],[4,13,1.3],[0,7,.4]],
['autoexp','gust',200,260,[-3,2,-1.4],[4,3,-.8],[0,1,-1.1]],
['freeStrike','thrust',240,360,[-5,-1,-1.8],[11,1,0],[5,3,.5]]
];
// Body-family is a selection hint, never permission to replace a named hand track.
const utility=new Set(['inkcloud','eelstep','penance','martyr','veil','bloodrage','seafog','offering','shift','hide','defend','dash','breath','escape','draught','charge','ink','tea','stone','oil','shadowstep','clapper','camp','autoexp']);
const heavy=new Set(['undertow','redtide','ironwake','quake','caveblow','judgement']);
const thrust=new Set(['gaff','knife','fishhook','headbutt','chainlash','garrote','venomdart','brand','brandofsalt','shove','freeStrike']);
const sweep=new Set(['breakwater','gutter','scourge','flurry','caltrops','vanish']);
for(const [id,style,wind,recovery,windPose,hit,follow] of rows){
 const bodyFamily=utility.has(id)?'utility':heavy.has(id)?'heavy':thrust.has(id)?'thrust':sweep.has(id)?'sweep':'cast';
 profiles[id]={id,style,bodyFamily,wind,recovery,windPose,hit,follow};
}
const elements=['fire','frost','lightning','holy','void','blood'];
function profile(ab){if(!ab)return null;if(!ab.tome)return profiles[ab.id]||null;
 const shape=ab.ward?'ward':ab.blink?'blink':({ranged:'bolt',area:'area',burst:'burst'}[ab.kind]);
 const index=elements.indexOf(ab.el),i=Math.max(0,index);
 const style={fire:'pillar',frost:'hail',lightning:'fork',holy:'nova',void:'rift',blood:'leech'}[ab.el]||'cast';
 const poses={bolt:[[-5,-8,-2],[14,-6,-.2],[7,-3,-.7]],area:[[0,-18,-1.7],[7,-21,-1],[4,-9,-1.3]],burst:[[-12,1,-3],[12,-9,3],[2,-5,4.5]],ward:[[-3,4,-2],[0,-12,-1.5],[0,-8,-1.4]],blink:[[10,3,0],[-10,-9,-3],[-4,0,-2]]}[shape];
 if(!poses)return null;return{id:'tome_'+ab.el+'_'+shape,style,bodyFamily:ab.ward||ab.blink?'utility':'cast',wind:420+i*25+(shape==='area'?100:0),recovery:500+i*20,windPose:poses[0],hit:poses[1].map((v,k)=>v+(k===1?-i:0)),follow:poses[2]};
}
function track(p,t,recover){const ease=q=>q*q*(3-2*q),lerp=(a,b,q)=>a.map((v,i)=>v+(b[i]-v)*ease(q));
 if(t<.68)return lerp([0,0,-1.15],p.windPose,Math.max(0,t/.68));
 if(t<1)return lerp(p.windPose,p.hit,(t-.68)/.32);
 if(recover<.35)return lerp(p.hit,p.follow,recover/.35);
 return lerp(p.follow,[0,0,-1.15],Math.min(1,(recover-.35)/.65));
}
// Each rectangle is rasterized before direction transforms: no canvas rotation or blur.
function fallbackSprite(g,base,x=0,y=0,angle=0,side=1,phase='idle'){
 const D='#111c25',S='#425867',M='#91a9ae',E='#e0e8d7',W='#765037',L='#ba8751',G='#b89b59',B='#645843',R='#743d40';
 const p=(u,v,w,h,c)=>{g.fillStyle=c;for(let a=0;a<w;a++)for(let b=0;b<h;b++)g.fillRect(Math.round(x+side*(Math.cos(angle)*(u+a)-Math.sin(angle)*(v+b))),Math.round(y+Math.sin(angle)*(u+a)+Math.cos(angle)*(v+b)),1,1)};
 const handle=(length)=>{p(-5,-2,length,4,D);p(-4,-1,length-2,2,W);p(-4,-1,length-2,1,L);for(let i=-3;i<5;i+=2)p(i,-1,1,2,B);p(-5,-2,2,4,G)};
 handle(['rod','pick','maul'].includes(base)?25:12);
 switch(base){
 case'maul':p(12,-9,13,18,D);p(13,-8,11,16,S);p(14,-7,9,13,M);p(14,-7,9,2,E);p(14,5,9,2,B);p(16,-6,2,11,S);p(21,-6,2,11,S);p(18,-3,2,4,G);p(12,-7,2,14,G);p(24,-7,2,14,G);p(14,2,2,1,E);break;
 case'pick':p(14,-13,4,27,D);p(15,-12,2,25,M);p(16,-12,1,12,E);p(17,-12,3,3,S);p(18,-10,3,4,S);p(20,-7,3,5,M);p(22,-3,2,4,E);p(13,2,2,7,S);p(11,7,3,4,M);p(9,10,3,2,E);p(12,-2,8,5,G);p(13,-1,6,2,B);break;
 case'knife':p(3,-4,3,8,D);p(4,-3,1,6,G);p(6,-3,14,6,D);p(6,-2,12,4,S);p(7,-2,11,2,M);p(8,-2,9,1,E);p(18,-2,3,3,M);p(21,-1,2,1,E);p(7,2,10,1,E);p(-3,-1,6,2,R);p(0,-1,1,2,G);break;
 case'hook':p(5,-1,9,2,S);for(let i=5;i<14;i+=3){p(i,-2,2,4,D);p(i,-1,2,2,M)}p(13,-8,3,9,D);p(14,-7,2,8,M);p(15,-9,7,3,D);p(16,-8,5,2,E);p(21,-7,3,10,D);p(21,-6,2,8,M);p(17,2,5,3,D);p(17,2,4,2,E);p(16,-1,2,4,M);p(16,-2,1,2,E);break;
 case'xbow':p(1,-4,23,8,D);p(2,-3,20,6,W);p(3,-3,17,2,L);p(9,-13,4,26,D);p(10,-12,2,24,S);for(const sign of [-1,1]){p(7,sign*10,3,3,W);p(5,sign*12,3,2,L);for(let i=0;i<12;i++)p(4+Math.floor(i/3),sign*i,1,1,E)}p(2,-1,21,2,S);p(2,-1,19,1,M);p(-5,2,8,4,D);p(-4,2,6,3,W);p(5,3,2,4,G);if(phase!=='reload'){p(6,-1,22,1,E);p(25,-2,4,3,M);p(6,-2,3,3,R)}break;
 case'rod':p(15,-4,8,8,D);p(16,-3,6,6,G);p(17,-2,4,4,S);p(22,-7,2,14,D);p(23,-6,1,12,E);p(19,-9,3,18,D);p(20,-8,1,16,M);p(24,-3,3,6,'#326c83');p(25,-2,2,4,'#73cfda');p(25,-2,1,2,E);for(let i=4;i<15;i+=4)p(i,-2,2,4,G);break;
 case'censer':for(let i=5;i<18;i++){p(i,Math.round((i-5)*.22),1,2,i%2?M:S)}p(16,-2,11,12,D);p(17,-1,9,10,G);p(18,0,7,8,B);p(17,-2,9,2,E);p(18,9,7,2,G);for(let i=19;i<25;i+=2){p(i,2,1,5,D);p(i,3,1,3,'#e1a45a')}p(20,-5,3,3,G);p(21,-4,1,1,E);break;
 case'scourge':p(-3,-1,9,2,R);p(4,-3,3,6,G);for(let strand=0;strand<3;strand++)for(let i=7;i<28-strand*2;i++){const v=Math.round(Math.sin(i*.25+strand)*2+strand*3-3);p(i,v,1,1,i%3?M:S);if(i%6===0){p(i,v-1,2,3,D);p(i+1,v-1,1,2,E)}}break;
 case'fetish':p(3,-4,4,9,D);p(4,-3,2,7,R);p(7,-6,13,13,D);p(8,-5,11,11,B);p(9,-5,9,4,'#c7b893');p(9,0,9,5,'#a7987d');p(10,-2,3,3,D);p(15,-2,3,3,D);p(13,1,1,2,D);for(let i=10;i<18;i+=2)p(i,4,1,3,E);p(7,-9,3,5,E);p(18,-9,3,5,E);p(12,-7,4,2,G);p(13,-6,2,1,'#ad7ecd');break;
 }
}
const sprites={},inventory={},aspects={};
const atlas={url:'assets/flat/weapons-v2.png',cols:3,rows:3,order:['maul','hook','pick','knife','xbow','rod','censer','scourge','fetish']};
// Sample the authored pixels backwards into the destination grid: solid silhouettes,
// hard alpha, exact mirrored anchors and no resampled/blurred canvas rotations.
function drawSprite(g,base,x=0,y=0,angle=0,side=1,phase='idle'){
 const sprite=sprites[base];if(!sprite)return fallbackSprite(g,base,x,y,angle,side,phase);
 const {w,h,grip,data}=sprite,c=Math.cos(angle),s=Math.sin(angle);
 const corners=[[0,0],[w,0],[0,h],[w,h]].map(([u,v])=>[x+side*(c*(u-grip[0])-s*(v-grip[1])),y+s*(u-grip[0])+c*(v-grip[1])]);
 const left=Math.floor(Math.min(...corners.map(v=>v[0]))),right=Math.ceil(Math.max(...corners.map(v=>v[0]))),top=Math.floor(Math.min(...corners.map(v=>v[1]))),bottom=Math.ceil(Math.max(...corners.map(v=>v[1])));
 for(let yy=top;yy<=bottom;yy++)for(let xx=left;xx<=right;xx++){
  const dx=(xx-x)*side,dy=yy-y,u=Math.round(c*dx+s*dy+grip[0]),v=Math.round(-s*dx+c*dy+grip[1]);
  if(u<0||v<0||u>=w||v>=h)continue;
  if(base==='xbow'&&phase==='reload'&&u>w*.38&&Math.abs(v-h*.45)<1)continue;
  const colour=data[v*w+u];if(colour){g.fillStyle=colour;g.fillRect(xx,yy,1,1)}
 }
}
const api={profiles,profile,track,drawSprite,atlas,sprites,inventory,aspects,bases:['maul','hook','pick','knife','xbow','rod','censer','scourge','fetish']};
if(typeof module==='object'&&module.exports)module.exports=api;root.SaltmarrowWeapons=api;
const art=root.SaltmarrowArt;if(!art)return;
if(typeof document==='object'){
 const baseReady=art.ready;
 api.ready=new Promise(resolve=>{
  const im=new Image();im.onload=()=>{
   const widths=[40,40,42,27,36,40,40,42,29];
   atlas.order.forEach((base,i)=>{
    const cell=document.createElement('canvas');cell.width=Math.floor(im.width/3);cell.height=Math.floor(im.height/3);
    const cg=cell.getContext('2d');cg.drawImage(im,Math.floor(i%3*im.width/3),Math.floor(Math.floor(i/3)*im.height/3),cell.width,cell.height,0,0,cell.width,cell.height);
    const raw=cg.getImageData(0,0,cell.width,cell.height).data;let x0=cell.width,y0=cell.height,x1=-1,y1=-1;
    for(let y=0;y<cell.height;y++)for(let x=0;x<cell.width;x++)if(raw[(y*cell.width+x)*4+3]>96){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
    if(x1<x0){art.errors.push('Empty weapon sprite '+base);return}
    const sw=x1-x0+1,sh=y1-y0+1,w=widths[i],h=Math.max(1,Math.round(sh/sw*w));
    aspects[base]=sw/sh;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(cell,x0,y0,sw,sh,0,0,w,h);
    const pixels=g.getImageData(0,0,w,h).data,data=[];for(let n=0;n<w*h;n++)data.push(pixels[n*4+3]>96?'#'+[pixels[n*4],pixels[n*4+1],pixels[n*4+2]].map(v=>v.toString(16).padStart(2,'0')).join(''):null);
    const grip=[Math.round(w*(base==='xbow'?.17:.12)),Math.round(h*(base==='xbow'?.6:base==='censer'?.3:.5))];sprites[base]={w,h,grip,data};
    const icon=document.createElement('canvas');icon.width=icon.height=96;const ig=icon.getContext('2d');ig.imageSmoothingEnabled=false;const factor=82/Math.max(sw,sh),iw=Math.round(sw*factor),ih=Math.round(sh*factor);ig.drawImage(cell,x0,y0,sw,sh,Math.round((96-iw)/2),Math.round((96-ih)/2),iw,ih);inventory[base]=icon;
   });resolve(api);
  };im.onerror=()=>{art.errors.push('Unable to load '+atlas.url);resolve(api)};im.src=atlas.url;
 });
 art.ready=Promise.all([baseReady,api.ready]).then(()=>art);
}
const oldPose=art.weaponPose,oldDraw=art.drawWeapon;
art.weaponPose=function(base,e,now,action,reduced){const pose=oldPose(base,e,now,action,reduced);if(!pose||reduced||!action||action.base!==base||now<action.t0||(now>=action.end&&action.resolved!==false))return pose;
 const p=action.profile||profiles[action.id];if(!p)return pose;
 const clock=action.resolved===false?Math.min(now,action.impact-.01):now;
 const t=(clock-action.t0)/Math.max(1,action.impact-action.t0),recovery=Math.max(0,(clock-action.impact)/Math.max(1,action.end-action.impact));
 const [x,y,angle]=track(p,t,recovery),vertical=Math.abs(action.dy)>Math.abs(action.dx);
 pose.x=Math.round(pose.side*(9+x*(vertical?.4:1)));pose.y=Math.round(-21+y+(vertical?action.dy*Math.max(0,Math.min(1,t))*6:0));pose.angle=angle+(vertical?(action.dy<0?-.6:.6):0);return pose;
};
art.drawWeapon=function(g,pose,base,now){if(!api.bases.includes(base))return oldDraw(g,pose,base,now);if(!pose)return;
 const {x,y,side,angle}=pose;
 // Native pixel sleeve joins the shoulder to the grip; fingers are always painted last.
 for(let i=0;i<=14;i++){const t=i/14;g.fillStyle=i<10?'#304759':'#c08c60';g.fillRect(Math.round(side*5+(x-side*5)*t)-1,Math.round(-25+(y+25)*t)-1,3,3)}
 drawSprite(g,base,x,y,angle,side,pose.phase);g.fillStyle='#c08c60';g.fillRect(x-1,y-1,3,3);
 if(['maul','pick','rod','xbow'].includes(base)){g.fillRect(Math.round(x+side*Math.cos(angle)*6)-1,Math.round(y+Math.sin(angle)*6)-1,3,3)}
};
})(typeof window==='object'?window:globalThis);
