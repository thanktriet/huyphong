// =======================================================
// PUSH NOTIFICATIONS
// =======================================================

const PWANotifications = {
    permission: null,
    registration: null,
    subscription: null,

    async init() {
        if (!('Notification' in window)) {
            console.warn('[PWA Notifications] Notifications not supported');
            return;
        }

        this.permission = Notification.permission;
        this.registration = await navigator.serviceWorker.ready;

        // Check existing subscription
        this.subscription = await this.registration.pushManager.getSubscription();
        
        if (this.subscription) {
            console.log('[PWA Notifications] Already subscribed');
        }

        // Listen for notification clicks
        this.setupClickHandler();
    },

    async requestPermission() {
        if (this.permission === 'granted') {
            return true;
        }

        if (this.permission === 'denied') {
            console.warn('[PWA Notifications] Permission denied');
            if (typeof Toast !== 'undefined') {
                Toast.error('Thông báo đã bị từ chối. Vui lòng bật trong cài đặt trình duyệt.');
            }
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            if (permission === 'granted') {
                console.log('[PWA Notifications] Permission granted');
                return true;
            } else {
                console.log('[PWA Notifications] Permission denied');
                return false;
            }
        } catch (error) {
            console.error('[PWA Notifications] Request permission error:', error);
            return false;
        }
    },

    async subscribe() {
        if (!('PushManager' in window)) {
            console.warn('[PWA Notifications] Push Manager not supported');
            return null;
        }

        // Request permission first
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            return null;
        }

        try {
            // Get VAPID public key (should be stored in config)
            // For now, we'll use a placeholder - this needs to be set up with a push service
            const vapidPublicKey = CONFIG?.VAPID_PUBLIC_KEY || '';

            if (!vapidPublicKey) {
                console.warn('[PWA Notifications] VAPID key not configured');
                console.info('[PWA Notifications] To enable push notifications, set up VAPID keys with a push service (e.g., Firebase Cloud Messaging)');
                return null;
            }

            this.subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
            });

            console.log('[PWA Notifications] Subscribed:', this.subscription.endpoint);

            // Send subscription to server
            await this.sendSubscriptionToServer(this.subscription);

            if (typeof Toast !== 'undefined') {
                Toast.success('Đã bật thông báo đẩy');
            }

            return this.subscription;
        } catch (error) {
            console.error('[PWA Notifications] Subscribe error:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Lỗi đăng ký thông báo: ' + error.message);
            }
            return null;
        }
    },

    async unsubscribe() {
        if (!this.subscription) {
            return;
        }

        try {
            const success = await this.subscription.unsubscribe();
            if (success) {
                console.log('[PWA Notifications] Unsubscribed');
                this.subscription = null;
                
                // Notify server
                await this.removeSubscriptionFromServer();

                if (typeof Toast !== 'undefined') {
                    Toast.success('Đã tắt thông báo đẩy');
                }
            }
        } catch (error) {
            console.error('[PWA Notifications] Unsubscribe error:', error);
        }
    },

    async sendSubscriptionToServer(subscription) {
        // Send subscription to your backend server
        // This should store the subscription for sending push notifications later
        try {
            const response = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/push_subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': CONFIG.SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    user_id: AuthService.getCurrentUser()?.id,
                    subscription: JSON.stringify(subscription),
                    endpoint: subscription.endpoint
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }

            console.log('[PWA Notifications] Subscription saved to server');
        } catch (error) {
            console.error('[PWA Notifications] Save subscription error:', error);
            // Don't throw - subscription is still valid locally
        }
    },

    async removeSubscriptionFromServer() {
        // Remove subscription from server
        try {
            const user = AuthService.getCurrentUser();
            if (!user) return;

            await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${user.id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': CONFIG.SUPABASE_ANON_KEY
                }
            });

            console.log('[PWA Notifications] Subscription removed from server');
        } catch (error) {
            console.error('[PWA Notifications] Remove subscription error:', error);
        }
    },

    showLocalNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            console.warn('[PWA Notifications] Permission not granted');
            return;
        }

        const notificationOptions = {
            body: options.body || '',
            icon: options.icon || '/huyphong/icons/icon-192x192.png',
            badge: options.badge || '/huyphong/icons/icon-192x192.png',
            tag: options.tag || 'default',
            data: options.data || {},
            requireInteraction: options.requireInteraction || false,
            ...options
        };

        if (this.registration) {
            this.registration.showNotification(title, notificationOptions);
        } else {
            new Notification(title, notificationOptions);
        }
    },

    setupClickHandler() {
        // Service worker handles notification clicks
        // This is just for local notifications
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
                    const data = event.data.data;
                    if (data.url) {
                        window.location.href = data.url;
                    }
                }
            });
        }
    },

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    },

    isSubscribed() {
        return this.subscription !== null;
    },

    getPermission() {
        return this.permission;
    }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PWANotifications.init());
} else {
    PWANotifications.init();
}

// Export for manual control
window.PWANotifications = PWANotifications;

