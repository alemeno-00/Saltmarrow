/* Saltmarrow coastal kit. All art is drawn at native pixels and cached.
 * Land, elevation and bridge masks are authored by genTown; rendering never edits them.
 * Exported sprite() assets can be reused in maps and exported as PNG from the browser. */
(function(root){
'use strict';
const palette={ink:'#08141e',rock:'#12232e',stone:'#223945',edge:'#49616a',salt:'#9baca8',gold:'#d6a363',light:'#ffe0a0',sea:'#102e3c',foam:'#7eaaaa'};
const hash=(x,y)=>{let n=Math.imul(x+57,374761393)^Math.imul(y+19,668265263);return (n^(n>>>13))>>>0};
const cache=new Map(),plans=new WeakMap(),floors=new Map();
function floor(L,x,y,w){
 const v=hash(x,y)%16,lane=L.townLanes?.[y*w+x]||0,z=L.townElevation?.[y*w+x]||1,key=v+':'+lane+':'+z;if(floors.has(key))return floors.get(key);
 const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');
 const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 r(0,0,32,32,lane?'#172c36':'#192b32');
 if(lane){for(let yy=0;yy<32;yy+=6)for(let xx=-5;xx<32;xx+=10){const px=xx+(yy%12?5:0),n=hash(px+v,yy);r(px+1,yy+1,8,4,['#30434a','#35494f','#293e47','#3a4c50'][n%4]);r(px+1,yy+1,7,1,'#4a5d60');if(n%5===0)r(px+3,yy+4,3,1,'#213840')}}
 else{for(let j=0;j<60;j++){const n=hash(j,v);r(n%32,(n>>>8)%32,1+n%3,1,['#304349','#3e5054','#253942'][n%3])}}
 if(v%3===0){r(3,21,21,3,'#254452');r(6,21,13,1,'#607d81');r(12,24,15,2,'#1b3543')}
 if(v%4===0){r(15,3,1,7,'#091f2b');r(14,10,1,4,'#091f2b');r(12,14,2,1,'#091f2b')}
 if(!lane&&v%3===0){r(6,9,8,1,'#9ba89a');r(7,10,3,2,'#627974')}
 floors.set(key,c);return c;
}
const detailed=new Map(),errors=[];
const atlasCells={tower:[0,0,446,1536,128,448],saint:[425,24,290,510,48,80],winch:[728,130,296,405,48,64],net:[425,542,290,409,48,64],wreck:[721,542,303,409,96,128],cliff:[448,956,267,560,32,96],arch:[725,956,299,560,48,96]};
let ready=Promise.resolve();
if(typeof document!=='undefined')ready=new Promise(resolve=>{
 const atlas=new Image();atlas.onload=()=>{try{
  for(const[kind,[x,y,w,h,ww,hh]]of Object.entries(atlasCells)){
   const raw=document.createElement('canvas');raw.width=w;raw.height=h;const rg=raw.getContext('2d',{willReadFrequently:true});rg.drawImage(atlas,x,y,w,h,0,0,w,h);
   const image=rg.getImageData(0,0,w,h),p=image.data;
   // Conventional magenta key, including antialiased edge pixels, before nearest-pixel packing.
   for(let j=0;j<p.length;j+=4)if(p[j]>140&&p[j+2]>100&&p[j]-p[j+1]>45&&p[j+2]-p[j+1]>30)p[j+3]=0;
   if(kind==='tower')for(let yy=0;yy<950;yy++)for(let xx=424;xx<w;xx++)p[(yy*w+xx)*4+3]=0;
   rg.putImageData(image,0,0);const c=document.createElement('canvas');c.width=ww;c.height=hh;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(raw,0,0,ww,hh);detailed.set(kind,c);
  }
 }catch(e){errors.push(e.message)}resolve()};atlas.onerror=()=>{errors.push('Unable to load coastal atlas');resolve()};atlas.src='assets/coast/coastal-atlas-keyed.png';
});
function sprite(kind,v=0){
 if(detailed.has(kind))return detailed.get(kind);
 const key=kind+v;if(cache.has(key))return cache.get(key);
 const c=document.createElement('canvas');c.width=kind==='tower'?128:kind==='wreck'?160:32;c.height=kind==='tower'?320:kind==='cliff'?96:kind==='wreck'?96:kind==='arch'?64:48;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const line=(x,y,w,col)=>r(x,y,w,1,col);
 function masonry(x,y,w,h){r(x,y,w,h,palette.ink);for(let yy=y;yy<y+h;yy+=8)for(let xx=x-12;xx<x+w;xx+=16){const px=Math.max(x,xx+(Math.floor(yy/8)%2)*8),ww=Math.min(15,x+w-px);if(ww<1)continue;const n=hash(xx,yy);r(px,yy,ww,7,['#20333e','#263e49','#192e3a','#30434a'][n%4]);line(px,yy,ww,n%3?'#3d515a':'#4f6268');if(n%4===0)r(px+2,yy+2,1,4,'#6e8486');if(n%5===0)line(px+3,yy+6,Math.max(1,ww-4),'#88948b')}}
 function lancet(x,y,w,h,lit=true){r(x+2,y,w-4,h,palette.ink);r(x+4,y-2,w-8,3,palette.edge);r(x+1,y+4,1,h-4,palette.edge);r(x+w-2,y+4,1,h-4,palette.edge);if(lit){r(x+4,y+5,w-8,h-8,palette.gold);r(x+5,y+6,2,h-10,palette.light);r(x+w/2,y+3,2,h-4,palette.ink);line(x+3,y+h-7,w-6,palette.ink)}line(x,y+h,w,palette.salt)}
 if(kind==='tower'){
  // An asymmetric repaired bell tower, rooted in an older ruined gatehouse.
  masonry(10,273,111,40);masonry(25,85,78,205);masonry(19,73,90,18);
  for(let y=99;y<280;y+=43){r(22,y,84,4,'#0c1c27');line(22,y,84,'#728084');r(24,y+4,3,30,'#60727a')}
  masonry(17,57,13,218);masonry(99,57,13,235);
  for(const x of [14,38,63,88,106]){masonry(x,42-(x===63?20:0),10,31+(x===63?20:0));r(x+3,27-(x===63?20:0),4,15,'#0a1923');r(x+4,24-(x===63?20:0),2,4,palette.salt)}
  r(12,73,105,5,palette.ink);line(12,73,105,palette.edge);
  for(const x of[34,76])lancet(x,97,22,44,false);
  // Visible bronze bells and the shared warning rope.
  for(const x of[40,82]){r(x,111,10,15,'#9b7951');r(x-3,124,16,3,'#d1ad75');r(x+4,128,2,4,palette.gold)}
  lancet(49,161,24,34,true);lancet(50,216,22,30,false);
  r(59,132,1,150,'#b2a38a');
  // Broken older arch, salt-caked buttresses and bone lintels.
  r(45,277,40,36,palette.ink);r(49,272,32,5,palette.ink);r(54,268,22,4,palette.ink);
  for(const x of[13,105]){masonry(x,249,12,64);r(x+1,270,2,28,palette.salt)}
  for(let j=0;j<12;j++){const n=hash(j,9),x=27+n%69,y=145+n%118;r(x,y,1,4+n%10,'#82938e')}
  for(let j=0;j<6;j++){r(26+j*14,300,8,3,'#aaa895');r(28+j*14,299,3,5,'#666d68')}
  r(27,286,6,12,palette.gold);r(28,287,2,9,palette.light);
 }else if(kind==='cliff'){
  r(0,0,32,96,'#0c1d28');for(let j=0;j<7;j++){const n=hash(j,v),x=n%30;const y=j*12;r(x,y,2+n%8,95-y,['#172c37','#213641','#0c1b25'][j%3]);line(x,y,Math.min(31-x,7),palette.edge)}
  masonry(0,0,32,16);line(0,0,32,'#8b9995');for(let j=0;j<5;j++){const x=(hash(j,v)%30);r(x,14,1,12+hash(j+1,v)%24,'#718582')}r(0,90,32,6,'#193b49');line(2,91,26,'#5d858c');
 }else if(kind==='wreck'){
  // Broken trawler, ribbed hull, tangled rigging and snapped mast.
  for(let j=0;j<9;j++){r(12+j*4,49+j*3,127-j*9,3,j%2?'#654f3d':'#302e2a')}
  for(let j=0;j<11;j++){r(28+j*10,43+j%3*3,3,22,'#a08a65');r(29+j*10,46,1,18,'#282a29')}
  r(83,4,4,62,'#6d6654');r(55,22,58,3,'#6d6654');
  g.strokeStyle='#697571';g.lineWidth=1;for(const x of[28,48,130]){g.beginPath();g.moveTo(85,8);g.lineTo(x,62);g.stroke()}
  for(let j=0;j<6;j++)line(12+j*23,78+j%2*5,19,'#87b1b1');
 }else if(kind==='arch'){
  masonry(1,5,7,59);masonry(25,11,7,53);masonry(7,3,19,8);r(9,10,14,3,palette.edge);r(13,0,7,5,palette.stone);r(1,23,2,22,palette.salt);r(28,39,2,19,palette.salt);
 }else if(kind==='saint'){
  masonry(3,35,27,10);r(9,26,16,10,palette.edge);r(13,11,8,21,'#8b9994');r(10,23,14,8,'#657d7d');r(14,5,6,7,'#bbc1ad');r(15,9,4,2,palette.ink);r(8,16,17,3,palette.salt);r(4,11,2,24,'#aca891');r(2,9,7,2,palette.salt);r(26,32,2,8,palette.gold);r(26,30,1,2,palette.light);
 }else if(kind==='bones'){
  for(let j=0;j<5;j++){const x=3+j*6;r(x,13+j%2*2,2,25-j%2*3,'#adb3a2');r(x+2,10+j%2*2,3,3,'#ccd0b8');r(x+2,37,4,2,'#7c8c82')}r(2,39,29,3,'#3d504f');
 }else if(kind==='net'){
  r(2,3,2,39,'#786b50');r(28,9,2,33,'#786b50');for(let y=12;y<37;y+=4)line(5,y,22,'#687c77');for(let x=5;x<28;x+=4)r(x,12,1,24,'#536e6b');r(1,41,30,3,palette.rock);
 }else if(kind==='winch'){
  r(2,34,28,8,'#46514c');r(5,12,4,25,'#7a6d51');r(25,12,4,25,'#7a6d51');r(2,10,29,4,'#b2a385');r(9,19,17,11,'#333e40');for(let x=10;x<26;x+=3)r(x,18,1,14,'#a39a7c');r(16,29,2,18,'#878977');
 }else if(kind==='crystal'){
  for(let j=0;j<5;j++){const x=3+j*6,h=8+hash(j,v)%21;r(x,40-h,4,h,'#71908e');r(x+1,37-h,2,3,'#c3cec0');r(x+1,40-h,1,h-2,'#d1d4bb')}line(2,40,29,'#d1d4bb');
 }else if(kind==='refuge'){
  r(2,25,28,17,'#4f4b43');r(3,24,26,4,'#999181');for(let j=0;j<4;j++){r(4+j*6,29,5,10,j%2?'#736578':'#687d7b');line(4+j*6,30,5,'#b1ae94')}r(7,13,18,10,'#756e5c');line(7,13,18,palette.salt);
 }else if(kind==='harpoon'){
  for(let j=0;j<3;j++){r(5+j*9,7+j*3,2,34-j*3,'#8c7856');r(4+j*9,3+j*3,4,8,'#a8b6ad');r(3+j*9,7+j*3,2,2,'#a8b6ad')}r(1,27,31,3,'#43463d');
 }else if(kind==='chain'){
  for(let y=2;y<42;y+=6){r(12,y,7,5,'#71847f');r(14,y+1,3,3,palette.ink)}r(4,36,24,4,'#5c7575');r(4,32,3,6,palette.salt);r(25,32,3,6,palette.salt);
 }else if(kind==='chair'){
  r(5,12,3,30,'#7f735b');r(23,12,3,30,'#7f735b');r(8,14,15,3,'#9c8e70');r(8,21,15,3,'#5b635a');r(4,29,23,4,'#93836a');r(7,33,2,12,'#605945');r(23,33,2,12,'#605945');r(16,34,3,3,'#bdb7a0');
 }else if(kind==='letters'){
  r(3,32,26,10,'#405256');for(let j=0;j<4;j++){r(5+j*5,26+j%2*2,7,8,'#b8b8a1');r(6+j*5,29+j%2*2,5,1,'#737c71')}r(4,36,25,2,'#203743');
 }else if(kind==='marker'){
  r(10,6,12,36,'#40585e');r(11,5,10,2,palette.salt);for(let j=0;j<5;j++){line(11,13+j*5,j%2?6:10,'#aeb8aa')}r(9,40,15,3,palette.edge);
 }
 cache.set(key,c);return c;
}
function entries(L){
 if(!L.townLand||L.interior)return [];if(plans.has(L))return plans.get(L);
 const p=[{kind:'tower',x:29,y:13,w:4},
 {kind:'net',x:9,y:19},{kind:'harpoon',x:12,y:20},{kind:'bones',x:18,y:25},
 {kind:'saint',x:19,y:26},{kind:'arch',x:28,y:19},{kind:'winch',x:54,y:19},
 {kind:'chain',x:55,y:20},{kind:'marker',x:54,y:18},{kind:'letters',x:38,y:28},{kind:'chair',x:28,y:30},
 {kind:'crystal',x:32,y:14},{kind:'harpoon',x:9,y:14},{kind:'arch',x:37,y:20}];
 if(L.townAct>=2)p.push({kind:'crystal',x:28,y:18},{kind:'marker',x:52,y:22});
 if(L.townAct>=3)p.push({kind:'crystal',x:20,y:29},{kind:'crystal',x:38,y:23});
 if(L.townAct>=4)p.push({kind:'refuge',x:28,y:15},{kind:'refuge',x:43,y:18});
 plans.set(L,p);return p;
}
function ground(g,L,{w,h,camera,viewport,now,reduced}){
 if(!L.townLand||L.interior)return;
 g.save();g.imageSmoothingEnabled=false;
 const r=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),ww,hh)};
 const phase=reduced?0:Math.floor(now/180);
 const x0=Math.max(0,Math.floor(camera.x/32)-1),x1=Math.min(w-1,Math.ceil((camera.x+viewport.w)/32)+1),y0=Math.max(0,Math.floor(camera.y/32)-4),y1=Math.min(h-1,Math.ceil((camera.y+viewport.h)/32)+1);
 // A continuous sea field, including the cleft and beyond the map edges.
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const i=y*w+x;if(L.townLand[i])continue;
  r(x*32,y*32,32,32,'#0d2736');
  for(let j=0;j<7;j++){const n=hash(x*13+j,y);const px=x*32+(n+phase)%32,py=y*32+(n>>>8)%30;r(px,py,Math.min(32-(px-x*32),4+n%11),1,j%3?'#1e4353':'#426773')}
  if(hash(x,y)%9===0){const yy=y*32+12+(phase%3);r(x*32+2,yy+4,5,1,'#476d7a');r(x*32+7,yy+2,7,2,'#71989c');r(x*32+14,yy,8,2,'#91b1ad');r(x*32+22,yy+3,6,1,'#456c7a')}
  // Storm foam against the foot of every carved cliff.
  if(y>0&&L.townLand[i-w])for(let j=0;j<5;j++)r(x*32+j*6, y*32+24+(j+phase)%5,5,1,'#91b2ae');
 }
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const i=y*w+x;if(!L.townLand[i])continue;
  if(y<h-1&&!L.townLand[i+w]){
   const base=(y+1)*32;r(x*32,base,32,91,'#122a36');
   g.save();g.globalAlpha=.52;if(hash(x,y)%2){g.translate((x+1)*32,base);g.scale(-1,1);g.drawImage(sprite('cliff'),0,0)}else g.drawImage(sprite('cliff'),x*32,base);g.restore();
   r(x*32,base,32,3,'#627b7b');r(x*32,base+3,32,4,'#203b48');r(x*32,base+89,32,7,'#163b49');
   for(let j=0;j<4;j++){const n=hash(x,j);r(x*32+j*8+2,base+8,1,8+n%23,'#839994');r(x*32+j*8,base+92+n%3,6,1,'#6c969c')}
  }
  if(x>0&&!L.townLand[i-1]){r(x*32,y*32,3,32,'#73908f');r(x*32+3,y*32,4,32,'#122733')}
  // Continuous salt runoff, rainwater channels and subtle wet-stone glints.
  if(L.townLanes?.[i]&&hash(x,y)%5===0){r(x*32+3,y*32+25,23,2,'#294855');r(x*32+7,y*32+25,11,1,'#69817f')}
 }
 // Retaining courses make the middle and lower terraces read as separate ledges.
 for(const yy of[15,21])for(let x=8;x<56;x++){
  const i=yy*w+x;if(!L.townLand[i]||!L.townLand[i-w]||L.bld?.[i]||L.bld?.[i-w])continue;
  if((L.townStairs||[]).some(([sx,sy,sw,sh])=>x>=sx&&x<sx+sw&&yy>=sy&&yy<sy+sh))continue;
  r(x*32,yy*32,32,9,'#132a36');r(x*32,yy*32,32,2,'#667f81');
  for(let j=0;j<4;j++){r(x*32+j*8+2,yy*32+4,6,3,'#3c535c');if(hash(x,j)%3===0)r(x*32+j*8+3,yy*32+2,1,8,'#95a49a')}
 }
 for(const [x,y,ww,hh]of L.townStairs||[]){
  for(let j=0;j<hh*4;j++){r(x*32,y*32+j*8,ww*32,5,'#263e49');r(x*32+2,y*32+j*8,ww*32-4,1,'#81928d');for(let k=0;k<ww*4;k++){const n=hash(k,j);r(x*32+k*8+2,y*32+j*8+2,3+n%3,1,n%2?'#48616a':'#354b55')} r(x*32,y*32+j*8+5,ww*32,3,'#0d202d')}
  r(x*32,y*32,3,hh*32,'#7a8e8b');r((x+ww)*32-3,y*32,3,hh*32,'#7a8e8b');
 }
 for(const[x,y,ww,hh]of L.townBridges||[]){
  for(let j=0;j<ww*4;j++){r(x*32+j*8,y*32,7,hh*32,'#6e756a');r(x*32+j*8,y*32,1,hh*32,'#a1aa97')}
  for(const yy of[y*32,(y+hh)*32-3]){r(x*32,yy,ww*32,3,'#314d55');for(let j=0;j<=ww;j++)r((x+j)*32,yy-7,3,10,'#9aa69b')}
 }
 // Shipwrecks establish the scale of the drop below the lowest inhabited ledge.
 g.drawImage(sprite('wreck'),7*32,31*32);g.drawImage(sprite('wreck'),46*32,32*32);
 g.restore();
}
function draw(g,d,L,hero,now,reduced){
 const im=sprite(d.kind),x=d.x*32,y=(d.y+1)*32-im.height;
 g.save();if(hero.x>=d.x-1&&hero.x<d.x+(d.w||im.width/32)+1&&hero.y<=d.y&&hero.y*32>y-32)g.globalAlpha*=.3;
 g.drawImage(im,x,y);g.restore();
}
function facade(g,b,r,L,now=0,reduced=false){
 // Thin salt rivulets, buttress repairs and bone lintels link reused facades to the cliff kit.
 g.save();g.fillStyle='#a9b6a4';g.globalAlpha=.48;
 for(let j=0;j<b.w*2;j++){const n=hash(j,b.x),x=r.x+6+n%(r.w-12),y=r.y+r.h-22-n%43;g.fillRect(x,y,1,4+n%13)}
 g.globalAlpha=.65;g.fillStyle='#627c7c';g.fillRect(r.x+2,r.y+r.h-6,r.w-4,2);
 if(['smith','tavern','cottage'].includes(b.key))for(let k=0;k<5;k++){const drift=reduced?0:Math.floor(now/400)%8;g.globalAlpha=.12-k*.015;g.fillStyle='#a6b4b4';g.fillRect(r.x+r.w*.72-k*3-drift,r.y+12-k*7,5+k*3,4+k)}
 g.globalAlpha=1;g.fillStyle='#090f17';const cy=r.y+9,cx=r.x+11;g.fillRect(cx,cy,5,3);g.fillRect(cx-3,cy+2,3,1);g.fillRect(cx+5,cy+2,4,1);g.restore();
}
const api={palette,sprite,floor,entries,ground,draw,facade,ready,errors,atlasCells};root.SaltmarrowCoast=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
