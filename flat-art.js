/* Saltmarrow art assets. Presentation only: no game-state or collision mutations. */
(function(root){
  'use strict';
  const buildings=['smith','chapel','hall','tavern','archive','cottage','apoth','house'];
  const actors=[
    'riptide','shadow','storm','flag','occult','tobias','agathe','hale',
    'bram','nell','sailor_npc','pip','traveller','folk_woman','folk','rook',
    'rat','wolf','sapper','skeleton','ghoul','cultist','spider','shambler',
    'bat','direwolf','eel','harp','knight','wraith','horror','sailor',
    'husk','gaunt','host','deepone','saltleecher','bellbound','marrowmite','glassoracle',
    'chainwretch','shift','choir','saint','stalker','abbot','ratking','bonewitch'
  ];
  const props=['chest','chestOpen','barrel','crate','keg','brazier','brazierCold','shrine','coffin','coffinOpen','crystal','shroom','lever','leverOn','cart','bell','anvil','forge','shelf','altar','statue','table','bed','lamp'];
  const terrain=['town','mine','crypt','fungal','drowned','planks','masonry','bridge'];
  const specs={
    buildings:{url:'assets/flat/buildings.webp',cols:4,rows:2,keys:buildings},
    actors:{url:'assets/flat/actors.webp',cols:8,rows:6,keys:actors},
    props:{url:'assets/flat/props.webp',cols:6,rows:4,keys:props},
    structures:{url:'assets/flat/lift.webp',cols:1,rows:1,keys:['lift']},
    terrain:{url:'assets/flat/terrain.webp',cols:4,rows:2,keys:terrain}
  };
  const short=new Set(['rat','wolf','spider','bat','direwolf','eel','saltleecher','marrowmite','ratking']);
  const npcAliases={mara:'traveller',silas:'traveller',wenna:'folk_woman',peddler:'rook',ada:'nell',isobel:'folk_woman',tam:'folk'};
  function cellRect(width,height,spec,index){const w=width/spec.cols,h=height/spec.rows;return{x:index%spec.cols*w,y:Math.floor(index/spec.cols)*h,w,h}}
  function actorHeight(key){return short.has(key)?25:['shift','choir','saint','stalker','abbot','horror'].includes(key)?64:48}
  const api={specs,cellRect,actorHeight,errors:[],atlases:{},loaded:false};
  // Equipment is composed in native pixels; no rotated/resampled weapon bitmaps.
  const weaponKinds={maul:'mace',pick:'axe',hook:'hook',knife:'dagger',xbow:'ranged',rod:'staff',censer:'censer',scourge:'whip',fetish:'focus',sword:'sword',axe:'axe',spear:'spear',dagger:'dagger',bow:'ranged',staff:'staff',shield:'shield',mace:'mace'};
  api.weaponKind=base=>weaponKinds[base]||null;
  api.weaponStyle=(base,ability,style)=>{
    if(!weaponKinds[base])return style;
    // Keep spell, unarmed and signature area effects; equipment drives physical attacks.
    if(ability.kind==='melee'&&!['headbutt','garrote','vanish'].includes(ability.id))return {mace:'smash',axe:'smash',dagger:'thrust',spear:'thrust',ranged:'thrust',staff:'thrust',censer:'whip',focus:'cast',hook:'hook',whip:'whip',shield:'smash',sword:'slash'}[weaponKinds[base]];
    if(ability.kind==='ranged'&&base==='xbow'&&!ability.tome&&!ability.el)return 'thrust';
    return style;
  };
  api.weaponDeathKind=(base,ab,element,fallback)=>{
    if(element||ab.kind!=='melee'||['headbutt','garrote','vanish'].includes(ab.id))return fallback;
    const k=api.weaponKind(base);
    return ['dagger','spear','ranged','hook'].includes(k)?'piercing':['mace','shield','staff','censer'].includes(k)?'impact':k==='focus'?'occult':k? 'slash':fallback;
  };
  api.weaponPose=(base,e,now,action,reduced=false)=>{
    const kind=api.weaponKind(base);if(!kind)return null;
    const north=Math.abs(e.fy||0)>Math.abs(e.fx||0)&&e.fy<0,side=e.fx<0?-1:1;
    const moving=Math.abs((e.rx??e.x)-e.x)+Math.abs((e.ry??e.y)-e.y)>.04;
    let x=side*9,y=-21,angle=-1.15,phase='idle',off=0;
    if(moving&&!reduced){y+=Math.floor(now/130)%2;angle+=Math.sin(now/130)*.08;phase='walk'}
    if(action&&action.base===base&&now>=action.t0&&now<action.end&&!reduced){
      const t=(now-action.t0)/(action.impact-action.t0),recover=Math.max(0,(now-action.impact)/(action.end-action.impact));
      const power=t<1?Math.max(0,(t-.65)/.35):1-recover;
      phase=t<.65?'windup':t<1?'strike':kind==='ranged'?'reload':'recover';
      if(['dagger','spear','ranged'].includes(kind)){x+=side*(power*(kind==='spear'?13:8)-(t<.65?3*t:0));angle=kind==='ranged'?0:-.15;y-=kind==='ranged'?4:0;if(phase==='reload'){y+=Math.sin(recover*Math.PI)*5;angle+=Math.sin(recover*Math.PI)*.55}}
      else if(['axe','mace','shield'].includes(kind)){y-=t<.65?Math.sin(t/.65*Math.PI/2)*14:(1-power)*9;angle=t<.65?-1.15-t*2.3:-2.65+power*3.4}
      else if(['staff','focus','censer'].includes(kind)){y-=Math.sin(Math.min(1,t)*Math.PI/2)*8*(1-recover);angle=-1.4+power*.5}
      else{angle=t<.65?-1.15-t*2:-2.45+power*3.5;x+=side*power*5}
      // The same snapped directional aim is used for hands and weapon.
      if(Math.abs(action.dy)>Math.abs(action.dx)){x=side*(6+power*3);y+=action.dy*power*8;angle=action.dy<0?-1.57:1.25}
    }
    return{kind,x:Math.round(x),y:Math.round(y),angle,side,back:north,phase};
  };
  api.drawWeapon=(g,pose,base,now=0)=>{
    if(!pose)return;const {kind,x,y,angle,side}=pose;
    const pixel=(u,v,w,h,c)=>{g.fillStyle=c;for(let a=0;a<w;a++)for(let b=0;b<h;b++){const dx=u+a,dy=v+b;g.fillRect(Math.round(x+side*(Math.cos(angle)*dx-Math.sin(angle)*dy)),Math.round(y+Math.sin(angle)*dx+Math.cos(angle)*dy),1,1)}};
    const wood='#785332',metal='#99adb3',edge='#d9e4db',dark='#17242c',gold='#b69a57';
    // Draw the sleeve from the shoulder to the moving grip before the held object.
    const shoulder={x:side*5,y:-25};
    for(let i=0;i<=12;i++){const q=i/12;g.fillStyle=i<8?'#304759':'#c08c60';g.fillRect(Math.round(shoulder.x+(x-shoulder.x)*q)-1,Math.round(shoulder.y+(y-shoulder.y)*q)-1,3,3)}
    const shaft=['staff','spear'].includes(kind)?23:['dagger','focus','shield'].includes(kind)?7:16;
    pixel(-3,-2,shaft,4,dark);pixel(-2,-1,shaft-2,2,wood);
    if(['sword','dagger','spear'].includes(kind)){const len=kind==='dagger'?9:kind==='spear'?22:16;pixel(3,-2,len,4,dark);pixel(4,-1,len-1,2,metal);pixel(5,-1,len-2,1,edge);pixel(2,-4,2,8,gold)}
    else if(kind==='axe'){pixel(10,-7,6,13,dark);pixel(11,-6,5,11,metal);pixel(15,-5,1,9,edge)}
    else if(kind==='mace'){pixel(10,-5,8,10,dark);pixel(11,-4,6,8,metal);pixel(12,-4,2,7,edge)}
    else if(kind==='ranged'){pixel(5,-9,3,18,dark);pixel(6,-8,1,16,wood);pixel(3,-8,1,16,metal);pixel(-4,-1,19,2,metal);if(pose.phase!=='reload')pixel(9,-1,8,1,edge)}
    else if(kind==='shield'){pixel(1,-8,12,16,dark);pixel(2,-7,10,13,gold);pixel(3,-6,8,11,wood);pixel(6,-2,3,4,metal)}
    else if(kind==='hook'){pixel(13,-4,2,8,metal);pixel(9,3,5,2,edge)}
    else if(kind==='whip'||kind==='censer'){for(let i=5;i<20;i++)pixel(i,Math.round(Math.sin(i*.5+now/150)*2),1,2,metal);if(kind==='censer'){pixel(18,-3,5,6,gold);pixel(19,-2,3,3,'#e5bf64')}}
    else{pixel(13,-4,6,8,dark);pixel(14,-3,4,6,base==='fetish'?'#b9a890':'#59b9cf');pixel(15,-3,2,2,edge)}
    // Fingers cover the grip. A second hand supports long weapons and the crossbow.
    pixel(-2,-2,4,4,'#c08c60');if(['spear','staff','ranged','axe','mace'].includes(kind))pixel(4,-2,3,3,'#c08c60');
  };
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.SaltmarrowArt=api;
  if(typeof document==='undefined')return;
  const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
  function crop(image,r,trim){
    const raw=canvas(r.w,r.h),g=raw.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(image,r.x,r.y,r.w,r.h,0,0,r.w,r.h);
    if(!trim)return raw;
    const d=g.getImageData(0,0,raw.width,raw.height).data;let x0=raw.width,y0=raw.height,x1=-1,y1=-1;
    for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(d[(y*raw.width+x)*4+3]>32){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
    if(x1<0)throw Error('Empty atlas cell');
    const c=canvas(x1-x0+1,y1-y0+1);c.getContext('2d').drawImage(raw,x0,y0,c.width,c.height,0,0,c.width,c.height);return c;
  }
  function splitActors(image,spec){
    // Find transparent gutters near each expected boundary. This keeps weapons and
    // translucent bodies intact when a generated sheet has slightly uneven rows.
    const c=canvas(image.width,image.height),g=c.getContext('2d');g.drawImage(image,0,0);
    const d=g.getImageData(0,0,c.width,c.height).data,w=c.width,h=c.height;
    function cuts(n,size,score){const out=[0];for(let i=1;i<n;i++){const center=i*size/n,radius=size/n*.23;let best=Math.round(center),cost=Infinity;
      for(let v=Math.ceil(center-radius);v<Math.floor(center+radius);v++){const sum=score(v-1)+score(v)+score(v+1)+Math.abs(v-center)*.001;if(sum<cost){cost=sum;best=v}}out.push(best)}out.push(size);return out}
    const ys=cuts(spec.rows,h,y=>{let n=0;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>96)n++;return n});
    const cells=[];for(let row=0;row<spec.rows;row++){const y0=ys[row],y1=ys[row+1],xs=cuts(spec.cols,w,x=>{let n=0;for(let y=y0;y<y1;y++)if(d[(y*w+x)*4+3]>96)n++;return n});
      for(let col=0;col<spec.cols;col++)cells.push(crop(image,{x:xs[col],y:y0,w:xs[col+1]-xs[col],h:y1-y0},true))}
    return cells;
  }
  function native(source,height){const c=canvas(source.width*height/source.height,height),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(source,0,0,c.width,c.height);return c}
  api.ready=Promise.all(Object.entries(specs).map(([name,spec])=>new Promise(resolve=>{
    const image=new Image();image.onload=()=>{try{
      const cells={},actorSources=['actors','buildings','props'].includes(name)?splitActors(image,spec):null;spec.keys.forEach((key,i)=>{const source=actorSources?actorSources[i]:crop(image,cellRect(image.width,image.height,spec,i),name!=='terrain');
        const im=name==='actors'?native(source,actorHeight(key)):name==='props'?native(source,key==='lamp'?80:48):source;
        cells[key]={image:im,source,white:null};
      });api.atlases[name]=cells;
    }catch(e){api.errors.push(name+': '+e.message)}resolve()};
    image.onerror=()=>{api.errors.push('Unable to load '+spec.url);resolve()};image.src=spec.url;
  }))).then(()=>{api.loaded=true;return api});
  const staticReady=api.ready;
  const heroFrames=[],monsterFrames={},portraits={};
  const loadImage=url=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{api.errors.push('Unable to load '+url);resolve(null)};im.src=url});
  function animationCells(im,cols,rows,height){
    const sources=Array.from({length:cols*rows},(_,i)=>crop(im,cellRect(im.width,im.height,{cols,rows},i),true));
    // Normalize every frame using one scale, preserving the walk and attack silhouettes.
    const factor=height/Math.max(...sources.map(c=>c.height));
    return sources.map(source=>{const c=canvas(80,height+8),g=c.getContext('2d');g.imageSmoothingEnabled=false;const w=Math.round(source.width*factor),h=Math.round(source.height*factor);g.drawImage(source,Math.round((80-w)/2),c.height-h,w,h);return{image:c,source,white:null,directional:true}});
  }
  api.ready=Promise.all([staticReady,loadImage('assets/flat/hero.webp').then(im=>{if(im)heroFrames.push(...animationCells(im,4,4,48))}),loadImage('assets/flat/monsters.webp').then(im=>{if(!im)return;const frames=animationCells(im,4,5,48);['rat','cultist','wraith','ghoul','shambler'].forEach((key,row)=>monsterFrames[key]=frames.slice(row*4,row*4+4))}),loadImage('assets/flat/reference.webp').then(im=>{
    if(!im)return;const rects=[[1359,56,76,74],[1444,56,75,74],[1358,143,76,75],[1444,144,76,74]];
    ['riptide','storm','flag','shadow'].forEach((key,i)=>{const [x,y,w,h]=rects[i];const c=canvas(48,48),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,x,y,w,h,0,0,48,48);portraits[key]=c});portraits.occult=portraits.shadow;
  })]).then(()=>api);
  api.frameAsset=(key,e,now,reduced)=>{
    const moving=Math.abs((e.rx??e.x)-e.x)+Math.abs((e.ry??e.y)-e.y)>.04;
    const attacking=!!e.lunge&&now-e.lunge.t0>=0&&now-e.lunge.t0<200;
    const col=reduced?0:attacking?3:moving?1+(Math.floor(now/130)%2):0;
    if(key==='riptide'&&heroFrames.length){const row=Math.abs(e.fy||0)>Math.abs(e.fx||0)?(e.fy<0?0:2):(e.fx<0?3:1);return heroFrames[row*4+col]}
    return monsterFrames[key]?.[col]||null;
  };
  const bareFrames=new WeakMap();
  api.heroBody=(key,e,now,reduced)=>{
    const original=api.frameAsset(key,e,now,reduced)||api.actor(key);if(!original)return null;if(key==='riptide'&&!heroFrames.length)return original;
    // Use resting/walking bodies: the atlas attack column contains a fixed hammer.
    const row=Math.abs(e.fy||0)>Math.abs(e.fx||0)?(e.fy<0?0:2):(e.fx<0?3:1);
    const moving=Math.abs((e.rx??e.x)-e.x)+Math.abs((e.ry??e.y)-e.y)>.04;
    const source=key==='riptide'&&heroFrames.length?heroFrames[row*4+(moving&&!reduced?1+Math.floor(now/130)%2:0)]:original;
    if(bareFrames.has(source))return bareFrames.get(source);
    const raw=key==='riptide'?source.source:source.image,c=canvas(raw.width,raw.height),g=c.getContext('2d');g.drawImage(raw,0,0);
    const w=c.width,h=c.height;
    if(key==='riptide'){
      const left=row===3;g.save();if(left){g.translate(w,0);g.scale(-1,1)}
      const top=row===0?.65:row===2?.67:.65,shaft=row===0?.72:row===2?.71:.63;
      g.clearRect(w*.58,0,w*.42,h*.14);g.clearRect(w*top,h*.14,w*(1-top),h*.28);
      g.clearRect(w*shaft,h*.42,w*(.84-shaft),h*.38);g.clearRect(w*(shaft+.04),h*.8,w*.08,h*.09);
      g.clearRect(w*.84,h*.42,w*.16,h*.46);g.restore();
    }else{
      // Each class has a right-hand prop in the source atlas. Retain its hand.
      const cut={shadow:.65,storm:.72,flag:.70,occult:.73}[key]??.8;
      g.clearRect(w*cut,key==='shadow'?h*.3:0,w*(1-cut),h);
    }
    const im=canvas(source.image.width,source.image.height),ig=im.getContext('2d');ig.imageSmoothingEnabled=false;
    if(key==='riptide'){const factor=48/Math.max(...heroFrames.map(f=>f.source.height));const ww=Math.round(w*factor),hh=Math.round(h*factor);ig.drawImage(c,Math.round((im.width-ww)/2),im.height-hh,ww,hh)}else ig.drawImage(c,0,0,im.width,im.height);
    const result={...source,image:im,white:null};bareFrames.set(source,result);return result;
  };
  api.animationCounts=()=>({hero:heroFrames.length,monsters:Object.values(monsterFrames).reduce((n,a)=>n+a.length,0)});
  api.get=(group,key)=>api.atlases[group]?.[key]||null;
  api.actor=key=>api.get('actors',npcAliases[key]||({mariner:'sailor',brinewraith:'wraith',admiral:'abbot'}[key])||key);
  api.hit=(asset,x,y)=>{const im=asset.image;x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=im.width||y>=im.height)return false;if(!asset.alpha)asset.alpha=im.getContext('2d').getImageData(0,0,im.width,im.height).data;return asset.alpha[(y*im.width+x)*4+3]>48};
  api.white=asset=>{if(asset.white)return asset.white;const c=canvas(asset.image.width,asset.image.height),g=c.getContext('2d');g.drawImage(asset.image,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff5d3';g.fillRect(0,0,c.width,c.height);return asset.white=c};
  api.square=key=>{const a=api.actor(key);if(!a)return null;if(a.square)return a.square;const c=canvas(64,64),g=c.getContext('2d');g.imageSmoothingEnabled=false;const im=a.image;g.drawImage(im,Math.round((64-im.width)/2),64-im.height);return a.square=c};
  api.portrait=key=>{if(portraits[key])return portraits[key];const a=api.actor(key);if(!a)return null;if(a.portrait)return a.portrait;const c=canvas(48,48),g=c.getContext('2d'),s=a.source;g.imageSmoothingEnabled=false;g.fillStyle='#101e25';g.fillRect(0,0,48,48);const w=Math.min(s.width,s.height*.48),h=s.height*.4;g.drawImage(s,(s.width-w)/2,0,w,h,1,1,46,46);return a.portrait=c};
  const townTiles=new Map();
  api.townTile=(variant=0,surface='stone')=>{
    variant%=4;const key=surface+variant;if(townTiles.has(key))return townTiles.get(key);
    const c=canvas(32,32),g=c.getContext('2d');
    const grass=surface==='grass',yard=surface==='yard';
    g.fillStyle=grass?'#1a2928':yard?'#1c2529':'#202426';g.fillRect(0,0,32,32);
    if(grass){g.fillStyle='#20312d';g.fillRect(3+variant,5,13,9);g.fillRect(15,18-variant,12,8);g.fillStyle='#263630';g.fillRect(8,11,5,2)}
    else{
      const colors=yard?['#222d30','#242e31','#212b2f','#263033']:['#2a2e30','#2d3031','#292d2f','#303334'];
      for(let row=0;row<2;row++)for(let col=-1;col<3;col++){
        const x=col*16+(row%2?8:0),y=row*16;g.fillStyle=colors[(variant+row+col+4)%4];g.fillRect(x+1,y+1,15,15);
        g.fillStyle=yard?'#2a3536':'#383a38';g.fillRect(x+3,y+2,10,1);
      }
      // A few broad, quiet chips; no salt speckles, shimmer or noisy texture overlay.
      if(variant===2){g.fillStyle=yard?'#1c2529':'#202426';g.fillRect(13,2,2,2);g.fillRect(25,18,2,1)}
    }
    townTiles.set(key,c);return c;
  };
  api.tile=(key,variant=0)=>{if(key==='town')return api.townTile(variant);const a=api.get('terrain',key);if(!a)return null;if(!a.tiles)a.tiles=[];variant=variant%4;if(a.tiles[variant])return a.tiles[variant];const s=a.source,w=s.width/2,h=s.height/2,c=canvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(s,variant%2*w,Math.floor(variant/2)*h,w,h,0,0,32,32);return a.tiles[variant]=c};
})(typeof globalThis!=='undefined'?globalThis:this);
