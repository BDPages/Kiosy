const CACHE_NAME = 'kiosy-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Kiosy-logo1.png',
  './Kiosy-logo2.png'
];

// Instalación: cachear activos estáticos iniciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: borrar cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones: Estrategia Network First para HTML y Network/Cache para lo demás
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return response;
        })
        .catch(() => caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then(cachedRes => {
        return cachedRes || fetch(req).then(response => {
          return response;
        });
      }).catch(() => {})
    );
  }
});
