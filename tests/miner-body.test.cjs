const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),B=require('../miner-body.js');
test('full-body contact clock stages anticipation, contact, hold and recovery',()=>{
 const e={fx:1,fy:0},a={t0:1000,impact:1610,end:2330,hold:90,resolved:true};
 assert.deepEqual([1000,1130,1260,1390,1520,1610,1699,1700,2320].map(t=>B.sample(e,t,false,a).frame),[0,1,2,3,4,5,5,6,7]);
 assert.equal(B.sample(e,1600,false,{...a,resolved:false,impact:1500}).frame,4,'unresolved damage holds before contact');assert.equal(B.sample(e,1400,true,a).kind,'idle');
});
test('left/right use one coherent walk clock with explicit mirrored facing',()=>{
 const e={x:1,y:1,rx:.5,ry:1,walkCycle:1,walkStart:1000,walkDuration:145,fx:1};
 const frames=[0,42,84,126].map(t=>B.sample(e,1000+t,false,null).frame);assert.equal(new Set(frames).size,4);
 assert.equal(B.sample(e,1100,false,null).facing,'east');assert.equal(B.sample({...e,fx:-1},1100,false,null).facing,'west');
 assert.equal(B.sample({...e,rx:1},1100,false,null).kind,'idle');
});
test('body sheet and module ship through offline and desktop bundles',()=>{
 const sw=fs.readFileSync('sw.js','utf8');for(const path of ['miner-body.js',B.url])assert.ok(sw.includes("'"+path+"'"));assert.ok(fs.statSync(B.url).size>10000);assert.match(fs.readFileSync('.github/workflows/mac.yml','utf8'),/\.\.\/miner-body\.js/);
});
