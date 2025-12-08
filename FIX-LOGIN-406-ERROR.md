# 🔧 Fix: Login 406 Error - email=[object Object]

## ❌ Lỗi

```
GET https://opjagtkygfgiokuaveje.supabase.co/rest/v1/users?select=*&email=eq.%5Bobject+Object%5D&password=eq.undefined 406 (Not Acceptable)
```

## 🔍 Nguyên Nhân

Lỗi này xảy ra vì:

1. `API.login(email, password)` gọi `this.call('login', { email, password })`
2. `this.call()` truyền object `{ email, password }` vào hàm `login()`
3. Nhưng hàm `login()` trong `supabase/api.js` nhận **2 parameters riêng**: `login(email, password)`
4. Khi gọi `login({ email, password })`, object được coi là parameter đầu tiên
5. Kết quả: `email = { email, password }` (trở thành `[object Object]`) và `password = undefined`

## ✅ Giải Pháp Đã Áp Dụng

Sửa `API.login()` trong `js/core/api.js` để gọi trực tiếp với 2 parameters:

**Trước (SAI):**
```javascript
async login(email, password) {
    return this.call('login', { email, password }); // ❌ Truyền object
}
```

**Sau (ĐÚNG):**
```javascript
async login(email, password) {
    await this.init();
    // Call login directly with 2 parameters
    if (!this.api || !this.api.login) {
        throw new Error('Supabase API not initialized.');
    }
    return await this.api.login(email, password); // ✅ Truyền 2 parameters riêng
}
```

## 🧪 Test Sau Khi Fix

1. Refresh browser (Ctrl+F5 hoặc Cmd+Shift+R)
2. Mở `login.html`
3. Thử login với:
   - Email: `admin@huyphong.com`
   - Password: `123456`
4. Kiểm tra Browser Console (F12) - không còn lỗi 406
5. Kiểm tra Network tab - URL phải đúng:
   ```
   /rest/v1/users?select=*&email=eq.admin@huyphong.com&password=eq.123456
   ```

## ✅ Kết Quả Mong Đợi

Sau khi fix:
- ✅ URL đúng: `email=eq.admin@huyphong.com` (không phải `[object Object]`)
- ✅ Password đúng: `password=eq.123456` (không phải `undefined`)
- ✅ Login thành công
- ✅ Không còn lỗi 406

## 🔍 Debug Nếu Vẫn Lỗi

### Kiểm Tra 1: API Có Được Init Không?

Mở Browser Console và chạy:

```javascript
await API.init();
console.log('API initialized:', !!window.supabaseAPI);
console.log('Login function:', typeof window.supabaseAPI?.login);
```

### Kiểm Tra 2: Parameters Có Đúng Không?

Thêm log vào `supabase/api.js`:

```javascript
async function login(email, password) {
    console.log('Login called with:', { email, password, emailType: typeof email });
    // ... rest of code
}
```

### Kiểm Tra 3: Network Tab

1. Mở Browser DevTools (F12) → Network tab
2. Thử login
3. Click vào request đến `/rest/v1/users`
4. Xem **Query String Parameters**:
   - `email` phải là string (ví dụ: `admin@huyphong.com`)
   - `password` phải là string (ví dụ: `123456`)
   - Không được là `[object Object]` hoặc `undefined`

## 📝 Lưu Ý

- `API.login()` giờ gọi trực tiếp `supabaseAPI.login(email, password)`
- Không dùng `this.call()` cho login vì login nhận 2 parameters riêng
- Các hàm khác vẫn dùng `this.call()` bình thường

---

**Cập nhật:** $(date)
**File đã sửa:** `js/core/api.js`
**Status:** ✅ Fixed

