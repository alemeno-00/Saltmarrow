const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const source=html.slice(html.indexOf('const ISO={'),html.indexOf('// The backing buffer'));
const ISO=vm.runInNewContext(source+';ISO',{T:32});
test('projection and inverse agree throughout map and outside map',()=>{
  for(let x=-64;x<2100;x+=13.25)for(let y=-64;y<1450;y+=19.75){const p=ISO.project(x,y),q=ISO.unproject(p.x,p.y);assert.ok(Math.abs(q.x-x)<1e-8);assert.ok(Math.abs(q.y-y)<1e-8)}
});
test('picking uses camera offset and floors at square boundaries',()=>{
  for(const camera of [{x:-900,y:233},{x:82,y:-120}]){ISO.camera=camera;
    for(let x=0;x<63;x++)for(let y=0;y<43;y++)for(const offset of [.001,.5,.999]){
      const p=ISO.screen((x+offset)*32,(y+offset)*32),q=ISO.pick(p.x,p.y);assert.equal(q.x,x);assert.equal(q.y,y)
    }
  }
});
test('reference camera preserves horizontal and vertical screen axes',()=>{
  assert.deepEqual(JSON.parse(JSON.stringify(ISO.project(64,96))),{x:64,y:96});
  assert.equal(ISO.project(96,96).y,ISO.project(64,96).y);
  assert.equal(ISO.project(64,128).x,ISO.project(64,96).x);
});
test('depth follows interpolated feet by row, independent of column',()=>{
  assert.ok(ISO.depth({x:10,y:2})<ISO.depth({x:1,y:9}));
  assert.equal(ISO.depth({x:3,y:7,rx:2.5,ry:6.5}),6.5);
  assert.equal(ISO.depth({x:60,y:7}),ISO.depth({x:1,y:7}));
});
test('every inline script remains valid JavaScript',()=>{
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi))if(m[1].trim())new vm.Script(m[1]);
});
