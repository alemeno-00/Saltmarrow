/* Carrion Brood: deterministic turn rules; pending actions survive save/load. */
(function(root){'use strict';
const ids=['marrowgnaw','bloatcarrier','sinewStalker','broodShepherd','carrionMatriarch'];
const names=['Marrowgnaw','Bloatcarrier','Sinew Stalker','Brood Shepherd','Carrion Matriarch'];
const phases=['','Feeding Ground','Molting','Mother of Hunger'];
const phase=m=>Math.max(m.broodPhase||1,m.stam<=m.max/3?3:m.stam<=m.max*2/3?2:1);
const definitions={};
ids.forEach((id,i)=>definitions[id]={name:names[i],title:names[i],ai:['pack','brute','stalker','support','boss'][i],stam:[18,28,22,35,170][i],speed:[6,3,8,4,4][i],bonus:2,free:2,xp:i===4?65:8,pts:i===4?0:6,boss:i===4,faction:'carrion',ab:[{name:['Gnaw','Spore Claw','Hooked Talons','Brood Staff','Hunger Claw'][i],kind:'melee',range:1,t:[{d:3},{d:5},{d:7}]}],desc:[
 'Pack scavenger. Consumes a nearby corpse to regenerate; deny it feeding grounds.',
 'Marks a toxic spore burst for its next turn and releases parasites. Leave the marked tiles.',
 'Climbs along walls and telegraphs a leap. Move away from the marked landing tiles.',
 'Plants vulnerable brood eggs. Eggs hatch on its following turn; destroy the egg or Shepherd to stop them. Heals nearby brood.',
 'Feeding Ground consumes remains. Molting grants a temporary shell and warns of a leap. Mother of Hunger plants eggs and marks a wider toxic burst.'
][i]});
definitions.broodEgg={noLoot:true,noCorpse:true,name:'Brood Egg',ai:'brute',stam:6,speed:0,bonus:0,free:0,xp:0,pts:0,ab:[],desc:'A fragile egg. Destroy it before the parent acts again.'};
definitions.broodParasite={...definitions.marrowgnaw,noLoot:true,noCorpse:true,name:'Brood Parasite',title:'Brood Parasite',stam:5,speed:7,xp:1,pts:0,ab:[{name:'Nip',kind:'melee',range:1,t:[{d:1},{d:2},{d:3}]}],desc:'A small parasite released by a Bloatcarrier. Summoned brood are capped at six.'};
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
function create(api){
 const friends=m=>api.state().L.mons.filter(o=>!o.dead&&(ids.includes(o.type)||o.type==='broodParasite')&&o!==m&&dist(o,m)<=4);
 function cancel(m){if(m.broodEgg)api.consumeEgg(m.broodEgg);delete m.broodMark;delete m.broodEgg;}
 function death(m){cancel(m);for(const o of api.state().L.mons)if(o.broodParent===m.id){o.stam=0;api.dismiss(o);}}
 function feed(m){const L=api.state().L,c=L.objs.find(o=>o.type==='corpse'&&!o.broodConsumed&&dist(o,m)<=1);if(!c||m.stam>=m.max)return false;c.broodConsumed=true;L.objs.splice(L.objs.indexOf(c),1);m.stam=Math.min(m.max,m.stam+8);api.log(m.type==='marrowgnaw'?'The Marrowgnaw feeds and regains stamina.':'The Matriarch devours remains.','bad');return true;}
 function hatch(m){if(m.broodEgg&&!api.consumeEgg(m.broodEgg)){delete m.broodEgg;return;}delete m.broodEgg;const living=api.state().L.mons.filter(o=>!o.dead&&o.broodSummoned).length;if(living<6)api.summon(m,m.type==='bloatcarrier'?'broodParasite':'marrowgnaw',Math.min(2,6-living));}
 function mark(m,kind,radius){const p=api.state().P;m.broodMark={x:p.x,y:p.y,kind,radius};api.log(kind==='leap'?'Hooked limbs coil. Leave the marked landing tiles!':'Toxic spores gather. Leave the marked tiles!','bad');}
 async function turn(m){
  if(!ids.includes(m.type)||m.dead||m.surprised)return false;
  if(api.dazed(m)){cancel(m);m.broodCooldown=2;return true;}
  if(!api.sees(m)){const pending=!!(m.broodMark||m.broodEgg);cancel(m);return pending;}
  if(m.broodCooldown>0)m.broodCooldown--;
  if(m.type==='carrionMatriarch'){const p=phase(m);if(p!==(m.broodPhase||1)){m.broodPhase=p;cancel(m);m.broodCooldown=0;if(p===2)m.temp=Math.max(m.temp||0,12);api.log('Carrion Matriarch — '+phases[p],'dread');}}
  if(m.broodMark){const a=m.broodMark;delete m.broodMark;
   if(a.kind==='leap')api.land(m,a);
   if(dist(a,api.state().P)<=a.radius){api.damage(api.state().P,m.type==='carrionMatriarch'?10:5,m);if(a.kind==='spores')api.poison(api.state().P);}
   if(a.kind==='spores'&&m.type==='bloatcarrier')hatch(m);
   api.fx(a);m.broodCooldown=3;return true;
  }
  if(m.broodEgg){hatch(m);m.broodCooldown=3;return true;}
  if((m.type==='marrowgnaw'||m.type==='carrionMatriarch'&&phase(m)===1)&&feed(m))return true;
  if(m.type==='broodShepherd')for(const o of friends(m))o.stam=Math.min(o.max,o.stam+3);
  if(m.broodCooldown>0)return false;
  if(dist(m,api.state().P)>6)return false;
  if(m.type==='sinewStalker'){api.climb(m);mark(m,'leap',0);return true;}
  if(m.type==='bloatcarrier'){mark(m,'spores',1);return true;}
  if(m.type==='broodShepherd'||m.type==='carrionMatriarch'&&phase(m)!==2){m.broodEgg=api.egg(m);if(m.type==='carrionMatriarch')mark(m,'spores',phase(m)===3?2:1);return true;}
  if(m.type==='carrionMatriarch'){mark(m,'leap',1);return true;}
  return false;
 }
 function cleanup(){for(const m of api.state().L.mons.slice())cancel(m);}
 return {turn,death,cleanup,feed};
}
root.SaltmarrowCarrion={ids,names,phases,phase,definitions,create};
})(globalThis);
