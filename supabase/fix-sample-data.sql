-- =======================================================
-- FIX: Thêm user TEMPLATE để workout_plans có thể reference
-- Chạy script này nếu gặp lỗi foreign key constraint
-- =======================================================

-- Thêm user TEMPLATE nếu chưa có
INSERT INTO users (id, email, password, name, role, phone, status, session_left, expiry_date) 
VALUES ('TEMPLATE', 'template@system.com', '123456', 'System Template', 'PT', NULL, 'Active', 0, NULL)
ON CONFLICT (id) DO NOTHING;

-- Kiểm tra xem đã có chưa
SELECT id, name, role FROM users WHERE id = 'TEMPLATE';

