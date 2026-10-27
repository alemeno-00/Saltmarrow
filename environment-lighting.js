/* Soft light is composited over native pixels; simulation lighting/FOV are never changed. */
(function(root){
'use strict';
const profiles={town:{dark:.18,tint:'#09151b',warm:'#efb873'},mine:{dark:.36,tint:'#080f15',warm:'#e6b26c'},crypt:{dark:.39,tint:'#0b101c',warm:'#ebbd84'},fungal:{dark:.34,tint:'#081915',warm:'#e4bf83'},drowned:{dark:.39,tint:'#08121d',warm:'#ecc494'},abbey:{dark:.38,tint:'#120d1b',warm:'#e6b082'},sewer:{dark:.37,tint:'#101810',warm:'#ddbb79'}};
const textures=new Map(),shapes=new WeakMap(),memories=new WeakMap();let mask=null,mg=null;
function falloff(d){if(d>=1)return 0;if(d<=0)return 1;return (Math.exp(-4*d*d)-Math.exp(-4))/(1-Math.exp(-4))}
function texture(radius,color='#ffffff'){
 const r=Math.max(4,Math.min(224,Math.round(radius))),key=r+color;if(textures.has(key))return textures.get(key);
 const c=document.createElement('canvas');c.width=c.height=r*2+2;const g=c.getContext('2d'),gr=g.createRadialGradient(r+1,r+1,0,r+1,r+1,r);
 const rgb=color.replace('#','').match(/../g).map(n=>parseInt(n,16));for(let k=0;k<=16;k++){const d=k/16;gr.addColorStop(d,`rgba(${rgb.join(',')},${falloff(d)})`)}g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);
 if(textures.size>=64)textures.delete(textures.keys().next().value);textures.set(key,c);return c;
}
function trace(map,w,h,x,y,r,blocked,steps=96){
 const points=[],origin=Math.floor(y/32)*w+Math.floor(x/32);
 for(let k=0;k<steps;k++){const a=k*Math.PI*2/steps,dx=Math.cos(a),dy=Math.sin(a);let distance=r;
  for(let d=4;d<=r;d+=4){const px=x+dx*d,py=y+dy*d,tx=Math.floor(px/32),ty=Math.floor(py/32),i=ty*w+tx;
   if(tx<0||ty<0||tx>=w||ty>=h){distance=d;break}if(i!==origin&&blocked(i)){distance=Math.min(r,d+5);break}}
  points.push({x:x+dx*distance,y:y+dy*distance});
 }return points;
}
function fingerprint(L){let n=2166136261;for(let i=0;i<L.map.length;i++)n=Math.imul(n^L.map[i]^(L.opq?.[i]?128:0),16777619);return n>>>0}
function collect(L,{w,h,hero,visible,now=0,reduced=false,extra=[],effects=[]}){
 const p=profiles[L.bio]||profiles.mine,sources=[];
 const add=(x,y,r,color,strength,kind='steady',head=0)=>{const i=Math.floor(y/32)*w+Math.floor(x/32);if(!visible[i])return;const pulse=reduced||kind==='steady'?1:1+Math.sin(now/(kind==='flame'?183:1470)+x*.17+y*.11)*(kind==='flame'?.025:.045);sources.push({x,y,r,color,strength:strength*pulse,head})};
 if(hero?.lantern)add(((hero.rx??hero.x)+.5)*32,((hero.ry??hero.y)+.5)*32,112,p.warm,.82,'steady');
 for(const o of L.objs||[]){const x=(o.x+.5)*32,y=(o.y+.5)*32;
  if(o.type==='lamp')add(x,y,112,p.warm,.87,'flame',49);
  else if(['forge','hearth'].includes(o.type))add(x,y,104,'#ef9e59',.96,'flame',19);
  else if(o.type==='brazier'&&o.lit)add(x,y,96,p.warm,.88,'flame',17);
  else if(o.type==='crystal')add(x,y,78,'#85c5da',.76,'glow',20);
  else if(o.type==='shroom')add(x,y,66,'#80c8ac',.66,'glow',13);
  else if(['altar','chandelier'].includes(o.type)||(o.type==='shrine'&&!o.used))add(x,y,70,p.warm,.58,'flame',12);
 }
 for(let i=0;i<L.map.length;i++){
  const x=(i%w+.5)*32,y=(Math.floor(i/w)+.5)*32;
  if(L.decal?.[i]===30)add(x,y+32,76,p.warm,.72,'flame',35);
  if(L.fire?.[i]>0)add(x,y,64,'#eaa466',.68,'flame',8);
 }
 for(const s of extra)add(s.x,s.y,64,p.warm,.42,'flame');
 for(const s of effects){const fade=Math.max(0,Math.min(1,1-(now-s.t0)/s.dur));if(fade)add(s.x,s.y,Math.min(160,s.r),/^#[0-9a-f]{6}$/i.test(s.c)?s.c:p.warm,.5*fade)}
 return sources;
}
function polygon(g,points){g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.clip()}
function seenClip(g,L,w){g.beginPath();if(L.townLand&&!L.interior&&L.seen.every(Boolean)){g.rect(0,0,w*32,Math.ceil(L.map.length/w)*32);g.clip();return}for(let i=0;i<L.map.length;i++)if(L.seen[i])g.rect(i%w*32,Math.floor(i/w)*32,32,32);g.clip()}
function point(g,x,y,r,color,alpha){g.save();g.globalCompositeOperation='screen';g.globalAlpha*=alpha;const im=texture(r,color);g.drawImage(im,Math.round(x-im.width/2),Math.round(y-im.height/2));g.restore()}
function memoryMask(L,w,h,visible){
 let revision=2166136261;for(let i=0;i<L.map.length;i++)revision=Math.imul(revision^(visible[i]?3:L.seen[i]?1:0),16777619);
 let cached=memories.get(L);if(cached?.revision===revision)return cached.image;
 const scale=8,ww=w*scale,hh=h*scale,a=new Float32Array(ww*hh),b=new Float32Array(ww*hh);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,alpha=visible[i]?0:L.seen[i]?(L.town?72:128):255;for(let yy=0;yy<scale;yy++)a.fill(alpha,(y*scale+yy)*ww+x*scale,(y*scale+yy)*ww+x*scale+scale)}
 // Two separable box passes approximate a soft 12px visibility edge. Only this alpha mask is softened.
 const radius=3,den=radius*2+1;
 for(let pass=0;pass<2;pass++){
  for(let y=0;y<hh;y++){const row=y*ww;let sum=a[row]*radius;for(let k=0;k<=radius;k++)sum+=a[row+k];for(let x=0;x<ww;x++){b[row+x]=sum/den;sum+=a[row+Math.min(ww-1,x+radius+1)]-a[row+Math.max(0,x-radius)]}}
  for(let x=0;x<ww;x++){let sum=b[x]*radius;for(let k=0;k<=radius;k++)sum+=b[k*ww+x];for(let y=0;y<hh;y++){a[y*ww+x]=sum/den;sum+=b[Math.min(hh-1,y+radius+1)*ww+x]-b[Math.max(0,y-radius)*ww+x]}}
 }
 const c=document.createElement('canvas');c.width=ww;c.height=hh;const cg=c.getContext('2d'),im=cg.createImageData(ww,hh);for(let i=0;i<a.length;i++)im.data[i*4+3]=Math.round(a[i]);cg.putImageData(im,0,0);memories.set(L,{revision,image:c});return c;
}
function draw(g,L,opt){
 const {w,h,camera:c,viewport:v,hero,visible,types,now=0,reduced=false}=opt,p=profiles[L.bio]||profiles.mine;
 if(!mask){mask=document.createElement('canvas');mg=mask.getContext('2d')}
 const vw=Math.ceil(v.w),vh=Math.ceil(v.h);if(mask.width!==vw||mask.height!==vh){mask.width=vw;mask.height=vh}
 mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,vw,vh);mg.fillStyle=p.tint;mg.globalAlpha=p.dark;mg.fillRect(0,0,vw,vh);mg.globalAlpha=1;mg.translate(-c.x,-c.y);
 const sources=collect(L,opt).filter(s=>s.x+s.r>c.x&&s.x-s.r<c.x+v.w&&s.y+s.r>c.y&&s.y-s.r<c.y+v.h).sort((a,b)=>Math.hypot(a.x-(hero.x+.5)*32,a.y-(hero.y+.5)*32)-Math.hypot(b.x-(hero.x+.5)*32,b.y-(hero.y+.5)*32)).slice(0,32);
 const revision=fingerprint(L);let cache=shapes.get(L);if(!cache||cache.revision!==revision){cache={revision,paths:new Map()};shapes.set(L,cache)}
 const blocked=i=>[types.wall,types.crack,types.door,types.gate,types.grass].includes(L.map[i])||!!L.opq?.[i];
 for(const s of sources){const key=[s.x,s.y,s.r].join(',');let path=cache.paths.get(key);if(!path){path=trace(L.map,w,h,s.x,s.y,s.r,blocked);if(cache.paths.size>=80)cache.paths.delete(cache.paths.keys().next().value);cache.paths.set(key,path)}s.path=path;
  mg.save();polygon(mg,path);mg.globalCompositeOperation='destination-out';mg.globalAlpha=s.strength;const im=texture(s.r);mg.drawImage(im,Math.round(s.x-im.width/2),Math.round(s.y-im.height/2));mg.restore();
 }
 g.save();g.save();g.imageSmoothingEnabled=true;g.drawImage(memoryMask(L,w,h,visible),0,0,w*32,h*32);g.restore();g.drawImage(mask,c.x,c.y);seenClip(g,L,w);
 for(const s of sources){g.save();polygon(g,s.path);point(g,s.x,s.y,s.r,s.color,.16*s.strength);g.restore();if(s.head)point(g,s.x,s.y-s.head,18,s.color,.23*s.strength)}
 // Quiet floating dust/spores only around visible physical emitters; reduced motion is static.
 if(!reduced&&!L.town){for(let k=0;k<Math.min(8,sources.length);k++){const s=sources[k],phase=now/4200+k*1.7,px=s.x+Math.sin(phase)*18,py=s.y-10-(phase%1)*19;const i=Math.floor(py/32)*w+Math.floor(px/32);if(!visible[i])continue;g.globalAlpha=.16;g.fillStyle=L.bio==='fungal'?'#b6d7ac':'#d7c5a1';g.fillRect(Math.round(px),Math.round(py),1,1)}}
 g.restore();return{sources:sources.length,textures:textures.size,shadowPaths:cache.paths.size};
}
function detail(g,L,tiles,{w,types,visible,actors=[]}){
 if(L.town)return;
 const hash=(x,y)=>{let n=Math.imul(x+19,374761393)^Math.imul(y+43,668265263);return(n^(n>>>13))>>>0};
 const occupied=new Set([...actors,...(L.items||[]),...(L.objs||[]),...(L.traps||[])].map(o=>o.y*w+o.x));
 g.save();const r=(x,y,a,b,col)=>{g.fillStyle=col;g.fillRect(x,y,a,b)};
 for(const{x,y,i}of tiles){if(L.map[i]!==types.floor||L.decal?.[i]||L.weak?.[i]||L.fire?.[i]||L.spore?.[i]||L.smoke?.[i]||occupied.has(i))continue;
  const n=hash(x,y),north=L.map[i-w]===types.wall,shore=[i-1,i+1,i-w,i+w].some(j=>L.map[j]===types.water);
  if(!north&&!shore||n%3===0)continue;g.globalAlpha=visible[i]?.45:.17;const xx=x*32,yy=y*32;
  if(L.bio==='fungal'){
   // Roots branch along the wall margin; tiny caps interrupt the silhouette.
   for(let j=0;j<5;j++){r(xx+3+j*5,yy+5+j%2*2,6,1,'#51715a');r(xx+5+j*5,yy+7+j%2*2,1,3,'#3d594b')}
   for(let j=0;j<3;j++){const px=xx+5+j*9;r(px,yy+3+j%2*2,1,4,'#76998a');r(px-2,yy+2+j%2*2,5,2,j%2?'#688b86':'#65836d')}
  }else if(L.bio==='drowned'||L.bio==='sewer'){
   r(xx+2,yy+3,27,2,'#263f42');r(xx+6,yy+5,19,1,'#536d69');for(let j=0;j<4;j++){const px=xx+4+j*7;r(px,yy+8+j%2,3,2,'#75877b');r(px+1,yy+8+j%2,1,1,'#a6aa8d')}if(shore){r(xx+4,yy+18,21,1,'#4d686b');r(xx+9,yy+20,12,1,'#334c50')}
  }else if(L.bio==='crypt'||L.bio==='abbey'){
   r(xx+2,yy+4,15,2,'#3c4944');r(xx+17,yy+6,10,1,'#465349');for(let j=0;j<3;j++){r(xx+4+j*8,yy+9+j%2*2,4,1,'#777765');r(xx+6+j*8,yy+10+j%2*2,1,2,'#37413e')}
  }else if(L.bio==='mine'){
   r(xx+3,yy+3,22,2,'#343c32');for(let j=0;j<3;j++){r(xx+5+j*7,yy+7+j%2*3,4,2,'#74715a');r(xx+5+j*7,yy+7+j%2*3,2,1,'#aaa082')}
  }
 }g.restore();
}
const api={profiles,falloff,texture,trace,collect,point,draw,detail,memoryMask,cacheSize:()=>textures.size};root.SaltmarrowLighting=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
