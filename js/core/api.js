// =======================================================
// API CLIENT - Optimized với retry, cache, error handling
// =======================================================

class APIClient {
    constructor() {
        this.supabase = null;
        this.api = null;
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) return this.initPromise;
        
        this.initPromise = (async () => {
            try {
                // Load Supabase library
                if (!window.supabase) {
                    await this.loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
                    // Wait a bit for the library to be ready
                    await new Promise(r => setTimeout(r, 100));
                }
                
                if (!window.supabase) {
                    throw new Error('Failed to load Supabase library');
                }
                
                // Initialize Supabase client
                if (!window.supabaseClient) {
                    // Get CONFIG (with fallback)
                    const config = typeof CONFIG !== 'undefined' ? CONFIG : (window.CONFIG || {});
                    
                    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
                        throw new Error('CONFIG not properly initialized. SUPABASE_URL or SUPABASE_ANON_KEY is missing. Make sure js/core/config.js is loaded before js/core/api.js');
                    }
                    
                    if (window.initSupabaseClient) {
                        window.initSupabaseClient();
                    } else {
                        window.supabaseClient = window.supabase.createClient(
                            config.SUPABASE_URL,
                            config.SUPABASE_ANON_KEY,
                            {
                                auth: {
                                    persistSession: false,
                                    autoRefreshToken: false
                                }
                            }
                        );
                    }
                }
                
                this.supabase = window.supabaseClient;
                
                // Ensure supabase client is available
                if (!this.supabase) {
                    throw new Error('Failed to initialize Supabase client');
                }
                
                // Load API functions
                if (!window.supabaseAPI) {
                    await this.loadScript('supabase/api.js');
                    // Wait for API functions to be available
                    await this.waitFor(() => window.supabaseAPI, 5000);
                }
                
                if (!window.supabaseAPI) {
                    throw new Error('Failed to load Supabase API functions');
                }
                
                this.api = window.supabaseAPI;
            } catch (error) {
                console.error('API.init() error:', error);
                throw error;
            }
        })();
        
        return this.initPromise;
    }

    async loadScript(src) {
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
    }

    async waitFor(condition, timeout = 5000) {
        const start = Date.now();
        while (!condition() && Date.now() - start < timeout) {
            await new Promise(r => setTimeout(r, 100));
        }
        if (!condition()) {
            throw new Error('Timeout waiting for condition');
        }
    }

    async call(action, data = {}, options = {}) {
        await this.init();
        
        // Get CONFIG with fallback
        const config = typeof CONFIG !== 'undefined' ? CONFIG : (window.CONFIG || {});
        
        const {
            useCache = false,
            cacheKey = null,
            retry = config.API_RETRY_COUNT || 3,
            timeout = config.API_TIMEOUT || 30000
        } = options;

        // Check cache
        if (useCache && cacheKey) {
            const cached = Utils.cache.get(cacheKey);
            if (cached !== null) {
                return cached;
            }
        }

        // Retry logic
        let lastError;
        for (let i = 0; i <= retry; i++) {
            try {
                // Call the API function - handle both direct function calls and data object
                let apiFunction = this.api[action];
                if (!apiFunction) {
                    throw new Error(`API function '${action}' not found`);
                }
                
                // If function expects separate parameters, extract them from data
                let result;
                if (action === 'login' && typeof apiFunction === 'function') {
                    // Login expects (email, password) as separate params
                    const email = data.email || (typeof data === 'string' ? data : null);
                    const password = data.password || (data && typeof data === 'object' ? data.password : null);
                    if (!email || !password) {
                        throw new Error('Login requires email and password');
                    }
                    result = await Promise.race([
                        apiFunction(email, password),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Request timeout')), timeout)
                        )
                    ]);
                } else {
                    // Other functions expect data object
                    result = await Promise.race([
                        apiFunction(data),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Request timeout')), timeout)
                        )
                    ]);
                }

                // Cache result
                if (useCache && cacheKey && result.success) {
                    Utils.cache.set(cacheKey, result);
                }

                return result;
            } catch (error) {
                lastError = error;
                if (i < retry) {
                    const retryDelay = config.API_RETRY_DELAY || 1000;
                    await new Promise(r => setTimeout(r, retryDelay * (i + 1)));
                }
            }
        }

        return Utils.handleError(lastError, `API.${action}`);
    }

    // Convenience methods
    async login(email, password) {
        return this.call('login', { email, password });
    }

    async getAllExercises(useCache = true) {
        return this.call('getAllExercises', {}, {
            useCache,
            cacheKey: 'exercises'
        });
    }

    async getAllFoods(useCache = true) {
        return this.call('getAllFoods', {}, {
            useCache,
            cacheKey: 'foods'
        });
    }

    async getStudentPlan(userId, useCache = true) {
        return this.call('getStudentPlan', { userId }, {
            useCache,
            cacheKey: `plan_${userId}`
        });
    }

    async getDailyMacros(userId) {
        return this.call('getDailyMacros', { userId });
    }

    async getSchedule(useCache = true) {
        return this.call('getSchedule', {}, {
            useCache,
            cacheKey: 'schedule',
            cacheTTL: 60000 // 1 minute
        });
    }

    // Admin convenience methods
    async adminUpdateStudent(data) {
        return this.call('adminUpdateStudent', data);
    }

    async adminEditStudentInfo(data) {
        return this.call('adminEditStudentInfo', data);
    }

    async adminDeleteStudent(id) {
        return this.call('adminDeleteStudent', { id });
    }

    async adminAddExercise(data) {
        return this.call('adminAddExercise', data);
    }

    async adminUpdateExercise(data) {
        return this.call('adminUpdateExercise', data);
    }

    async adminDeleteExercise(id) {
        return this.call('adminDeleteExercise', { id });
    }

    async adminAddFood(data) {
        return this.call('adminAddFood', data);
    }

    async adminUpdateFood(data) {
        return this.call('adminUpdateFood', data);
    }

    async adminDeleteFood(id) {
        return this.call('adminDeleteFood', { id });
    }

    async getPlanDetails(planId) {
        return this.call('getPlanDetails', { planId });
    }

    async adminDeletePlan(planId) {
        return this.call('adminDeletePlan', { planId });
    }
}

// Create singleton instance
window.API = new APIClient();

// Backward compatibility
window.callAPI = async function(action, data = {}) {
    // Map old actions to new API
    const actionMap = {
        'login': 'login',
        'get_all_exercises': 'getAllExercises',
        'get_all_foods': 'getAllFoods',
        'get_student_plan': 'getStudentPlan',
        'get_daily_macros': 'getDailyMacros',
        'get_schedule': 'getSchedule',
        'log_workout': 'logWorkout',
        'log_meal': 'logMeal',
        'get_workout_history': 'getWorkoutHistory',
        'get_nutrition_history': 'getNutritionHistory',
        'get_all_students': 'getAllStudents',
        'admin_get_dashboard': 'adminGetDashboardStats'
    };

    const mappedAction = actionMap[action] || action;
    
    try {
        return await window.API.call(mappedAction, data);
    } catch (error) {
        // Fallback to old API wrapper if exists
        if (window.supabaseAPI && window.supabaseAPI[mappedAction]) {
            return await window.supabaseAPI[mappedAction](data);
        }
        return { success: false, message: error.message };
    }
};

