const CACHE_NAME = 'smart-factory-v1.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add external resources that should be cached
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting(); // Force activation
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('⚡ Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim(); // Take control of all pages
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('📱 Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        console.log('🌐 Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If network fails and no cache, show offline page
            if (event.request.destination === 'document') {
              return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Smart Factory - Offline</title>
                  <style>
                    body { 
                      font-family: Arial, sans-serif; 
                      text-align: center; 
                      padding: 50px;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      margin: 0;
                      min-height: 100vh;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                    }
                    .offline-content {
                      max-width: 500px;
                      margin: 0 auto;
                    }
                    .emoji { font-size: 4rem; margin-bottom: 20px; }
                    h1 { margin-bottom: 20px; }
                    button {
                      background: #fff;
                      color: #667eea;
                      border: none;
                      padding: 15px 30px;
                      font-size: 16px;
                      border-radius: 8px;
                      cursor: pointer;
                      margin-top: 20px;
                    }
                    button:hover { opacity: 0.9; }
                  </style>
                </head>
                <body>
                  <div class="offline-content">
                    <div class="emoji">🏭📡</div>
                    <h1>Smart Factory Offline</h1>
                    <p>No hay conexión a internet, pero puedes usar las funciones básicas del dashboard.</p>
                    <button onclick="window.location.reload()">🔄 Reintentar Conexión</button>
                  </div>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva actualización del Smart Factory',
    icon: '/manifest-icon-192.png',
    badge: '/manifest-icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'smart-factory-notification',
    actions: [
      {
        action: 'view',
        title: 'Ver Dashboard',
        icon: '/manifest-icon-192.png'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🏭 Smart Factory Alert', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification clicked');
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered');
  
  if (event.tag === 'factory-data-sync') {
    event.waitUntil(
      // Sync factory data when back online
      syncFactoryData()
    );
  }
});

async function syncFactoryData() {
  try {
    console.log('📡 Service Worker: Syncing factory data...');
    // Here you would sync any offline data with the server
    // For demo purposes, we'll just log success
    console.log('✅ Service Worker: Factory data synced successfully');
  } catch (error) {
    console.error('❌ Service Worker: Sync failed:', error);
  }
}