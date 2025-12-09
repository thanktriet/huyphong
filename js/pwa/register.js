// =======================================================
// SERVICE WORKER REGISTRATION
// =======================================================

const PWARegister = {
    registration: null,
    updateAvailable: false,

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                await this.register();
                this.setupUpdateListener();
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        } else {
            console.warn('[PWA] Service Workers are not supported');
        }
    },

    async register() {
        try {
            const registration = await navigator.serviceWorker.register('/huyphong/sw.js', {
                scope: '/huyphong/'
            });

            this.registration = registration;
            console.log('[PWA] Service Worker registered:', registration.scope);

            // Check for updates immediately
            await registration.update();

            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[PWA] New service worker found');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker is ready, show update notification
                        this.updateAvailable = true;
                        this.showUpdateNotification();
                    }
                });
            });

            // Listen for controller change (new SW activated)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[PWA] New service worker activated');
                window.location.reload();
            });

        } catch (error) {
            console.error('[PWA] Registration error:', error);
            throw error;
        }
    },

    setupUpdateListener() {
        // Check for updates periodically (every 1 hour)
        setInterval(() => {
            if (this.registration) {
                this.registration.update();
            }
        }, 60 * 60 * 1000);

        // Check for updates when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.registration) {
                this.registration.update();
            }
        });
    },

    showUpdateNotification() {
        // Show toast notification if Toast is available
        if (typeof Toast !== 'undefined') {
            Toast.info('Có phiên bản mới! Nhấn để cập nhật.', {
                duration: 0,
                onClick: () => this.applyUpdate()
            });
        } else {
            // Fallback: show browser alert
            if (confirm('Có phiên bản mới của ứng dụng. Bạn có muốn cập nhật không?')) {
                this.applyUpdate();
            }
        }
    },

    async applyUpdate() {
        if (!this.registration || !this.registration.waiting) {
            console.warn('[PWA] No waiting service worker');
            return;
        }

        // Send skip waiting message to service worker
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Reload page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    },

    async unregister() {
        if (this.registration) {
            const success = await this.registration.unregister();
            if (success) {
                console.log('[PWA] Service Worker unregistered');
            }
        }
    }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PWARegister.init());
} else {
    PWARegister.init();
}

// Export for manual control
window.PWARegister = PWARegister;

