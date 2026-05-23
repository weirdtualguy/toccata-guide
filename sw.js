const CACHE = 'toccata-v2'

// Files that rarely change — safe to cache aggressively
const STATIC_ASSETS = [
    './index.html',
    './css/style.css',
    './js/main.js',
    './js/search.js',
    './manifest.json',
    './assets/icons/icon.svg'
]

// Install — cache static assets
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    )
})

// Activate — clean old caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    )
    self.clients.claim()
})

// Fetch — network first for data, cache first for static
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url)
    
    // For content.json — always try network first
    if (url.pathname.includes('content.json')) {
        e.respondWith(networkFirst(e.request))
        return
    }
    
    // For everything else — cache first, network fallback
    e.respondWith(cacheFirst(e.request))
})

// Network first strategy — for frequently updated files
async function networkFirst(request) {
    try {
        const response = await fetch(request)
        // Update cache with fresh version
        const cache = await caches.open(CACHE)
        cache.put(request, response.clone())
        return response
    } catch (e) {
        // Offline — serve cached version
        const cached = await caches.match(request)
        if (cached) return cached
        throw e
    }
}

// Cache first strategy — for static files
async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) return cached
    
    try {
        const response = await fetch(request)
        const cache = await caches.open(CACHE)
        cache.put(request, response.clone())
        return response
    } catch (e) {
        // Offline and not cached — fail gracefully
        return new Response('Offline — content not cached', { status: 503 })
    }
}