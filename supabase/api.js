// =======================================================
// SUPABASE API WRAPPER
// Thay thế Google Apps Script API calls
// =======================================================

// Helper function to get supabase client
function getSupabase() {
    if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized. Please call API.init() first.');
    }
    return window.supabaseClient;
}

// =======================================================
// AUTHENTICATION
// =======================================================

async function login(email, password) {
    try {
        // Check password trực tiếp trong users table (tương thích với code gốc)
        // TODO: Sau khi migrate sang Supabase Auth, sẽ dùng auth.signInWithPassword()
        const { data: userData, error: userError } = await getSupabase()
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password)  // Check password trực tiếp
            .single();

        if (userError || !userData) {
            return { success: false, message: 'Sai thông tin' };
        }

        // Check status
        if (userData.status !== 'Active') {
            return { success: false, message: 'Khóa' };
        }

        // Format expiry date
        const expiryDate = userData.expiry_date 
            ? new Date(userData.expiry_date).toLocaleDateString('vi-VN')
            : '---';

        return {
            success: true,
            user: {
                id: userData.id,
                name: userData.name,
                role: userData.role,
                sessionLeft: userData.session_left || 0,
                expiryDate: expiryDate
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Lỗi đăng nhập: ' + error.message };
    }
}

async function register(userData) {
    try {
        // Check if email already exists
        const { data: existingUser, error: checkError } = await getSupabase()
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .single();

        if (existingUser) {
            return { success: false, message: 'Trùng Email' };
        }

        // Create user profile (tương thích với code gốc)
        // TODO: Sau khi migrate sang Supabase Auth, sẽ tạo auth user trước
        const userId = 'U_' + Date.now();
        const { error: insertError } = await getSupabase()
            .from('users')
            .insert({
                id: userId,
                email: userData.email,
                password: userData.password || '123456',
                name: userData.name,
                role: 'Student',
                phone: userData.phone,
                status: 'Active',
                session_left: 0
            });

        if (insertError) {
            return { success: false, message: insertError.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: 'Lỗi đăng ký: ' + error.message };
    }
}

// =======================================================
// ADMIN FUNCTIONS
// =======================================================

async function adminGetDashboardStats() {
    try {
        const { data: students, error: studentsError } = await getSupabase()
            .from('users')
            .select('id, status')
            .eq('role', 'Student');

        if (studentsError) throw studentsError;

        const totalStudent = students.length;
        const activeStudent = students.filter(s => s.status === 'Active').length;

        const today = new Date().toISOString().split('T')[0];
        const { data: todaySessions, error: sessionsError } = await getSupabase()
            .from('calendar')
            .select('id')
            .eq('date', today)
            .eq('status', 'Upcoming');

        if (sessionsError) throw sessionsError;

        return {
            success: true,
            data: {
                totalStudent,
                activeStudent,
                todaySessions: todaySessions.length
            }
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function getAllStudents() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await getSupabase()
            .from('users')
            .select('*')
            .eq('role', 'Student')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const students = data.map(s => {
            let expiryDate = '---';
            let isExpired = true;
            
            if (s.expiry_date) {
                expiryDate = new Date(s.expiry_date).toLocaleDateString('vi-VN');
                const expiry = new Date(s.expiry_date);
                expiry.setHours(0, 0, 0, 0);
                isExpired = expiry < today;
            }

            return {
                id: s.id,
                name: s.name,
                email: s.email,
                phone: s.phone,
                status: s.status,
                sessionLeft: s.session_left || 0,
                expiryDate: expiryDate,
                isExpired: isExpired
            };
        });

        return { success: true, data: students };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminUpdateStudent(data) {
    try {
        const updates = {};
        if (data.status) updates.status = data.status;
        if (data.addSession !== undefined) {
            const { data: current, error: fetchError } = await getSupabase()
                .from('users')
                .select('session_left')
                .eq('id', data.studentId)
                .single();
            
            if (fetchError) throw fetchError;
            updates.session_left = (current.session_left || 0) + data.addSession;
        }
        if (data.setExpiryDate) {
            updates.expiry_date = data.setExpiryDate;
        }

        const { error } = await getSupabase()
            .from('users')
            .update(updates)
            .eq('id', data.studentId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminEditStudentInfo(data) {
    try {
        const { error } = await getSupabase()
            .from('users')
            .update({
                name: data.name,
                email: data.email,
                phone: data.phone
            })
            .eq('id', data.id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminDeleteStudent(id) {
    try {
        const { error } = await getSupabase()
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// =======================================================
// EXERCISE LIBRARY
// =======================================================

async function getAllExercises() {
    try {
        const { data, error } = await getSupabase()
            .from('exercise_library')
            .select('*')
            .order('name');

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminAddExercise(data) {
    try {
        const { error } = await getSupabase()
            .from('exercise_library')
            .insert({
                name: data.name,
                group_name: data.group,
                image: data.image,
                description: data.desc
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminUpdateExercise(data) {
    try {
        const { error } = await getSupabase()
            .from('exercise_library')
            .update({
                name: data.name,
                group_name: data.group,
                image: data.image,
                description: data.desc
            })
            .eq('id', data.id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminDeleteExercise(id) {
    try {
        const { error } = await getSupabase()
            .from('exercise_library')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// =======================================================
// FOOD LIBRARY
// =======================================================

async function getAllFoods() {
    try {
        const { data, error } = await getSupabase()
            .from('food_library')
            .select('*')
            .order('name');

        if (error) throw error;

        // Format data to match old API response
        const foods = data.map(f => ({
            id: f.id,
            name: f.name,
            cal: parseFloat(f.calories) || 0,
            pro: parseFloat(f.protein) || 0,
            carb: parseFloat(f.carb) || 0,
            fat: parseFloat(f.fat) || 0,
            unit: f.unit || '100g'
        }));

        return { success: true, data: foods };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminAddFood(data) {
    try {
        const { error } = await getSupabase()
            .from('food_library')
            .insert({
                name: data.name,
                calories: data.cal,
                protein: data.pro,
                carb: data.carb,
                fat: data.fat,
                unit: data.unit
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminUpdateFood(data) {
    try {
        const { error } = await getSupabase()
            .from('food_library')
            .update({
                name: data.name,
                calories: data.cal,
                protein: data.pro,
                carb: data.carb,
                fat: data.fat,
                unit: data.unit
            })
            .eq('id', data.id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminDeleteFood(id) {
    try {
        const { error } = await getSupabase()
            .from('food_library')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// =======================================================
// WORKOUT PLANS
// =======================================================

async function getAllPlans() {
    try {
        const { data, error } = await getSupabase()
            .from('workout_plans')
            .select('id, name, user_id')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by plan id
        const plansMap = {};
        data.forEach(p => {
            if (!plansMap[p.id]) {
                plansMap[p.id] = {
                    id: p.id,
                    name: p.name,
                    userId: p.user_id
                };
            }
        });

        return { success: true, data: Object.values(plansMap) };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function getTemplates() {
    try {
        const { data, error } = await getSupabase()
            .from('workout_plans')
            .select('id, name')
            .eq('user_id', 'TEMPLATE');

        if (error) throw error;

        // Count exercises per template
        const templatesMap = {};
        data.forEach(t => {
            if (!templatesMap[t.id]) {
                templatesMap[t.id] = {
                    id: t.id,
                    name: t.name,
                    count: 0
                };
            }
            templatesMap[t.id].count++;
        });

        return { success: true, data: Object.values(templatesMap) };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function getPlanDetails(planId) {
    try {
        const { data, error } = await getSupabase()
            .from('workout_plans')
            .select('*')
            .eq('id', planId)
            .order('day');

        if (error) throw error;

        if (data.length === 0) {
            return { success: false, message: 'Plan not found' };
        }

        const plan = {
            name: data[0].name,
            userId: data[0].user_id,
            details: data.map(p => ({
                day: p.day,
                exercise: p.exercise,
                sets: p.sets,
                reps: p.reps,
                note: p.note,
                image: p.image
            }))
        };

        return { success: true, data: plan };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function saveWorkoutPlan(data) {
    try {
        const planId = data.planId || 'PL_' + Date.now();

        // Delete existing plan if updating
        if (data.planId) {
            await getSupabase()
                .from('workout_plans')
                .delete()
                .eq('id', planId);
        }

        // Insert new plan details
        const planRows = data.details.map(d => ({
            id: planId,
            name: data.planName,
            user_id: data.targetUser,
            day: d.day,
            exercise: d.exercise,
            sets: d.sets,
            reps: d.reps,
            note: d.note,
            image: d.video || d.image
        }));

        if (planRows.length > 0) {
            const { error } = await getSupabase()
                .from('workout_plans')
                .insert(planRows);

            if (error) throw error;
        }

        return { success: true, message: 'OK' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function assignTemplate(data) {
    try {
        // Get template details
        const { data: template, error: templateError } = await getSupabase()
            .from('workout_plans')
            .select('*')
            .eq('id', data.templateId);

        if (templateError || !template || template.length === 0) {
            return { success: false, message: 'Template not found' };
        }

        // Create plans for each student
        const planRows = [];
        data.studentIds.forEach(userId => {
            const newPlanId = 'PL_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            const planName = data.newName || template[0].name;

            template.forEach(t => {
                planRows.push({
                    id: newPlanId,
                    name: planName,
                    user_id: userId,
                    day: t.day,
                    exercise: t.exercise,
                    sets: t.sets,
                    reps: t.reps,
                    note: t.note,
                    image: t.image
                });
            });
        });

        if (planRows.length > 0) {
            const { error } = await getSupabase()
                .from('workout_plans')
                .insert(planRows);

            if (error) throw error;
        }

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function getStudentPlan(userId) {
    try {
        // Get plan
        const { data: planData, error: planError } = await getSupabase()
            .from('workout_plans')
            .select('*')
            .eq('user_id', userId)
            .order('day');

        if (planError) throw planError;

        // Get exercise images
        const { data: exercises, error: exError } = await getSupabase()
            .from('exercise_library')
            .select('name, image');

        if (exError) throw exError;

        const exImages = {};
        exercises.forEach(e => {
            exImages[e.name] = e.image;
        });

        // Group by day
        const plans = {};
        planData.forEach(p => {
            if (!plans[p.day]) plans[p.day] = [];
            plans[p.day].push({
                exercise: p.exercise,
                sets: p.sets,
                reps: p.reps,
                note: p.note,
                image: p.image || exImages[p.exercise] || ''
            });
        });

        return { success: true, data: plans };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function adminDeletePlan(planId) {
    try {
        const { error } = await getSupabase()
            .from('workout_plans')
            .delete()
            .eq('id', planId);

        if (error) throw error;
        return { success: true, message: 'Đã xóa toàn bộ giáo án!' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// =======================================================
// CALENDAR
// =======================================================

async function getSchedule() {
    try {
        const { data, error } = await getSupabase()
            .from('calendar')
            .select('*')
            .neq('status', 'Cancelled')
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (error) throw error;

        const events = data.map(e => ({
            id: e.id,
            userId: e.user_id,
            date: e.date,
            time: e.time,
            status: e.status
        }));

        return { success: true, data: events };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function bookSession(data) {
    try {
        // Check for conflicts
        const { data: conflicts, error: conflictError } = await getSupabase()
            .from('calendar')
            .select('id')
            .eq('date', data.date)
            .eq('time', data.time)
            .neq('status', 'Cancelled');

        if (conflictError) throw conflictError;
        if (conflicts && conflicts.length > 0) {
            return { success: false, message: 'Trùng lịch' };
        }

        const { error } = await getSupabase()
            .from('calendar')
            .insert({
                created_by: 'ADMIN',
                user_id: data.userId,
                date: data.date,
                time: data.time,
                status: 'Upcoming'
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function updateSchedule(data) {
    try {
        const updates = {};
        if (data.status) updates.status = data.status;
        if (data.date) updates.date = data.date;
        if (data.time) updates.time = data.time;

        const { error } = await getSupabase()
            .from('calendar')
            .update(updates)
            .eq('id', data.bookingId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function cancelSession(bookingId) {
    try {
        const { error } = await getSupabase()
            .from('calendar')
            .update({ status: 'Cancelled' })
            .eq('id', bookingId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function deductSession(userId) {
    try {
        const { data: user, error: userError } = await getSupabase()
            .from('users')
            .select('expiry_date, session_left')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        // Check if monthly package
        if (user.expiry_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expiry = new Date(user.expiry_date);
            expiry.setHours(0, 0, 0, 0);

            if (expiry >= today) {
                return { success: true, message: 'Gói tháng' };
            }
        }

        // Deduct session
        const currentSessions = user.session_left || 0;
        if (currentSessions <= 0) {
            return { success: false, message: 'Hết hạn' };
        }

        const { error } = await getSupabase()
            .from('users')
            .update({ session_left: currentSessions - 1 })
            .eq('id', userId);

        if (error) throw error;
        return { success: true, message: 'Trừ 1 buổi' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// =======================================================
// WORKOUT LOGS
// =======================================================

async function logWorkout(data) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const logRows = data.logs.map(log => ({
            user_id: data.userId,
            date: today,
            exercise: log.exercise,
            weight: log.weight,
            reps: log.reps,
            status: 'Done'
        }));

        const { error } = await getSupabase()
            .from('workout_logs')
            .insert(logRows);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function getWorkoutHistory(userId) {
    try {
        const { data, error } = await getSupabase()
            .from('workout_logs')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by date
        const history = {};
        data.forEach(log => {
            const dateStr = log.date;
            if (!history[dateStr]) history[dateStr] = [];
            history[dateStr].push({
                exercise: log.exercise,
                weight: log.weight,
                reps: log.reps
            });
        });

        return { success: true, data: history };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// =======================================================
// MEAL LOGS
// =======================================================

async function logMeal(data) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        let calories = parseFloat(data.cal || data.baseCal) || 0;
        let protein = 0;
        let carb = 0;
        let fat = 0;

        if (!data.isManual) {
            // Calculate from base values and amount
            const ratio = parseFloat(data.amount) / 100;
            calories = (parseFloat(data.baseCal) || 0) * ratio;
            protein = (parseFloat(data.basePro) || 0) * ratio;
            carb = (parseFloat(data.baseCarb) || 0) * ratio;
            fat = (parseFloat(data.baseFat) || 0) * ratio;
        }

        // Round to 1 decimal
        calories = Math.round(calories * 10) / 10;
        protein = Math.round(protein * 10) / 10;
        carb = Math.round(carb * 10) / 10;
        fat = Math.round(fat * 10) / 10;

        const { error } = await getSupabase()
            .from('meal_logs')
            .insert({
                user_id: data.userId,
                date: today,
                type: data.type,
                name: data.name,
                amount: data.amount || 1,
                calories: calories,
                protein: protein,
                carb: carb,
                fat: fat
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function getDailyMacros(userId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await getSupabase()
            .from('meal_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today);

        if (error) throw error;

        let totals = { cal: 0, pro: 0, carb: 0, fat: 0, list: [] };

        data.forEach(meal => {
            totals.cal += parseFloat(meal.calories) || 0;
            totals.pro += parseFloat(meal.protein) || 0;
            totals.carb += parseFloat(meal.carb) || 0;
            totals.fat += parseFloat(meal.fat) || 0;
            totals.list.push({
                type: meal.type,
                name: meal.name,
                cal: parseFloat(meal.calories) || 0
            });
        });

        return { success: true, data: totals };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function getNutritionHistory(userId) {
    try {
        const { data, error } = await getSupabase()
            .from('meal_logs')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;

        // Group by date
        const history = {};
        data.forEach(meal => {
            const dateStr = meal.date;
            if (!history[dateStr]) {
                history[dateStr] = { cal: 0, pro: 0, carb: 0, fat: 0, count: 0 };
            }
            history[dateStr].cal += parseFloat(meal.calories) || 0;
            history[dateStr].pro += parseFloat(meal.protein) || 0;
            history[dateStr].carb += parseFloat(meal.carb) || 0;
            history[dateStr].fat += parseFloat(meal.fat) || 0;
            history[dateStr].count++;
        });

        return { success: true, data: history };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// =======================================================
// BODY TRACKING
// =======================================================

async function logBodyStats(data) {
    try {
        const { error } = await getSupabase()
            .from('body_tracking')
            .insert({
                user_id: data.userId,
                date: new Date().toISOString().split('T')[0],
                weight: data.weight,
                waist: data.waist,
                photos: data.photos || ''
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function getBodyHistory(userId) {
    try {
        const { data, error } = await getSupabase()
            .from('body_tracking')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true });

        if (error) throw error;

        const history = data.map(t => ({
            date: t.date,
            weight: t.weight,
            waist: t.waist
        }));

        return { success: true, data: history };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// =======================================================
// EXPORT API FUNCTIONS
// =======================================================

window.supabaseAPI = {
    // Auth
    login,
    register,
    
    // Admin
    adminGetDashboardStats,
    getAllStudents,
    adminUpdateStudent,
    adminEditStudentInfo,
    adminDeleteStudent,
    
    // Exercise
    getAllExercises,
    adminAddExercise,
    adminUpdateExercise,
    adminDeleteExercise,
    
    // Food
    getAllFoods,
    adminAddFood,
    adminUpdateFood,
    adminDeleteFood,
    
    // Plans
    getAllPlans,
    getTemplates,
    getPlanDetails,
    saveWorkoutPlan,
    assignTemplate,
    getStudentPlan,
    adminDeletePlan,
    
    // Calendar
    getSchedule,
    bookSession,
    updateSchedule,
    cancelSession,
    deductSession,
    
    // Workout
    logWorkout,
    getWorkoutHistory,
    
    // Nutrition
    logMeal,
    getDailyMacros,
    getNutritionHistory,
    
    // Body Tracking
    logBodyStats,
    getBodyHistory
};

