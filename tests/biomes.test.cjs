const {test}=require('node:test'),assert=require('node:assert/strict');
const B=require('../biome-art.js');
test('material fields are deterministic, coherent, and exclude town, interiors and tutorial',()=>{
 for(const bio of ['mine','crypt','fungal','sewer','drowned']){
  const L={bio};const before=JSON.stringify(L),found=new Set();
  for(let y=0;y<64;y+=4)for(let x=0;x<64;x+=4){const m=B.material(L,x,y);found.add(m);assert.equal(B.material(L,x+1,y+1),m);assert.equal(B.material(L,x,y),m)}
  assert.equal(found.size,5);assert.equal(JSON.stringify(L),before);
  for(const flag of ['town','interior','tutorial'])assert.equal(B.material({...L,[flag]:true},8,8),null);
 }
 assert.equal(B.material({bio:'abbey'},1,1),null);
});
test('drowned and sewer alias use the same art and material field',()=>{
 for(let y=0;y<40;y++)for(let x=0;x<64;x++)assert.equal(B.material({bio:'drowned'},x,y),B.material({bio:'sewer'},x,y));
});
