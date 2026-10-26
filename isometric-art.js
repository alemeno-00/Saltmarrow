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
    buildings:{url:'assets/art/buildings.webp',cols:4,rows:2,keys:buildings},
    actors:{url:'assets/art/actors.webp',cols:8,rows:6,keys:actors},
    props:{url:'assets/art/props.webp',cols:6,rows:4,keys:props},
    structures:{url:'assets/art/lift.webp',cols:1,rows:1,keys:['lift']},
    terrain:{url:'assets/art/terrain.webp',cols:4,rows:2,keys:terrain}
  };
  const short=new Set(['rat','wolf','spider','bat','direwolf','eel','saltleecher','marrowmite','ratking']);
  const npcAliases={mara:'traveller',silas:'traveller',wenna:'folk_woman',peddler:'rook',ada:'nell',isobel:'folk_woman',tam:'folk'};
  function cellRect(width,height,spec,index){const w=width/spec.cols,h=height/spec.rows;return{x:index%spec.cols*w,y:Math.floor(index/spec.cols)*h,w,h}}
  function actorHeight(key){return short.has(key)?25:['shift','choir','saint','stalker','abbot','horror'].includes(key)?64:48}
  const api={specs,cellRect,actorHeight,errors:[],atlases:{},loaded:false};
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
    // The generated sheet has uneven gutters. Extract connected silhouettes before
    // scaling so adjacent boots, weapons and heads never leak into another actor.
    const c=canvas(image.width,image.height),g=c.getContext('2d');g.drawImage(image,0,0);
    const data=g.getImageData(0,0,c.width,c.height),p=data.data,w=c.width,h=c.height;
    const ids=new Int32Array(w*h),queue=new Int32Array(w*h),components=[];
    let id=0;
    for(let n=0;n<ids.length;n++){
      if(ids[n]||p[n*4+3]<=32)continue;
      id++;let head=0,tail=1,area=0,sumX=0,sumY=0,x0=w,y0=h,x1=0,y1=0;queue[0]=n;ids[n]=id;
      while(head<tail){const q=queue[head++],x=q%w,y=Math.floor(q/w);area++;sumX+=x;sumY+=y;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
        for(const v of [x>0?q-1:-1,x+1<w?q+1:-1,y>0?q-w:-1,y+1<h?q+w:-1])if(v>=0&&!ids[v]&&p[v*4+3]>32){ids[v]=id;queue[tail++]=v}
      }
      if(area>=40)components.push({id,area,cx:sumX/area,cy:sumY/area,x0,y0,x1,y1});
    }
    const rowEdges=[0,.1794,.3453,.5008,.6603,.8102,1].map(v=>v*h),groups=spec.keys.map(()=>[]);
    for(const part of components){let row=0;while(row<5&&part.cy>=rowEdges[row+1])row++;const col=Math.min(7,Math.floor(part.cx/w*8));groups[row*8+col].push(part)}
    return groups.map((parts,i)=>{
      if(!parts.length)return crop(image,cellRect(w,h,spec,i),true);
      const x0=Math.min(...parts.map(p=>p.x0)),x1=Math.max(...parts.map(p=>p.x1)),y0=Math.min(...parts.map(p=>p.y0)),y1=Math.max(...parts.map(p=>p.y1));
      const allowed=new Set(parts.map(p=>p.id)),out=canvas(x1-x0+1,y1-y0+1),og=out.getContext('2d'),d=og.createImageData(out.width,out.height);
      for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++){const n=(y+y0)*w+x+x0;if(allowed.has(ids[n])){const dest=(y*out.width+x)*4;d.data.set(p.subarray(n*4,n*4+4),dest)}}
      og.putImageData(d,0,0);return out;
    });
  }
  function native(source,height){const c=canvas(source.width*height/source.height,height),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(source,0,0,c.width,c.height);return c}
  api.ready=Promise.all(Object.entries(specs).map(([name,spec])=>new Promise(resolve=>{
    const image=new Image();image.onload=()=>{try{
      const cells={},actorSources=name==='actors'?splitActors(image,spec):null;spec.keys.forEach((key,i)=>{const source=actorSources?actorSources[i]:crop(image,cellRect(image.width,image.height,spec,i),name!=='terrain');
        const im=name==='actors'?native(source,actorHeight(key)):name==='props'?native(source,key==='lamp'?80:48):source;
        cells[key]={image:im,source,white:null};
      });api.atlases[name]=cells;
    }catch(e){api.errors.push(name+': '+e.message)}resolve()};
    image.onerror=()=>{api.errors.push('Unable to load '+spec.url);resolve()};image.src=spec.url;
  }))).then(()=>{api.loaded=true;return api});
  api.get=(group,key)=>api.atlases[group]?.[key]||null;
  api.actor=key=>api.get('actors',npcAliases[key]||key);
  api.hit=(asset,x,y)=>{const im=asset.image;x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=im.width||y>=im.height)return false;if(!asset.alpha)asset.alpha=im.getContext('2d').getImageData(0,0,im.width,im.height).data;return asset.alpha[(y*im.width+x)*4+3]>48};
  api.white=asset=>{if(asset.white)return asset.white;const c=canvas(asset.image.width,asset.image.height),g=c.getContext('2d');g.drawImage(asset.image,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff5d3';g.fillRect(0,0,c.width,c.height);return asset.white=c};
  api.square=key=>{const a=api.actor(key);if(!a)return null;if(a.square)return a.square;const c=canvas(64,64),g=c.getContext('2d');g.imageSmoothingEnabled=false;const im=a.image;g.drawImage(im,Math.round((64-im.width)/2),64-im.height);return a.square=c};
  api.portrait=key=>{const a=api.actor(key);if(!a)return null;if(a.portrait)return a.portrait;const c=canvas(48,48),g=c.getContext('2d'),s=a.source;g.imageSmoothingEnabled=false;g.fillStyle='#101e25';g.fillRect(0,0,48,48);const w=Math.min(s.width,s.height*.48),h=s.height*.4;g.drawImage(s,(s.width-w)/2,0,w,h,1,1,46,46);return a.portrait=c};
  const townTiles=new Map();
  api.townTile=(variant=0,surface='stone')=>{
    variant%=4;const key=surface+variant;if(townTiles.has(key))return townTiles.get(key);
    const c=canvas(32,32),g=c.getContext('2d');
    const grass=surface==='grass',yard=surface==='yard';
    g.fillStyle=grass?'#1a2928':yard?'#1c2529':'#19252c';g.fillRect(0,0,32,32);
    if(grass){g.fillStyle='#20312d';g.fillRect(3+variant,5,13,9);g.fillRect(15,18-variant,12,8);g.fillStyle='#263630';g.fillRect(8,11,5,2)}
    else{
      const colors=yard?['#222d30','#242e31','#212b2f','#263033']:['#253238','#263339','#243137','#28353a'];
      for(let row=0;row<2;row++)for(let col=-1;col<3;col++){
        const x=col*16+(row%2?8:0),y=row*16;g.fillStyle=colors[(variant+row+col+4)%4];g.fillRect(x+1,y+1,15,15);
        g.fillStyle=yard?'#2a3536':'#2e3b40';g.fillRect(x+3,y+2,10,1);
      }
      // A few broad, quiet chips; no salt speckles, shimmer or noisy texture overlay.
      if(variant===2){g.fillStyle=yard?'#1c2529':'#19252c';g.fillRect(13,2,2,2);g.fillRect(25,18,2,1)}
    }
    townTiles.set(key,c);return c;
  };
  api.tile=(key,variant=0)=>{if(key==='town')return api.townTile(variant);const a=api.get('terrain',key);if(!a)return null;if(!a.tiles)a.tiles=[];variant=variant%4;if(a.tiles[variant])return a.tiles[variant];const s=a.source,w=s.width/2,h=s.height/2,c=canvas(32,32),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(s,variant%2*w,Math.floor(variant/2)*h,w,h,0,0,32,32);return a.tiles[variant]=c};
})(typeof globalThis!=='undefined'?globalThis:this);
