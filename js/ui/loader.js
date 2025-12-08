// =======================================================
// LOADING STATE MANAGER
// =======================================================

const Loader = {
    // Show loading overlay
    show(target = 'body', text = 'Đang tải...') {
        const overlay = document.createElement('div');
        overlay.id = 'loader-overlay';
        overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
        overlay.innerHTML = `
            <div class="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-4">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p class="text-slate-700 font-medium">${text}</p>
            </div>
        `;
        
        const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
        if (targetEl) {
            targetEl.appendChild(overlay);
        } else {
            document.body.appendChild(overlay);
        }
    },

    // Hide loading overlay
    hide() {
        const overlay = document.getElementById('loader-overlay');
        if (overlay) {
            overlay.remove();
        }
    },

    // Show loading in element
    showIn(elementId, text = 'Đang tải...') {
        const el = document.getElementById(elementId);
        if (el) {
            el.innerHTML = `
                <div class="flex items-center justify-center p-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <span class="ml-3 text-slate-600">${text}</span>
                </div>
            `;
            el.classList.add('loading');
        }
    },

    // Hide loading in element
    hideIn(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.classList.remove('loading');
        }
    }
};

window.Loader = Loader;

