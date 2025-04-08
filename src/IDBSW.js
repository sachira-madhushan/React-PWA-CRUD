const CACHE_NAME='idb-cache-v1';

self.addEventListener('install', (event) => {
    console.log('[Custom SW] Installed');
});

self.addEventListener('fetch', (event) => {
    console.log('[Custom SW] Fetching:', event.request.url);
});

self.addEventListener('message', async (event) => {
    if (event.data.action === 'cacheIDBData') {
      const data = event.data.data;
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
  
      const cache = await caches.open(CACHE_NAME);
      await cache.put(DB_FILE_KEY, response);
      console.log('IndexedDB data cached in Service Worker');
    }
  
    if (event.data.action === 'loadIDBDataFromCache') {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(DB_FILE_KEY);
  
      if (cachedResponse) {
        const cachedData = await cachedResponse.json();
        event.ports[0].postMessage({ action: 'restoreIDBData', data: cachedData });
      }
    }
  });