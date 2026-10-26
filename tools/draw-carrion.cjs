/* Direct pixel authoring. Integer geometry, hard edges, fixed palette and anchor. */
const fs=require('fs'),sharp=require('sharp');
const ids=['marrowgnaw','bloatcarrier','sinewStalker','broodShepherd','carrionMatriarch'];
const pal=['#10131b','#302c39','#57444b','#826759','#b8a381','#e1d6ae','#354b3b','#65794a','#a8bb65','#d4e792','#874a66'];
function make(id,phase=1){const cell=80,w=cell*4,h=cell*5,b=Buffer.alloc(w*h*4);let ox=0,oy=0;
function pixel(x,y,c){x=Math.round(x)+ox;y=Math.round(y)+oy;if(x<ox||x>=ox+80||y<oy||y>=oy+80)return;const k=(y*w+x)*4,s=pal[c];b[k]=parseInt(s.slice(1,3),16);b[k+1]=parseInt(s.slice(3,5),16);b[k+2]=parseInt(s.slice(5,7),16);b[k+3]=255;}
function rect(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)pixel(x+i,y+j,c);}
function line(x,y,u,v,c,t=1){const n=Math.max(Math.abs(u-x),Math.abs(v-y));for(let i=0;i<=n;i++)rect(Math.round(x+(u-x)*i/(n||1)),Math.round(y+(v-y)*i/(n||1)),t,t,c);}
function oval(x,y,rx,ry,c){for(let j=-ry;j<=ry;j++)for(let i=-rx;i<=rx;i++)if(i*i/(rx*rx)+j*j/(ry*ry)<=1)pixel(x+i,y+j,c);}
function shell(x,y,rx,ry){oval(x,y,rx+1,ry+1,0);oval(x,y,rx,ry,2);oval(x-2,y-2,rx-2,ry-2,3);oval(x-4,y-4,Math.max(1,rx-5),Math.max(1,ry-5),4);for(let i=-rx+3;i<rx-2;i+=4)line(x+i,y-ry+3,x+i+2,y+ry-3,2);}
for(let r=0;r<5;r++)for(let f=0;f<4;f++){ox=f*80;oy=r*80;const walk=r===1?(f%2?3:-3):0,hit=r===3?[-3,-1,2,0][f]:0,bob=r===0?[0,-1,0,1][f]:0,atk=r===2?[0,-3,6,2][f]:0,dead=r===4;let x=38+hit,y=46+bob;
if(dead){const fade=f;for(let k=0;k<12;k++){const px=22+(k*13%39),py=59+(k*7%10);rect(px,py,3,2,k%2?2:4);}for(let k=0;k<7;k++)rect(24+k*5+f,50-(k%3)*4-f*3,2,2,7+k%3);if(f===3)continue;y+=f*5;}
if(id==='broodEgg'){oval(x,y+15,7,10,0);oval(x,y+15,6,9,6);oval(x-2,y+12,3,5,8);line(x-3,y+9,x+2,y+16,4);if(r===2)line(x,y+8,x+3+f,y+20,0);
}else if(id==='broodParasite'){shell(x,y+13,9,5);for(let k=0;k<5;k++)line(x-8+k*4,y+15,x-10+k*4+walk,y+22,7);rect(x+6+atk,y+11,3,2,9);
}else if(id==='marrowgnaw'){
 for(let s of [-1,1]){line(x+s*10,y+7,x+s*16+walk*s,y+18,0,5);line(x+s*10,y+7,x+s*16+walk*s,y+17,3,3);line(x+s*16+walk*s,y+18,x+s*20+walk*s,y+18,5,2);}
 line(x-13,y+2,x-24,y+9,0,4);line(x-24,y+9,x-28,y+4,3,2);shell(x,y,16,10);shell(x+14+atk,y-1,9,7);rect(x+16+atk,y-3,3,2,9);line(x+17+atk,y+4,x+23+atk,y+4,0,2);for(let k=0;k<3;k++)rect(x+17+atk+k*2,y+4,1,3,5);for(let k=0;k<5;k++)line(x-10+k*4,y-8,x-12+k*4,y-14+(k%2)*2,5,2);
}else if(id==='bloatcarrier'){
 line(x-10,y+12,x-13+walk,y+23,0,6);line(x+8,y+12,x+13-walk,y+23,0,6);shell(x,y,19,20);oval(x+3,y+1,12,14,6);for(let k=0;k<8;k++){const a=x-10+k*3,b=y-10+(k%3)*7;oval(a,b,4,5,0);oval(a,b-1,3,4,7);pixel(a-1,b-2,9);}shell(x+12,y-18,7,6);rect(x+14,y-20,3,2,9);for(let s of [-1,1])line(x+s*15,y-5,x+s*25+atk,y+8,2,4);if(r===2)for(let k=0;k<=f;k++)oval(x+20+k*4,y-23-k*4,2,2,8);
}else if(id==='sinewStalker'){
 for(let s of [-1,1]){line(x+s*7,y,x+s*22,y-9+walk*s,0,4);line(x+s*22,y-9+walk*s,x+s*26+atk,y+15,3,2);line(x+s*5,y+8,x+s*14,y+17-walk*s,0,4);line(x+s*14,y+17-walk*s,x+s*24,y+22-walk*s,4,2);line(x+s*26+atk,y+15,x+s*23+atk,y+20,5,2);}shell(x,y,8,16);shell(x+4+atk,y-17,8,7);rect(x+5+atk,y-19,4,1,9);for(let k=0;k<5;k++)line(x-6,y-9+k*5,x+6,y-7+k*5,4);
}else{
 const boss=id==='carrionMatriarch',rx=boss?24:14,ry=boss?18:16;
 for(let s of [-1,1])for(let k=0;k<(boss?3:2);k++){line(x+s*(rx-4),y-9+k*9,x+s*(rx+8),y-7+k*9+walk*s,0,4);line(x+s*(rx+8),y-7+k*9+walk*s,x+s*(rx+10),y+14+k*3,4,2);}
 shell(x,y,rx,ry);if(boss&&phase===3){for(let k=0;k<7;k++){line(x-19+k*6,y-14,x-23+k*7,y-25-(k%2)*3,0,3);line(x-19+k*6,y-14,x-23+k*7,y-25-(k%2)*3,5);}}
 if(boss&&phase===2){line(x-20,y-8,x-26,y-16,5,3);line(x+18,y-10,x+25,y-19,5,3);line(x-20,y+10,x-25,y+17,4,3);}
 if(boss){oval(x,y+3,rx-5,ry-5,phase===2?4:6);for(let k=0;k<7;k++)oval(x-14+(k*7%27),y-7+(k*11%23),3,4,phase===3?9:7);}
 shell(x+5,y-ry-6,9,8);rect(x+7,y-ry-8,4,2,9);for(let k=0;k<5;k++)line(x-3+k*4,y-ry-10,x-5+k*4,y-ry-19+(k%2)*5,5,2);
 if(!boss){line(x+19,y-25,x+22,y+22,0,4);line(x+20,y-25,x+23,y+22,4,2);oval(x+19,y-28,5,6,7);rect(x+17,y-31,3,2,9);}
 if(r===2)for(let k=0;k<=f;k++)oval(x-15+k*9,y+20,3,4,8);
}
if(r===3){line(15+f*2,26,21+f*2,21,5);line(62,29+f,67,26+f,5);}
}
return sharp(b,{raw:{width:w,height:h,channels:4}}).png().toFile(`assets/carrion-brood/${id}${phase>1?'-phase'+phase:''}.png`);
}
(async()=>{for(const id of [...ids,'broodEgg','broodParasite'])await make(id);await make('carrionMatriarch',2);await make('carrionMatriarch',3);fs.writeFileSync('assets/carrion-brood/manifest.json',JSON.stringify({cell:80,columns:4,states:['idle','move','attack','hurt','defeat'],anchor:[40,70],palette:pal,ids},null,2)+'\n');})();
