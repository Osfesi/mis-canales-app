const CACHE_NAME = 'canales-acestream-v3'; // Incrementa la versión para forzar la actualización del caché
const urlsToCache = [
  '/mis-canales-app/',
  '/mis-canales-app/index.html',
  '/mis-canales-app/script.js',
  '/mis-canales-app/style.css',
  '/mis-canales-app/manifest.json',
  '/mis-canales-app/icon-192.png',
  '/mis-canales-app/icon-512.png',
  // Si añades iconos SVG, asegúrate de listarlos aquí para que se cacheen:
  '/mis-canales-app/f1-icon.svg',
  '/mis-canales-app/football-icon.svg',
  '/mis-canales-app/basketball-icon.svg',
  // Añade aquí cualquier otro icono SVG que uses
];

// Instalar Service Worker y cachear archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Fallo al abrir o añadir al caché durante la instalación:', error);
      })
  );
});

// Interceptar solicitudes y servir desde caché si está disponible
self.addEventListener('fetch', event => {
  // Para la contraseña de GitHub, siempre ir a la red (no cachear)
  if (event.request.url.includes('/password.txt')) {
    event.respondWith(
      fetch(event.request).catch(error => {
        console.error('Error al obtener password.txt de la red:', error);
        // Si hay un error de red al intentar obtener la contraseña, puedes hacer algo aquí
        // Por ejemplo, devolver una respuesta de error para que el script sepa que falló
        return new Response('Network error for password.txt', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return; // Importante para no procesar el resto de la lógica de caché para password.txt
  }

  // Para el resto de los recursos, intenta desde caché, luego de la red
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Permite que el SW tome control inmediatamente
  );
});