// =======================================================
// TOAST NOTIFICATION SYSTEM
// =======================================================

const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'success', duration = 3000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} pointer-events-auto`;
        
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const colors = {
            success: 'text-green-600',
            error: 'text-red-600',
            warning: 'text-yellow-600',
            info: 'text-blue-600'
        };

        toast.innerHTML = `
            <div class="flex items-center gap-3 bg-white rounded-lg shadow-lg px-4 py-3 border-l-4 ${
                type === 'success' ? 'border-green-500' :
                type === 'error' ? 'border-red-500' :
                type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
            }">
                <i data-lucide="${icons[type] || 'info'}" class="w-5 h-5 ${colors[type] || 'text-blue-600'}"></i>
                <span class="text-sm font-medium text-slate-700">${message}</span>
            </div>
        `;

        this.container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('animate-in'), 10);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.add('animate-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        // Initialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// Global function for backward compatibility
window.showToast = (message, type = 'success') => {
    Toast.show(message, type);
};

window.Toast = Toast;

