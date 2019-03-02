'use strict';

const cacheName = 'exlskills.com-exlskils-1.0.0';
const startPage = 'https://exlskills.com/learn-en/pwa-boot/?source=pwa_0';
const offlinePage = 'https://exlskills.com/learn-en/pwa-offline/';
const filesToCache = [startPage, offlinePage];
// const neverCacheUrls = [/\/settings/, /\/courses/, /spf=navigate/];

// Install
self.addEventListener('install', function (e) {
    console.log('EXLskills service worker installation');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('EXLskills service worker caching dependencies');
            filesToCache.map(function (url) {
                return cache.add(url).catch(function (reason) {
                    return console.log('EXLskills: ' + String(reason) + ' ' + url);
                });
            });
        })
    );
});

// Activate
self.addEventListener('activate', function (e) {
    console.log('EXLskills service worker activation');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('EXLskills old cache removed', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Fetch
self.addEventListener('fetch', function (e) {

    // Return if the current request url is in the never cache list
    // if (!neverCacheUrls.every(checkNeverCacheList, e.request.url)) {
    if (e.request.url.indexOf('/learn-en/pwa-') < 0) {
        console.log('EXLskills: Current request is excluded from cache.');
        return;
    }

    // Return if request url protocal isn't http or https
    if (!e.request.url.match(/^(http|https):\/\//i))
        return;

    // Return if request url is from an external domain.
    if (new URL(e.request.url).origin !== location.origin)
        return;

    // For POST requests, do not use the cache. Serve offline page if offline.
    if (e.request.method !== 'GET') {
        e.respondWith(
            fetch(e.request).catch(function () {
                return caches.match(offlinePage);
            })
        );
        return;
    }

    // Revving strategy
    if (e.request.mode === 'navigate' && navigator.onLine) {
        e.respondWith(
            fetch(e.request).then(function (response) {
                return caches.open(cacheName).then(function (cache) {
                    cache.put(e.request, response.clone());
                    return response;
                });
            })
        );
        return;
    }

    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request).then(function (response) {
                return caches.open(cacheName).then(function (cache) {
                    cache.put(e.request, response.clone());
                    return response;
                });
            });
        }).catch(function () {
            return caches.match(offlinePage);
        })
    );
});

// Check if current url is in the neverCacheUrls list
// function checkNeverCacheList(url) {
//     return !this.match(url);
// }
