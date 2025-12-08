// =======================================================
// UTILITY FUNCTIONS
// =======================================================

const Utils = {
    // =======================================================
    // STORAGE HELPERS
    // =======================================================
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get error:', e);
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                return false;
            }
        }
    },

    // =======================================================
    // CACHE HELPERS
    // =======================================================
    cache: {
        get(key) {
            if (!CONFIG.CACHE_ENABLED) return null;
            
            const cache = Utils.storage.get(CONFIG.STORAGE_KEYS.CACHE, {});
            const item = cache[key];
            
            if (!item) return null;
            
            // Check if expired
            if (Date.now() > item.expiry) {
                delete cache[key];
                Utils.storage.set(CONFIG.STORAGE_KEYS.CACHE, cache);
                return null;
            }
            
            return item.data;
        },
        
        set(key, data, ttl = CONFIG.CACHE_TTL) {
            if (!CONFIG.CACHE_ENABLED) return;
            
            const cache = Utils.storage.get(CONFIG.STORAGE_KEYS.CACHE, {});
            cache[key] = {
                data,
                expiry: Date.now() + ttl
            };
            Utils.storage.set(CONFIG.STORAGE_KEYS.CACHE, cache);
        },
        
        clear(key = null) {
            if (key) {
                const cache = Utils.storage.get(CONFIG.STORAGE_KEYS.CACHE, {});
                delete cache[key];
                Utils.storage.set(CONFIG.STORAGE_KEYS.CACHE, cache);
            } else {
                Utils.storage.remove(CONFIG.STORAGE_KEYS.CACHE);
            }
        }
    },

    // =======================================================
    // FORMAT HELPERS
    // =======================================================
    format: {
        date(date, format = 'vi-VN') {
            if (!date) return '---';
            try {
                return new Date(date).toLocaleDateString(format);
            } catch (e) {
                return '---';
            }
        },
        
        number(num, decimals = 0) {
            if (num === null || num === undefined) return '0';
            return parseFloat(num).toFixed(decimals);
        },
        
        currency(amount) {
            return new Intl.NumberFormat('vi-VN').format(amount);
        }
    },

    // =======================================================
    // VALIDATION
    // =======================================================
    validate: {
        email(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        phone(phone) {
            return /^[0-9]{10,11}$/.test(phone.replace(/\s/g, ''));
        },
        
        required(value) {
            return value !== null && value !== undefined && value !== '';
        }
    },

    // =======================================================
    // DEBOUNCE & THROTTLE
    // =======================================================
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // =======================================================
    // ERROR HANDLING
    // =======================================================
    handleError(error, context = '') {
        console.error(`[${context}] Error:`, error);
        
        const message = error.message || 'Đã xảy ra lỗi';
        
        // Show user-friendly message
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            alert(message);
        }
        
        return { success: false, message };
    },

    // =======================================================
    // LOADING STATE
    // =======================================================
    loading: {
        show(elementId, text = 'Đang tải...') {
            const el = document.getElementById(elementId);
            if (el) {
                el.innerHTML = `<div class="flex items-center justify-center p-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span class="ml-3">${text}</span></div>`;
                el.classList.add('loading');
            }
        },
        
        hide(elementId) {
            const el = document.getElementById(elementId);
            if (el) {
                el.classList.remove('loading');
            }
        }
    }
};

// Export
window.Utils = Utils;

