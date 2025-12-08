-- =======================================================
-- FIX: Infinite Recursion in RLS Policy (SIMPLE VERSION)
-- Copy và chạy trong Supabase SQL Editor
-- =======================================================

-- Bước 1: Drop old policies
DROP POLICY IF EXISTS "PT can manage users" ON users;
DROP POLICY IF EXISTS "Allow all users read" ON users;
DROP POLICY IF EXISTS "Allow all users manage" ON users;

-- Bước 2: Tạo policies mới (không có recursion)
CREATE POLICY "Allow all users read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow all users manage" ON users FOR ALL USING (true);

-- Bước 3: Kiểm tra
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

