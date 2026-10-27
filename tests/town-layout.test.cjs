const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
require('../death-effects.js');
const html=fs.readFileSync('index.html','utf8'),script=html.match(/<script>\s*\(function\(\)\{([\s\S]*?)<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
function game(seed=1){let n=seed;const math=Object.create(Math);math.random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};const c={console,Math:math,SaltmarrowDeaths:global.SaltmarrowDeaths,setTimeout,clearTimeout};vm.createContext(c);vm.runInContext(script,c);return c.G}
function check(g){
 const {L,P}=g.S,d=g.bfsDist(g.TOWN_LAYOUT.spawnX,g.TOWN_LAYOUT.spawnY,false),ids=new Set();
 assert.equal(L.townLayout.version,6);assert.equal(L.townScene,6);assert.equal(L.townBridges.length,2);assert.ok(L.townStairs.length>=4);
 for(const [x,y,w,h]of L.townBridges)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)assert.ok(d[g.I(xx,yy)]>=0,'bridge connected');
 for(const b of g.BUILDINGS){assert.ok(d[g.I(b.dx,b.dy)]>=0,`${b.key} approach reachable`);const o=L.objs.find(o=>o.type==='door'&&o.key===b.key);assert.ok(o);assert.equal(o.x,b.dx);assert.equal(o.y,b.dy-1);assert.equal(L.map[g.I(b.dx,b.dy)],1)}
 for(const o of L.objs){assert.ok(!ids.has(o.id),'unique object IDs');ids.add(o.id);if(o.type==='townRelic')assert.ok(d[g.I(o.x,o.y)]>=0,o.name+' story reachable');if(['house','liftgate','lotbox'].includes(o.type))assert.ok([[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>d[g.I(o.x+dx,o.y+dy)]>=0),o.type+' accessible');if(['house','door','grave','lamp'].includes(o.type))assert.ok(L.map[g.I(o.x,o.y)]!==0,o.type+' not buried in a building')}
 for(const n of L.npcs){assert.ok(d[g.I(n.x,n.y)]>=0,n.key+' reachable');assert.equal(L.map[g.I(n.x,n.y)],1);assert.ok(!g.blockObjAt(n.x,n.y))}
 assert.ok(d[g.I(P.x,P.y)]>=0);
}
test('all town services, houses and NPCs remain reachable across 120 seeded towns and all four acts',()=>{
 for(let act=1;act<=4;act++)for(let seed=1;seed<=30;seed++){const g=game(seed);g.META.deepest=(act-1)*2;g.META.story.f.nellFreed=1;g.META.story.f.pipFreed=1;g.enterTown();check(g)}
});
test('every interior exits onto the correct new exterior approach',()=>{const g=game();g.enterTown();for(const b of g.BUILDINGS){g.enterInterior(b.key);assert.equal(g.S.L.interior,b.key);g.exitInterior();assert.equal(g.S.P.x,b.dx);assert.equal(g.S.P.y,b.dy);assert.equal(g.S.L.map[g.I(b.dx,b.dy)],1);check(g)}});
test('legacy town migration preserves player, equipment, inventory, quests and dropped items',()=>{
 const g=game();g.enterTown();g.S.L.townLayout.version=3;g.S.P.x=32;g.S.P.y=21;g.S.gold=123;g.S.bag=[{id:900,kind:'weapon',base:'axe'}];g.S.L.items=[{kind:'gold',amt:7,x:28,y:20}];const player=g.S.P,gear=g.S.gear,bag=g.S.bag,meta=JSON.stringify(g.META);
 assert.equal(g.migrateTownLayout(),true);assert.equal(g.S.P,player);assert.ok(!g.S.L.npcs.some(n=>n.x===player.x&&n.y===player.y));assert.equal(g.S.gear,gear);assert.equal(g.S.bag,bag);assert.equal(g.S.gold,123);assert.equal(JSON.stringify(g.META),meta);assert.equal(g.S.L.items.length,1);assert.equal(g.S.L.items[0].amt,7);const it=g.S.L.items[0];assert.ok(g.bfsDist(g.TOWN_LAYOUT.spawnX,g.TOWN_LAYOUT.spawnY,false)[g.I(it.x,it.y)]>=0);check(g);assert.equal(g.migrateTownLayout(),false);
 g.enterInterior('tavern');g.S.L.townLayout=undefined;const L=g.S.L;assert.equal(g.migrateTownLayout(),false);assert.equal(g.S.L,L);
});

test('coastal landmarks and scenic tiers progress without losing safe routes',()=>{
 const coast=require('../town-coast.js');assert.equal(coast.version,6);
 for(let a=1;a<=4;a++){const g=game(a);g.META.deepest=(a-1)*2;g.enterTown();const L=g.S.L;assert.equal(L.townAct,a);
  const bell=L.objs.find(o=>o.type==='townRelic'&&o.name==='Deep Bell Tower');assert.ok(bell.desc.length>40);
  assert.equal(L.objs.filter(o=>o.type==='townRelic').length,6);
  assert.equal(L.objs.filter(o=>o.type==='house'&&o.boarded).length,a-1);
  assert.ok(L.townFacades.every(b=>Number.isInteger(b.entryX)&&Number.isInteger(b.entryY)));
  assert.equal(L.map[g.I(5,30)],0,'ocean remains impassable');

 }
});
test('coastal module ships in web cache and both native offline bundles',()=>{
 for(const p of ['sw.js','.github/workflows/mac.yml','.github/workflows/apk.yml'])assert.ok(fs.readFileSync(p,'utf8').includes('town-coast.js'));const coast=require('../town-coast.js');assert.ok(fs.statSync(coast.url).size>1000);assert.ok(fs.readFileSync('sw.js','utf8').includes(coast.url));
});

test('the authored coastline cannot be excavated into walkable sea',async()=>{const g=game();g.enterTown();Object.assign(g.S.P,{x:13,y:33,rx:13,ry:33});g.S.gear.weapon=g.genWeapon(1,'fine');g.S.gear.weapon.base='pick';const before=JSON.stringify(g.S.L.map);assert.equal(await g.exploreStep(-1,0),false);assert.equal(JSON.stringify(g.S.L.map),before);assert.equal(g.S.P.x,13);assert.equal(g.S.P.y,33)});
