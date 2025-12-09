// =======================================================
// NUTRITION SERVICE
// =======================================================

const NutritionService = {
    // Get all foods
    async getFoods(useCache = true) {
        try {
            return await API.getAllFoods(useCache);
        } catch (error) {
            return Utils.handleError(error, 'NutritionService.getFoods');
        }
    },

    // Get daily macros
    async getDailyMacros(userId) {
        try {
            return await API.getDailyMacros(userId);
        } catch (error) {
            return Utils.handleError(error, 'NutritionService.getDailyMacros');
        }
    },

    // Log meal
    async logMeal(data) {
        try {
            // Check if offline - queue for sync
            if (!navigator.onLine && typeof PWASync !== 'undefined') {
                console.log('[NutritionService] Offline - queueing meal log');
                
                await PWASync.queueAction({
                    type: 'log_meal',
                    url: `${CONFIG.SUPABASE_URL}/rest/v1/meal_logs`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': CONFIG.SUPABASE_ANON_KEY,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        user_id: data.userId,
                        date: data.date || new Date().toISOString().split('T')[0],
                        food_name: data.foodName,
                        calories: data.calories,
                        protein: data.protein,
                        carb: data.carb,
                        fat: data.fat,
                        quantity: data.quantity || 1
                    })
                });
                
                if (typeof Toast !== 'undefined') {
                    Toast.info('Đã lưu vào hàng đợi. Sẽ đồng bộ khi online.');
                }
                
                return { success: true, queued: true, message: 'Queued for sync' };
            }
            
            const result = await API.call('logMeal', data);
            if (result.success) {
                // Clear cache
                Utils.cache.clear(`macros_${data.userId}`);
                Utils.cache.clear(`nutrition_history_${data.userId}`);
            }
            return result;
        } catch (error) {
            // If error and offline, try to queue
            if (!navigator.onLine && typeof PWASync !== 'undefined') {
                console.log('[NutritionService] Error while offline - queueing meal log');
                await PWASync.queueAction({
                    type: 'log_meal',
                    url: `${CONFIG.SUPABASE_URL}/rest/v1/meal_logs`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': CONFIG.SUPABASE_ANON_KEY
                    },
                    body: JSON.stringify({
                        user_id: data.userId,
                        date: data.date || new Date().toISOString().split('T')[0],
                        food_name: data.foodName,
                        calories: data.calories,
                        protein: data.protein,
                        carb: data.carb,
                        fat: data.fat,
                        quantity: data.quantity || 1
                    })
                });
                return { success: true, queued: true, message: 'Queued for sync' };
            }
            return Utils.handleError(error, 'NutritionService.logMeal');
        }
    },

    // Get nutrition history
    async getHistory(userId, useCache = true) {
        try {
            return await API.getNutritionHistory(userId, useCache);
        } catch (error) {
            return Utils.handleError(error, 'NutritionService.getHistory');
        }
    },

    // Meal Planning
    async getMealPlan(userId, weekStartDate) {
        try {
            return await API.getMealPlan(userId, weekStartDate);
        } catch (error) {
            return Utils.handleError(error, 'NutritionService.getMealPlan');
        }
    },

    async createMealPlan(userId, weekStartDate, meals, createdBy = null) {
        try {
            return await API.createMealPlan(userId, weekStartDate, meals, createdBy);
        } catch (error) {
            return Utils.handleError(error, 'NutritionService.createMealPlan');
        }
    },

    async copyMealPlanDay(userId, fromDate, toDate) {
        try {
            return await API.copyMealPlanDay(userId, fromDate, toDate);
        } catch (error) {
            return Utils.handleError(error, 'NutritionService.copyMealPlanDay');
        }
    },

    // Target Calories
    async getTargets(userId) {
        try {
            return await API.getUserTargets(userId);
        } catch (error) {
            return Utils.handleError(error, 'NutritionService.getTargets');
        }
    }
};

window.NutritionService = NutritionService;

