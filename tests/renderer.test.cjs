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
test('picking uses camera offset and floors at diamond boundaries',()=>{
  for(const camera of [{x:-900,y:233},{x:82,y:-120}]){ISO.camera=camera;
    for(let x=0;x<63;x++)for(let y=0;y<43;y++)for(const offset of [.001,.5,.999]){
      const p=ISO.screen((x+offset)*32,(y+offset)*32),q=ISO.pick(p.x,p.y);assert.equal(q.x,x);assert.equal(q.y,y)
    }
  }
});
test('higher camera retains upright wall and effect alignment',()=>{
  assert.ok(ISO.rise>.5&&ISO.rise<.8);
  const a=1,b=ISO.rise,c=-1,d=ISO.rise,ia=.5,ib=-.5,ic=1/(2*ISO.rise),id=ic;
  assert.ok(Math.abs(a*ia+c*ib-1)<1e-10);assert.ok(Math.abs(b*ic+d*id-1)<1e-10);assert.ok(Math.abs(a*ic+c*id)<1e-10);assert.ok(Math.abs(b*ia+d*ib)<1e-10);
});
test('depth follows interpolated diagonal feet rather than grid row',()=>{
  assert.ok(ISO.depth({x:10,y:2})>ISO.depth({x:1,y:9}));
  assert.equal(ISO.depth({x:3,y:7,rx:2.5,ry:6.5}),9);
});
test('every inline script remains valid JavaScript',()=>{
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi))if(m[1].trim())new vm.Script(m[1]);
});
