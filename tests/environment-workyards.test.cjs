const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const surfaces=require('../environment-surfaces.js'),scenes=require('../environment-scenes.js');
require('../death-effects.js');
const html=fs.readFileSync('index.html','utf8'),script=html.match(/<script>\s*\(function\(\)\{([\s\S]*?)<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
const types={wall:0,floor:1},buildings=[{key:'smith',x:10,y:9,w:7,h:5,dx:13,dy:14}];
test('town materials follow street and work-area use, with a clear paved smith entrance',()=>{
 assert.equal(surfaces.district(13,16,buildings),'road');assert.equal(surfaces.district(13,14,buildings),'paving');assert.equal(surfaces.district(10,14,buildings),'cinders');assert.equal(surfaces.district(36,9,buildings),'grass');assert.equal(surfaces.district(45,25,buildings),'earth');
 const L={town:true,interior:'smith'};assert.equal(surfaces.material(L,10,10,64,buildings),null);assert.equal(surfaces.material({bio:'crypt'},10,10,64),'crypt-stone');
});
test('mining floors distinguish working bays, scree rims, compacted ground and bedrock',()=>{
 const L={bio:'mine',rooms:[{x:2,y:2,w:9,h:7,theme:'rails'}]};assert.equal(surfaces.material(L,2,4,20),'scree');assert.equal(surfaces.material(L,4,4,20),'workfloor');const kinds=new Set();for(let y=12;y<25;y++)for(let x=12;x<25;x++)kinds.add(surfaces.material(L,x,y,30));assert.deepEqual([...kinds].sort(),['bedrock','mine-earth','scree']);
});
test('landmarks are deterministic and wall-bound across 60 real seeded mines; no gameplay RNG or mutations',()=>{
 let total=0,winches=0;
 for(let seed=1;seed<=60;seed++){
  let n=seed;const math=Object.create(Math);math.random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
  const c={console,Math:math,SaltmarrowDeaths:global.SaltmarrowDeaths,setTimeout,clearTimeout};vm.createContext(c);vm.runInContext(script,c);const g=c.G;g.newGame('riptide',1);const L=g.S.L,before=JSON.stringify(L),random=Math.random;
  let p;try{Math.random=()=>{throw Error('art consumed gameplay RNG')};p=scenes.plan(L,g.W,g.H,types);assert.deepEqual(p,scenes.plan(L,g.W,g.H,types))}finally{Math.random=random}
  assert.equal(JSON.stringify(L),before);total+=p.length;winches+=p.filter(d=>d.kind==='winch').length;
  for(const d of p)for(let dx=0;dx<d.w;dx++){const i=d.y*g.W+d.x+dx;assert.equal(L.map[i],0);assert.equal(L.map[i+g.W],1);assert.ok(!L.decal[i])}
 }
 assert.ok(total>60,'landmarks appear throughout real generation');assert.ok(winches>0,'working rail/storage rooms receive winches');
});
test('smith fixtures remain inside blocked facade cells and leave its doorway free',()=>{
 const L={town:true},p=scenes.plan(L,64,44,types,buildings),b=buildings[0];assert.equal(p.length,2);assert.deepEqual(p.map(d=>d.kind),['coal','quench']);for(const d of p)for(let dx=0;dx<d.w;dx++){assert.equal(d.y,b.y+b.h-1);assert.notEqual(d.x+dx,b.dx);assert.ok(d.x+dx>=b.x&&d.x+dx<b.x+b.w)}
});
test('secret clues, broken walls, and unrevealed cells suppress whole landmarks',()=>{
 const w=10,L={bio:'mine',map:Array(100).fill(0),decal:[],objs:[],seen:Array(100).fill(1),rooms:[{x:2,y:3,w:7,h:5,shape:'rect'}]};for(let y=3;y<8;y++)for(let x=2;x<9;x++)L.map[y*w+x]=1;
 const p=scenes.plan(L,w,10,types);assert.equal(p.length,1);const d=p[0],i=d.y*w+d.x,g={save(){throw Error('invalid landmark was drawn')}};
 for(const condition of ['clue','wall','fog']){if(condition==='clue')L.decal[i]=38;if(condition==='wall')L.map[i]=1;if(condition==='fog')L.seen[i+w]=0;scenes.draw(g,L,d,{w,types,visible:L.seen});L.decal[i]=0;L.map[i]=0;L.seen[i+w]=1}
 L.decal=Array(100).fill(38);assert.equal(scenes.plan(L,w,10,types).length,0);
});
test('cracked mine walls retain their existing cues; new art ships offline',()=>{
 assert.equal(surfaces.wall({}, {bio:'mine',map:[9]},0,0,false,1),false);
 const sw=fs.readFileSync('sw.js','utf8');for(const name of ['environment-art.js','environment-surfaces.js','environment-scenes.js','assets/flat/workyards.webp']){assert.ok(fs.existsSync(name));assert.ok(sw.includes("'"+name+"'"))}
 for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi))if(m[1].trim())new vm.Script(m[1]);
});
test('town outskirts use a low boundary and ground cover without changing collision',()=>{
 const L={town:true,map:Array(25).fill(0)},before=JSON.stringify(L),calls=[],g={save(){},restore(){},fillRect(...a){calls.push(a)}};L.map[17]=1;const marked=JSON.stringify(L);assert.equal(surfaces.wall(g,L,2,2,false,5),true);assert.equal(JSON.stringify(L),marked);assert.ok(calls.some(c=>c[3]===9),'low boundary');assert.ok(calls.every(c=>c[3]<=32),'no tall dungeon wall');
});
