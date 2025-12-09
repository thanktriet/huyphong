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

