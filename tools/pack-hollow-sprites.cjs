// Compile generated pose grids to aligned pixel frames; no concept-sheet crops.
// NODE_PATH=<runtime node_modules> node tools/pack-hollow-sprites.cjs input-manifest.json
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const manifest=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
(async()=>{for(const {id,source} of manifest){
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const w=info.width,h=info.height,scale=54/(h/5),packed=Buffer.alloc(512*640*4),boxes=[];
 for(let row=0;row<5;row++)for(let col=0;col<4;col++){
  // The generated flail/smoke strike extends into the otherwise empty fourth cell margin.
  let left=Math.round(col*w/4),right=Math.round((col+1)*w/4);
  if(row===2&&id==='ashenPenitent'){if(col===2)right=Math.round(w*.84);if(col===3)left=Math.round(w*.84)}
  const top=Math.round(row*h/5),bottom=Math.round((row+1)*h/5),anchorX=(col+.5)*w/4,anchorY=(row+1)*h/5-10;
  let xmin=128,ymin=128,xmax=-1,ymax=-1,count=0;
  // Nearest-neighbour point sampling onto a fixed frame/foot anchor, binary alpha.
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
   const sx=Math.floor(anchorX+(x-64)/scale),sy=Math.floor(anchorY+(y-110)/scale);
   if(sx<left||sx>=right||sy<top||sy>=bottom)continue;const a=(sy*w+sx)*4;if(data[a+3]<100)continue;
   const o=((row*128+y)*512+col*128+x)*4;
   // A compact fixed RGB lattice removes semi-tones and keeps pixels crisp.
   for(let c=0;c<3;c++)packed[o+c]=Math.min(255,Math.round(data[a+c]/17)*17);packed[o+3]=255;
   xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);count++;
  }
  if(count<80||xmin===0||xmax===127||ymin===0||ymax===127)throw Error(`${id} frame ${row},${col} empty or clipped: ${count} ${[xmin,ymin,xmax,ymax]}`);
  boxes.push({state:['idle','move','attack','hurt','death'][row],frame:col,bounds:[xmin,ymin,xmax,ymax],pixels:count});
 }
 const dest=path.join('assets/hollow-faith',id+'.png');await sharp(packed,{raw:{width:512,height:640,channels:4}}).png().toFile(dest);
 fs.writeFileSync(dest.replace('.png','.json'),JSON.stringify({id,width:512,height:640,cell:128,columns:4,rows:5,anchor:[64,110],frames:boxes},null,2)+'\n');console.log(id+' packed: 20 isolated frames');
}})().catch(e=>{console.error(e);process.exitCode=1});
