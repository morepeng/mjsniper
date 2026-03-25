
// sw.js - 讓 PWA 離線緩存運作
self.addEventListener('fetch', function(event) {
    event.respondWith(fetch(event.request));
});

