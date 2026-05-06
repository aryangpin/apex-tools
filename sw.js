const CACHE_NAME = 'apexjaya-tools-v2';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/Frame_costing_calculator_Frame_(EG_Classic).html',
  '/Frame_costing_calculator_(Zincalumn).html',
  '/door-leaf-costing-v2.html',
  '/cnc-handle-calculator.html',
  '/material-length-calculator.html',
  '/metal-frame-opening.html',
  '/steel-sheet-calculator-v2.html',
  '/nesting-tool.html',
  '/Door-Leaf-calculator.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install - cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate - clean ALL old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// Fetch - NETWORK FIRST, fallback to cache (always get latest version)
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Got fresh response from network - update cache
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed - fallback to cache (offline mode)
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
