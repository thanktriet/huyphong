# 🧪 Hướng Dẫn Test Supabase

## 📋 Test Page

Đã tạo test page: `test-supabase-connection.html`

**URL:**
- Local: `http://localhost:8001/test-supabase-connection.html`
- GitHub Pages: `https://thanktriet.github.io/huyphong/test-supabase-connection.html`

## 🔍 Các Test Cases

### 1. ✅ Kiểm tra CONFIG
- Kiểm tra CONFIG có được load không
- Kiểm tra SUPABASE_URL và SUPABASE_ANON_KEY
- Xem script tag có tồn tại không

### 2. ✅ Kiểm tra Supabase Library
- Kiểm tra library có được load không
- Kiểm tra có thể tạo client không

### 3. ✅ Kiểm tra API Init
- Test `API.init()` có chạy thành công không
- Kiểm tra Supabase client có được khởi tạo không
- Kiểm tra API functions có được load không

### 4. ✅ Test Direct Query
- Query trực tiếp vào `users` table
- Kiểm tra có lỗi RLS không
- Xem có data không

### 5. ✅ Test Login Function
- Test login với email/password
- Kiểm tra function hoạt động đúng không
- Xem response là gì

### 6. ✅ Test RLS Policies
- Test SELECT operation
- Test INSERT operation (có thể fail - expected)
- Kiểm tra RLS có chặn không đúng không

### 7. ✅ Kiểm tra Tables
- Kiểm tra tất cả tables có tồn tại không
- Kiểm tra có thể query được không
- Xem có data không

### 8. ✅ Test Tất Cả
- Chạy tất cả tests một lúc
- Xem tổng quan kết quả

## 🚀 Cách Sử Dụng

1. **Mở test page:**
   ```
   https://thanktriet.github.io/huyphong/test-supabase-connection.html
   ```

2. **Click từng nút test** để xem kết quả chi tiết

3. **Hoặc click "Run All Tests"** để test tất cả một lúc

## 📊 Kết Quả Mong Đợi

### ✅ Success Cases:
- CONFIG: `hasCONFIG: true`, `SUPABASE_URL: "https://..."`, `SUPABASE_ANON_KEY: "eyJ..."`
- Library: `libraryLoaded: true`
- API Init: `status: "Success"`, `supabaseClient: "Initialized"`, `supabaseAPI: "Loaded"`
- Query: `status: "Success"`, `count: > 0`, `users: [...]`
- Login: `success: true`, `user: {...}`

### ❌ Error Cases:
- **CORS Error**: Cần cấu hình CORS trong Supabase Dashboard
- **RLS Error**: Cần fix RLS policies
- **No Data**: Cần chạy `sample-data.sql`
- **CONFIG Missing**: Script loading issue

## 🔧 Fix Common Issues

### Issue 1: CORS Error
```
Access to fetch at '...' has been blocked by CORS policy
```
**Fix:** Vào Supabase Dashboard > Settings > API > Thêm domain vào "Additional Allowed Origins"

### Issue 2: RLS Error
```
new row violates row-level security policy
```
**Fix:** Chạy SQL trong Supabase SQL Editor:
```sql
DROP POLICY IF EXISTS "Allow all users manage" ON users;
CREATE POLICY "Allow all users manage" ON users FOR ALL USING (true);
```

### Issue 3: No Data
```
count: 0
```
**Fix:** Chạy `supabase/sample-data.sql` trong Supabase SQL Editor

### Issue 4: CONFIG Missing
```
hasCONFIG: false
```
**Fix:** 
- Hard refresh browser (Ctrl+F5)
- Kiểm tra Network tab xem `config.js` có load không
- Kiểm tra Console có errors không

## 📝 Test Credentials

**Admin:**
- Email: `admin@huyphong.com`
- Password: `123456`

**Student:**
- Email: `student1@test.com`
- Password: `123456`

## ✅ Next Steps

1. Mở test page
2. Chạy "Test Tất Cả"
3. Xem kết quả và fix các issues
4. Test lại cho đến khi tất cả pass

## 🆘 Vẫn Có Lỗi?

Gửi cho tôi:
1. Screenshot của test results
2. Console errors (nếu có)
3. Network tab (requests đến Supabase)

