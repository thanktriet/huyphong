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
            const result = await API.call('logMeal', data);
            if (result.success) {
                // Clear cache
                Utils.cache.clear(`macros_${data.userId}`);
                Utils.cache.clear(`nutrition_history_${data.userId}`);
            }
            return result;
        } catch (error) {
            return Utils.handleError(error, 'NutritionService.logMeal');
        }
    },

    // Get nutrition history
    async getHistory(userId, useCache = true) {
        try {
            return await API.call('getNutritionHistory', { userId }, {
                useCache,
                cacheKey: `nutrition_history_${userId}`
            });
        } catch (error) {
            return Utils.handleError(error, 'NutritionService.getHistory');
        }
    }
};

window.NutritionService = NutritionService;

