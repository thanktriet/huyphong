// =======================================================
// WORKOUT SERVICE
// =======================================================

const WorkoutService = {
    // Get student plan
    async getPlan(userId) {
        try {
            const result = await API.getStudentPlan(userId, true);
            return result;
        } catch (error) {
            return Utils.handleError(error, 'WorkoutService.getPlan');
        }
    },

    // Log workout
    async logWorkout(userId, logs) {
        try {
            const result = await API.call('logWorkout', { userId, logs });
            if (result.success) {
                // Clear cache
                Utils.cache.clear(`plan_${userId}`);
                Utils.cache.clear(`workout_history_${userId}`);
            }
            return result;
        } catch (error) {
            return Utils.handleError(error, 'WorkoutService.logWorkout');
        }
    },

    // Get workout history
    async getHistory(userId, useCache = true) {
        try {
            return await API.call('getWorkoutHistory', { userId }, {
                useCache,
                cacheKey: `workout_history_${userId}`
            });
        } catch (error) {
            return Utils.handleError(error, 'WorkoutService.getHistory');
        }
    },

    // Deduct session
    async deductSession(userId) {
        try {
            return await API.call('deductSession', { userId });
        } catch (error) {
            return Utils.handleError(error, 'WorkoutService.deductSession');
        }
    }
};

window.WorkoutService = WorkoutService;

