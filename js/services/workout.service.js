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
            // Check if offline - queue for sync
            if (!navigator.onLine && typeof PWASync !== 'undefined') {
                console.log('[WorkoutService] Offline - queueing workout log');
                
                await PWASync.queueAction({
                    type: 'log_workout',
                    url: `${CONFIG.SUPABASE_URL}/rest/v1/workout_logs`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': CONFIG.SUPABASE_ANON_KEY,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        date: new Date().toISOString().split('T')[0],
                        logs: JSON.stringify(logs)
                    })
                });
                
                if (typeof Toast !== 'undefined') {
                    Toast.info('Đã lưu vào hàng đợi. Sẽ đồng bộ khi online.');
                }
                
                return { success: true, queued: true, message: 'Queued for sync' };
            }
            
            const result = await API.call('logWorkout', { userId, logs });
            if (result.success) {
                // Clear cache
                Utils.cache.clear(`plan_${userId}`);
                Utils.cache.clear(`workout_history_${userId}`);
            }
            return result;
        } catch (error) {
            // If error and offline, try to queue
            if (!navigator.onLine && typeof PWASync !== 'undefined') {
                console.log('[WorkoutService] Error while offline - queueing workout log');
                await PWASync.queueAction({
                    type: 'log_workout',
                    url: `${CONFIG.SUPABASE_URL}/rest/v1/workout_logs`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': CONFIG.SUPABASE_ANON_KEY
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        date: new Date().toISOString().split('T')[0],
                        logs: JSON.stringify(logs)
                    })
                });
                return { success: true, queued: true, message: 'Queued for sync' };
            }
            return Utils.handleError(error, 'WorkoutService.logWorkout');
        }
    },

    // Get workout history
    async getHistory(userId, useCache = true) {
        try {
            // Check cache first
            if (useCache) {
                const cacheKey = `workout_history_${userId}`;
                const cached = Utils.cache.get(cacheKey);
                if (cached) return cached;
            }

            // Call API directly
            await API.init();
            if (!API.api || !API.api.getWorkoutHistory) {
                throw new Error('Supabase API not initialized or getWorkoutHistory function not found.');
            }
            
            const result = await API.api.getWorkoutHistory(userId);
            
            // Cache result
            if (useCache && result.success) {
                const cacheKey = `workout_history_${userId}`;
                Utils.cache.set(cacheKey, result);
            }
            
            return result;
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

