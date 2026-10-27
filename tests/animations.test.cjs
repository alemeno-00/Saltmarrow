const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const A=require('../animation-art.js');
test('attacks use actual cast/attack timestamps through windup, strike and recovery',()=>{
 const e={x:4,y:4,attackT:1000};assert.equal(A.sample(e,1100,false).state,'windup');assert.equal(A.sample(e,1250,false).state,'strike');assert.equal(A.sample(e,1400,false).state,'recover');assert.equal(A.sample(e,1500,false).state,'idle');
 assert.equal(A.sample({...e,pixelAction:{t0:2000,dur:800}},2400,false).state,'strike');
 assert.equal(A.sample({x:0,y:0,cast:{t0:1000,dur:400}},1200,false).state,'strike');
});
test('hit reactions interrupt attacks, walking alternates and reduced motion stays still',()=>{
 const e={x:4,y:4,rx:3.5,ry:4};assert.notEqual(A.sample(e,0,false).column,A.sample(e,120,false).column);
 assert.equal(A.sample({...e,attackT:1000,hitT:1100},1200,false).state,'hurt');
 assert.equal(A.sample({...e,attackT:1000,hitT:1100},1200,true).state,'idle');
 assert.equal(A.sample({...e,pixelAction:{t0:2000,dur:480}},1000,false).state,'walk');
});
test('death sequence reaches a stable final pose without wrapping or replaying',()=>{
 assert.deepEqual([0,130,260,390,520,650,780,5000].map(t=>A.deathIndex(t,false)),[0,1,2,3,4,5,5,5]);assert.equal(A.deathIndex(0,true),5);
});
test('every animation asset and runtime is cached and bundled offline',()=>{
 const sw=fs.readFileSync('sw.js','utf8');for(const name of ['actions','deaths','hero-actions','miner-actions','corpses']){const url='assets/flat/'+name+'.webp';assert.ok(fs.statSync(url).size>1024);assert.ok(sw.includes("'"+url+"'"))}
 assert.ok(sw.includes("'animation-art.js'"));for(const file of ['apk','mac'])assert.ok(fs.readFileSync('.github/workflows/'+file+'.yml','utf8').includes('../animation-art.js'));
});
test('explicit contact clock holds strike before entering recovery, without advancing simulation',()=>{
 const e={x:1,y:1,pixelAction:{t0:1000,dur:960,impact:1530,hold:65,end:2025}};
 const original=JSON.stringify(e);assert.equal(A.sample(e,1450,false).state,'windup');assert.equal(A.sample(e,1530,false).state,'strike');assert.equal(A.sample(e,1594,false).state,'strike');assert.equal(A.sample(e,1595,false).state,'recover');assert.equal(A.sample(e,1800,true).state,'idle');assert.equal(JSON.stringify(e),original);
});
