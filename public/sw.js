const CACHE_NAME = "cj-brewkin-v1"
const STATIC_ASSETS = [
  "/",
  "/menu",
  "/cart",
  "/orders",
  "/account",
  "/auth/login",
  "/auth/sign-up",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, then cache
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip Supabase API calls - let them go through normally
  if (url.hostname.includes("supabase")) return

  // Skip extension requests
  if (url.protocol === "chrome-extension:") return

  // For navigation requests, use network-first strategy
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the response
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request).then((cached) => {
            return cached || caches.match("/")
          })
        })
    )
    return
  }

  // For static assets, use cache-first strategy
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/images") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached

        return fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
      })
    )
    return
  }

  // For other requests, use network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return response
      })
      .catch(() => caches.match(request))
  )
})

// Background sync for queued operations
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    event.waitUntil(
      // Notify clients to process sync queue
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SYNC_REQUESTED" })
        })
      })
    )
  }
})

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Handle push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const options = {
      body: data.body || "Your order has been updated",
      icon: "/images/brewkin-logo.png",
      badge: "/images/brewkin-logo.png",
      tag: data.orderId || "order-notification",
      requireInteraction: false,
      actions: [
        {
          action: "open",
          title: "View Order",
        },
      ],
      data: {
        orderId: data.orderId,
        url: data.url || "/orders",
      },
    }

    event.waitUntil(
      self.registration.showNotification(data.title || "CJ BrewKin Coffee", options)
    )
  } catch (error) {
    console.error("Error handling push notification:", error)
  }
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const url = event.notification.data.url || "/orders"
  const orderId = event.notification.data.orderId

  // If order ID exists, navigate to that specific order
  const targetUrl = orderId ? `/orders/${orderId}` : url

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if window/tab with target URL is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === targetUrl && "focus" in client) {
          return client.focus()
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
