// =======================================================
// API WRAPPER - Tương thích với API cũ
// Thay thế callAPI() function để dùng Supabase
// =======================================================

async function callAPI(action, data = {}) {
    try {
        const api = window.supabaseAPI;
        if (!api) {
            console.error('Supabase API not loaded');
            return { success: false, message: 'API not initialized' };
        }

        // Map old actions to new Supabase functions
        switch (action) {
            // Auth
            case 'login':
                return await api.login(data.email, data.password);
            case 'register':
                return await api.register(data);

            // Admin
            case 'admin_get_dashboard':
                return await api.adminGetDashboardStats();
            case 'get_all_students':
                return await api.getAllStudents();
            case 'admin_update_student':
                return await api.adminUpdateStudent(data);
            case 'admin_edit_student_info':
                return await api.adminEditStudentInfo(data);
            case 'admin_delete_student':
                return await api.adminDeleteStudent(data.id);

            // Exercise
            case 'get_all_exercises':
                return await api.getAllExercises();
            case 'admin_add_exercise':
                return await api.adminAddExercise(data);
            case 'admin_update_exercise':
                return await api.adminUpdateExercise(data);
            case 'admin_delete_exercise':
                return await api.adminDeleteExercise(data.id);

            // Food
            case 'get_all_foods':
                return await api.getAllFoods();
            case 'admin_add_food':
                return await api.adminAddFood(data);
            case 'admin_update_food':
                return await api.adminUpdateFood(data);
            case 'admin_delete_food':
                return await api.adminDeleteFood(data.id);

            // Plans
            case 'get_all_plans':
                return await api.getAllPlans();
            case 'get_templates':
                return await api.getTemplates();
            case 'get_plan_details':
                return await api.getPlanDetails(data.planId);
            case 'save_workout_plan':
                return await api.saveWorkoutPlan(data);
            case 'assign_template':
                return await api.assignTemplate(data);
            case 'admin_delete_plan':
                return await api.adminDeletePlan(data.id);
            case 'get_student_plan':
                return await api.getStudentPlan(data.userId);

            // Calendar
            case 'get_schedule':
                return await api.getSchedule();
            case 'book_session':
                return await api.bookSession(data);
            case 'update_schedule':
                return await api.updateSchedule(data);
            case 'cancel_session':
                return await api.cancelSession(data.bookingId);
            case 'deduct_session':
                return await api.deductSession(data.userId);

            // Workout
            case 'log_workout':
                return await api.logWorkout(data);
            case 'get_workout_history':
                return await api.getWorkoutHistory(data.userId);

            // Nutrition
            case 'log_meal':
                return await api.logMeal(data);
            case 'get_daily_macros':
                return await api.getDailyMacros(data.userId);
            case 'get_nutrition_history':
                return await api.getNutritionHistory(data.userId);

            // Body Tracking
            case 'log_body_stats':
                return await api.logBodyStats(data);
            case 'get_body_history':
                return await api.getBodyHistory(data.userId);

            default:
                return { success: false, message: 'Invalid action: ' + action };
        }
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message || 'Unknown error' };
    }
}

// Export for global use
window.callAPI = callAPI;

