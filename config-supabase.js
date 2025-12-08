// =======================================================
// CONFIG - SUPABASE VERSION
// Thay thế config.js cũ
// =======================================================

const CONFIG = {
    SUPABASE_URL: 'https://opjagtkygfgiokuaveje.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM',
    APP_NAME: "PT Manager"
};

// Load Supabase client library
(function() {
    if (window.supabase) {
        // Already loaded
        window.supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        loadSupabaseAPI();
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = function() {
        // Initialize Supabase client
        window.supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        
        // Load API functions
        loadSupabaseAPI();
    };
    script.onerror = function() {
        console.error('Failed to load Supabase client library');
    };
    document.head.appendChild(script);
})();

// Load API files
function loadSupabaseAPI() {
    // Load API functions
    const apiScript = document.createElement('script');
    apiScript.src = 'supabase/api.js';
    apiScript.onerror = function() {
        console.error('Failed to load supabase/api.js');
    };
    
    // Load API wrapper after API is loaded
    apiScript.onload = function() {
        const wrapperScript = document.createElement('script');
        wrapperScript.src = 'supabase/api-wrapper.js';
        wrapperScript.onerror = function() {
            console.error('Failed to load supabase/api-wrapper.js');
        };
        document.head.appendChild(wrapperScript);
    };
    
    document.head.appendChild(apiScript);
}

// Hàm gọi API dùng chung (tương thích với code cũ)
async function callAPI(action, data = {}) {
    // Wait for API wrapper to be loaded
    if (!window.callAPI) {
        await new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (window.callAPI) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
    
    return await window.callAPI(action, data);
}

