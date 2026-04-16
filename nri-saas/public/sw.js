// Service Worker for NRI Finance Manager
// Provides offline support and caching

const CACHE_NAME = 'nri-finance-v1'
const STATIC_CACHE = 'nri-static-v1'
const DYNAMIC_CACHE = 'nri-dynamic-v1'

// Assets to cache immediately - DISABLED FOR NOW TO FIX AUTH
const STATIC_ASSETS = [
  // Temporarily empty to avoid caching issues during auth
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] Removing old cache:', key)
            return caches.delete(key)
          })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  // API requests - network only (with offline fallback)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful API responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request).then((cached) => {
            return cached || new Response(JSON.stringify({ error: 'Offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          })
        })
    )
    return
  }

  // Page requests - network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache successful responses
        const responseClone = response.clone()
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone)
        })
        return response
      })
      .catch(() => {
        // Return cached response if network fails
        return caches.match(request).then((cached) => {
          return cached || caches.match('/offline')
        })
      })
  )
})

// Background sync (for offline data submission)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'NRI Finance'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    data: data.url || '/dashboard',
    actions: [
      { action: 'open', title: 'View', icon: '/icon-open.png' },
      { action: 'close', title: 'Dismiss', icon: '/icon-close.png' }
    ]
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data || '/dashboard'
    event.waitUntil(
      clients.openWindow(url)
    )
  }
})

// Helper: Sync offline expenses
async function syncExpenses() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const requests = await cache.keys()
    const expenseRequests = requests.filter(req => 
      req.url.includes('/api/expenses') && req.method === 'POST'
    )
    
    for (const request of expenseRequests) {
      try {
        await fetch(request)
        await cache.delete(request)
        console.log('[SW] Synced expense:', request.url)
      } catch (err) {
        console.error('[SW] Failed to sync expense:', err)
      }
    }
  } catch (err) {
    console.error('[SW] Sync failed:', err)
  }
}
