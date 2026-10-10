const CACHE_NAME = 'zixcord-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './fv.png',
  './surgena.ttf'
];

// 1. Install and Cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('Some files failed to cache, check if they exist:', err);
        });
      })
  );
});

// 2. Fetch files (Network First for HTML/JS, Cache for images)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If it's an image/font/manifest, return from cache immediately
        if (event.request.url.match(/\.(png|ttf|json)$/)) {
          return response || fetch(event.request);
        }
        
        // For HTML and JS, always try to get the newest version from the network
        return fetch(event.request).catch(() => {
          // If offline, fallback to cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return response;
        });
      })
  );
});

// 3. Clean up old caches when you update the app
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