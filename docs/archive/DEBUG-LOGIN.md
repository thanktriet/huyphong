# 🔍 Debug Login Issues

## ❌ Login không thành công

## 🔍 Checklist Debug

### 1. ✅ Kiểm tra Console Errors
Mở Browser Console (F12) và kiểm tra:
- [ ] Có lỗi CORS không?
- [ ] Có lỗi "CONFIG is not defined" không?
- [ ] Có lỗi "API.init() failed" không?
- [ ] Có lỗi "Supabase client not initialized" không?

### 2. ✅ Kiểm tra Network Tab
Mở Network tab và kiểm tra:
- [ ] `config.js` load thành công (200)?
- [ ] `api.js` load thành công (200)?
- [ ] `supabase/api.js` load thành công (200)?
- [ ] Supabase API calls có được gửi không?
- [ ] Response từ Supabase là gì?

### 3. ✅ Kiểm tra Supabase Config
- [ ] SUPABASE_URL đúng chưa?
- [ ] SUPABASE_ANON_KEY đúng chưa?
- [ ] CORS đã được cấu hình trong Supabase Dashboard chưa?

### 4. ✅ Kiểm tra CORS
Trong Supabase Dashboard:
1. Vào Settings > API
2. Thêm domain vào "Additional Allowed Origins":
   - `http://localhost:8001` (local)
   - `https://thanktriet.github.io` (GitHub Pages)

### 5. ✅ Kiểm tra Database
- [ ] Table `users` có tồn tại không?
- [ ] Có user nào trong database không?
- [ ] RLS policies đã được cấu hình đúng chưa?

## 🧪 Test Steps

### Step 1: Test Local
```bash
# Chạy local server
cd /Users/mac2019/huyphong
python3 -m http.server 8001

# Mở: http://localhost:8001/login.html
```

### Step 2: Test Credentials
Thử login với:
- Email: `admin@huyphong.com`
- Password: `123456`

### Step 3: Check Console
Mở Console và xem:
- API.init() có chạy không?
- Login request có được gửi không?
- Response là gì?

## 🔧 Common Issues

### Issue 1: CORS Error
**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Fix:**
1. Vào Supabase Dashboard
2. Settings > API
3. Thêm domain vào "Additional Allowed Origins"

### Issue 2: CONFIG is not defined
**Error:** `ReferenceError: CONFIG is not defined`

**Fix:** Đã được fix trong `auth.service.js` với fallback

### Issue 3: Supabase client not initialized
**Error:** `Supabase client not initialized`

**Fix:** Đảm bảo `API.init()` được gọi trước khi login

### Issue 4: Login failed - Wrong credentials
**Error:** `Sai thông tin` hoặc `success: false`

**Fix:** 
- Kiểm tra email/password đúng chưa
- Kiểm tra user có trong database không

## 📝 Debug Commands

```javascript
// Trong Browser Console, test:
// 1. Kiểm tra CONFIG
console.log('CONFIG:', typeof CONFIG !== 'undefined' ? CONFIG : window.CONFIG);

// 2. Kiểm tra API
console.log('API:', typeof API !== 'undefined' ? API : 'API not defined');

// 3. Kiểm tra Supabase client
console.log('Supabase client:', window.supabaseClient);

// 4. Test login trực tiếp
API.init().then(() => {
    API.login('admin@huyphong.com', '123456').then(result => {
        console.log('Login result:', result);
    });
});
```

## ✅ Next Steps

1. Mở Browser Console
2. Copy errors và gửi cho tôi
3. Hoặc chạy debug commands trên
4. Kiểm tra Network tab và xem requests

