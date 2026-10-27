const {test}=require('node:test'),assert=require('node:assert/strict'),A=require('../flat-art.js');
const bases=['maul','hook','pick','knife','xbow','rod','censer','scourge','fetish'];
test('every shipped weapon has a distinct visible representation and physical attack family',()=>{
  for(const base of bases){assert.ok(A.weaponKind(base),base);assert.ok(A.weaponStyle(base,{kind:'melee',id:'gutter'},'slash'),base)}
  assert.equal(A.weaponStyle('pick',{kind:'melee'},'slash'),'smash');
  assert.equal(A.weaponStyle('knife',{kind:'melee'},'slash'),'thrust');
  assert.equal(A.weaponStyle('xbow',{kind:'ranged'},'dart'),'thrust');
  assert.equal(A.weaponStyle('rod',{kind:'area'},'fork'),'fork');
  assert.equal(A.weaponStyle('maul',{kind:'melee',id:'headbutt'},'butt'),'butt');
  assert.equal(A.weaponStyle('missing',{kind:'melee'},'slash'),'slash');
});
test('directional layering, movement and immediate equipment changes are presentation-only',()=>{
  for(const [fx,fy,back] of [[0,-1,true],[0,1,false],[-1,0,false],[1,0,false]]){
    const e={x:2,y:2,rx:1.5,ry:2,fx,fy},copy=JSON.stringify(e);
    const p=A.weaponPose('knife',e,100,null);assert.equal(p.back,back);assert.equal(p.phase,'walk');assert.equal(JSON.stringify(e),copy);
    assert.equal(A.weaponPose(null,e,100,null),null);
  }
  const action={base:'maul',t0:0,impact:470,end:800,dx:1,dy:0};
  assert.equal(A.weaponPose('knife',{fx:1},300,action).phase,'idle');
});
test('distinct windup, strike, recovery/reload and reduced motion follow the resolution clock',()=>{
  const action={base:'xbow',t0:100,impact:400,end:700,dx:1,dy:0},e={fx:1};
  assert.equal(A.weaponPose('xbow',e,150,action).phase,'windup');
  assert.equal(A.weaponPose('xbow',e,350,action).phase,'strike');
  assert.equal(A.weaponPose('xbow',e,450,action).phase,'reload');
  assert.equal(A.weaponPose('xbow',e,701,action).phase,'idle');
  assert.equal(A.weaponPose('xbow',e,350,action,true).phase,'idle');
  assert.notEqual(A.weaponPose('pick',e,350,{...action,base:'pick'}).angle,A.weaponPose('knife',e,350,{...action,base:'knife'}).angle);
});
test('weapon pixels stay snapped, bounded and restore no gameplay state',()=>{
  const cells=[];const g={fillStyle:'',fillRect:(x,y,w,h)=>{assert.ok(Number.isInteger(x)&&Number.isInteger(y));assert.ok([1,3].includes(w));assert.ok([1,3].includes(h));cells.push([x,y])}};
  for(const base of [...bases,'sword','spear','shield'])for(const fx of [-1,1])A.drawWeapon(g,A.weaponPose(base,{fx},300,{base,t0:0,impact:400,end:700,dx:fx,dy:0}),base,300);
  assert.ok(cells.length>1000);assert.ok(cells.every(([x,y])=>Math.abs(x)<70&&Math.abs(y)<70));
});
test('physical death context follows the held weapon while spells keep their element',()=>{
  assert.equal(A.weaponDeathKind('maul',{kind:'melee'},null,'slash'),'impact');
  assert.equal(A.weaponDeathKind('knife',{kind:'melee'},null,'impact'),'piercing');
  assert.equal(A.weaponDeathKind('pick',{kind:'melee'},null,'impact'),'slash');
  assert.equal(A.weaponDeathKind('maul',{kind:'melee'},'fire','fire'),'fire');
  assert.equal(A.weaponDeathKind('knife',{kind:'melee',id:'headbutt'},null,'impact'),'impact');
});
