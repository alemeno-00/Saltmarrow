const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
require('../death-effects.js');
require('../drowned-sprites.js');
const html=fs.readFileSync('index.html','utf8'),script=html.match(/<script>\s*\(function\(\)\{([\s\S]*?)<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
function game(){const c={console,Math,SaltmarrowDeaths:global.SaltmarrowDeaths,setTimeout,clearTimeout};vm.createContext(c);vm.runInContext(script,c);const g=c.G;g.newGame('riptide',7);g.S.L.mons=[];g.S.L.objs=[];g.S.L.items=[];g.S.P.x=g.S.P.rx=15;g.S.P.y=g.S.P.ry=15;g.S.P.stam=g.S.P.max=500;for(let y=5;y<30;y++)for(let x=5;x<30;x++){g.S.L.map[g.I(x,y)]=1;g.S.L.fire[g.I(x,y)]=0}g.computeFov();return g}
async function fight(g,type,x=17,y=15){const m=g.spawnMon(type,x,y);await g.startCombat('ambush',m);m.surprised=false;return m}
test('sapper bombs commit a tile, allow a full hero turn, and cannot gain instant extra blasts',async()=>{
  for(const extra of [false,true]){const g=game(),m=await fight(g,'sapper',19,15);if(extra)m.mut='frenzied';m.extra=extra;
    const hp=g.S.P.stam;await g.monsterTurn(m);assert.ok(m.primed);assert.equal(g.S.P.stam,hp);
    const mark={...m.primed};g.S.P.y=mark.y+3;await g.monsterTurn(m);assert.equal(m.primed,null);assert.equal(g.S.P.stam,hp);
  }
});
test('daze immediately clears a bomb and prevents rearming that turn',async()=>{
  const g=game(),m=await fight(g,'sapper',19,15);await g.monsterTurn(m);assert.ok(m.primed);
  g.addC(m,'dazed',g.S.P);assert.equal(m.primed,null);const hp=g.S.P.stam;
  await g.monsterTurn(m);assert.equal(m.primed,null);assert.equal(g.S.P.stam,hp);assert.ok(!g.hasC(m,'dazed'));
});
test('bleeding kills a bomber before its committed blast',async()=>{
  const g=game(),m=await fight(g,'sapper',19,15);await g.monsterTurn(m);m.stam=1;g.addC(m,'bleeding',g.S.P);
  const hp=g.S.P.stam;await g.monsterTurn(m);assert.ok(m.dead);assert.equal(g.S.P.stam,hp);
});
test('displacement behind a wall cancels committed line of fire',async()=>{
  const g=game(),m=await fight(g,'sapper',19,15);await g.monsterTurn(m);const mark={...m.primed};
  m.x=mark.x+3;m.y=mark.y;g.S.L.map[g.I(mark.x+1,mark.y)]=0;
  // WALL is zero in the map; the committed target stays fixed.
  const hp=g.S.P.stam;await g.monsterTurn(m);assert.equal(m.primed,null);assert.equal(g.S.P.stam,hp);
});
test('powder kegs receive the same warning turn as ordinary bombs',async()=>{
  const g=game(),m=await fight(g,'sapper',19,15);m.conds.push({id:'grabbed',src:'P',left:1});
  const keg={id:999,type:'keg',x:15,y:16};g.S.L.objs.push(keg);const hp=g.S.P.stam;
  await g.monsterTurn(m);assert.ok(m.primed);assert.equal(m.primed.keg,keg);assert.equal(m.primed.radius,2);assert.match(g.intentText(m),/5×5/);assert.ok(g.S.L.objs.includes(keg));assert.equal(g.S.P.stam,hp);
});
test('crossbow rewards distance, penalizes adjacency, and leaves melee unchanged',async()=>{
  const g=game(),m=await fight(g,'skeleton',19,15);g.S.gear.weapon=g.genWeapon(1,'worn','xbow');
  const ranged={kind:'ranged'},melee={kind:'melee'};const far=g.heroEdges(ranged,m);
  m.x=16;const near=g.heroEdges(ranged,m);assert.equal(far.e,near.e+1);assert.equal(near.b,far.b+1);
  const withBow=g.heroEdges(melee,m);g.S.gear.weapon=null;assert.deepEqual(g.heroEdges(melee,m),withBow);
});
test('shared enemy paths pay a penalty for allied bomb tiles, not hero movement',async()=>{
  const g=game(),m=await fight(g,'sapper',19,15),ally=g.spawnMon('wolf',18,16);ally.inCombat=true;m.primed={x:17,y:16};
  assert.ok(g.stepCost(1,ally,g.I(17,16))>g.stepCost(1,ally,g.I(18,18)));
  assert.equal(g.stepCost(1,g.S.P,g.I(17,16)),g.stepCost(1,g.S.P,g.I(18,18)));
});
test('intent reads consume no randomness and describe actual selected attacks',async()=>{
  const g=game(),m=await fight(g,'skeleton',19,15);const attack=g.pickAb(m);
  for(let i=0;i<20;i++){assert.equal(g.pickAb(m),attack);assert.equal(g.intentOf(m).kind,'ranged')}
  assert.match(g.intentText(m),/tier 2/);m.primed={x:15,y:15};assert.match(g.intentText(m),/daze to interrupt/);
});
test('committed bombs still damage a hero who stays in the marked area',async()=>{
  const g=game(),m=await fight(g,'sapper',19,15);await g.monsterTurn(m);assert.ok(m.primed);
  const hp=g.S.P.stam;await g.monsterTurn(m);assert.ok(g.S.P.stam<hp);assert.equal(m.primed,null);
});
test('combat advances only when the player ends the turn',async()=>{
  const g=game(),m=await fight(g,'sapper',19,15),round=g.S.C.round,hp=g.S.P.stam;
  for(let i=0;i<50;i++)g.intentOf(m);assert.equal(g.S.C.round,round);assert.equal(g.S.P.stam,hp);assert.ok(!m.primed);
  await g.endHeroTurn();assert.ok(m.primed);assert.equal(g.S.C.phase,'hero');assert.equal(g.S.C.round,round+1);
});
test('enemy movement routes around a marked allied blast when safe ground is available',async()=>{
  const g=game(),m=await fight(g,'sapper',19,15),ally=g.spawnMon('wolf',17,20);ally.inCombat=true;m.primed={x:20,y:20,radius:1};
  const goal=g.I(23,20),pr=g.paths(ally,ally.x,ally.y,30),route=g.pathTo(pr,goal);assert.ok(route&&route.length);
  assert.ok(route.every(i=>Math.max(Math.abs(i%g.W-20),Math.abs(Math.floor(i/g.W)-20))>1));
});
