// =======================================================
// PWA INSTALL PROMPT
// =======================================================

const PWAInstall = {
    deferredPrompt: null,
    isInstalled: false,

    init() {
        console.log('[PWA Install] Initializing...');
        
        // Check if already installed
        if (this.checkInstalled()) {
            console.log('[PWA Install] Already installed');
            return;
        }

        // Check if on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        console.log('[PWA Install] Device:', { isMobile, isIOS });

        // For iOS, always show install button (manual install)
        if (isIOS) {
            console.log('[PWA Install] iOS detected - showing manual install button');
            setTimeout(() => this.showInstallButton(), 1000); // Delay to ensure page is loaded
            return;
        }

        // Listen for beforeinstallprompt event (Android Chrome/Edge)
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed');
            this.isInstalled = true;
            this.hideInstallButton();
            this.deferredPrompt = null;
            
            if (typeof Toast !== 'undefined') {
                Toast.success('Ứng dụng đã được cài đặt thành công!');
            }
        });

        // For Android, also check after a delay (in case event fires late)
        if (isMobile && !isIOS) {
            setTimeout(() => {
                if (!this.deferredPrompt && !this.isInstalled) {
                    console.log('[PWA Install] No prompt after delay - showing manual install button');
                    this.showInstallButton();
                }
            }, 2000);
        }

        // Check installation status on load
        this.checkInstalled();
    },

    checkInstalled() {
        // Check if running as standalone (installed)
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://')) {
            this.isInstalled = true;
            this.hideInstallButton();
            return true;
        }
        return false;
    },

    showInstallButton() {
        // Don't show if already installed
        if (this.isInstalled) {
            console.log('[PWA Install] Already installed, not showing button');
            return;
        }

        // Create or show install button
        let installBtn = document.getElementById('pwa-install-btn');
        
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            // Mobile-friendly styling
            installBtn.className = 'fixed bottom-20 right-4 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg z-[100] flex items-center gap-2 hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-bold';
            installBtn.style.cssText = 'position: fixed; bottom: 5rem; right: 1rem; z-index: 100; min-width: 140px; min-height: 44px;';
            installBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5"></i> <span>Cài đặt App</span>';
            installBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.promptInstall();
            };
            document.body.appendChild(installBtn);
            
            // Recreate icons after adding button
            if (typeof lucide !== 'undefined') {
                setTimeout(() => lucide.createIcons(), 100);
            }
            
            console.log('[PWA Install] Button created and shown');
        }
        
        installBtn.style.display = 'flex';
        installBtn.style.visibility = 'visible';
        installBtn.style.opacity = '1';
    },

    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
            installBtn.style.visibility = 'hidden';
            console.log('[PWA Install] Button hidden');
        }
    },

    async promptInstall() {
        if (!this.deferredPrompt) {
            console.warn('[PWA] No install prompt available');
            
            // Show instructions for manual install
            this.showManualInstallInstructions();
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for user response
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('[PWA] User choice:', outcome);

        if (outcome === 'accepted') {
            if (typeof Toast !== 'undefined') {
                Toast.success('Đang cài đặt ứng dụng...');
            }
        } else {
            if (typeof Toast !== 'undefined') {
                Toast.info('Bạn có thể cài đặt sau từ menu trình duyệt');
            }
        }

        // Clear the deferred prompt
        this.deferredPrompt = null;
        this.hideInstallButton();
    },

    showManualInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        let instructions = '';

        if (isIOS) {
            instructions = `
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 class="font-bold text-blue-900 mb-2">Cài đặt trên iOS:</h3>
                    <ol class="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Nhấn nút Share <i data-lucide="share" class="w-4 h-4 inline"></i> ở dưới màn hình</li>
                        <li>Chọn "Thêm vào Màn hình chính"</li>
                        <li>Nhấn "Thêm" để hoàn tất</li>
                    </ol>
                </div>
            `;
        } else if (isAndroid) {
            instructions = `
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 class="font-bold text-blue-900 mb-2">Cài đặt trên Android:</h3>
                    <ol class="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Nhấn menu <i data-lucide="menu" class="w-4 h-4 inline"></i> ở góc trình duyệt</li>
                        <li>Chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính"</li>
                        <li>Nhấn "Cài đặt" để hoàn tất</li>
                    </ol>
                </div>
            `;
        } else {
            instructions = `
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 class="font-bold text-blue-900 mb-2">Cài đặt ứng dụng:</h3>
                    <p class="text-sm text-blue-800">Nhấn vào biểu tượng cài đặt trong thanh địa chỉ trình duyệt</p>
                </div>
            `;
        }

        if (typeof Toast !== 'undefined') {
            Toast.info(instructions, { duration: 10000 });
        } else {
            alert('Vui lòng sử dụng menu trình duyệt để cài đặt ứng dụng');
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PWAInstall.init());
} else {
    PWAInstall.init();
}

// Export for manual control
window.PWAInstall = PWAInstall;

