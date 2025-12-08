// =======================================================
// AUTH SERVICE
// =======================================================

const AuthService = {
    // Get current user
    getCurrentUser() {
        return Utils.storage.get(CONFIG.STORAGE_KEYS.USER);
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
                Utils.storage.set(CONFIG.STORAGE_KEYS.USER, result.user);
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
        Utils.storage.remove(CONFIG.STORAGE_KEYS.USER);
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

