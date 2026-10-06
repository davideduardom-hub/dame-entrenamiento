/* Dame entrenamiento - service worker v2
   La pagina se busca primero en la red, para que cada actualizacion que subas
   llegue sola al telefono; si no hay conexion, se sirve la copia guardada. */
const CACHE='dame-entrenamiento-v2';
const ARCHIVOS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS).catch(()=>{})));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const esPagina = e.request.mode==='navigate' || e.request.destination==='document';
  if(esPagina){
    e.respondWith(
      fetch(e.request).then(resp=>{
        const copia=resp.clone();
        caches.open(CACHE).then(c=>c.put('./index.html',copia));
        return resp;
      }).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r=>{
      const red=fetch(e.request).then(resp=>{
        if(resp&&resp.status===200&&resp.type==='basic'){
          const copia=resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copia));
        }
        return resp;
      }).catch(()=>r);
      return r||red;
    })
  );
});
