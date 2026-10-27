const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const hook=`window.__environment={prepare(bio){document.getElementById('boot')?.remove();RT.on=false;window.__pause=true;UI.quiet=true;let seed=73819;const random=Math.random;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};try{if(bio==='town')enterTown();else newRun('riptide',({mine:1,crypt:3,fungal:5,drowned:7})[bio],{});}finally{Math.random=random}ov.hidden=true;closeInspect();S.busy=false;NOW=4000;S.L.seen.fill(1);vis.fill(1);const room=S.L.rooms?.find(r=>r.w>=9&&r.h>=7)||S.L.rooms?.[0];if(room){S.P.x=S.P.rx=room.cx;S.P.y=S.P.ry=room.cy;}else{S.P.x=S.P.rx=26;S.P.y=S.P.ry=17}ISO.camera.x=Math.round((S.P.x+.5)*T-VW/2);ISO.camera.y=Math.round((S.P.y+.5)*T-VH/2);ISO.camera.ready=true;return{bio:S.L.bio,map:JSON.stringify(S.L.map)}},async traverse(){const L=S.L,d=SaltmarrowEnvironment.plan(L,W,H,{floor:FLOOR,wall:WALL}).deposits.find(d=>!L.mons.some(m=>m.x===d.x&&m.y===d.y));if(!d)return null;L.mons=[];S.mode='explore';S.busy=false;S.P.x=S.P.rx=d.x;S.P.y=S.P.ry=d.y+1;computeFov();await exploreStep(0,-1);return{expected:{x:d.x,y:d.y},actual:{x:S.P.x,y:S.P.y}}},render:()=>draw(),stats(){const E=SaltmarrowEnvironment,L=S.L,p=E.plan(L,W,H,{floor:FLOOR,wall:WALL});return{seed:p.seed,count:p.deposits.length,map:JSON.stringify(L.map),smoothing:ctx.imageSmoothingEnabled}}};`;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('window.claude?.hot?.snapshot?.',hook+'\nwindow.claude?.hot?.snapshot?.');
const server=http.createServer((req,res)=>{const name=decodeURIComponent(req.url.split('?')[0]);if(name==='/'||name==='/index.html'){res.setHeader('Content-Type','text/html');return res.end(html)}const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.statusCode=404;return res.end()}res.setHeader('Content-Type',({'.js':'text/javascript','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file))});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  for(const bio of ['town','mine','crypt','fungal','drowned']){
   const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${server.address().port}`);
   await page.waitForFunction(()=>window.__environment);await page.evaluate(()=>window.__art.ready);
   const initial=await page.evaluate(b=>window.__environment.prepare(b),bio),stats=await page.evaluate(()=>window.__environment.stats());
   assert.ok(stats.count>0,`${bio} has clusters`);assert.equal(stats.map,initial.map);
   const pixels=[];
   for(const phase of ['before','after']){
    pixels.push(await page.evaluate(phase=>{
     const E=SaltmarrowEnvironment,draw=E.draw,wall=E.drawWall;
     try{if(phase==='before'){E.draw=()=>{};E.drawWall=()=>{}}window.__environment.render();return document.getElementById('cv').toDataURL()}
     finally{E.draw=draw;E.drawWall=wall}
    },phase));
    if(process.env.SCREENSHOT_DIR){fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`${bio}-${phase}.png`)})}
   }
   assert.notEqual(pixels[0],pixels[1],'environment hooks produce a visible scene change');
   const result=await page.evaluate(()=>{let t=performance.now();for(let i=0;i<30;i++)window.__environment.render();return{...window.__environment.stats(),ms:(performance.now()-t)/30}});
   assert.equal(result.map,initial.map,'drawing preserves navigation');assert.equal(result.smoothing,false);
   const move=await page.evaluate(()=>window.__environment.traverse());assert.ok(move);assert.deepEqual(move.actual,move.expected,'decorated tile remains walkable');
   assert.deepEqual(errors,[]);await page.close();
   console.log(`PASS desktop ${bio}: ${stats.count} deterministic clusters; ${result.ms.toFixed(2)} ms/full render; navigation unchanged`);
  }
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
