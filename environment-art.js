/* Flat, native-pixel set dressing. No collision, RNG, lighting-state or save mutations. */
(function(root){
'use strict';
function hash(x,y,seed=0){let n=Math.imul(x+17,374761393)^Math.imul(y+31,668265263)^seed;n=Math.imul(n^(n>>>13),1274126177);return(n^(n>>>16))>>>0}
function seedOf(map){let s=2166136261;for(let i=0;i<map.length;i++)s=Math.imul(s^map[i],16777619);return s>>>0}
const palettes={mine:['#493d30','#796447','#ac9363'],crypt:['#343b40','#626967','#a3a18a'],fungal:['#273e37','#537c64','#9db690'],drowned:['#263e43','#4c7476','#91aaa0'],sewer:['#343c32','#5e6b43','#97a174'],abbey:['#3f333e','#71616c','#b1a18b'],town:['#3a3b32','#6b6450','#a29873']};
function plan(L,w,h,types,buildings=[]){
 const {floor,wall}=types,seed=seedOf(L.map),deposits=[],at=(x,y)=>x>=0&&y>=0&&x<w&&y<h?L.map[y*w+x]:wall;
 const busy=new Set([...(L.objs||[]),...(L.items||[]),...(L.traps||[]),...(L.npcs||[])].map(o=>o.y*w+o.x));
 const protectedCell=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=at(x+dx,y+dy);if(t!==floor&&t!==wall)return true;if(busy.has((y+dy)*w+x+dx))return true}return false};
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  const i=y*w+x,n=hash(x,y,seed),north=at(x,y-1)===wall;
  if(at(x,y)!==floor||L.bld?.[i]||L.decal?.[i]||protectedCell(x,y))continue;
  // Ground silhouettes only along rear walls. One-tile corridors stay completely bare.
  if(north&&at(x-1,y)===floor&&at(x+1,y)===floor&&at(x,y+1)===floor&&n%5<(L.town?4:2)){
   let bio=L.interior?'interior':L.bio;
   if(L.town&&!L.interior){const b=buildings.find(b=>x>=b.x&&x<b.x+b.w&&y===b.y+b.h);if(b)bio=b.key==='smith'?'mine':b.key==='chapel'?'crypt':b.key==='archive'?'archive':'town'}
   deposits.push({x,y,i,kind:bio,variant:n%3,seed:n});
  }
 }
 return {seed,deposits};
}
const plans=new WeakMap(),sprites=new Map();
function sprite(kind,variant){
 const key=kind+variant;if(sprites.has(key))return sprites.get(key);
 const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');
 const pal=palettes[kind]||palettes.town;
 const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 const line=(x,y,w,col)=>r(x,y,w,1,col);
 // Every silhouette is <= 16 pixels tall, anchored to the rear half of its tile.
 r(3,15,26,3,'#101c20');
 if(kind==='mine'){
  if(variant===0){for(let j=0;j<3;j++){r(4+j*2,8-j*3,22-j*3,3,pal[0]);line(4+j*2,8-j*3,22-j*3,pal[1]);r(9+j*2,8-j*3,2,3,'#263038')}r(24,4,2,12,'#7b6b51');line(20,4,9,'#90978c')}
  else if(variant===1){for(let j=0;j<3;j++){r(7+j*6,10-j%2*3,5,4,pal[1]);r(8+j*6,9-j%2*3,3,1,pal[2])}r(3,5,2,11,pal[1]);r(2,5,6,2,'#989987')}
  else{r(6,5,21,10,'#292c2a');r(7,4,18,3,pal[1]);for(let j=0;j<4;j++)r(8+j*5,7,1,6,pal[1]);r(9,15,4,3,'#111a20');r(22,15,4,3,'#111a20');r(10,1,9,3,'#6b7264')}
 }else if(kind==='fungal'){
  for(let j=0;j<5;j++){const x=5+j*5,y=6+(j+variant)%3*3;r(x,y,2,10-y,pal[1]);r(x-2,y-2,6,3,j%2?'#749b84':'#547f85');r(x-1,y-2,3,1,'#a4c4a3');r(x,12,5,2,pal[0])}line(4,16,23,pal[1]);
 }else if(kind==='crypt'||kind==='abbey'){
  if(variant===0){r(6,3,19,13,pal[0]);r(8,2,15,2,pal[1]);r(9,6,13,1,pal[1]);r(14,4,2,8,pal[2]);line(11,7,8,pal[2]);r(4,13,23,3,pal[1])}
  else if(variant===1){r(7,12,18,3,pal[0]);for(let j=0;j<3;j++){r(8+j*6,8-j%2*3,3,5+j%2*3,'#a6a089');r(9+j*6,6-j%2*3,1,2,'#dbb976')}r(19,13,6,2,'#715653')}
  else{r(6,10,20,5,pal[0]);r(8,8,5,5,pal[2]);r(9,13,1,2,pal[0]);r(11,13,1,2,pal[0]);r(9,10,1,1,'#242d31');r(12,10,1,1,'#242d31');line(15,12,10,pal[1]);line(18,10,6,pal[1])}
 }else if(kind==='drowned'||kind==='sewer'){
  for(let j=0;j<3;j++){r(4+j*7,5+j%2*3,6,10-j%2*3,pal[0]);line(4+j*7,5+j%2*3,6,pal[1]);r(5+j*7,7+j%2*3,1,6,pal[1])}
  for(let j=0;j<5;j++){r(6+j*4,12+(j+variant)%3,2,2,pal[2])}r(23,3,2,11,'#61716a');r(20,6,7,2,'#61716a');
 }else if(kind==='archive'){
  r(4,8,24,8,'#383c35');for(let j=0;j<5;j++){r(6+j*4,5+j%2,3,9,['#8c7358','#566d69','#806269'][j%3]);line(6+j*4,7+j%2,3,'#b2a17f')}r(3,15,26,2,'#77715a');
 }else{
  if(variant===0){for(let j=0;j<3;j++){r(5+j*7,7+j%2*2,6,8-j%2*2,'#4d4638');line(5+j*7,7+j%2*2,6,'#8a7755');r(7+j*7,9,1,5,'#282e2b')}r(3,14,26,2,'#756445')}
  else if(variant===1){r(5,10,23,5,'#5b5140');line(4,9,25,'#a08b5f');for(let j=0;j<5;j++){r(7+j*4,4+j%2*2,2,5,'#4d6854');line(6+j*4,4+j%2*2,4,'#829179')}}
  else{for(let j=0;j<3;j++){r(4+j*3,11-j*3,22-j*2,3,'#4a4033');line(4+j*3,11-j*3,22-j*2,'#8b7650')}r(9,3,2,12,'#28343a');r(23,5,2,10,'#28343a')}
 }
 sprites.set(key,c);return c;
}
function draw(g,L,tiles,options){
 const {w,h,types,now=0,reduced=false,visible,actors=[],buildings=[]}=options;
 let p=plans.get(L);if(!p){p=plan(L,w,h,types,buildings);plans.set(L,p)}
 const pal=palettes[L.bio]||palettes.mine;
 const occupied=new Set(actors.map(a=>Math.round(a.y)*w+Math.round(a.x)));
 const active=new Set(tiles.map(t=>t.i));
 g.save();g.imageSmoothingEnabled=false;
 const rect=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)};
 for(const{x,y,i}of tiles){
  if(L.map[i]!==types.floor||L.bld?.[i])continue;
  g.globalAlpha=visible[i]?1:.45;
  const n=hash(x,y,p.seed),xx=x*32,yy=y*32,north=y>0&&L.map[i-w]===types.wall;
  // Wall contact shadows and salt/dirt tide lines give rooms a grounded border.
  if(north){rect(xx,yy,32,3,'#10191d');rect(xx+1,yy+3,30,2,'#192528');if(n%3===0)rect(xx+3,yy+5,16,1,pal[0])}
  if(x>0&&L.map[i-1]===types.wall)rect(xx,yy,3,32,'#142024');
  if(L.decal?.[i]||occupied.has(i)||L.weak?.[i]||L.fire?.[i]||L.spore?.[i])continue;
  // Low-contrast contiguous patches, never animated noise on every floor tile.
  const patch=hash(Math.floor(x/3),Math.floor(y/3),p.seed);
  if(patch%4===0&&n%3===0){g.globalAlpha*=.4;rect(xx+4+n%5,yy+21,15,2,pal[0]);rect(xx+8,yy+23,10,1,pal[1])}
  if(L.bio==='town'&&!L.interior&&y>=15&&y<=18){
   // A worn main street: continuous gutters and inset center paving, no new obstacles.
   if(y===15||y===18){rect(xx,yy+(y===15?2:28),32,2,'#50554c');rect(xx,yy+(y===15?4:27),32,1,'#111e23');if(x%4===0)for(let k=0;k<4;k++)rect(xx+9+k*3,yy+(y===15?0:29),1,3,'#111a20')}
  }
 }
 if(L.town&&!L.interior)for(const b of buildings){
  const x=b.dx,y=b.dy,i=y*w+x;if(!active.has(i)||!L.seen[i])continue;
  g.globalAlpha=.55;rect(x*32+4,y*32+4,24,2,'#7c7965');rect(x*32+7,y*32+7,18,1,'#575e55');
  // Foundations cast a short stepped contact shadow, preserving the doorway opening.
  for(let bx=b.x;bx<b.x+b.w;bx++){if(bx===x)continue;const j=y*w+bx;if(!active.has(j)||L.map[j]!==types.floor)continue;g.globalAlpha=.28;rect(bx*32,y*32,32,4,'#07141b');rect(bx*32+2,y*32+4,28,2,'#07141b')}
 }
 for(const d of p.deposits){
  if(!active.has(d.i)||L.map[d.i]!==types.floor||L.decal?.[d.i]||occupied.has(d.i)||L.weak?.[d.i])continue;
  // Moving actors and live effects always have a clear tile; deposits remain background art.
  if((L.objs||[]).some(o=>o.x===d.x&&o.y===d.y)||(L.items||[]).some(o=>o.x===d.x&&o.y===d.y)||L.fire?.[d.i]||L.spore?.[d.i])continue;
  g.globalAlpha=visible[d.i]?.92:.35;g.drawImage(sprite(d.kind,d.variant),d.x*32,d.y*32);
  if(d.kind==='fungal'&&visible[d.i]){g.globalAlpha=reduced?.16:.16+Math.floor((Math.sin(now/1400+d.seed%29)+1)*2)/30;rect(d.x*32+4,d.y*32+3,24,12,'#628f75')}
 }
 g.restore();
}
// Rendered inside the existing wall depth entry, so foreground cutaways still apply.
function drawWall(g,L,x,y,{w,types,front=false,now=0,reduced=false}){
 const i=y*w+x;if(L.map[i]!==types.wall||L.decal?.[i]||L.bld?.[i])return;
 if(L.map[i+w]!==types.floor||front)return;
 const p=plans.get(L),seed=p?.seed??seedOf(L.map),n=hash(x,y,seed),pal=palettes[L.bio]||palettes.mine;
 const xx=x*32,base=(y+1)*32,top=base-48;
 g.save();const r=(a,b,c,d,col)=>{g.fillStyle=col;g.fillRect(xx+a,top+b,c,d)};
 // Broken strata and broad damp courses distinguish geology from cut tomb stone.
 g.globalAlpha*=.55;r(1,8,30,2,pal[0]);r(3,10,25,1,pal[1]);
 if(L.bio==='mine'){
  if(n%3===0){r(3,0,4,47,'#453a2c');r(4,0,1,44,'#8b7150');r(25,0,4,47,'#453a2c');r(26,0,1,44,'#8b7150');r(2,3,28,4,'#68543b');for(let j=0;j<3;j++){r(3,14+j*12,4,2,'#202c30');r(25,14+j*12,4,2,'#202c30')}}
  else if(n%3===1){for(let j=0;j<4;j++){r(6+j*4,16+j*3,5,2,'#8e8c6e');r(7+j*4,15+j*3,2,1,'#b8b194')}}
 }else if(L.bio==='fungal'){
  for(let j=0;j<3;j++){const a=5+j*9,b=20+(n>>>j)%9;r(a,b,2,24-b,'#59725c');r(a-3,b-2,8,3,'#578277');r(a-2,b-2,5,1,'#97b2a0');r(a+1,b+3,1,13,'#394e48')}
  g.globalAlpha*=reduced?.6:.55+Math.floor((Math.sin(now/1700+n%31)+1)*2)*.06;r(4,31,24,2,'#638b78');
 }else if(L.bio==='crypt'||L.bio==='abbey'){
  if(n%3===0){r(7,10,18,27,'#151e23');r(6,9,20,2,pal[1]);r(6,11,2,27,pal[1]);r(24,11,2,27,pal[1]);r(10,29,12,7,pal[0]);r(13,23,6,7,pal[2]);r(13,26,2,2,'#172328');r(17,26,2,2,'#172328');r(6,37,20,3,pal[1])}
  else if(n%3===1){r(11,8,11,24,'#54404a');r(12,8,1,22,'#8c716b');r(16,12,2,13,'#968b72');r(13,16,8,2,'#968b72');r(11,32,3,3,'#54404a');r(18,32,4,2,'#54404a')}
 }else{
  r(0,30,32,2,'#4f6b64');r(0,32,32,5,'#243b3d');
  if(n%2===0){for(let j=0;j<5;j++){r(13+j%2,8+j*5,4,3,'#6b7771');r(14+j%2,9+j*5,2,1,'#15272d')}r(11,35,10,3,'#65706a')}
  for(let j=0;j<4;j++){r(3+j*7,39+(n>>>j)%4,3,2,'#84958a');r(4+j*7,39+(n>>>j)%4,1,1,'#bdbaa0')}
 }
 g.restore();
}
const api={hash,seedOf,plan,draw,drawWall,palettes};root.SaltmarrowEnvironment=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
