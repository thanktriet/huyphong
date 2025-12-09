// =======================================================
// BACKGROUND SYNC - Queue offline actions
// =======================================================

const PWASync = {
    db: null,
    dbName: 'pt-manager-sync',
    storeName: 'sync-queue',
    version: 1,

    async init() {
        if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
            console.warn('[PWA Sync] Background Sync not supported');
            return;
        }

        await this.openDB();
        this.setupSyncListener();
        
        // Sync on online
        window.addEventListener('online', () => {
            console.log('[PWA Sync] Online - syncing queue');
            this.syncQueue();
        });

        // Check for pending items on load
        this.syncQueue();
    },

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('[PWA Sync] DB open error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[PWA Sync] DB opened');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('type', 'type', { unique: false });
                    console.log('[PWA Sync] Object store created');
                }
            };
        });
    },

    setupSyncListener() {
        // Register sync event listener in service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SETUP_SYNC'
            });
        }
    },

    async queueAction(action) {
        if (!this.db) {
            await this.openDB();
        }

        const item = {
            ...action,
            timestamp: Date.now(),
            retries: 0,
            maxRetries: 3
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(item);

            request.onsuccess = () => {
                console.log('[PWA Sync] Action queued:', item.type, item.id);
                
                // Register background sync
                this.registerSync();
                
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('[PWA Sync] Queue error:', request.error);
                reject(request.error);
            };
        });
    },

    async registerSync() {
        if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-queue');
            console.log('[PWA Sync] Background sync registered');
        } catch (error) {
            console.error('[PWA Sync] Register sync error:', error);
        }
    },

    async syncQueue() {
        if (!this.db) {
            await this.openDB();
        }

        if (!navigator.onLine) {
            console.log('[PWA Sync] Offline - cannot sync');
            return;
        }

        try {
            const items = await this.getQueuedItems();
            
            if (items.length === 0) {
                console.log('[PWA Sync] No items to sync');
                return;
            }

            console.log(`[PWA Sync] Syncing ${items.length} items`);

            for (const item of items) {
                try {
                    await this.syncItem(item);
                    await this.removeItem(item.id);
                    console.log('[PWA Sync] Synced:', item.type, item.id);
                } catch (error) {
                    console.error('[PWA Sync] Sync error:', error);
                    
                    // Increment retry count
                    item.retries = (item.retries || 0) + 1;
                    
                    if (item.retries >= item.maxRetries) {
                        console.error('[PWA Sync] Max retries reached, removing:', item.id);
                        await this.removeItem(item.id);
                    } else {
                        await this.updateItem(item);
                    }
                }
            }

            // Show success message
            if (items.length > 0 && typeof Toast !== 'undefined') {
                Toast.success(`Đã đồng bộ ${items.length} hành động`);
            }

        } catch (error) {
            console.error('[PWA Sync] Sync queue error:', error);
        }
    },

    async getQueuedItems() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    async syncItem(item) {
        // Reconstruct fetch request from queued item
        const response = await fetch(item.url, {
            method: item.method,
            headers: item.headers || {},
            body: item.body ? JSON.parse(item.body) : undefined
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    },

    async removeItem(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async updateItem(item) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(item);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getQueueSize() {
        const items = await this.getQueuedItems();
        return items.length;
    },

    async clearQueue() {
        if (!this.db) {
            await this.openDB();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('[PWA Sync] Queue cleared');
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PWASync.init());
} else {
    PWASync.init();
}

// Export for manual control
window.PWASync = PWASync;

