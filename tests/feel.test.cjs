const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
require('../death-effects.js');
const html=fs.readFileSync(process.env.FEEL_BASELINE||'index.html','utf8'),script=html.match(/<script>\s*\(function\(\)\{([\s\S]*?)<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
function game(seed=1,cls='riptide'){let n=seed;const math=Object.create(Math);math.random=()=>((n=(1664525*n+1013904223)>>>0)/4294967296);const c={console,Math:math,SaltmarrowDeaths:global.SaltmarrowDeaths,setTimeout,clearTimeout};vm.createContext(c);vm.runInContext(script,c);const g=c.G;g.newGame(cls,3);g.S.L.mons=[];g.S.L.objs=[];g.S.L.items=[];g.S.L.traps=[];g.S.L.opq.fill(0);g.S.L.smoke.fill(0);g.S.L.spore.fill(0);g.S.L.weak.fill(0);g.S.P.x=g.S.P.rx=15;g.S.P.y=g.S.P.ry=15;for(let y=5;y<30;y++)for(let x=5;x<30;x++){g.S.L.map[g.I(x,y)]=1;g.S.L.fire[g.I(x,y)]=0}g.computeFov();return g}
async function heavy(type='knight'){const g=game(),m=g.spawnMon(type,16,15);await g.startCombat('ambush',m);m.surprised=false;return {g,m}}
test('movement preserves blocked cells, diagonal destinations and exact movement cost',async()=>{
 const g=game();g.S.mode='explore';const p=g.S.P;g.S.L.map[g.I(16,15)]=0;await g.exploreStep(1,0);assert.equal(p.x,15);assert.equal(p.y,15);
 await g.exploreStep(1,1);assert.equal(p.x,16);assert.equal(p.y,16);assert.equal(p.fx,1);assert.equal(p.fy,1);
 const m=g.spawnMon('knight',20,16);await g.startCombat('ambush',m);const before=g.moveAvail();await g.combatStep(0,1);assert.equal(p.y,17);assert.equal(g.moveAvail(),before-g.stepCost(1,p));assert.equal(g.S.C.round,1);
});
test('heavy threat gives a full warning turn, a committed tile and recovery opening',async()=>{
 for(const type of ['knight','shambler']){const {g,m}=await heavy(type),hp=g.S.P.stam,max=m.max;await g.monsterTurn(m);assert.ok(m.heavyAim);assert.equal(g.S.P.stam,hp);assert.equal(m.max,max);assert.match(g.intentText(m),/marked tile/);
 const aim={...m.heavyAim};g.S.P.y++;await g.monsterTurn(m);assert.equal(g.S.P.stam,hp);assert.ok(m.heavyRecovery);assert.equal(m.heavyAim,null);await g.monsterTurn(m);assert.equal(m.heavyRecovery,false);assert.equal(g.S.P.stam,hp);assert.equal(aim.y,15)}
});
test('standing in a committed slam is dangerous and cannot gain instant extra attacks',async()=>{
 const {g,m}=await heavy();m.extra=true;m.mut='frenzied';await g.monsterTurn(m);const hp=g.S.P.stam;assert.ok(m.heavyAim);await g.monsterTurn(m);assert.ok(g.S.P.stam<hp-3);assert.ok(m.heavyRecovery);assert.equal(m.heavyAim,null);
});
test('frontal brace has positional and status counterplay, without changing maximum HP',async()=>{
 const {g,m}=await heavy();await g.monsterTurn(m);const max=m.max,hp=m.stam;g.damage(m,6,g.S.P);assert.equal(hp-m.stam,3);
 g.S.P.x=17;const h=m.stam;g.damage(m,6,g.S.P);assert.equal(h-m.stam,6);assert.equal(m.max,max);
 g.addC(m,'dazed',g.S.P);assert.equal(m.heavyAim,null);assert.ok(m.heavyRecovery);const hero=g.S.P.stam;await g.monsterTurn(m);assert.equal(g.S.P.stam,hero);
});
test('displacement and bleeding cancel a prepared heavy attack before damage',async()=>{
 const {g,m}=await heavy();await g.monsterTurn(m);m.x++;const hp=g.S.P.stam;await g.monsterTurn(m);assert.equal(g.S.P.stam,hp);assert.equal(m.heavyAim,null);
 const f=await heavy();await f.g.monsterTurn(f.m);f.m.stam=1;f.g.addC(f.m,'bleeding',f.g.S.P);await f.g.monsterTurn(f.m);assert.ok(f.m.dead);
});
// Fixed policies expose tuning drift; they are not a claim of human playtest balance.
async function encounter(seed,cls='riptide'){
 const g=game(seed,cls),p=g.S.P,hp=p.stam;const enemies=[g.spawnMon('knight',19,15),g.spawnMon('sailor',18,17),g.spawnMon('sapper',21,17)];await g.startCombat('ambush',enemies[0]);enemies.forEach(m=>{m.surprised=false;m.inCombat=true;m.state='alert'});let turns=0,dodges=0,attacks=0;
 while(g.S.C&&!g.S.over&&turns<20){turns++;const live=()=>g.S.L.mons.filter(m=>!m.dead&&m.inCombat);
 const danger=live().some(m=>m.heavyAim&&m.heavyAim.x===p.x&&m.heavyAim.y===p.y||m.primed&&Math.max(Math.abs(m.primed.x-p.x),Math.abs(m.primed.y-p.y))<=1);
 if(danger){for(const [dx,dy]of [[0,-1],[-1,0],[0,1],[1,0]]){if(g.monAt(p.x+dx,p.y+dy))continue;const x=p.x,y=p.y;await g.combatStep(dx,dy);if(x!==p.x||y!==p.y){dodges++;break}}}
 const ability=cls==='shadow'?'gutter':'undertow';let target=live().find(m=>g.validTargets(ability).some(t=>t.x===m.x&&t.y===m.y));
 if(!target&&live().length){const nearest=live().sort((a,b)=>Math.max(Math.abs(a.x-p.x),Math.abs(a.y-p.y))-Math.max(Math.abs(b.x-p.x),Math.abs(b.y-p.y)))[0];const route=g.paths(p,p.x,p.y,g.moveAvail());let goal=null,dist=Infinity;for(let y=nearest.y-1;y<=nearest.y+1;y++)for(let x=nearest.x-1;x<=nearest.x+1;x++){const d=route.dist[g.I(x,y)];if(!g.monAt(x,y)&&d<dist){dist=d;goal={x,y}}}if(goal)await g.combatWalkTo(goal.x,goal.y);target=live().find(m=>g.validTargets(ability).some(t=>t.x===m.x&&t.y===m.y))}
 if(target&&g.abUsable(ability).ok){attacks++;await g.useAbility(ability,target.x,target.y)}
 if(g.S.C)await g.endHeroTurn();
 }
 return{seed,cls,turns,dodges,attacks,hpLost:hp-p.stam,won:!g.S.over&&!g.S.C,stalled:turns===20};
}
test('seeded mixed encounter policies finish with survival pressure and no stalls',async()=>{
 const rows=[];for(const cls of ['riptide','shadow'])for(let seed=1;seed<=12;seed++)rows.push(await encounter(seed,cls));
 assert.ok(rows.every(r=>!r.stalled),JSON.stringify(rows));assert.ok(rows.some(r=>r.hpLost>0));assert.ok(rows.some(r=>r.dodges>0));if(!process.env.FEEL_BASELINE)assert.ok(rows.filter(r=>r.won).length>=rows.length/2,'mixed encounter should be survivable by the fixed basic policy');const sorted=rows.map(r=>r.turns).sort((a,b)=>a-b);assert.ok(sorted[12]>=4&&sorted[12]<=10,'provisional turn-budget guardrail, not a fixed encounter length');
 if(process.env.FEEL_REPORT){fs.writeFileSync(process.env.FEEL_REPORT,JSON.stringify(rows,null,2));console.log(JSON.stringify(rows))}
});

test('an ambush surprises its target while nearby guards can act in the first round',async()=>{
 const g=game(),target=g.spawnMon('husk',16,15),guard=g.spawnMon('sailor',15,16);await g.startCombat('ambush',target);
 assert.equal(target.surprised,true);assert.equal(guard.surprised,false);assert.equal(guard.inCombat,true);
 const hp=g.S.P.stam;await g.endHeroTurn();assert.ok(g.S.P.stam<hp,'nearby guard attacks instead of skipping the entire opening round');
});
