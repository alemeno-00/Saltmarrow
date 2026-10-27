const {test}=require('node:test'),assert=require('node:assert/strict');
const light=require('../environment-lighting.js');
test('light falloff is continuous, monotonic and ends at zero rather than five bands',()=>{assert.equal(light.falloff(0),1);assert.equal(light.falloff(1),0);let last=1;const levels=new Set();for(let k=0;k<=100;k++){const a=light.falloff(k/100);assert.ok(a<=last&&a>=0);if(k)assert.ok(last-a<.025);levels.add(a.toFixed(5));last=a}assert.ok(levels.size>90)});
test('shadow rays stop at walls and closed doors, and extend when a door opens',()=>{
 const w=12,h=10,map=Array(w*h).fill(1);for(let y=0;y<h;y++)map[y*w+6]=0;
 const blocked=i=>[0,2,7,11].includes(map[i]);const ray=()=>light.trace(map,w,h,144,144,112,blocked)[0];assert.ok(ray().x<200);map[4*w+6]=2;assert.ok(ray().x<200);map[4*w+6]=3;assert.ok(ray().x>240);
});
test('sources follow physical props, visibility and lantern state without RNG or state mutation',()=>{
 const w=12,h=10,L={bio:'fungal',map:Array(w*h).fill(1),objs:[{type:'brazier',x:3,y:3,lit:false},{type:'shroom',x:5,y:4},{type:'crystal',x:7,y:4}],light:Array(w*h).fill(0)},visible=Array(w*h).fill(1),hero={x:4,y:4,lantern:false};visible[4*w+7]=0;const before=JSON.stringify({L,hero,visible}),random=Math.random;
 try{Math.random=()=>{throw Error('render consumed RNG')};const s=light.collect(L,{w,h,hero,visible,reduced:true});assert.equal(s.length,1);assert.equal(s[0].color,'#80c8ac');hero.lantern=true;assert.equal(light.collect(L,{w,h,hero,visible}).length,2);hero.lantern=false}finally{Math.random=random}assert.equal(JSON.stringify({L,hero,visible}),before);
});
test('reduced motion freezes flicker while normal flames vary gently',()=>{const L={bio:'crypt',map:Array(100).fill(1),objs:[{type:'brazier',x:4,y:4,lit:true}]},o={w:10,h:10,hero:{x:4,y:4},visible:Array(100).fill(1)};assert.deepEqual(light.collect(L,{...o,now:0,reduced:true}),light.collect(L,{...o,now:2000,reduced:true}));const a=light.collect(L,{...o,now:0})[0].strength,b=light.collect(L,{...o,now:2000})[0].strength;assert.notEqual(a,b);assert.ok(Math.abs(a-b)<.05)});
test('biomes have distinct shadow tints and grounded additional floor materials',()=>{const surfaces=require('../environment-surfaces.js');assert.equal(new Set(['mine','crypt','fungal','drowned'].map(k=>light.profiles[k].tint)).size,4);assert.equal(surfaces.material({bio:'crypt'},4,4,10),'crypt-stone');assert.ok(['moss','fungal-earth'].includes(surfaces.material({bio:'fungal'},4,4,10)));const L={bio:'drowned',map:Array(100).fill(1)};L.map[43]=4;assert.equal(surfaces.material(L,4,4,10),'silt')});
