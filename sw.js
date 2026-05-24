const CACHE = 'toccata-v4'

// Static files that rarely change — safe to cache aggressively
const STATIC_ASSETS = [
    './index.html',
    './css/style.css',
    './js/main.js',
    './js/search.js',
    './manifest.json',
    './assets/icons/icon.svg'
]

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    )
    self.clients.claim()
})

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url)

    // Content.json — always network first, update cache on success
    if (url.pathname.includes('content.json')) {
        e.respondWith(networkFirst(e.request))
        return
    }

    // Everything else — cache first, network fallback
    e.respondWith(cacheFirst(e.request))
})

async function networkFirst(request) {
    try {
        const response = await fetch(request)
        const cache = await caches.open(CACHE)
        cache.put(request, response.clone())
        return response
    } catch (e) {
        const cached = await caches.match(request)
        if (cached) return cached
        throw e
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) return cached

    try {
        const response = await fetch(request)
        const cache = await caches.open(CACHE)
        cache.put(request, response.clone())
        return response
    } catch (e) {
        return new Response('Offline', { status: 503 })
    }
}