importScripts('cache-polyfill.js');

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open('exlskills_web_base').then(function(cache) {
            return cache.addAll([
                // TODO implement caching
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
