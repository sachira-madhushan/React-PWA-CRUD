const cache = "v1";

this.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cache).then(cache => {
            return cache.addAll([
                "/",
                "/index.html",
                "/sw.js",
                '/vite.svg',
                '/assets/index-CgdpMj_y.css',
                '/assets/index-UwfN1leK.js',
                '/assets/react-CHdo91hT.svg',
            ])
        })
    )
});

this.addEventListener("fetch", (event) => {
    if (event.request.url.includes('/@vite/client') || event.request.url.includes('/src/main.jsx')) {
        return;
    }
    event.respondWith(
        caches.match(event.request).then((cacheRes) => {

            if (cacheRes) {
                return cacheRes;
            }


            return fetch(event.request).then((networkRes) => {

                if (networkRes && networkRes.status === 200) {
                    caches.open(cache).then((cache) => {
                        cache.put(event.request, networkRes.clone());
                    });
                }
                return networkRes;
            })
        })
    );

})