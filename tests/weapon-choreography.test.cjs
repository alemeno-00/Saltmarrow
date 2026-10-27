const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const W=require('../weapon-art.js');
const html=fs.readFileSync('index.html','utf8');
const source=html.match(/<script>\s*\(function\(\)\{([\s\S]*?)<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
function abilities(){const c={console,Math,setTimeout,clearTimeout};vm.createContext(c);vm.runInContext(source,c);return c.G}
test('every implemented static ability has an authored track; all generated shapes and elements are covered',()=>{
 const g=abilities();for(const [id,ab] of Object.entries(g.AB))assert.ok(W.profile({...ab,id}),id);
 const signatures=new Set();for(const p of Object.values(W.profiles)){const key=JSON.stringify([p.windPose,p.hit,p.follow]);assert.ok(!signatures.has(key),p.id);signatures.add(key);assert.ok(p.wind>=200&&p.recovery>=260);assert.deepEqual(W.track(p,1,0),p.hit);const end=W.track(p,2,1);assert.ok(end.every((v,i)=>Math.abs(v-[0,0,-1.15][i])<1e-8))}
 for(const el of ['fire','frost','lightning','holy','void','blood'])for(const kind of ['ranged','area','burst','ward','blink']){const p=W.profile({tome:'i1',kind,el,ward:kind==='ward',blink:kind==='blink'});assert.ok(p,el+kind);assert.ok(!signatures.has(JSON.stringify([p.id,p.hit])));signatures.add(JSON.stringify([p.id,p.hit]))}
});
test('nine detailed sprites have distinct native-pixel silhouettes with bounded directional geometry',()=>{
 const fingerprints=new Set();for(const base of W.bases){const pixels=[];const g={fillRect(x,y,w,h){assert.ok(Number.isInteger(x)&&Number.isInteger(y));assert.equal(w,1);assert.equal(h,1);assert.ok(Math.abs(x)<50&&Math.abs(y)<50);pixels.push([x,y,this.fillStyle])}};W.drawSprite(g,base);assert.ok(pixels.length>180,base);fingerprints.add(JSON.stringify(pixels));for(const side of [-1,1])W.drawSprite(g,base,0,0,-1.3,side)}assert.equal(fingerprints.size,9);
});
test('equipped choreography holds contact during delayed resolution and preserves direction/layer contracts',()=>{
 require('../flat-art.js');delete require.cache[require.resolve('../weapon-art.js')];require('../weapon-art.js');const A=global.SaltmarrowArt;
 for(const p of Object.values(W.profiles)){const a={base:'knife',id:p.id,profile:p,t0:0,impact:500,end:1000,dx:1,dy:0,resolved:false};const e={fx:1,fy:0};assert.deepEqual(A.weaponPose('knife',e,500,a),A.weaponPose('knife',e,3000,a));assert.equal(A.weaponPose('knife',e,3000,a).phase,'strike');assert.equal(A.weaponPose('knife',e,300,a,true).phase,'idle')}
});
test('new weapon runtime ships in offline web and native bundles',()=>{
 assert.ok(html.includes('src="weapon-art.js"'));for(const path of ['sw.js','.github/workflows/mac.yml','.github/workflows/apk.yml'])assert.ok(fs.readFileSync(path,'utf8').includes('weapon-art.js'),path);
});
test('body-family selection preserves named choreography and keeps tome utility shapes separate',()=>{
 const families=new Set(['heavy','thrust','sweep','cast','utility']);for(const p of Object.values(W.profiles))assert.ok(families.has(p.bodyFamily),p.id);
 for(const [id,family] of [['undertow','heavy'],['knife','thrust'],['breakwater','sweep'],['brinebolt','cast'],['draught','utility']]){const p=W.profile({id});assert.equal(p.bodyFamily,family);assert.equal(p.id,id);assert.ok(p.style&&p.hit&&p.follow)}
 for(const el of ['fire','frost','lightning','holy','void','blood'])for(const kind of ['ranged','area','burst','ward','blink'])assert.equal(W.profile({tome:'i1',kind,el,ward:kind==='ward',blink:kind==='blink'}).bodyFamily,['ward','blink'].includes(kind)?'utility':'cast');
 assert.match(html,/id:'freeStrike',style:'thrust',profile:SaltmarrowWeapons.profile/);
});
