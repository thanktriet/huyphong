// =======================================================
// SERVICE WORKER - PT Manager PWA
// =======================================================

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `pt-manager-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_CACHE = [
    '/huyphong/',
    '/huyphong/index.html',
    '/huyphong/login.html',
    '/huyphong/admin.html',
    '/huyphong/workout.html',
    '/huyphong/nutrition.html',
    '/huyphong/profile.html',
    '/huyphong/schedule.html',
    '/huyphong/favicon.ico',
    '/huyphong/manifest.json',
    '/huyphong/icons/icon-192x192.png',
    '/huyphong/icons/icon-512x512.png',
    '/huyphong/css/mobile.css',
    '/huyphong/js/core/config.js',
    '/huyphong/js/core/utils.js',
    '/huyphong/js/core/api.js',
    '/huyphong/js/services/auth.service.js',
    '/huyphong/js/ui/toast.js',
    '/huyphong/js/ui/loader.js',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest'
];

// API endpoints to cache (read-only, network first)
const API_CACHE_PATTERNS = [
    /\/rest\/v1\/users/,
    /\/rest\/v1\/food_library/,
    /\/rest\/v1\/exercise_library/,
    /\/rest\/v1\/workout_plans/,
    /\/rest\/v1\/meal_logs/,
    /\/rest\/v1\/body_tracking/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_CACHE.filter(url => {
                    // Only cache local files, skip external CDN
                    return url.startsWith('/huyphong/') || url.startsWith('https://cdn.tailwindcss.com') || url.startsWith('https://unpkg.com');
                }).map(url => {
                    // Convert relative URLs to absolute for GitHub Pages
                    if (url.startsWith('/huyphong/')) {
                        return url;
                    }
                    return url;
                }));
            })
            .catch((error) => {
                console.error('[SW] Error caching static assets:', error);
            })
    );
    
    // Force activation of new service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
    );
    
    // Take control of all pages immediately
    return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Strategy: Cache First for static assets, Network First for API
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(request.url)) {
        event.respondWith(networkFirstWithCache(request));
    } else {
        // Default: Network first with cache fallback
        event.respondWith(networkFirstWithCache(request));
    }
});

// Check if request is for static asset
function isStaticAsset(url) {
    return url.includes('.html') ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.ico') ||
           url.includes('manifest.json') ||
           url.includes('tailwindcss.com') ||
           url.includes('unpkg.com/lucide');
}

// Check if request is for API
function isAPIRequest(url) {
    return url.includes('supabase.co/rest/v1/') ||
           url.includes('supabase.co/auth/v1/');
}

// Cache First strategy - for static assets
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] Cache First error:', error);
        // Return offline page if available
        const offlinePage = await cache.match('/huyphong/index.html');
        if (offlinePage) {
            return offlinePage;
        }
        throw error;
    }
}

// Network First with Cache fallback - for API requests
async function networkFirstWithCache(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        const response = await fetch(request);
        
        // Cache successful GET responses
        if (response.ok && request.method === 'GET') {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        
        // Try to serve from cache
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
        
        // If it's an API request and we're offline, return a meaningful error
        if (isAPIRequest(request.url)) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    message: 'Offline - data will sync when online',
                    offline: true 
                }),
                {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        throw error;
    }
}

// Background Sync - sync queued actions when online
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-queue') {
        event.waitUntil(syncQueue());
    }
});

// Sync queued actions from IndexedDB
async function syncQueue() {
    try {
        // Get queued actions from IndexedDB
        const db = await openDB();
        const queue = await db.getAll('sync-queue');
        
        if (queue.length === 0) {
            console.log('[SW] No items in sync queue');
            return;
        }
        
        console.log(`[SW] Syncing ${queue.length} queued actions`);
        
        // Process each queued action
        for (const item of queue) {
            try {
                const response = await fetch(item.url, {
                    method: item.method,
                    headers: item.headers,
                    body: item.body
                });
                
                if (response.ok) {
                    // Remove from queue on success
                    await db.delete('sync-queue', item.id);
                    console.log('[SW] Synced:', item.url);
                }
            } catch (error) {
                console.error('[SW] Failed to sync:', item.url, error);
            }
        }
    } catch (error) {
        console.error('[SW] Error syncing queue:', error);
    }
}

// Open IndexedDB for sync queue
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pt-manager-sync', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('sync-queue')) {
                const store = db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

// Push notification handler
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'PT Manager', body: event.data.text() };
        }
    }
    
    const options = {
        title: data.title || 'PT Manager',
        body: data.body || 'Bạn có thông báo mới',
        icon: '/huyphong/icons/icon-192x192.png',
        badge: '/huyphong/icons/icon-192x192.png',
        tag: data.tag || 'default',
        data: data.data || {},
        requireInteraction: data.requireInteraction || false
    };
    
    event.waitUntil(
        self.registration.showNotification(options.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.notification.tag);
    
    event.notification.close();
    
    const urlToOpen = event.notification.data.url || '/huyphong/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'SYNC_NOW') {
        event.waitUntil(syncQueue());
    }
});

