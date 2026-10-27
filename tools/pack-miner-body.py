"""Normalize generated full-body poses; no painting or synthetic limb animation.
Uses alpha-connected components to avoid cutting an extended maul into a neighbor.
Requires Pillow. Source PNGs and frame metadata remain alongside the packed atlas.
"""
from pathlib import Path
from PIL import Image,ImageOps
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
def components(im):
 w,h=im.size;alpha=bytearray(im.getchannel('A').point(lambda a:255 if a>32 else 0).tobytes());out=[]
 for start in range(w*h):
  if not alpha[start]:continue
  alpha[start]=0;q=[start];size=0;x0=w;y0=h;x1=y1=0
  while q:
   i=q.pop();y,x=divmod(i,w);size+=1;x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)
   for j in (i-w if y else -1,i+w if y<h-1 else -1,i-1 if x else -1,i+1 if x<w-1 else -1):
    if j>=0 and alpha[j]:alpha[j]=0;q.append(j)
  if size>500:out.append((x0,y0,x1+1,y1+1))
 return out
walk_path=ROOT/'assets/flat/miner-body-side-v1.png';attack_path=ROOT/'assets/flat/miner-maul-body-source-v1.png'
walk=Image.open(walk_path).convert('RGBA');attack=Image.open(attack_path).convert('RGBA')
wrects=sorted([b for b in components(walk) if b[3]<walk.height*.52],key=lambda b:b[0]);arects=components(attack);assert len(wrects)==8,len(wrects);assert len(arects)==8,len(arects)
arects=sorted(arects,key=lambda b:(int((b[1]+b[3])/2>attack.height/2),b[0]))
CW,CH,GROUND=112,96,88;sheet=Image.new('RGBA',(CW*8,CH*4));metadata=[]
for kind,im,rects,row in [('walk',walk,wrects,0),('attack',attack,arects,2)]:
 first=rects[0];scale=48/(first[3]-first[1]);px=im.load()
 for col,box in enumerate(rects):
  x0,y0,x1,y1=box;h=y1-y0;reds=[x for y in range(y0,int(y0+h*.45)) for x in range(x0,x1) if px[x,y][3]>160 and px[x,y][0]>px[x,y][1]*1.5 and px[x,y][0]>px[x,y][2]*1.5];head=sum(reds)/len(reds) if reds else (x0+x1)/2
  boots=[]
  for y in range(int(y0+h*.73),y1):
   for x in range(max(x0,int(head-h*.6)),min(x1,int(head+h*.38))):
    r,g,b,a=px[x,y]
    if a>160 and r>g+4 and g>b+2 and r<180:boots.append((x,y))
  assert boots,(kind,col,'no boot anchor')
  ground=max(y for x,y in boots)+1
  anchor=head if kind=='walk' else (min(x for x,y in boots)+max(x for x,y in boots))/2
  raw=im.crop(box);size=(round(raw.width*scale),round(raw.height*scale));sprite=raw.resize(size,Image.Resampling.NEAREST)
  c=Image.new('RGBA',(CW,CH));dx=round(CW/2+(x0-anchor)*scale);dy=round(GROUND+(y0-ground)*scale);assert dx>=1 and dx+size[0]<CW-1,(kind,col,'horizontal clipping',dx,size)
  assert dy>=1 and dy+size[1]<CH-1,(kind,col,'vertical clipping',dy,size)
  c.alpha_composite(sprite,(dx,dy));sheet.alpha_composite(c,(col*CW,row*CH));sheet.alpha_composite(ImageOps.mirror(c),(col*CW,(row+1)*CH))
  metadata.append({'kind':kind,'frame':col,'sourceBox':box,'anchor':[round(anchor,3),ground],'scale':scale,'packedOrigin':[dx,dy],'packedSize':size})
sheet.save(ROOT/'assets/flat/miner-body-packed-v1.png',optimize=True)
manifest={'cell':[CW,CH],'groundY':GROUND,'rows':['walk-east','walk-west','attack-east','attack-west'],'walkFrames':8,'attackFrames':8,'frames':metadata,'sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [walk_path,attack_path]}}
(ROOT/'assets/flat/miner-body-v1.json').write_text(json.dumps(manifest,indent=2)+'\n');print('Packed 32 directional poses; no clipping; fixed boot baseline; exact mirrored west.')
