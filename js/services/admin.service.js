// =======================================================
// ADMIN SERVICE
// =======================================================

const AdminService = {
    // Get dashboard stats
    async getDashboardStats(useCache = true) {
        try {
            return await API.call('adminGetDashboardStats', {}, {
                useCache,
                cacheKey: 'dashboard_stats',
                cacheTTL: 60000 // 1 minute
            });
        } catch (error) {
            return Utils.handleError(error, 'AdminService.getDashboardStats');
        }
    },

    // Get all students
    async getStudents(useCache = true) {
        try {
            return await API.call('getAllStudents', {}, {
                useCache,
                cacheKey: 'students'
            });
        } catch (error) {
            return Utils.handleError(error, 'AdminService.getStudents');
        }
    },

    // Get all exercises
    async getExercises(useCache = true) {
        try {
            return await API.getAllExercises(useCache);
        } catch (error) {
            return Utils.handleError(error, 'AdminService.getExercises');
        }
    },

    // Get all foods
    async getFoods(useCache = true) {
        try {
            return await API.getAllFoods(useCache);
        } catch (error) {
            return Utils.handleError(error, 'AdminService.getFoods');
        }
    },

    // Get all plans
    async getPlans(useCache = true) {
        try {
            return await API.call('getAllPlans', {}, {
                useCache,
                cacheKey: 'plans'
            });
        } catch (error) {
            return Utils.handleError(error, 'AdminService.getPlans');
        }
    },

    // Get templates
    async getTemplates(useCache = true) {
        try {
            return await API.call('getTemplates', {}, {
                useCache,
                cacheKey: 'templates'
            });
        } catch (error) {
            return Utils.handleError(error, 'AdminService.getTemplates');
        }
    },

    // Save workout plan
    async savePlan(data) {
        try {
            const result = await API.call('saveWorkoutPlan', data);
            if (result.success) {
                Utils.cache.clear('plans');
                Utils.cache.clear('templates');
            }
            return result;
        } catch (error) {
            return Utils.handleError(error, 'AdminService.savePlan');
        }
    },

    // Assign template
    async assignTemplate(data) {
        try {
            const result = await API.call('assignTemplate', data);
            if (result.success) {
                Utils.cache.clear('plans');
            }
            return result;
        } catch (error) {
            return Utils.handleError(error, 'AdminService.assignTemplate');
        }
    }
};

window.AdminService = AdminService;

