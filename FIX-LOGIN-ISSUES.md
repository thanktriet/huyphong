# 🔧 Fix Login Issues - Hướng Dẫn Chi Tiết

## ❌ Login không thành công

## 🔍 Các Nguyên Nhân Có Thể

### 1. ⚠️ CORS Error (Phổ biến nhất)
**Triệu chứng:** Console hiển thị `Access to fetch at '...' has been blocked by CORS policy`

**Giải pháp:**
1. Vào Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Settings** > **API**
4. Scroll xuống **"Additional Allowed Origins"**
5. Thêm các domains:
   - `http://localhost:8001` (cho local testing)
   - `https://thanktriet.github.io` (cho GitHub Pages)
6. Click **Save**

### 2. ⚠️ RLS Policies Chặn Query
**Triệu chứng:** Query trả về empty hoặc error về permissions

**Giải pháp:**
1. Vào Supabase Dashboard > **SQL Editor**
2. Chạy script này để fix RLS:

```sql
-- Fix RLS cho users table
DROP POLICY IF EXISTS "Allow all users manage" ON users;
DROP POLICY IF EXISTS "Allow all users select" ON users;

CREATE POLICY "Allow all users manage" ON users FOR ALL USING (true);
CREATE POLICY "Allow all users select" ON users FOR SELECT USING (true);
```

### 3. ⚠️ Không Có User Trong Database
**Triệu chứng:** Login trả về "Sai thông tin"

**Giải pháp:**
1. Vào Supabase Dashboard > **Table Editor** > `users`
2. Kiểm tra có user nào không
3. Nếu không có, chạy `supabase/sample-data.sql` để tạo sample data

### 4. ⚠️ Password Không Đúng
**Triệu chứng:** Login trả về "Sai thông tin"

**Giải pháp:**
- Kiểm tra password trong database
- Default password trong sample data: `123456`

## 🧪 Test Login

### Cách 1: Dùng Test Page
1. Mở: `http://localhost:8001/test-login-debug.html` (local)
   hoặc `https://thanktriet.github.io/huyphong/test-login-debug.html` (GitHub Pages)
2. Click các nút test để xem chi tiết lỗi

### Cách 2: Dùng Browser Console
Mở Console (F12) và chạy:

```javascript
// 1. Test API init
await API.init();
console.log('API initialized:', window.supabaseClient ? 'Yes' : 'No');

// 2. Test login
const result = await AuthService.login('admin@huyphong.com', '123456');
console.log('Login result:', result);

// 3. Test direct query
const { data, error } = await window.supabaseClient
    .from('users')
    .select('*')
    .eq('email', 'admin@huyphong.com')
    .single();
console.log('Direct query:', { data, error });
```

## 📋 Checklist Debug

- [ ] CORS đã được cấu hình trong Supabase Dashboard
- [ ] RLS policies đã được fix
- [ ] Có user trong database
- [ ] Password đúng
- [ ] Supabase URL và Key đúng trong `js/core/config.js`
- [ ] API.init() chạy thành công
- [ ] Không có lỗi trong Console

## 🔧 Quick Fix Commands

### Fix RLS (chạy trong Supabase SQL Editor):
```sql
-- Fix users table RLS
DROP POLICY IF EXISTS "Allow all users manage" ON users;
DROP POLICY IF EXISTS "Allow all users select" ON users;
CREATE POLICY "Allow all users manage" ON users FOR ALL USING (true);
CREATE POLICY "Allow all users select" ON users FOR SELECT USING (true);
```

### Tạo Sample User (nếu chưa có):
```sql
INSERT INTO users (id, email, password, name, role, phone, created_at, status, session_left)
VALUES ('U_ADMIN', 'admin@huyphong.com', '123456', 'Admin User', 'Admin', '0123456789', NOW(), 'Active', 0)
ON CONFLICT (id) DO NOTHING;
```

## 📝 Test Credentials

**Admin:**
- Email: `admin@huyphong.com`
- Password: `123456`

**Student:**
- Email: `student1@test.com`
- Password: `123456`

## ✅ Sau Khi Fix

1. Refresh browser (Ctrl+F5)
2. Thử login lại
3. Kiểm tra Console không còn lỗi
4. Nếu vẫn lỗi, mở `test-login-debug.html` để xem chi tiết

## 🆘 Vẫn Không Được?

Gửi cho tôi:
1. Screenshot Console errors
2. Screenshot Network tab (requests đến Supabase)
3. Kết quả từ `test-login-debug.html`

