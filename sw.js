// Force update — clear all caches and start fresh
const CACHE = 'toccata-v3'

self.addEventListener('install', e => {
    // Skip waiting — activate immediately
    self.skipWaiting()
})

self.addEventListener('activate', e => {
    // Delete ALL old caches
    e.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    )
})

// Don't cache anything — always fetch from network
self.addEventListener('fetch', e => {
    e.respondWith(fetch(e.request))
})