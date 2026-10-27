/* Saltmarrow v6: one authored environment, one coordinate system.
 * The image contains the town's complete static composition. No legacy building,
 * cliff, tile or prop atlas is composited onto it. Gameplay remains a 32px grid. */
(function(root){
'use strict';
const url='assets/town-v6/town.webp',size={w:2016,h:1376},errors=[];
let plate=null;
const ready=typeof document==='undefined'?Promise.resolve():new Promise(resolve=>{
 const image=new Image();image.onload=()=>{plate=image;resolve()};image.onerror=()=>{errors.push('Unable to load '+url);resolve()};image.src=url;
});
function draw(g,L){
 g.save();g.imageSmoothingEnabled=false;g.fillStyle='#10252f';g.fillRect(0,0,size.w,size.h);
 if(plate)g.drawImage(plate,0,0,size.w,size.h);
 g.restore();
}
function changes(g,L){
 g.save();g.imageSmoothingEnabled=false;
 for(const o of L.objs||[]){
  if(!((o.type==='house'&&o.boarded)||(o.type==='door'&&o.closed)))continue;
  const x=Math.round((o.x+.5)*32),y=Math.round((o.y+.55)*32);
  for(let j=0;j<3;j++){g.fillStyle=j%2?'#433d33':'#574c3b';g.fillRect(x-11,y-13+j*8,23,4);g.fillStyle='#a49b7c';g.fillRect(x-8,y-12+j*8,1,1);g.fillRect(x+8,y-12+j*8,1,1)}
 }
 // Physical progression stays sparse so it does not compete with the authored scene.
 if(L.townAct===4){g.fillStyle='rgba(12,39,49,.18)';for(const[x,y,w,h]of[[14,36,8,1],[22,33,8,1]])g.fillRect(x*32,y*32,w*32,h*32)}
 // Discreet brass wayfinding marks identify stair landings without covering the authored masonry.
 for(const p of L.townPassages||[]){const x=p.x*32,y=p.y*32;
  g.fillStyle='rgba(13,23,27,.65)';g.fillRect(x+6,y+8,21,20);
  g.fillStyle='#9e8d65';for(const [dx,dy]of[[5,7],[24,7],[5,26],[24,26]]){g.fillRect(x+dx,y+dy,4,1);g.fillRect(x+dx,y+dy,1,3)}
  g.fillStyle='#747d77';for(let k=0;k<3;k++)g.fillRect(x+10,y+17+k*3,13,1);
  const up=p.toY<p.y;g.fillStyle='#e1c583';g.fillRect(x+15,y+10,2,10);g.fillRect(x+12,y+(up?12:16),8,2);g.fillRect(x+14,y+(up?10:18),4,2);
 }
 g.restore();
}
function hit(L,x,y){
 // Clickable facades refer back to their real grid doors, never a second projection.
 return (L.townFacades||[]).filter(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h).sort((a,b)=>b.y+b.h-a.y-a.h)[0]||null;
}
const api={version:6,url,size,ready,errors,draw,changes,hit,get loaded(){return!!plate}};
root.SaltmarrowCoast=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
