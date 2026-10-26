/* Pack generated source atlases without altering character identity.
   NODE_PATH=<Sharp directory> node tools/pack-carrion.cjs source/manifest.json
   Source manifest files are relative to the manifest. Raw generated art is
   archived with the task deliverables, not required by the runtime. */
const fs=require('fs'),path=require('path'),sharp=require('sharp'),crypto=require('crypto');
const sourceManifest=path.resolve(process.argv[2]||'');
const sourceRoot=path.dirname(sourceManifest),entries=JSON.parse(fs.readFileSync(sourceManifest,'utf8'));
const CELL=128,ANCHOR=[64,112],ALPHA=180,states=['idle','move','attack','hurt','defeat'];
const dest=path.resolve(__dirname,'../assets/carrion-brood');
const opaque=(data,w,x,y)=>data[(y*w+x)*4+3]>=ALPHA;
function bounds(data,w,box){let x0=box.right,y0=box.bottom,x1=-1,y1=-1,pixels=0;for(let y=box.top;y<box.bottom;y++)for(let x=box.left;x<box.right;x++)if(opaque(data,w,x,y)){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);pixels++;}if(pixels<100)throw Error('Empty source pose');return{left:x0,top:y0,right:x1+1,bottom:y1+1,pixels};}
function valley(data,w,h,axis,expected,extent,lo,hi){let best=expected,score=Infinity;for(let n=Math.max(1,Math.round(expected-extent));n<Math.min(axis==='y'?h:w,expected+extent);n++){let count=0;for(let i=lo;i<hi;i++)if(opaque(data,w,axis==='y'?i:n,axis==='y'?n:i))count++;const s=count+Math.abs(n-expected)*.35;if(s<score){score=s;best=n;}}return best;}
function sample(data,w,h,box,scale,frame,{aux=false,r=0,c=0}={}){const b=bounds(data,w,box),out=Buffer.alloc(CELL*CELL*4),cx=(box.left+box.right)/2,foot=b.bottom;
let xmin=CELL,ymin=CELL,xmax=-1,ymax=-1,pixels=0;
// Fixed scale across every pose; normalize foot location without resizing poses.
const rise=!aux&&r===2&&c===2&&frame.id==='sinewStalker'?7:0;
for(let y=1;y<CELL-1;y++)for(let x=1;x<CELL-1;x++){
 const dx=aux?[-1,0,1,0][c]:0,dy=aux&&r===0?[0,-1,0,1][c]:0;
 const collapse=aux&&r===4?[1,.8,.45,.2][c]:1;
 const sx=Math.floor(cx+(x-ANCHOR[0]-dx)/scale),sy=Math.floor(foot+(y-ANCHOR[1]+rise-dy)/(scale*collapse));
 if(sx<box.left||sx>=box.right||sy<box.top||sy>=box.bottom)continue;
 const si=(sy*w+sx)*4;if(data[si+3]<ALPHA)continue;const oi=(y*CELL+x)*4;
 for(let k=0;k<3;k++)out[oi+k]=Math.min(255,Math.round(data[si+k]/8)*8);out[oi+3]=255;
 xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);pixels++;
}
if(pixels<50||xmin<=1||xmax>=CELL-2||ymin<=1||ymax>=CELL-2)throw Error(`${frame.id} clipped or empty ${r},${c}: ${[xmin,ymin,xmax,ymax]}`);
return {out,metadata:{state:states[r],frame:c,source:box,bounds:[xmin,ymin,xmax,ymax],pixels,hash:crypto.createHash('sha256').update(out).digest('hex')}};
}
async function pack(entry){const source=path.join(sourceRoot,entry.file),{data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const w=info.width,h=info.height,ys=[0];for(let r=1;r<5;r++)ys.push(valley(data,w,h,'y',r*h/5,28,0,w));ys.push(h);
const boxes=[];for(let r=0;r<5;r++){const xs=[0];for(let c=1;c<4;c++)xs.push(valley(data,w,h,'x',c*w/4,24,ys[r],ys[r+1]));xs.push(w);for(let c=0;c<4;c++)boxes.push({left:xs[c],top:ys[r],right:xs[c+1],bottom:ys[r+1]});}
let scale=Infinity;for(const b of boxes){const bb=bounds(data,w,b);scale=Math.min(scale,104/(bb.right-bb.left),101/(bb.bottom-bb.top));}
const packed=Buffer.alloc(CELL*4*CELL*5*4),frames=[];
for(let r=0;r<5;r++)for(let c=0;c<4;c++){const {out,metadata}=sample(data,w,h,boxes[r*4+c],scale,entry,{r,c});for(let y=0;y<CELL;y++)out.copy(packed,((r*CELL+y)*CELL*4+c*CELL)*4,y*CELL*4,(y+1)*CELL*4);frames.push(metadata);}
const file=entry.id+'.png';await sharp(packed,{raw:{width:CELL*4,height:CELL*5,channels:4}}).png().toFile(path.join(dest,file));return{id:entry.id,file,sourceHash:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),scale,frames};}
async function aux(id,box){const {data,info}=await sharp(path.join(sourceRoot,'approved-concept.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true}),w=info.width,h=info.height;
// Retain the largest connected subject; removes the neighboring parasite tip.
const mask=new Uint8Array(w*h),seen=new Uint8Array(w*h);let largest=[];
for(let y=box.top;y<box.bottom;y++)for(let x=box.left;x<box.right;x++){const n=y*w+x;if(seen[n]||!opaque(data,w,x,y))continue;const component=[],queue=[n];seen[n]=1;for(let k=0;k<queue.length;k++){const n=queue[k],xx=n%w,yy=Math.floor(n/w);component.push(n);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const x=xx+dx,y=yy+dy,m=y*w+x;if(x>=box.left&&x<box.right&&y>=box.top&&y<box.bottom&&!seen[m]&&opaque(data,w,x,y)){seen[m]=1;queue.push(m);}}}if(component.length>largest.length)largest=component;}
for(const n of largest)mask[n]=1;for(let i=3;i<data.length;i+=4)if(!mask[(i-3)/4])data[i]=0;
const bb=bounds(data,w,box);box={left:bb.left-1,top:bb.top-1,right:bb.right+1,bottom:bb.bottom+1};const scale=Math.min((id==='broodEgg'?42:48)/(bb.right-bb.left),45/(bb.bottom-bb.top));
const packed=Buffer.alloc(CELL*4*CELL*5*4),frames=[];for(let r=0;r<5;r++)for(let c=0;c<4;c++){const {out,metadata}=sample(data,w,h,box,scale,{id},{aux:true,r,c});for(let y=0;y<CELL;y++)out.copy(packed,((r*CELL+y)*CELL*4+c*CELL)*4,y*CELL*4,(y+1)*CELL*4);frames.push(metadata);}
await sharp(packed,{raw:{width:CELL*4,height:CELL*5,channels:4}}).png().toFile(path.join(dest,id+'.png'));return{id,file:id+'.png',derived:true,frames};}
(async()=>{const atlases=[];for(const entry of entries){atlases.push(await pack(entry));console.log(entry.id+': 20 packed poses');}atlases.push(await aux('broodEgg',{left:790,top:1058,right:999,bottom:1247}));atlases.push(await aux('broodParasite',{left:1008,top:1080,right:1177,bottom:1247}));fs.writeFileSync(path.join(dest,'manifest.json'),JSON.stringify({cell:CELL,columns:4,rows:5,states,anchor:ANCHOR,alphaThreshold:ALPHA,ids:entries.filter(e=>!e.id.includes('-phase')).map(e=>e.id),authoredFrames:140,derivedAuxiliaryFrames:40,atlases},null,2)+'\n');})().catch(e=>{console.error(e);process.exitCode=1});
