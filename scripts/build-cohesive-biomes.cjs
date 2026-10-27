// Build exclusively from the three NEW matched v3 generation sheets. No legacy atlas inputs.
const fs=require('node:fs'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true});try{const page=await browser.newPage();const uri=p=>'data:image/png;base64,'+fs.readFileSync(p).toString('base64');const dir=process.argv[2]||'../../outputs/biome-art-v3/source';const input=Object.fromEntries(['terrain','props','landmarks'].map(k=>[k,uri(`${dir}/${k}.png`)]));
 const results=await page.evaluate(async input=>{const load=async s=>{const i=new Image();i.src=s;await i.decode();return i};const terrain=await load(input.terrain),props=await load(input.props),landmarks=await load(input.landmarks),out=[];
 for(const [row,bio]of ['sewer','fungal','crypt','mine'].entries()){const c=document.createElement('canvas');c.width=512;c.height=320;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const put=(im,cols,rows,x,y,id)=>{const sx=Math.round(im.width*x/cols)+2,sy=Math.round(im.height*y/rows)+2,sw=Math.round(im.width*(x+1)/cols)-sx-2,sh=Math.round(im.height*(y+1)/rows)-sy-2;g.drawImage(im,sx,sy,sw,sh,id%8*64,Math.floor(id/8)*64,64,64)};
 for(let id=0;id<16;id++){put(terrain,8,8,id%8,row*2+Math.floor(id/8),id);put(props,8,8,id%8,row*2+Math.floor(id/8),16+id)}
 for(let id=0;id<8;id++)put(landmarks,4,8,id%4,row*2+Math.floor(id/4),32+id);
 // One palette for all surfaces, functional props and landmarks in the biome.
 const d=g.getImageData(0,0,512,320),hist=new Map();for(let i=0;i<d.data.length;i+=4){if(d.data[i+3]<64)continue;const v=[0,1,2].map(k=>Math.min(255,Math.floor(d.data[i+k]/24)*24+12)),key=v.join(',');hist.set(key,(hist.get(key)||0)+1)}
 const palette=[];for(const [k]of [...hist].sort((a,b)=>b[1]-a[1])){const v=k.split(',').map(Number);if(!palette.some(p=>p.reduce((s,n,i)=>s+(n-v[i])**2,0)<400))palette.push(v);if(palette.length===96)break}
 const mapped=new Map();for(let i=0;i<d.data.length;i+=4){if(d.data[i+3]<16){d.data[i+3]=0;continue}const key=[0,1,2].map(k=>d.data[i+k]>>4).join(',');let v=mapped.get(key);if(!v){let cost=Infinity;for(const p of palette){const n=p.reduce((s,n,k)=>s+(n-d.data[i+k])**2,0);if(n<cost){v=p;cost=n}}mapped.set(key,v)}for(let k=0;k<3;k++)d.data[i+k]=v[k]}g.putImageData(d,0,0);
 for(let id=16;id<40;id++){const p=g.getImageData(id%8*64,Math.floor(id/8)*64,64,64).data;let n=0;for(let j=3;j<p.length;j+=4)if(p[j]<128)n++;if(n/4096<.12)throw Error(`${bio} cell ${id} lacks transparent margins`)}
 out.push({bio,png:c.toDataURL('image/png').split(',')[1],colors:palette.length});
 }return out;},input);
 for(const r of results){fs.writeFileSync(`assets/biomes/${r.bio}-v3.png`,Buffer.from(r.png,'base64'));console.log(r.bio,r.colors,'shared colors')}
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
