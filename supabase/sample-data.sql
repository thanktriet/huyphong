-- =======================================================
-- SAMPLE DATA FOR TESTING
-- Chạy sau khi đã chạy schema.sql
-- =======================================================

-- =======================================================
-- 1. USERS (PT và Students)
-- =======================================================
-- Dùng ON CONFLICT để tránh lỗi duplicate key
INSERT INTO users (id, email, password, name, role, phone, status, session_left, expiry_date) VALUES
('U_PT001', 'pt@huyphong.com', '123456', 'Huấn Luyện Viên A', 'PT', '0901234567', 'Active', 0, NULL),
('U_ADMIN', 'admin@huyphong.com', '123456', 'Quản Trị Viên', 'Admin', '0901234568', 'Active', 0, NULL),
('TEMPLATE', 'template@system.com', '123456', 'System Template', 'PT', NULL, 'Active', 0, NULL), -- User đặc biệt cho templates
('U_STU001', 'student1@test.com', '123456', 'Nguyễn Văn A', 'Student', '0901111111', 'Active', 10, NULL),
('U_STU002', 'student2@test.com', '123456', 'Trần Thị B', 'Student', '0902222222', 'Active', 5, NULL),
('U_STU003', 'student3@test.com', '123456', 'Lê Văn C', 'Student', '0903333333', 'Active', 0, (CURRENT_DATE + INTERVAL '30 days')),
('U_STU004', 'student4@test.com', '123456', 'Phạm Thị D', 'Student', '0904444444', 'Inactive', 0, NULL)
ON CONFLICT (id) DO NOTHING;

-- =======================================================
-- 2. EXERCISE_LIBRARY
-- =======================================================
INSERT INTO exercise_library (id, name, group_name, image, description) VALUES
('EX_001', 'Bench Press', 'Ngực', 'https://example.com/bench-press.jpg', 'Nằm ngửa đẩy tạ ngang ngực'),
('EX_002', 'Squat', 'Chân', 'https://example.com/squat.jpg', 'Ngồi xổm với tạ trên vai'),
('EX_003', 'Deadlift', 'Lưng', 'https://example.com/deadlift.jpg', 'Nâng tạ từ sàn lên'),
('EX_004', 'Pull Up', 'Lưng', 'https://example.com/pullup.jpg', 'Kéo xà đơn'),
('EX_005', 'Shoulder Press', 'Vai', 'https://example.com/shoulder-press.jpg', 'Đẩy tạ qua đầu'),
('EX_006', 'Bicep Curl', 'Tay', 'https://example.com/bicep-curl.jpg', 'Cuốn tạ tay'),
('EX_007', 'Tricep Extension', 'Tay', 'https://example.com/tricep.jpg', 'Duỗi tay sau'),
('EX_008', 'Plank', 'Bụng', 'https://example.com/plank.jpg', 'Giữ tư thế plank'),
('EX_009', 'Running', 'Cardio', 'https://example.com/running.jpg', 'Chạy bộ'),
('EX_010', 'Leg Press', 'Chân', 'https://example.com/leg-press.jpg', 'Đẩy chân trên máy')
ON CONFLICT (id) DO NOTHING;

-- =======================================================
-- 3. FOOD_LIBRARY
-- =======================================================
INSERT INTO food_library (id, name, calories, protein, carb, fat, unit) VALUES
('F_001', 'Cơm trắng', 130, 2.7, 28, 0.3, '100g'),
('F_002', 'Thịt heo nạc', 143, 20.3, 0, 6.2, '100g'),
('F_003', 'Thịt gà nạc', 165, 31, 0, 3.6, '100g'),
('F_004', 'Cá hồi', 208, 20, 0, 13, '100g'),
('F_005', 'Trứng gà', 155, 13, 1.1, 11, '1 quả'),
('F_006', 'Bánh mì', 265, 9, 49, 3.2, '100g'),
('F_007', 'Chuối', 89, 1.1, 23, 0.3, '100g'),
('F_008', 'Táo', 52, 0.3, 14, 0.2, '100g'),
('F_009', 'Sữa tươi', 61, 3.2, 4.8, 3.2, '100ml'),
('F_010', 'Yogurt', 59, 10, 3.6, 0.4, '100g'),
('F_011', 'Phở bò', 431, 25, 45, 12, '1 tô'),
('F_012', 'Bún bò', 398, 22, 42, 10, '1 tô'),
('F_013', 'Cơm tấm sườn', 650, 35, 75, 18, '1 phần'),
('F_014', 'Gà rán', 320, 20, 15, 18, '100g'),
('F_015', 'Rau xanh', 25, 2, 5, 0.2, '100g')
ON CONFLICT (id) DO NOTHING;

-- =======================================================
-- 4. WORKOUT_PLANS (Template và Plan cho học viên)
-- =======================================================
-- Template 1: Tăng cơ cơ bản
INSERT INTO workout_plans (id, name, user_id, day, exercise, sets, reps, note, image) VALUES
('PL_TEMPLATE_001', 'Tăng Cơ Cơ Bản', 'TEMPLATE', 'Thứ 2', 'Bench Press', 4, 8, 'Khởi động 1 set nhẹ', NULL),
('PL_TEMPLATE_001', 'Tăng Cơ Cơ Bản', 'TEMPLATE', 'Thứ 2', 'Shoulder Press', 3, 10, NULL, NULL),
('PL_TEMPLATE_001', 'Tăng Cơ Cơ Bản', 'TEMPLATE', 'Thứ 2', 'Bicep Curl', 3, 12, NULL, NULL),
('PL_TEMPLATE_001', 'Tăng Cơ Cơ Bản', 'TEMPLATE', 'Thứ 4', 'Squat', 4, 8, 'Giữ form đúng', NULL),
('PL_TEMPLATE_001', 'Tăng Cơ Cơ Bản', 'TEMPLATE', 'Thứ 4', 'Leg Press', 3, 12, NULL, NULL),
('PL_TEMPLATE_001', 'Tăng Cơ Cơ Bản', 'TEMPLATE', 'Thứ 4', 'Plank', 3, 60, 'Giữ 60 giây', NULL),
('PL_TEMPLATE_001', 'Tăng Cơ Cơ Bản', 'TEMPLATE', 'Thứ 6', 'Deadlift', 4, 6, 'Cẩn thận lưng', NULL),
('PL_TEMPLATE_001', 'Tăng Cơ Cơ Bản', 'TEMPLATE', 'Thứ 6', 'Pull Up', 3, 8, NULL, NULL),
('PL_TEMPLATE_001', 'Tăng Cơ Cơ Bản', 'TEMPLATE', 'Thứ 6', 'Tricep Extension', 3, 12, NULL, NULL)
ON CONFLICT (id, day, exercise) DO NOTHING;

-- Template 2: Giảm mỡ
INSERT INTO workout_plans (id, name, user_id, day, exercise, sets, reps, note, image) VALUES
('PL_TEMPLATE_002', 'Giảm Mỡ', 'TEMPLATE', 'Thứ 2', 'Running', 1, 30, 'Chạy 30 phút', NULL),
('PL_TEMPLATE_002', 'Giảm Mỡ', 'TEMPLATE', 'Thứ 2', 'Squat', 3, 15, NULL, NULL),
('PL_TEMPLATE_002', 'Giảm Mỡ', 'TEMPLATE', 'Thứ 2', 'Plank', 3, 45, NULL, NULL),
('PL_TEMPLATE_002', 'Giảm Mỡ', 'TEMPLATE', 'Thứ 4', 'Running', 1, 30, 'Chạy 30 phút', NULL),
('PL_TEMPLATE_002', 'Giảm Mỡ', 'TEMPLATE', 'Thứ 4', 'Bench Press', 3, 12, NULL, NULL),
('PL_TEMPLATE_002', 'Giảm Mỡ', 'TEMPLATE', 'Thứ 6', 'Running', 1, 30, 'Chạy 30 phút', NULL),
('PL_TEMPLATE_002', 'Giảm Mỡ', 'TEMPLATE', 'Thứ 6', 'Deadlift', 3, 10, NULL, NULL)
ON CONFLICT (id, day, exercise) DO NOTHING;

-- Plan cho Student 1
INSERT INTO workout_plans (id, name, user_id, day, exercise, sets, reps, note, image) VALUES
('PL_STU001_001', 'Giáo Án Tăng Cơ', 'U_STU001', 'Thứ 2', 'Bench Press', 4, 8, 'Bắt đầu với 20kg', NULL),
('PL_STU001_001', 'Giáo Án Tăng Cơ', 'U_STU001', 'Thứ 2', 'Shoulder Press', 3, 10, NULL, NULL),
('PL_STU001_001', 'Giáo Án Tăng Cơ', 'U_STU001', 'Thứ 4', 'Squat', 4, 8, 'Giữ form đúng', NULL),
('PL_STU001_001', 'Giáo Án Tăng Cơ', 'U_STU001', 'Thứ 4', 'Leg Press', 3, 12, NULL, NULL),
('PL_STU001_001', 'Giáo Án Tăng Cơ', 'U_STU001', 'Thứ 6', 'Deadlift', 4, 6, 'Cẩn thận lưng', NULL),
('PL_STU001_001', 'Giáo Án Tăng Cơ', 'U_STU001', 'Thứ 6', 'Pull Up', 3, 8, NULL, NULL)
ON CONFLICT (id, day, exercise) DO NOTHING;

-- Plan cho Student 2
INSERT INTO workout_plans (id, name, user_id, day, exercise, sets, reps, note, image) VALUES
('PL_STU002_001', 'Giáo Án Giảm Mỡ', 'U_STU002', 'Thứ 2', 'Running', 1, 30, 'Chạy 30 phút', NULL),
('PL_STU002_001', 'Giáo Án Giảm Mỡ', 'U_STU002', 'Thứ 2', 'Squat', 3, 15, NULL, NULL),
('PL_STU002_001', 'Giáo Án Giảm Mỡ', 'U_STU002', 'Thứ 4', 'Running', 1, 30, 'Chạy 30 phút', NULL),
('PL_STU002_001', 'Giáo Án Giảm Mỡ', 'U_STU002', 'Thứ 4', 'Bench Press', 3, 12, NULL, NULL),
('PL_STU002_001', 'Giáo Án Giảm Mỡ', 'U_STU002', 'Thứ 6', 'Running', 1, 30, 'Chạy 30 phút', NULL)
ON CONFLICT (id, day, exercise) DO NOTHING;

-- =======================================================
-- 5. CALENDAR (Lịch hẹn)
-- =======================================================
INSERT INTO calendar (id, created_by, user_id, date, time, note, status) VALUES
('BK_001', 'ADMIN', 'U_STU001', CURRENT_DATE + INTERVAL '1 day', '08:00:00', 'Buổi tập đầu tiên', 'Upcoming'),
('BK_002', 'ADMIN', 'U_STU001', CURRENT_DATE + INTERVAL '3 days', '08:00:00', NULL, 'Upcoming'),
('BK_003', 'ADMIN', 'U_STU002', CURRENT_DATE + INTERVAL '1 day', '09:00:00', NULL, 'Upcoming'),
('BK_004', 'ADMIN', 'U_STU003', CURRENT_DATE + INTERVAL '2 days', '10:00:00', NULL, 'Upcoming'),
('BK_005', 'ADMIN', 'U_STU001', CURRENT_DATE - INTERVAL '2 days', '08:00:00', NULL, 'Completed'),
('BK_006', 'ADMIN', 'U_STU002', CURRENT_DATE - INTERVAL '1 day', '09:00:00', NULL, 'Completed')
ON CONFLICT (id) DO NOTHING;

-- =======================================================
-- 6. WORKOUT_LOGS (Lịch sử tập)
-- =======================================================
INSERT INTO workout_logs (id, user_id, date, exercise, weight, reps, status) VALUES
('LG_001', 'U_STU001', CURRENT_DATE - INTERVAL '2 days', 'Bench Press', 20, 8, 'Done'),
('LG_002', 'U_STU001', CURRENT_DATE - INTERVAL '2 days', 'Bench Press', 20, 8, 'Done'),
('LG_003', 'U_STU001', CURRENT_DATE - INTERVAL '2 days', 'Bench Press', 22.5, 6, 'Done'),
('LG_004', 'U_STU001', CURRENT_DATE - INTERVAL '2 days', 'Shoulder Press', 15, 10, 'Done'),
('LG_005', 'U_STU001', CURRENT_DATE - INTERVAL '2 days', 'Shoulder Press', 15, 10, 'Done'),
('LG_006', 'U_STU001', CURRENT_DATE - INTERVAL '2 days', 'Shoulder Press', 15, 8, 'Done'),
('LG_007', 'U_STU002', CURRENT_DATE - INTERVAL '1 day', 'Running', NULL, 30, 'Done'),
('LG_008', 'U_STU002', CURRENT_DATE - INTERVAL '1 day', 'Squat', 30, 15, 'Done'),
('LG_009', 'U_STU002', CURRENT_DATE - INTERVAL '1 day', 'Squat', 30, 15, 'Done'),
('LG_010', 'U_STU002', CURRENT_DATE - INTERVAL '1 day', 'Squat', 30, 12, 'Done')
ON CONFLICT (id) DO NOTHING;

-- =======================================================
-- 7. MEAL_LOGS (Lịch sử ăn uống - Hôm nay)
-- =======================================================
INSERT INTO meal_logs (id, user_id, date, type, name, amount, calories, protein, carb, fat) VALUES
-- Student 1 - Hôm nay
('ML_001', 'U_STU001', CURRENT_DATE, 'Sáng', 'Phở bò', 1, 431, 25, 45, 12),
('ML_002', 'U_STU001', CURRENT_DATE, 'Trưa', 'Cơm trắng', 200, 260, 5.4, 56, 0.6),
('ML_003', 'U_STU001', CURRENT_DATE, 'Trưa', 'Thịt gà nạc', 150, 247.5, 46.5, 0, 5.4),
('ML_004', 'U_STU001', CURRENT_DATE, 'Trưa', 'Rau xanh', 100, 25, 2, 5, 0.2),
('ML_005', 'U_STU001', CURRENT_DATE, 'Tối', 'Cơm trắng', 150, 195, 4.05, 42, 0.45),
('ML_006', 'U_STU001', CURRENT_DATE, 'Tối', 'Cá hồi', 200, 416, 40, 0, 26),
('ML_007', 'U_STU001', CURRENT_DATE, 'Phụ', 'Chuối', 100, 89, 1.1, 23, 0.3),
('ML_008', 'U_STU001', CURRENT_DATE, 'Phụ', 'Yogurt', 200, 118, 20, 7.2, 0.8),

-- Student 2 - Hôm nay
('ML_009', 'U_STU002', CURRENT_DATE, 'Sáng', 'Bánh mì', 100, 265, 9, 49, 3.2),
('ML_010', 'U_STU002', CURRENT_DATE, 'Sáng', 'Trứng gà', 2, 310, 26, 2.2, 22),
('ML_011', 'U_STU002', CURRENT_DATE, 'Trưa', 'Cơm tấm sườn', 1, 650, 35, 75, 18),
('ML_012', 'U_STU002', CURRENT_DATE, 'Tối', 'Cơm trắng', 100, 130, 2.7, 28, 0.3),
('ML_013', 'U_STU002', CURRENT_DATE, 'Tối', 'Thịt heo nạc', 150, 214.5, 30.45, 0, 9.3),
('ML_014', 'U_STU002', CURRENT_DATE, 'Phụ', 'Táo', 150, 78, 0.45, 21, 0.3)
ON CONFLICT (id) DO NOTHING;

-- =======================================================
-- 8. BODY_TRACKING (Theo dõi cơ thể)
-- =======================================================
INSERT INTO body_tracking (id, user_id, date, weight, waist, photos) VALUES
('TR_001', 'U_STU001', CURRENT_DATE - INTERVAL '30 days', 70.5, 85, NULL),
('TR_002', 'U_STU001', CURRENT_DATE - INTERVAL '20 days', 70.0, 84, NULL),
('TR_003', 'U_STU001', CURRENT_DATE - INTERVAL '10 days', 69.5, 83, NULL),
('TR_004', 'U_STU001', CURRENT_DATE, 69.0, 82, NULL),
('TR_005', 'U_STU002', CURRENT_DATE - INTERVAL '30 days', 65.0, 75, NULL),
('TR_006', 'U_STU002', CURRENT_DATE - INTERVAL '20 days', 64.5, 74, NULL),
('TR_007', 'U_STU002', CURRENT_DATE - INTERVAL '10 days', 64.0, 73, NULL),
('TR_008', 'U_STU002', CURRENT_DATE, 63.5, 72, NULL)
ON CONFLICT (id) DO NOTHING;

-- =======================================================
-- NOTES:
-- 1. Passwords: Tất cả là '123456' (sẽ hash sau)
-- 2. Dates: Dùng CURRENT_DATE để tự động lấy ngày hiện tại
-- 3. Calories: Đã tính sẵn theo công thức
-- 4. User 'TEMPLATE' được tạo để workout_plans có thể reference (foreign key)
-- 5. Tất cả INSERT đã có ON CONFLICT DO NOTHING - có thể chạy lại an toàn
-- 6. Workout_plans dùng ON CONFLICT (id, day, exercise) vì composite primary key
-- =======================================================

