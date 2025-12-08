// =======================================================
// DATA MIGRATION SCRIPT
// Chạy trong Google Apps Script để export data sang Supabase
// =======================================================

// Hướng dẫn:
// 1. Mở Google Apps Script project
// 2. Tạo file mới tên "migrate-data.js"
// 3. Copy code này vào
// 4. Thay SUPABASE_URL và SUPABASE_ANON_KEY
// 5. Chạy từng function để migrate từng bảng

const SUPABASE_URL = 'https://opjagtkygfgiokuaveje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTE1Nzc3OCwiZXhwIjoyMDgwNzMzNzc4fQ.QTxv7SnfJaSm05UlHK-o9yQ-p9YTA7l9542Ye0lzMmM'; // Dùng service-role key cho migration
const SS_ID = "17O_fbyjwPG44ASzMXytNkwvtJQMHMiVdcdyVP14PsEE"; // Spreadsheet ID

// =======================================================
// HELPER: Gọi Supabase API
// =======================================================
function callSupabaseAPI(table, method, data) {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    const options = {
        method: method,
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    };
    
    if (method === 'POST' || method === 'PATCH') {
        options.payload = JSON.stringify(data);
    }
    
    try {
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    } catch (e) {
        Logger.log('Error: ' + e.toString());
        return null;
    }
}

// =======================================================
// 1. MIGRATE USERS
// =======================================================
function migrateUsers() {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("USERS");
    const data = sheet.getDataRange().getValues();
    
    const users = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            users.push({
                id: data[i][0],
                email: data[i][1],
                password: data[i][2],
                name: data[i][3],
                role: data[i][4],
                phone: data[i][5] || null,
                created_at: data[i][6] ? new Date(data[i][6]).toISOString() : new Date().toISOString(),
                status: data[i][7] || 'Active',
                session_left: data[i][8] || 0,
                expiry_date: data[i][9] ? Utilities.formatDate(new Date(data[i][9]), Session.getScriptTimeZone(), "yyyy-MM-dd") : null
            });
        }
    }
    
    // Insert in batches of 100
    for (let i = 0; i < users.length; i += 100) {
        const batch = users.slice(i, i + 100);
        callSupabaseAPI('users', 'POST', batch);
        Logger.log(`Migrated ${i + batch.length}/${users.length} users`);
    }
    
    Logger.log('Users migration completed!');
}

// =======================================================
// 2. MIGRATE EXERCISE_LIBRARY
// =======================================================
function migrateExercises() {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("EXERCISE_LIBRARY");
    const data = sheet.getDataRange().getValues();
    
    const exercises = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            exercises.push({
                id: data[i][0],
                name: data[i][1],
                group_name: data[i][2],
                image: data[i][3] || null,
                description: data[i][4] || null
            });
        }
    }
    
    for (let i = 0; i < exercises.length; i += 100) {
        const batch = exercises.slice(i, i + 100);
        callSupabaseAPI('exercise_library', 'POST', batch);
        Logger.log(`Migrated ${i + batch.length}/${exercises.length} exercises`);
    }
    
    Logger.log('Exercises migration completed!');
}

// =======================================================
// 3. MIGRATE FOOD_LIBRARY
// =======================================================
function migrateFoods() {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("FOOD_LIBRARY");
    const data = sheet.getDataRange().getValues();
    
    const foods = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            foods.push({
                id: data[i][0],
                name: data[i][1],
                calories: parseFloat(data[i][2]) || 0,
                protein: parseFloat(data[i][3]) || 0,
                carb: parseFloat(data[i][4]) || 0,
                fat: parseFloat(data[i][5]) || 0,
                unit: data[i][6] || '100g'
            });
        }
    }
    
    for (let i = 0; i < foods.length; i += 100) {
        const batch = foods.slice(i, i + 100);
        callSupabaseAPI('food_library', 'POST', batch);
        Logger.log(`Migrated ${i + batch.length}/${foods.length} foods`);
    }
    
    Logger.log('Foods migration completed!');
}

// =======================================================
// 4. MIGRATE WORKOUT_PLANS
// =======================================================
function migrateWorkoutPlans() {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("WORKOUT_PLANS");
    const data = sheet.getDataRange().getValues();
    
    const plans = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            plans.push({
                id: data[i][0],
                name: data[i][1],
                user_id: data[i][2],
                day: data[i][3],
                exercise: data[i][4],
                sets: parseInt(data[i][5]) || 3,
                reps: parseInt(data[i][6]) || 10,
                note: data[i][7] || null,
                image: data[i][8] || null
            });
        }
    }
    
    for (let i = 0; i < plans.length; i += 100) {
        const batch = plans.slice(i, i + 100);
        callSupabaseAPI('workout_plans', 'POST', batch);
        Logger.log(`Migrated ${i + batch.length}/${plans.length} plan rows`);
    }
    
    Logger.log('Workout plans migration completed!');
}

// =======================================================
// 5. MIGRATE CALENDAR
// =======================================================
function migrateCalendar() {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("CALENDAR");
    const data = sheet.getDataRange().getValues();
    
    const events = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            const dateStr = Utilities.formatDate(new Date(data[i][3]), Session.getScriptTimeZone(), "yyyy-MM-dd");
            events.push({
                id: data[i][0],
                created_by: data[i][1] || 'ADMIN',
                user_id: data[i][2],
                date: dateStr,
                time: data[i][4],
                note: data[i][5] || null,
                status: data[i][6] || 'Upcoming'
            });
        }
    }
    
    for (let i = 0; i < events.length; i += 100) {
        const batch = events.slice(i, i + 100);
        callSupabaseAPI('calendar', 'POST', batch);
        Logger.log(`Migrated ${i + batch.length}/${events.length} calendar events`);
    }
    
    Logger.log('Calendar migration completed!');
}

// =======================================================
// 6. MIGRATE WORKOUT_LOGS
// =======================================================
function migrateWorkoutLogs() {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("WORKOUT_LOGS");
    const data = sheet.getDataRange().getValues();
    
    const logs = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            const dateStr = Utilities.formatDate(new Date(data[i][2]), Session.getScriptTimeZone(), "yyyy-MM-dd");
            logs.push({
                id: data[i][0],
                user_id: data[i][1],
                date: dateStr,
                exercise: data[i][3],
                weight: parseFloat(data[i][4]) || null,
                reps: parseInt(data[i][5]) || null,
                status: data[i][6] || 'Done'
            });
        }
    }
    
    for (let i = 0; i < logs.length; i += 100) {
        const batch = logs.slice(i, i + 100);
        callSupabaseAPI('workout_logs', 'POST', batch);
        Logger.log(`Migrated ${i + batch.length}/${logs.length} workout logs`);
    }
    
    Logger.log('Workout logs migration completed!');
}

// =======================================================
// 7. MIGRATE MEAL_LOGS
// =======================================================
function migrateMealLogs() {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("MEAL_LOGS");
    const data = sheet.getDataRange().getValues();
    
    const logs = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            const dateStr = Utilities.formatDate(new Date(data[i][2]), Session.getScriptTimeZone(), "yyyy-MM-dd");
            logs.push({
                id: data[i][0],
                user_id: data[i][1],
                date: dateStr,
                type: data[i][3],
                name: data[i][4],
                amount: parseFloat(data[i][5]) || 1,
                calories: parseFloat(data[i][6]) || 0,
                protein: parseFloat(data[i][7]) || 0,
                carb: parseFloat(data[i][8]) || 0,
                fat: parseFloat(data[i][9]) || 0
            });
        }
    }
    
    for (let i = 0; i < logs.length; i += 100) {
        const batch = logs.slice(i, i + 100);
        callSupabaseAPI('meal_logs', 'POST', batch);
        Logger.log(`Migrated ${i + batch.length}/${logs.length} meal logs`);
    }
    
    Logger.log('Meal logs migration completed!');
}

// =======================================================
// 8. MIGRATE BODY_TRACKING
// =======================================================
function migrateBodyTracking() {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("BODY_TRACKING");
    const data = sheet.getDataRange().getValues();
    
    const tracking = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            const dateStr = Utilities.formatDate(new Date(data[i][2]), Session.getScriptTimeZone(), "yyyy-MM-dd");
            tracking.push({
                id: data[i][0],
                user_id: data[i][1],
                date: dateStr,
                weight: parseFloat(data[i][3]) || null,
                waist: parseFloat(data[i][4]) || null,
                photos: data[i][5] || null
            });
        }
    }
    
    for (let i = 0; i < tracking.length; i += 100) {
        const batch = tracking.slice(i, i + 100);
        callSupabaseAPI('body_tracking', 'POST', batch);
        Logger.log(`Migrated ${i + batch.length}/${tracking.length} body tracking records`);
    }
    
    Logger.log('Body tracking migration completed!');
}

// =======================================================
// RUN ALL MIGRATIONS
// =======================================================
function runAllMigrations() {
    Logger.log('Starting migration...');
    migrateUsers();
    migrateExercises();
    migrateFoods();
    migrateWorkoutPlans();
    migrateCalendar();
    migrateWorkoutLogs();
    migrateMealLogs();
    migrateBodyTracking();
    Logger.log('All migrations completed!');
}

