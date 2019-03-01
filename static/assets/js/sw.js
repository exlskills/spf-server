importScripts('/learn-en/assets/js/cache-polyfill.js');

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open('exlskills_web_base').then(function(cache) {
            return cache.addAll([
                '/learn-en/dashboard/?source=pwa_0'
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
