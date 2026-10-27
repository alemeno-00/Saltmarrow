const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../environment-art.js');require('../death-effects.js');
const html=fs.readFileSync('index.html','utf8'),script=html.match(/<script>\s*\(function\(\)\{([\s\S]*?)<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
const types={wall:0,floor:1};
function fixture(){const w=14,h=10,L={bio:'mine',map:Array(w*h).fill(0),objs:[],items:[],traps:[],npcs:[]};for(let y=2;y<8;y++)for(let x=2;x<12;x++)L.map[y*w+x]=1;return{L,w,h}}
test('fixed map produces identical dressing and never consumes gameplay randomness',()=>{const {L,w,h}=fixture(),before=JSON.stringify(L),random=Math.random;try{Math.random=()=>{throw Error('game RNG consumed')};assert.deepEqual(E.plan(L,w,h,types),E.plan(JSON.parse(before),w,h,types));assert.ok(E.plan(L,w,h,types).deposits.length)}finally{Math.random=random}assert.equal(JSON.stringify(L),before)});
test('narrow corridors, doors, exits, occupied and authored decal tiles remain clear',()=>{const w=16,h=9,L={bio:'crypt',map:Array(w*h).fill(0),objs:[],items:[],decal:[]};for(let x=1;x<15;x++)L.map[2*w+x]=1;assert.equal(E.plan(L,w,h,types).deposits.length,0);for(let y=3;y<7;y++)for(let x=1;x<15;x++)L.map[y*w+x]=1;L.map[2*w+5]=2;L.objs.push({x:9,y:3});L.decal[3*w+13]=11;for(const d of E.plan(L,w,h,types).deposits){assert.ok(Math.max(Math.abs(d.x-5),Math.abs(d.y-2))>1);assert.ok(Math.max(Math.abs(d.x-9),Math.abs(d.y-3))>1);assert.notEqual(d.i,3*w+13)}});
test('80 seeded real dungeon generations retain identical navigation and legal placements',()=>{
 for(const depth of [1,3,5,7])for(let seed=1;seed<=20;seed++){
  let s=seed;const math=Object.create(Math);math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};
  const c={console,Math:math,SaltmarrowDeaths:global.SaltmarrowDeaths,setTimeout,clearTimeout};vm.createContext(c);vm.runInContext(script,c);const g=c.G;g.newGame('riptide',depth);const L=g.S.L,before=JSON.stringify(L),p=E.plan(L,g.W,g.H,types);
  assert.equal(JSON.stringify(L),before);assert.deepEqual(p,E.plan(L,g.W,g.H,types));
  for(const d of p.deposits){assert.equal(L.map[d.i],1);assert.equal(L.map[d.i-g.W],0);assert.equal(L.map[d.i+g.W],1);assert.equal(L.map[d.i-1],1);assert.equal(L.map[d.i+1],1);assert.ok(!L.decal[d.i]);assert.ok(!L.objs.some(o=>o.x===d.x&&o.y===d.y))}
 }
});
test('environment sits below telegraphs and actors; wall hook inherits depth and cutaway',()=>{const start=html.indexOf('draw=function(){const L=S.L,P=S.P,TS=tilesFor');const s=html.slice(start);assert.ok(s.indexOf('SaltmarrowEnvironment?.draw(')<s.indexOf('drawOverlays('));assert.ok(s.indexOf('SaltmarrowEnvironment?.draw(')<s.indexOf('standing.sort'));assert.match(s,/isoWall\(TS,entry.x,entry.y,wf\);\s*window.SaltmarrowEnvironment\?\.drawWall/);assert.match(fs.readFileSync('sw.js','utf8'),/'environment-art.js'/)});
test('live actors, loot, hazards and changed terrain suppress cached ground clusters',()=>{
 const {L,w,h}=fixture(),p=E.plan(L,w,h,types),d=p.deposits[0],calls=[];
 global.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
 const g={save(){},restore(){},fillRect(){},drawImage(...args){calls.push(args)},globalAlpha:1};
 L.seen=Array(w*h).fill(1);const tiles=[{...d}],opts={w,h,types,visible:L.seen};
 E.draw(g,L,tiles,opts);assert.equal(calls.length,1);
 for(const change of ['actor','loot','fire','terrain']){calls.length=0;const extra={...opts};if(change==='actor')extra.actors=[d];if(change==='loot')L.items=[d];if(change==='fire'){L.fire=[];L.fire[d.i]=1}if(change==='terrain')L.map[d.i]=0;E.draw(g,L,tiles,extra);assert.equal(calls.length,0,change);L.items=[];L.fire=[];L.map[d.i]=1}
 delete global.document;
});
test('reduced motion freezes glow while normal ambient glow changes; wall secrets stay unpainted',()=>{
 const {L,w,h}=fixture();L.bio='fungal';L.seen=Array(w*h).fill(1);const d=E.plan(L,w,h,types).deposits[0],calls=[];
 global.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
 const g={save(){},restore(){},fillRect(...a){calls.push([this.globalAlpha,...a])},drawImage(){},globalAlpha:1};
 const render=(now,reduced)=>{calls.length=0;E.draw(g,L,[d],{w,h,types,visible:L.seen,now,reduced});return JSON.stringify(calls)};
 assert.equal(render(0,true),render(1900,true));assert.notEqual(render(0,false),render(1900,false));
 calls.length=0;L.decal=[];L.decal[d.i-w]=38;E.drawWall(g,L,d.x,d.y-1,{w,types});assert.equal(calls.length,0,'secret clue is not overpainted');delete global.document;
});
