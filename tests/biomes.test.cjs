const {test}=require('node:test'),assert=require('node:assert/strict');
const B=require('../biome-art.js');
test('material fields are deterministic, coherent, and exclude town and interiors',()=>{
 for(const bio of ['mine','crypt','fungal','sewer','drowned']){
  const L={bio};const before=JSON.stringify(L),found=new Set();
  for(let y=0;y<64;y+=4)for(let x=0;x<64;x+=4){const m=B.material(L,x,y);found.add(m);assert.equal(B.material(L,x,y),m)}
  assert.ok(found.has(0));assert.ok(found.has(1));assert.equal(JSON.stringify(L),before);
  for(const flag of ['town','interior'])assert.equal(B.material({...L,[flag]:true},8,8),null);
 }
 assert.equal(B.material({bio:'abbey'},1,1),null);
});
test('drowned and sewer alias use the same art and material field',()=>{
 for(let y=0;y<40;y++)for(let x=0;x<64;x++)assert.equal(B.material({bio:'drowned'},x,y),B.material({bio:'sewer'},x,y));
});
test('landmark recipes stay inside the three-tile wall footprint',()=>{
 for(const bio of Object.keys(B.kits)){
  assert.equal(B.recipes[bio].length,5);assert.equal(new Set(B.recipes[bio].map(r=>JSON.stringify(r))).size,5);
  for(const recipe of B.recipes[bio])for(const [cell,x,y,w,h]of recipe){assert.ok(cell>=0&&cell<40);assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=96&&y+h<=48)}
 }
});
test('decorative clusters are withheld from authored clues and active hazards',()=>{
 for(const field of ['decal','weak','fire','spore','gas','oil','smoke']){
  const L={[field]:[0,1]},before=JSON.stringify(L);assert.ok(B.protectedAt(L,1));assert.ok(!B.protectedAt(L,0));assert.equal(JSON.stringify(L),before);
 }
});

test('complete kit owns all fourteen terrain types and paired interactive prop states',()=>{
 assert.equal(Object.keys(B.layout).length,40);assert.ok(B.eligible({bio:'mine',tutorial:true}));
 assert.notEqual(B.objectCell({type:'chest'}),B.objectCell({type:'chest',open:true}));
 assert.notEqual(B.objectCell({type:'coffin'}),B.objectCell({type:'coffin',open:true}));
 assert.notEqual(B.objectCell({type:'brazier',lit:true}),B.objectCell({type:'brazier',lit:false}));
 assert.notEqual(B.objectCell({type:'lever',on:true}),B.objectCell({type:'lever',on:false}));
});
