-- =======================================================
-- FIX: Infinite Recursion in RLS Policy
-- Chạy script này trong Supabase SQL Editor để sửa lỗi
-- =======================================================

-- Drop old policy có vấn đề
DROP POLICY IF EXISTS "PT can manage users" ON users;

-- Drop policy mới nếu đã tồn tại (tránh lỗi duplicate)
DROP POLICY IF EXISTS "Allow all users manage" ON users;

-- Tạo policy mới không có recursion
CREATE POLICY "Allow all users manage" ON users FOR ALL USING (true);

-- Kiểm tra policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

