// Pack generated source assets into native game cells; no background/key removal.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true});try{const page=await browser.newPage();for(const bio of ['sewer','fungal','crypt','mine']){
 const source=path.resolve(process.argv[2]||'../../outputs/biome-art-v2/source',`${bio}-v2.png`),data='data:image/png;base64,'+fs.readFileSync(source).toString('base64');
 const result=await page.evaluate(async({data})=>{const im=new Image();im.src=data;await im.decode();const raw=document.createElement('canvas');raw.width=im.width;raw.height=im.height;const rg=raw.getContext('2d');rg.drawImage(im,0,0);const out=document.createElement('canvas');out.width=out.height=256;const g=out.getContext('2d');g.imageSmoothingEnabled=false;const stats=[];
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){const x=Math.round(col*im.width/4),y=Math.round(row*im.height/4),w=Math.round((col+1)*im.width/4)-x,h=Math.round((row+1)*im.height/4)-y;
 // A two-source-pixel inset discards the generated cell separator without cutting into the art.
 g.drawImage(im,x+2,y+2,w-4,h-4,col*64,row*64,64,64);
 if(row>=2){const pixels=rg.getImageData(x,y,w,h).data;let transparent=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]<128)transparent++;stats.push({row,col,alpha:transparent/(w*h),corner:Array.from(rg.getImageData(x+5,y+5,1,1).data)})}
 }
 return{png:out.toDataURL('image/png').split(',')[1],stats};},{data});
 for(const cell of result.stats)if(cell.alpha<.2)throw Error(`${bio}: cell ${cell.row}/${cell.col} lacks transparency`);
 fs.mkdirSync('assets/biomes',{recursive:true});fs.writeFileSync(`assets/biomes/${bio}-v2.png`,Buffer.from(result.png,'base64'));console.log(bio,JSON.stringify(result.stats));
 }}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
