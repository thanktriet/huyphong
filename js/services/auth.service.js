// =======================================================
// AUTH SERVICE
// =======================================================

const AuthService = {
    // Get current user
    getCurrentUser() {
        // Use window.CONFIG if CONFIG is not defined
        const config = typeof CONFIG !== 'undefined' ? CONFIG : (window.CONFIG || {});
        if (!config.STORAGE_KEYS) {
            console.error('CONFIG is not properly initialized. Make sure js/core/config.js is loaded first.');
            return null;
        }
        return Utils.storage.get(config.STORAGE_KEYS.USER);
    },

    // Check if user is logged in
    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    // Check user role
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    // Check if admin or PT
    isAdmin() {
        const user = this.getCurrentUser();
        return user && (user.role === 'Admin' || user.role === 'PT');
    },

    // Login
    async login(email, password) {
        try {
            const result = await API.login(email, password);
            
            if (result.success) {
                const config = typeof CONFIG !== 'undefined' ? CONFIG : (window.CONFIG || {});
                if (config.STORAGE_KEYS) {
                    Utils.storage.set(config.STORAGE_KEYS.USER, result.user);
                }
                Utils.cache.clear(); // Clear cache on login
                return result;
            }
            
            return result;
        } catch (error) {
            return Utils.handleError(error, 'AuthService.login');
        }
    },

    // Logout
    logout() {
        const config = typeof CONFIG !== 'undefined' ? CONFIG : (window.CONFIG || {});
        if (config.STORAGE_KEYS) {
            Utils.storage.remove(config.STORAGE_KEYS.USER);
        }
        Utils.cache.clear();
        window.location.href = 'login.html';
    },

    // Require auth (redirect if not logged in)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Require role
    requireRole(role) {
        if (!this.hasRole(role)) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

window.AuthService = AuthService;

