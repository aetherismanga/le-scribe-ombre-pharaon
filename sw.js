const CACHE_NAME = 'le-scribe-v4-fix-mobile';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png',
  './images/Le Scribe et l’Ombre du Pharaon.png',
  './images/Prologue  Le Signe dans la Cire.png',
  './images/Chapitre I  Celui qui comptait les grains.png',
  './images/Chapitre II  La Chambre retournée.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  const isNavigation = req.mode === 'navigate' || new URL(req.url).pathname.endsWith('/index.html') || new URL(req.url).pathname.endsWith('/');
  if (isNavigation) {
    event.respondWith(
      fetch(req, {cache:'no-store'}).then(response => {
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
        return response;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(response => {
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
      return response;
    }))
  );
});