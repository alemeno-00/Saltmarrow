const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const hook=`window.__test={prepare(){document.getElementById('boot')?.remove();RT.on=false;newRun('riptide',1,{});UI.quiet=true;S.L.mons=[];S.L.objs=[];S.L.items=[];S.L.npcs=[];S.L.traps=[];S.L.weak.fill(0);S.P.x=S.P.rx=8;S.P.y=S.P.ry=14;S.busy=false;S.mode='explore';for(let y=11;y<18;y++)for(let x=5;x<13;x++)S.L.map[I(x,y)]=FLOOR;S.L.map[I(7,14)]=WALL;computeFov();ov.hidden=true;closeInspect();camInit=false;ISO.camera.ready=false},move:exploreStep,zoom(z){ZOOM=z;resize()},pan(x,y){PAN.x=x;PAN.y=y},pick:tileFromEvent,combat:async()=>{const m=spawnMon('rat',S.P.x+1,S.P.y,{state:'idle'});S.L.mons.push(m);computeFov();await startCombat('ambush',m);S.busy=false;return m.id},attack:async()=>{const m=S.L.mons[0];const id=defaultAttack(m.x,m.y);if(!id)throw Error('No valid melee attack');const before=S.C.a;await useAbility(id,m.x,m.y);return{before,after:S.C?.a,hit:!!m.hitT,stam:m.stam}},state:()=>({x:S.P.x,y:S.P.y,mode:S.mode,busy:S.busy,turn:S.turn}),render:()=>draw(),town:()=>enterTown(),interior:()=>enterInterior('tavern')};`;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('window.claude?.hot?.snapshot?.',hook+'\nwindow.claude?.hot?.snapshot?.');
const server=http.createServer((req,res)=>{if(req.url==='/'||req.url==='/index.html'){res.setHeader('Content-Type','text/html');res.end(html)}else{res.statusCode=404;res.end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{for(const mobile of [false,true]){const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:mobile?3:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>window.__test&&window.__dbg);await page.waitForTimeout(4500);await page.evaluate(()=>window.__test.prepare());await page.waitForTimeout(600);
  assert.equal(await page.evaluate(()=>window.__test.move(-1,0)),false,'wall blocks movement');await page.waitForTimeout(150);
  await page.evaluate(()=>window.__test.move(1,0));assert.equal((await page.evaluate(()=>window.__test.state())).x,9,'keyboard-equivalent movement');
  for(const z of [.6,1,2.2]){await page.evaluate(z=>{window.__test.zoom(z);window.__test.pan(-80,45)},z);await page.waitForTimeout(400);const result=await page.evaluate(()=>{const p=window.__iso.tileCenter(9,14),cv=document.getElementById('cv'),r=cv.getBoundingClientRect();return {p}});
    // CSS size / logical viewport is exactly the zoom factor, independent of device DPR.
    const hit=await page.evaluate(({z,p})=>{const r=document.getElementById('cv').getBoundingClientRect();return window.__test.pick({clientX:r.left+p.x*z,clientY:r.top+p.y*z})},{z,p:result.p});assert.equal(hit.x,9);assert.equal(hit.y,14);
  }
  await page.evaluate(()=>{window.__test.zoom(1);window.__test.pan(0,0)});await page.waitForTimeout(400);
  const dest=await page.evaluate(()=>{const p=window.__iso.tileCenter(10,14),r=document.getElementById('cv').getBoundingClientRect();return{x:r.left+p.x,y:r.top+p.y}});
  if(mobile)await page.touchscreen.tap(dest.x,dest.y);else await page.mouse.click(dest.x,dest.y);await page.waitForTimeout(600);assert.equal((await page.evaluate(()=>window.__test.state())).x,10,'projected pointer walks to selected grid tile');
  await page.evaluate(()=>window.__test.combat());await page.evaluate(()=>window.__test.render());const attack=await page.evaluate(()=>window.__test.attack());assert.ok(attack.hit,'melee attack produces damage feedback');await page.waitForTimeout(200);await page.evaluate(()=>window.__test.render());
  if(process.env.SCREENSHOT_DIR){fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,mobile?'mobile.png':'desktop.png')})}
  await page.evaluate(()=>{window.__test.town();document.getElementById('overlay').hidden=true});await page.waitForTimeout(350);await page.evaluate(()=>window.__test.render());
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,mobile?'town-mobile.png':'town-desktop.png')});
  await page.evaluate(()=>window.__test.interior());await page.waitForTimeout(350);await page.evaluate(()=>window.__test.render());
  assert.deepEqual(errors,[],`no runtime errors (${mobile?'mobile':'desktop'})`);await page.close();console.log(`PASS ${mobile?'mobile':'desktop'}: walls, movement, projected pointer, zoom/pan, combat, town rendering`);
}}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
