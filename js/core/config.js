// =======================================================
// CORE CONFIGURATION
// =======================================================

// Define CONFIG in global scope
var CONFIG = {
    SUPABASE_URL: 'https://opjagtkygfgiokuaveje.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM',
    APP_NAME: "PT Manager",
    VERSION: "2.0.0",
    
    // Cache settings
    CACHE_ENABLED: true,
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    
    // API settings
    API_TIMEOUT: 30000, // 30 seconds
    API_RETRY_COUNT: 3,
    API_RETRY_DELAY: 1000,
    
    // Storage keys
    STORAGE_KEYS: {
        USER: 'pt_user',
        CACHE: 'pt_cache',
        SETTINGS: 'pt_settings'
    }
};

// Initialize Supabase Client function
// This will be called by API.init() after loading the Supabase library
window.initSupabaseClient = function() {
    if (window.supabase && !window.supabaseClient) {
        window.supabaseClient = window.supabase.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: false, // We handle session manually
                    autoRefreshToken: false
                }
            }
        );
    }
};

// Export to window explicitly
window.CONFIG = CONFIG;

// Debug: Log that CONFIG is loaded
if (typeof console !== 'undefined') {
    console.log('[CONFIG] Loaded successfully:', {
        hasCONFIG: typeof CONFIG !== 'undefined',
        hasWindowCONFIG: typeof window.CONFIG !== 'undefined',
        SUPABASE_URL: CONFIG.SUPABASE_URL ? 'Set' : 'Missing',
        timestamp: new Date().toISOString()
    });
}
