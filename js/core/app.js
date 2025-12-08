// =======================================================
// APP INITIALIZER
// =======================================================

const App = {
    async init() {
        // Initialize core
        await this.loadCore();
        
        // Initialize services
        await this.loadServices();
        
        // Initialize UI
        this.initUI();
        
        // Check auth
        this.checkAuth();
    },

    async loadCore() {
        // Load scripts in order
        const scripts = [
            'js/core/config.js',
            'js/core/utils.js',
            'js/core/api.js'
        ];

        for (const src of scripts) {
            await this.loadScript(src);
        }
    },

    async loadServices() {
        const services = [
            'js/services/auth.service.js',
            'js/services/workout.service.js',
            'js/services/nutrition.service.js',
            'js/services/calendar.service.js',
            'js/services/admin.service.js'
        ];

        for (const src of services) {
            await this.loadScript(src);
        }
    },

    initUI() {
        // Load UI components
        this.loadScript('js/ui/toast.js');
        this.loadScript('js/ui/loader.js');
    },

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    checkAuth() {
        // Auto check auth on pages that need it
        const publicPages = ['login.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (!publicPages.includes(currentPage)) {
            if (!AuthService.isAuthenticated()) {
                window.location.href = 'login.html';
            }
        }
    }
};

// Auto init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

window.App = App;

