-- =======================================================
-- PT MANAGER - SUPABASE SCHEMA
-- Migration từ Google Sheets sang PostgreSQL
-- =======================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================================
-- 1. USERS TABLE
-- =======================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT 'U_' || extract(epoch from now())::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Sẽ hash bằng Supabase Auth sau
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'PT', 'Admin')),
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    session_left INTEGER DEFAULT 0,
    expiry_date DATE,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- =======================================================
-- 2. EXERCISE_LIBRARY TABLE
-- =======================================================
CREATE TABLE IF NOT EXISTS exercise_library (
    id TEXT PRIMARY KEY DEFAULT 'EX_' || extract(epoch from now())::text,
    name TEXT NOT NULL,
    group_name TEXT NOT NULL CHECK (group_name IN ('Ngực', 'Lưng', 'Chân', 'Vai', 'Tay', 'Bụng', 'Cardio')),
    image TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exercise_group ON exercise_library(group_name);
CREATE INDEX idx_exercise_name ON exercise_library(name);

-- =======================================================
-- 3. FOOD_LIBRARY TABLE
-- =======================================================
CREATE TABLE IF NOT EXISTS food_library (
    id TEXT PRIMARY KEY DEFAULT 'F_' || extract(epoch from now())::text,
    name TEXT NOT NULL,
    calories NUMERIC(10,2) NOT NULL DEFAULT 0,
    protein NUMERIC(10,2) DEFAULT 0,
    carb NUMERIC(10,2) DEFAULT 0,
    fat NUMERIC(10,2) DEFAULT 0,
    unit TEXT DEFAULT '100g',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_food_name ON food_library(name);

-- =======================================================
-- 4. WORKOUT_PLANS TABLE
-- =======================================================
CREATE TABLE IF NOT EXISTS workout_plans (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    day TEXT NOT NULL,
    exercise TEXT NOT NULL,
    sets INTEGER DEFAULT 3,
    reps INTEGER DEFAULT 10,
    note TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, day, exercise),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_workout_plans_user ON workout_plans(user_id);
CREATE INDEX idx_workout_plans_id ON workout_plans(id);
CREATE INDEX idx_workout_plans_day ON workout_plans(day);

-- =======================================================
-- 5. CALENDAR TABLE
-- =======================================================
CREATE TABLE IF NOT EXISTS calendar (
    id TEXT PRIMARY KEY DEFAULT 'BK_' || extract(epoch from now())::text,
    created_by TEXT NOT NULL,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    note TEXT,
    status TEXT DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_calendar_user ON calendar(user_id);
CREATE INDEX idx_calendar_date ON calendar(date);
CREATE INDEX idx_calendar_status ON calendar(status);
CREATE UNIQUE INDEX idx_calendar_unique ON calendar(date, time) WHERE status != 'Cancelled';

-- =======================================================
-- 6. WORKOUT_LOGS TABLE
-- =======================================================
CREATE TABLE IF NOT EXISTS workout_logs (
    id TEXT PRIMARY KEY DEFAULT 'LG_' || extract(epoch from now())::text,
    user_id TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercise TEXT NOT NULL,
    weight NUMERIC(10,2),
    reps INTEGER,
    status TEXT DEFAULT 'Done',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_workout_logs_user ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_date ON workout_logs(date);
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, date DESC);

-- =======================================================
-- 7. MEAL_LOGS TABLE
-- =======================================================
CREATE TABLE IF NOT EXISTS meal_logs (
    id TEXT PRIMARY KEY DEFAULT 'ML_' || extract(epoch from now())::text,
    user_id TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('Sáng', 'Trưa', 'Tối', 'Phụ', 'Tiệc')),
    name TEXT NOT NULL,
    amount NUMERIC(10,2) DEFAULT 1,
    calories NUMERIC(10,2) DEFAULT 0,
    protein NUMERIC(10,2) DEFAULT 0,
    carb NUMERIC(10,2) DEFAULT 0,
    fat NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_meal_logs_user ON meal_logs(user_id);
CREATE INDEX idx_meal_logs_date ON meal_logs(date);
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, date DESC);

-- =======================================================
-- 8. BODY_TRACKING TABLE
-- =======================================================
CREATE TABLE IF NOT EXISTS body_tracking (
    id TEXT PRIMARY KEY DEFAULT 'TR_' || extract(epoch from now())::text,
    user_id TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight NUMERIC(10,2),
    waist NUMERIC(10,2),
    photos TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_body_tracking_user ON body_tracking(user_id);
CREATE INDEX idx_body_tracking_date ON body_tracking(user_id, date DESC);

-- =======================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_tracking ENABLE ROW LEVEL SECURITY;

-- Users: Tạm thời cho phép tất cả (sẽ update sau khi có Supabase Auth)
-- TODO: Update policies sau khi migrate sang Supabase Auth
-- FIX: Không query lại users table trong policy để tránh infinite recursion
DROP POLICY IF EXISTS "Allow all users read" ON users;
DROP POLICY IF EXISTS "PT can manage users" ON users;
DROP POLICY IF EXISTS "Allow all users manage" ON users;

CREATE POLICY "Allow all users read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow all users manage" ON users FOR ALL USING (true); -- Tạm thời cho phép tất cả

-- Exercise Library: Public read, PT can manage
CREATE POLICY "Anyone can view exercises" ON exercise_library FOR SELECT USING (true);
CREATE POLICY "PT can manage exercises" ON exercise_library FOR ALL USING (true); -- Tạm thời, sẽ sửa sau

-- Food Library: Public read, PT can manage
CREATE POLICY "Anyone can view foods" ON food_library FOR SELECT USING (true);
CREATE POLICY "PT can manage foods" ON food_library FOR ALL USING (true); -- Tạm thời, sẽ sửa sau

-- Workout Plans: Users can view their own plans
CREATE POLICY "Users can view own plans" ON workout_plans FOR SELECT USING (true); -- Tạm thời
CREATE POLICY "PT can manage plans" ON workout_plans FOR ALL USING (true); -- Tạm thời

-- Calendar: Users can view their own bookings
CREATE POLICY "Users can view own calendar" ON calendar FOR SELECT USING (true); -- Tạm thời
CREATE POLICY "PT can manage calendar" ON calendar FOR ALL USING (true); -- Tạm thời

-- Workout Logs: Users can view/manage their own logs
CREATE POLICY "Users can manage own workout logs" ON workout_logs FOR ALL USING (true); -- Tạm thời

-- Meal Logs: Users can view/manage their own logs
CREATE POLICY "Users can manage own meal logs" ON meal_logs FOR ALL USING (true); -- Tạm thời

-- Body Tracking: Users can view/manage their own data
CREATE POLICY "Users can manage own body tracking" ON body_tracking FOR ALL USING (true); -- Tạm thời

-- =======================================================
-- 10. FUNCTIONS & TRIGGERS
-- =======================================================

-- Function to auto-update updated_at timestamp (nếu cần)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =======================================================
-- NOTES:
-- 1. Supabase Auth sẽ quản lý authentication riêng
-- 2. Cần migrate dữ liệu từ Google Sheets sang các bảng này
-- 3. Có thể thêm updated_at columns nếu cần tracking changes
-- =======================================================

