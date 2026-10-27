from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import re,mimetypes,subprocess,argparse
ROOT=Path(__file__).resolve().parents[1]
BASELINE='9bf5a8a'
parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=18831);args=parser.parse_args()
def original(name):return subprocess.check_output(['git','show',BASELINE+':'+name],cwd=ROOT)
PAGE=ROOT/'tools/feel-review.html'
test=(ROOT/'tests/feel-browser.cjs').read_text()
hook=re.search(r'const hook=`(.*?)`;',test,re.S).group(1)
extra=r'''
const reviewClean=()=>{document.getElementById('boot')?.remove();document.getElementById('toastHost').innerHTML='';document.getElementById('tipCard').hidden=true;closeInspect();};
window.__review={
 async reset(){window.__feel.prepare();reviewClean();UI.render();cv.focus()},
 async walk(){await this.reset();startWalk(23,15)},
 async attack(){await this.reset();await window.__feel.fight();reviewClean();return window.__feel.attack()},
 async battle(){await this.reset();S.P.max=S.P.stam=cls().stam;S.P.baseMax=cls().stam;S.L.mons=[];const m=spawnMon('husk',16,15);spawnMon('sailor',17,16);spawnMon('rat',18,14);computeLight();computeFov();await startCombat('ambush',m);reviewClean();UI.render();cv.focus()}
};
window.addEventListener('message',async e=>{if(e.origin!==location.origin||!['walk','attack','battle','reset'].includes(e.data?.action))return;try{await window.__review[e.data.action]();parent.postMessage({type:'done',action:e.data.action},location.origin)}catch(err){parent.postMessage({type:'error',message:err.message},location.origin)}});
ART.ready.then(async()=>{await window.__review.reset();parent.postMessage({type:'ready'},location.origin)});
'''
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  route=self.path.split('?')[0]
  if route=='/':data=PAGE.read_bytes();mime='text/html'
  elif route=='/poses.html':data=(PAGE.parent/'miner-pose-review.html').read_bytes();mime='text/html'
  else:
   parts=route.strip('/').split('/',1)
   if len(parts)!=2 or parts[0] not in ['original','revised']:self.send_error(404);return
   version,name=parts
   if name in ['', 'index.html']:
    source=original('index.html').decode() if version=='original' else (ROOT/'index.html').read_text()
    source=source.replace('window.claude?.hot?.snapshot?.',hook+'\n'+extra+'\nwindow.claude?.hot?.snapshot?.')
    source=re.sub(r"<script>if\('serviceWorker'[\s\S]*?</script>",'',source)
    data=source.encode();mime='text/html'
   else:
    file=ROOT/name
    if not file.resolve().is_relative_to(ROOT.resolve()) or not file.is_file():self.send_error(404);return
    data=original(name) if version=='original' and name in ['flat-art.js','animation-art.js'] else file.read_bytes();mime=mimetypes.guess_type(file.name)[0] or 'application/octet-stream'
  self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
 def log_message(self,*args):pass
print('Saltmarrow original/revised review: http://127.0.0.1:'+str(args.port)+'/',flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
