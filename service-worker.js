const CACHE_NAME = 'canales-acestream-v1';
const urlsToCache = [
  '/mis-canales-app/',
  '/mis-canales-app/index.html',
  '/mis-canales-app/script.js',
  '/mis-canales-app/style.css',
  '/mis-canales-app/canales.txt', // Si quieres que se cachee también
  '/mis-canales-app/icon-192.png', // Y los iconos que hayas creado
  '/mis-canales-app/icon-512.png'
];

// Instalar Service Worker y cachear archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar solicitudes y servir desde caché si está disponible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el recurso de la caché si está
        if (response) {
          return response;
        }
        // Si no está en caché, intenta obtenerlo de la red
        return fetch(event.request).catch(() => {
            // Si la red falla y es una navegación, puedes servir una página offline
            if (event.request.mode === 'navigate') {
                // Puedes tener una página offline.html si quieres
                // return caches.match('/mis-canales-app/offline.html');
            }
        });
      })
  );
});

// Activar Service Worker y limpiar cachés antiguas
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});