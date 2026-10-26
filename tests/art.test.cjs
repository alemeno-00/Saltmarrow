const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const art=require('../isometric-art.js');
test('every runtime atlas is shipped and precached for offline play',()=>{
  const sw=fs.readFileSync('sw.js','utf8');
  for(const spec of Object.values(art.specs)){assert.ok(fs.statSync(spec.url).size>1024,spec.url);assert.ok(sw.includes("'"+spec.url+"'"),spec.url)}
  assert.ok(sw.includes("'isometric-art.js'"));
});
test('atlas cells cover each declared sprite without leaving the sheet',()=>{
  for(const spec of Object.values(art.specs)){
    assert.equal(spec.keys.length,spec.cols*spec.rows);assert.equal(new Set(spec.keys).size,spec.keys.length);
    spec.keys.forEach((key,i)=>{const r=art.cellRect(1536,1536,spec,i);assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=1536&&r.y+r.h<=1536,key)});
  }
});
test('native actor scale distinguishes low creatures and bosses from people',()=>{
  assert.ok(art.actorHeight('rat')<art.actorHeight('riptide'));
  assert.equal(art.actorHeight('storm'),art.actorHeight('tobias'));
  assert.ok(art.actorHeight('abbot')>art.actorHeight('riptide'));
});
test('native app offline bundles include runtime scripts and the art folder',()=>{
  for(const file of ['.github/workflows/apk.yml','.github/workflows/mac.yml']){
    const src=fs.readFileSync(file,'utf8');for(const name of ['../death-effects.js','../isometric-art.js','cp -R ../assets www/assets'])assert.ok(src.includes(name),`${file}: ${name}`);
  }
});

test('home artwork is included in the offline cache',()=>{assert.ok(fs.statSync('assets/art/home.webp').size>1024);assert.ok(fs.readFileSync('sw.js','utf8').includes("'assets/art/home.webp'"))});
