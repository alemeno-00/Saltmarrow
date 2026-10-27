/* Hollow Faith rules. State lives on entities/levels so save/load retains telegraphs. */
(function(root){
'use strict';
const ids=['ashenPenitent','censerWitch','reliquaryKeeper','hollowCantor','facelessSaint'];
const attack=(name,kind,range,damages,cond)=>({name,kind,range,t:damages.map((d,i)=>Object.assign({d},cond&&i>0?{cond}:{}))});
const common={faction:'hollowFaith',free:2,bonus:2,xp:8,pts:6,weak:['holy']};
const definitions={
 ashenPenitent:{name:'Ashen Penitent',ai:'brute',stam:24,speed:5,ab:[attack('Penitent’s Flail','melee',1,[4,6,8],'bleeding')],desc:'A wounded zealot. Below half stamina it strikes twice; keep it at range.'},
 censerWitch:{name:'Censer Witch',ai:'kite',stam:18,speed:4,ab:[attack('Cursed Incense','ranged',5,[2,4,6],'weakened')],desc:'Marks a smoke cloud before releasing it. Leave the marked tiles. Its curse halves healing for two rounds.'},
 reliquaryKeeper:{name:'Reliquary Keeper',ai:'brute',stam:30,speed:3,ab:[attack('Reliquary Staff','melee',1,[3,5,7])],desc:'Raises a ward on nearby faithful. Wards expire on its next turn; killing the Keeper breaks them.'},
 hollowCantor:{name:'Hollow Cantor',ai:'kite',stam:20,speed:4,ab:[attack('Hollow Note','ranged',5,[2,3,5])],desc:'Chants for one turn before calling two penitents. Damage or daze interrupts the chant. At most four summoned faithful can live at once.'},
 facelessSaint:{name:'the Saint Without a Face',title:'The Saint Without a Face',boss:true,ai:'boss',stam:150,speed:4,stab:2,bonus:4,free:4,xp:55,pts:0,ab:[attack('False Sermon','ranged',6,[4,6,8])],desc:'False Sermon calls faithful. At two-thirds stamina the Unmasking marks cursed smoke. Below one-third, Revelation marks an eruption. Damage or daze interrupts its sermon; leave the marked tiles.'}
};
for(const key of ids)definitions[key]=Object.assign({},common,definitions[key]);
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const phase=m=>Math.max(m.hollowPhase||1,m.stam<=m.max/3?3:m.stam<=m.max*2/3?2:1);
const phaseNames=['','False Sermon','Unmasking','Revelation'];
function create(api){
 const state=()=>api.state();
 const friends=m=>state().L.mons.filter(o=>!o.dead&&ids.includes(o.type)&&dist(m,o)<=4);
 const round=()=>state().C?state().C.round:0;
 function clearWards(m){for(const o of state().L.mons)if(o.hollowWard?.source===m.id)delete o.hollowWard;}
 function beginTurn(m){if(ids.includes(m.type))clearWards(m);}
 function hit(m,amount){
  if(amount>0&&m.hollowChant){delete m.hollowChant;m.hollowCooldown=2;api.log('The chant breaks.','good');}
  if(amount>0&&m.hollowWard){const used=Math.min(amount,m.hollowWard.hp);m.hollowWard.hp-=used;amount-=used;if(!m.hollowWard.hp)delete m.hollowWard;}
  return amount;
 }
 function healing(amount){return state().P.hollowCurseUntil>=round()&&state().C?Math.floor(amount/2):amount;}
 function curse(p){p.hollowCurseUntil=round()+2;api.log('Cursed incense: healing halved for two rounds.','bad');}
 function summon(m){const s=state(),live=s.L.mons.filter(o=>!o.dead&&o.hollowSummoned).length;return api.summon(m,'ashenPenitent',Math.min(2,Math.max(0,4-live)));}
 function mark(m,kind,radius){const p=state().P;m.hollowMark={x:p.x,y:p.y,kind,radius};api.log(kind==='revelation'?'Revelation gathers on the marked tiles. Move before it erupts!':'Cursed smoke gathers on the marked tiles. Move before it blooms!','bad');}
 async function turn(m){
  const s=state();if(!ids.includes(m.type)||m.dead||m.surprised)return false;
  beginTurn(m);
  if(m.hollowCooldown>0)m.hollowCooldown--;
  if(m.type==='facelessSaint'){
   const p=phase(m);if(p!==(m.hollowPhase||1)){m.hollowPhase=p;delete m.hollowChant;delete m.hollowMark;api.log('The Saint Without a Face — '+phaseNames[p],'dread');}
  }
  if(api.dazed(m)){if(m.hollowChant||m.hollowMark)api.log('The ritual is interrupted.','good');delete m.hollowChant;delete m.hollowMark;m.hollowCooldown=2;return false;}
  if(!api.sees(m)){delete m.hollowChant;delete m.hollowMark;return false;}
  if(m.hollowMark){const markData=m.hollowMark;delete m.hollowMark;
   if(dist(markData,s.P)<=markData.radius){api.damage(s.P,markData.kind==='revelation'?10:4,m);if(markData.kind==='smoke')curse(s.P);}api.fx('smokepuff',markData);m.hollowCooldown=2;return true;}
  if(m.hollowChant){delete m.hollowChant;summon(m);m.hollowCooldown=3;return true;}
  if(m.type==='reliquaryKeeper')for(const o of friends(m))o.hollowWard={source:m.id,hp:6};
  if(m.type==='ashenPenitent'&&m.stam<=m.max/2)m.extra=true;
  if(m.hollowCooldown>0)return false;
  if(m.type==='censerWitch'){mark(m,'smoke',1);return true;}
  if(m.type==='hollowCantor'||m.type==='facelessSaint'&&phase(m)===1){m.hollowChant={round:round()};api.log('A summoning chant begins. Hit or daze the chanter before its next turn!','bad');return true;}
  if(m.type==='facelessSaint'){mark(m,phase(m)===3?'revelation':'smoke',phase(m)===3?2:1);return true;}
  return false;
 }
 function death(m){clearWards(m);delete m.hollowMark;delete m.hollowChant;}
 function cleanup(){const s=state();delete s.P.hollowCurseUntil;for(const m of s.L.mons){delete m.hollowWard;delete m.hollowChant;delete m.hollowMark;}}
 return{beginTurn,turn,hit,healing,death,cleanup};
}
root.SaltmarrowHollowFaith={ids,definitions,phase,phaseNames,create};
})(typeof globalThis!=='undefined'?globalThis:this);
