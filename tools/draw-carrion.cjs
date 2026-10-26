/* Hand-authored pixel silhouettes and material clusters. No generated imagery.
   Regenerate with NODE_PATH pointing to a Sharp installation. */
const fs=require('fs'),sharp=require('sharp');
const ids=['marrowgnaw','bloatcarrier','sinewStalker','broodShepherd','carrionMatriarch'];
const ramps={
 bone:['#17181b','#30272a','#514039','#77614c','#a18b68','#c7b18b','#e1d0a5','#f5e7bf'],
 hide:['#0c131a','#211e2c','#362636','#503044','#704657','#906478','#b28d96','#d2b6b0'],
 chitin:['#0a141a','#15262b','#253b3d','#3c514a','#5d7060','#81927b','#a8b49b','#ced4b9'],
 cloth:['#0b1019','#1c2029','#2c2932','#42313b','#5c4045','#7a5655','#a17b6a','#c4a38b'],
 red:['#17141d','#2c1d2b','#462638','#613343','#814a50','#a36763','#c18b7c','#d4ad8e'],
 toxin:['#101c20','#20342d','#3b5037','#5b7548','#829e59','#a8bf72','#d1df98','#ecf5c2'],
 brass:['#17171c','#332d2c','#514539','#786345','#9e8356','#bda26e','#d8c38f','#f0e2b5']
};
const rgb=Object.fromEntries(Object.entries(ramps).map(([k,v])=>[k,v.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)))]));
function authored(id,row,frame,phase){const tile=Buffer.alloc(80*80*4);let dx=0,dy=0;
const walk=row===1?[-2,0,3,1][frame]:0,wind=row===2?[-2,-4,5,1][frame]:0;
dx=row===3?[-3,-1,2,0][frame]:0;dy=row===0?[0,-1,0,1][frame]:row===1?[0,-1,1,0][frame]:0;
function raw(x,y,mat='bone',tone=4){x=Math.round(x+dx);y=Math.round(y+dy);if(x<1||x>78||y<1||y>78)return;const i=(y*80+x)*4,c=rgb[mat][Math.max(0,Math.min(7,tone))];tile[i]=c[0];tile[i+1]=c[1];tile[i+2]=c[2];tile[i+3]=255;}
function line(x,y,u,v,mat='bone',tone=4,width=1){const n=Math.max(Math.abs(x-u),Math.abs(y-v));for(let i=0;i<=n;i++){const a=Math.round(x+(u-x)*i/(n||1)),b=Math.round(y+(v-y)*i/(n||1));for(let j=0;j<width;j++)raw(a+j,b,mat,tone);}}
function poly(p,mat='bone',light=0,texture=true){let minx=Math.min(...p.map(v=>v[0])),maxx=Math.max(...p.map(v=>v[0])),miny=Math.min(...p.map(v=>v[1])),maxy=Math.max(...p.map(v=>v[1]));const inside=(x,y)=>{let b=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],c=p[j];if((a[1]>y)!==(c[1]>y)&&x<(c[0]-a[0])*(y-a[1])/(c[1]-a[1])+a[0])b=!b;}return b};
for(let y=Math.floor(miny);y<=maxy;y++)for(let x=Math.floor(minx);x<=maxx;x++)if(inside(x+.5,y+.5)){const edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);const n=((Math.floor(x/2)*37+Math.floor(y/2)*19+x*y*3)%29);let t=3+light+Math.floor((1-(x-minx)/(maxx-minx||1))*2-(y-miny)/(maxy-miny||1));if(texture){if(n<5)t-=2;if(n>25)t++;if(n===18&&((x+y)%5===0))t+=2;}if(edge)t=inside(x-1,y)&&inside(x,y-1)?Math.max(1,t-2):Math.min(7,t+1);raw(x,y,mat,t);}
for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];line(...a,...b,mat,0);} // silhouetted contour
// Broken upper-left rim highlights, not a uniform cartoon outline.
for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if(b[0]>a[0]&&b[1]<=a[1]+2)line(a[0]+1,a[1]+1,b[0]-1,b[1]+1,mat,5+light);}
}
function tendon(x,y,u,v,w=3,mat='hide',light=0){const n=Math.hypot(u-x,v-y)||1,nx=(v-y)/n,ny=(x-u)/n;poly([[x+nx*w,y+ny*w],[x-nx*w,y-ny*w],[u-nx*w*.55,v-ny*w*.55],[u+nx*w*.55,v+ny*w*.55]],mat,light);line(x-1,y,u-1,v,mat,5+light);}
function claw(x,y,u,v,mat='bone'){poly([[x-2,y],[x+2,y-1],[u+1,v-2],[u,v],[u-2,v]],mat,1,false);}
function plate(x,y,w,h,mat='bone',light=0){poly([[x,y-h],[x+w*.7,y-h*.6],[x+w,y],[x+w*.6,y+h*.65],[x-w*.4,y+h],[x-w,y+h*.3],[x-w*.8,y-h*.4]],mat,light);line(x-w*.5,y-h*.3,x+w*.4,y+h*.4,mat,Math.min(7,5+light));raw(x-w*.4,y-h*.4,mat,7);}
function horn(x,y,u,v,w=3){poly([[x-w,y],[x+w,y+1],[u+1,v+2],[u,v],[u-2,v+4]],'bone',1);line(x-w+1,y-1,u,v+2,'bone',6);}
function skull(x,y,s=1,open=0){const p=a=>a.map(([u,v])=>[x+u*s,y+v*s]);poly(p([[-7,-5],[-5,-9],[1,-11],[7,-8],[9,-3],[6,1],[8,4],[4,7],[-2,6],[-6,2],[-8,0]]),'bone',0);poly(p([[-4,-4],[0,-6],[3,-3],[1,0],[-3,0]]),'hide',-3,false);poly(p([[5,-5],[7,-4],[6,-1],[4,-1]]),'hide',-3,false);line(x-3*s,y-3*s,x,y-4*s,'toxin',6);raw(x-2*s,y-3*s,'toxin',7);poly(p([[0,1],[4,0],[5,3],[2,4]]),'hide',-2,false);poly(p([[-3,5],[3,4],[7,3+open],[6,7+open],[1,10+open],[-3,8+open]]),'bone',-1);for(let k=0;k<4;k++)line(x+(-2+k*2)*s,y+5*s,x+(-2+k*2)*s,y+(7+(k%2))*s,'bone',6);line(x-6*s,y-6*s,x-4*s,y-7*s,'bone',7);}
function sac(x,y,w=4,h=5,light=0){poly([[x-w+1,y-h+1],[x,y-h],[x+w-1,y-h+2],[x+w,y+1],[x+2,y+h],[x-2,y+h-1],[x-w,y+1]],'toxin',light);line(x-w+2,y-h+2,x-1,y-h+1,'toxin',7);raw(x-w+1,y-1,'toxin',6);line(x+1,y+1,x+2,y+h-2,'toxin',2);}
function ribs(x,y,n=4,w=8){for(let k=0;k<n;k++){const yy=y+k*3;line(x-1,yy,x-w+2,yy-2,'bone',4);line(x-w+2,yy-2,x-w,yy,'bone',6);line(x+1,yy,x+w-1,yy-3,'bone',3);line(x+w-1,yy-3,x+w+1,yy-1,'bone',5);raw(x-2,yy-1,'bone',7);}tendon(x,y-3,x,y+n*3,1,'bone',0);}
function talons(x,y,s=1){for(let k=0;k<3;k++){line(x+k*3,y,x+(k*3+2)*s,y+4,'bone',4);line(x+(k*3+2)*s,y+4,x+(k*3+1)*s,y+6,'bone',6);}}
function sporeTrail(x,y,n=8){for(let k=0;k<n;k++){const a=x+(k*7%19)-9,b=y-(k*11%21);raw(a,b,'toxin',4+k%3);if(k%3===0)line(a,b,a+1,b,'toxin',6);}}
if(id==='marrowgnaw'){
 // Low, crooked hyena-like scavenger: heavy near shoulder, narrow haunches.
 tendon(28,48,23-walk,59,4,'hide',-1);tendon(23-walk,59,29-walk,67,2,'hide');talons(26-walk,67);
 tendon(50,43,59+walk,53,3,'hide',-1);tendon(59+walk,53,56+walk,65,2,'bone',-1);talons(54+walk,65);
 poly([[22,45],[17,46],[11,42],[8,35],[11,36],[15,41],[24,40]],'hide',-1);horn(9,36,7,30,2);
 poly([[20,37],[24,30],[34,28],[45,33],[52,40],[51,49],[42,53],[30,50],[22,47]],'hide');
 poly([[26,31],[34,28],[43,32],[46,38],[35,41],[25,39]],'chitin',0);ribs(36,39,4,9);
 tendon(28,48,23+walk,56,4,'hide');tendon(23+walk,56,20+walk,66,2,'bone',1);talons(17+walk,66);
 tendon(48,42,51-walk,54,4,'hide',0);tendon(51-walk,54,47-walk,68,2,'bone',1);talons(44-walk,68);
 plate(45,35,7,9,'bone');for(let k=0;k<7;k++){line(24+k*3,34,22+k*3,40+(k%3)*2,'hide',2);raw(24+k*3,34,'hide',6);}
 for(let k=0;k<5;k++)horn(25+k*4,31+(k%2),23+k*4,23+(k%2)*2,2);
 tendon(48,34,56+wind,36,5,'hide');skull(59+wind,37,1, row===2&&frame===2?3:0);horn(53+wind,29,50+wind,23,2);line(64+wind,40,70+wind,41,'bone',5);
}else if(id==='bloatcarrier'){
 // Asymmetrical fungal bearer; plated shoulder over a weighted distended sac.
 tendon(32,51,28-walk,64,5,'hide',-1);plate(27-walk,67,5,3,'bone',-1);
 tendon(48,52,51+walk,64,5,'hide',-1);plate(53+walk,68,6,3,'bone');
 poly([[25,29],[31,23],[43,22],[53,29],[59,42],[58,52],[51,60],[37,61],[25,55],[21,44]],'hide');
 poly([[33,30],[45,27],[54,34],[57,46],[52,55],[42,58],[31,53],[28,42]],'red',-1);ribs(38,33,4,10);for(let k=0;k<5;k++){line(28+k*4,48,29+k*4,53+(k%2)*3,'hide',2);raw(30+k*4,54,'hide',5);}
 for(const [x,y,w,h]of [[27,29,6,7],[34,24,5,5],[43,26,6,6],[49,34,7,8],[54,45,5,7],[42,46,7,8],[31,44,6,7],[34,54,4,5]])sac(x,y,w,h,-1);
 tendon(24,31,18,44,4,'hide',-1);tendon(18,44,20+wind,56,3,'hide');talons(17+wind,55);
 tendon(52,29,61,39,4,'hide');tendon(61,39,65+wind,49,3,'hide');talons(62+wind,49);
 plate(24,28,7,6,'bone');horn(21,24,17,17,3);horn(27,22,24,14,3);skull(40,20,.8);plate(40,10,7,3,'chitin');
 for(let k=0;k<4;k++){const x=24+k*7,y=35+(k%2)*14;line(x,y,x+2,y+4,'toxin',2);raw(x+2,y+5,'toxin',5);}
 if(row===2)sporeTrail(62,27,4+frame*3);
}else if(id==='sinewStalker'){
 // Narrow elevated thorax, long folded mantis limbs and overextended talons.
 tendon(34,43,24+walk,54,3,'hide',-1);tendon(24+walk,54,20+walk,67,2,'bone',-1);talons(17+walk,66);
 tendon(43,43,50-walk,55,3,'hide');tendon(50-walk,55,58-walk,67,2,'bone');talons(56-walk,67);
 tendon(29,28,17,37,3,'hide',-1);tendon(17,37,11-wind,52,2,'bone',-1);claw(11-wind,52,14-wind,60);
 poly([[31,25],[39,23],[46,30],[43,38],[46,44],[40,49],[33,44],[29,35]],'hide',0);ribs(37,30,5,6);
 plate(31,27,5,5,'chitin');plate(43,28,5,5,'bone');
 tendon(45,30,57,37-wind,3,'hide');tendon(57,37-wind,63+wind,52-wind,2,'bone',1);
 claw(63+wind,52-wind,60+wind,64-wind);claw(65+wind,50-wind,69+wind,59-wind);claw(60+wind,51-wind,56+wind,59-wind);
 tendon(36,24,40,19,3,'hide');skull(43+wind*.3,19,.8, row===2?1:0);horn(37,13,32,5,2);horn(45,11,47,4,2);
 for(let k=0;k<4;k++)horn(31,29+k*4,25-k%2*3,25+k*4,2);
}else if(id==='broodShepherd'){
 // Crooked ceremonial figure, bone mantle and hanging nesting shroud.
 tendon(33,55,30-walk,68,3,'bone',-1);talons(28-walk,67);tendon(44,56,48+walk,68,3,'bone');talons(46+walk,67);
 poly([[29,27],[40,25],[48,31],[48,43],[54,65],[49,68],[43,64],[40,70],[34,66],[29,69],[25,64],[28,46]],'cloth',-1);
 poly([[31,29],[37,31],[35,48],[31,64],[27,66],[30,44]],'red',-1);poly([[41,29],[45,31],[45,47],[50,65],[46,63],[41,53]],'cloth',0);
 for(let k=0;k<6;k++){const x=30+k*3;line(x,43+(k%2)*4,x-2+(k%3),61+(k%2)*4,'cloth',k%2?5:2);}
 for(let k=0;k<5;k++){const x=28+k*5;line(x,32,x-1,52+(k%3)*4,'brass',2);for(let j=0;j<3;j++){raw(x-1,38+j*5,'brass',5);raw(x,39+j*5,'brass',3);}}
 ribs(38,34,5,8);tendon(28,31,22,43,3,'hide');tendon(22,43,28+wind,50,2,'bone');talons(27+wind,49);
 tendon(46,31,52,40,3,'hide');tendon(52,40,61,37+wind,2,'bone',1);
 line(61,16,64,69,'cloth',0,3);line(61,16,64,69,'brass',4);line(62,18,65,66,'brass',2);horn(61,20,65,9,2);horn(61,20,56,10,2);sac(60,14,4,5,0);
 plate(27,27,7,5,'bone');plate(46,27,7,5,'bone');for(const [x,y]of [[25,24],[30,22],[46,22],[50,24]])horn(x,y,x-3,y-8,2);
 poly([[30,20],[33,12],[40,10],[47,15],[46,25],[39,28],[33,25]],'cloth',-1);skull(39,21,.65);
 horn(32,13,28,5,2);horn(36,11,34,3,2);horn(43,12,46,5,2);
 for(const [x,y]of [[27,39],[24,45],[48,44],[51,50]]){sac(x,y,2,3,-1);line(x,y-4,x+2,y-9,'cloth',3);}
 if(row===2)sporeTrail(30+wind,46,3+frame*2);
}else if(id==='carrionMatriarch'){
 // Diagonal abdomen under a rising armored thorax; six jointed limbs, antler crest.
 for(let k=0;k<3;k++){const x=22+k*11,y=40+k*4;tendon(x,y,12+k*8+walk,53+k*3,3,'hide',-1);tendon(12+k*8+walk,53+k*3,7+k*11+walk,67,2,'bone',-1);claw(7+k*11+walk,67,12+k*11+walk,70);}
 poly([[22,35],[35,31],[49,37],[59,47],[61,57],[54,64],[41,68],[27,64],[18,56],[16,45]],phase===2?'hide':'chitin',0);
 for(const [x,y,w,h]of [[22,44,5,8],[29,39,6,6],[37,40,6,6],[45,44,6,6],[52,49,5,7],[52,58,5,5],[43,60,5,6],[33,60,6,5],[24,55,5,6]])plate(x,y,w,h,'chitin',phase===2?1:0);
 for(const [x,y]of [[25,48],[33,47],[41,50],[46,57],[35,58]])sac(x,y,3,4,phase===3?1:-1);
 for(let k=0;k<3;k++){tendon(48+k*3,45+k*3,63+k*3-walk,51+k*4,3,'hide');tendon(63+k*3-walk,51+k*4,67+k*3-walk,65+k,2,'bone',0);claw(67+k*3-walk,65+k,64+k*3-walk,70);}
 tendon(33,36,36,23,7,'hide');poly([[29,23],[36,18],[46,24],[47,34],[42,41],[33,39],[28,32]],'hide',0);ribs(38,27,5,8);
 plate(28,25,7,6,'bone');plate(46,25,7,6,'bone');
 tendon(27,28,18,35-wind,4,'hide');tendon(18,35-wind,14-wind,47-wind,2,'bone',1);claw(14-wind,47-wind,22-wind,57-wind);claw(17-wind,46-wind,26-wind,54-wind);
 tendon(48,27,57,31-wind,4,'hide');tendon(57,31-wind,64+wind,39-wind,2,'bone',1);claw(64+wind,39-wind,60+wind,51-wind);claw(66+wind,39-wind,69+wind,48-wind);
 skull(40,18,.85,phase===3?2:0);poly([[33,14],[34,9],[40,6],[45,8],[47,12],[43,15]],'chitin');
 horn(33,13,26,5,3);horn(37,10,34,2,2);horn(43,10,47,3,2);horn(46,13,54,7,3);
 if(phase===2){poly([[20,39],[14,37],[16,47],[20,51],[24,44]],'bone',1);poly([[47,39],[53,34],[59,42],[57,48],[52,45]],'bone',1);poly([[29,35],[27,29],[35,31],[40,37],[35,40]],'bone',1);for(const [x,y]of [[20,43],[32,37],[48,42],[56,55]]){horn(x,y,x-5,y-8,3);line(x,y,x+4,y+5,'hide',0);raw(x+1,y+2,'toxin',6);}}
 if(phase===3){poly([[23,39],[29,35],[38,38],[46,42],[52,49],[46,48],[39,44],[32,44]],'bone',1);for(let k=0;k<6;k++){const x=21+k*6,y=41+(k%3)*2;horn(x,y,x-5,y-13-(k%2)*3,3);line(x+1,y+4,x+2,y+8,'toxin',6);}sporeTrail(54,33,9);}
 if(row===2)sporeTrail(38,40,3+frame*2);
}else if(id==='broodParasite'){
 poly([[28,57],[32,52],[42,53],[49,58],[50,63],[43,66],[33,65],[27,62]],'hide');for(let k=0;k<5;k++){plate(30+k*4,58+k%2,3,4,'chitin');claw(29+k*4,63,27+k*4+walk,69);}skull(49+wind*.3,60,.45);sac(35,55,2,2,-1);
}else if(id==='broodEgg'){
 sac(39,59,8,10,0);plate(33,64,4,4,'chitin');plate(44,66,5,3,'chitin');for(let k=0;k<4;k++)line(34+k*3,54,35+k*2,63,'toxin',2);if(row===2)line(35,55,43+frame,62,'bone',2);sporeTrail(40,51,3);
}
if(row===3){for(let k=0;k<3;k++){line(20+k*14,15+(k%2)*7,22+k*14,13+(k%2)*7,'bone',6);}}
// Collapse the authored figure into dry chitin and drifting spores, without gore.
if(row===4){const out=Buffer.alloc(tile.length),factor=[.92,.65,.28,0][frame];if(factor)for(let y=0;y<80;y++)for(let x=0;x<80;x++){const i=(y*80+x)*4;if(!tile[i+3]||frame===2&&(x*7+y*11)%9<3)continue;const nx=Math.round(x+(70-y)*frame*.14),ny=Math.round(70-(70-y)*factor);if(nx<1||nx>78||ny<1||ny>78)continue;tile.copy(out,(ny*80+nx)*4,i,i+4);}for(let k=0;k<22;k++){const x=23+(k*13%39),y=69-(k*11%29)-frame*2;if(x>0&&y>0){const i=(y*80+x)*4,c=rgb[k%3?'toxin':'bone'][3+k%4];out[i]=c[0];out[i+1]=c[1];out[i+2]=c[2];out[i+3]=255;}}return out;}
return tile;
}
(async()=>{for(const id of [...ids,'broodEgg','broodParasite','carrionMatriarch-phase2','carrionMatriarch-phase3']){const phase=id.endsWith('phase2')?2:id.endsWith('phase3')?3:1,type=id.split('-phase')[0],b=Buffer.alloc(320*400*4);for(let r=0;r<5;r++)for(let f=0;f<4;f++){const tile=authored(type,r,f,phase);for(let y=0;y<80;y++)tile.copy(b,((r*80+y)*320+f*80)*4,y*80*4,(y+1)*80*4);}await sharp(b,{raw:{width:320,height:400,channels:4}}).png().toFile('assets/carrion-brood/'+id+'.png');}
fs.writeFileSync('assets/carrion-brood/manifest.json',JSON.stringify({cell:80,columns:4,states:['idle','move','attack','hurt','defeat'],anchor:[40,70],palette:ramps,ids,style:'Textured bone, sinew, corroded chitin; upper-left clustered highlights; semi-isometric anatomy'},null,2)+'\n');})();
