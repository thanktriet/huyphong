# 🔧 Fix Login Parameters Error

## ❌ Lỗi

```
GET https://opjagtkygfgiokuaveje.supabase.co/rest/v1/users?select=*&email=eq.%5Bobject+Object%5D&password=eq.undefined 406 (Not Acceptable)
```

**Vấn đề:**
- `email=eq.%5Bobject+Object%5D` - Email đang là object `[object Object]`
- `password=eq.undefined` - Password là undefined

## 🔍 Nguyên Nhân

1. **API.login()** gọi `this.call('login', { email, password })`
2. **this.call()** gọi `this.api['login'](data)` với `data = { email, password }`
3. **supabase/api.js** có `login(email, password)` - nhận 2 parameters riêng
4. Khi gọi `login({ email, password })`, object được coi là parameter đầu tiên

## ✅ Giải Pháp Đã Áp Dụng

### Sửa `API.login()` method:
```javascript
// Trước:
async login(email, password) {
    return this.call('login', { email, password });
}

// Sau:
async login(email, password) {
    await this.init();
    if (!this.api || !this.api.login) {
        throw new Error('Login function not available');
    }
    // Gọi trực tiếp với 2 parameters riêng
    return await this.api.login(email, password);
}
```

### Kết quả:
- `API.login('admin@huyphong.com', '123456')` 
- → Gọi trực tiếp `supabaseAPI.login('admin@huyphong.com', '123456')`
- → Không qua `call()` method

## 🧪 Test

1. **Hard refresh browser**: `Ctrl+F5`
2. **Test login** với:
   - Email: `admin@huyphong.com`
   - Password: `123456`

## ✅ Expected Result

Login sẽ thành công:
```json
{
  "success": true,
  "user": {
    "id": "U_ADMIN",
    "name": "Quản Trị Viên",
    "role": "Admin",
    ...
  }
}
```

## 📝 Note

- `API.login()` giờ gọi trực tiếp `supabaseAPI.login()` với 2 parameters
- Các functions khác vẫn dùng `call()` method với data object
- Đảm bảo `supabase/api.js` đã load trước khi gọi

## 🚀 Đã Push

Code đã được commit và push. GitHub Pages sẽ deploy lại sau 1-2 phút.

