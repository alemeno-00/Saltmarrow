const V='sm-drowned-20261026';const CORE=['./','index.html','death-effects.js','drowned-sprites.js','assets/drowned/saltleecher.png','assets/drowned/mariner.png','assets/drowned/bellbound.png','assets/drowned/brinewraith.png','assets/drowned/admiral.png','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='sm-fonts').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  if(u.hostname.endsWith('googleapis.com')||u.hostname.endsWith('gstatic.com')){e.respondWith(caches.open('sm-fonts').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}))));return}
  if(u.origin!==location.origin)return;
  const page=e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
  if(page){e.respondWith(new Promise(res=>{let done=false;const fall=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html')).then(r=>{if(!done&&r){done=true;res(r)}});const t=setTimeout(fall,3500);
    fetch(new Request(e.request.url,{cache:'no-cache'})).then(n=>{clearTimeout(t);if(n.ok){const c2=n.clone();caches.open(V).then(c=>{c.put(e.request,c2.clone());c.put('index.html',c2)})}if(!done){done=true;res(n)}}).catch(()=>{clearTimeout(t);fall()})}));return}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>{const net=fetch(e.request).then(n=>{if(n.ok)caches.open(V).then(c=>c.put(e.request,n.clone()));return n}).catch(()=>r);return r||net}))});
