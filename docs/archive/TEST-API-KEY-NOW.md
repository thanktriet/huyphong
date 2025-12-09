# ✅ Anon Key Đã Được Cấu Hình

## ✅ Xác Nhận

Anon key của bạn đã được cấu hình đúng trong `js/core/config.js`:

```javascript
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM'
```

## 🧪 Test Ngay

### Cách 1: Dùng Test Page

1. Mở `test-cors.html` trong browser
2. Xem phần "Supabase Config" - Anon Key phải hiển thị
3. Click "Test CORS"
4. Xem kết quả

### Cách 2: Dùng Browser Console

Mở Browser Console (F12) và chạy:

```javascript
// Test với anon key
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM';

fetch('https://opjagtkygfgiokuaveje.supabase.co/rest/v1/users?select=count', {
    method: 'GET',
    headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
    }
})
.then(r => {
    console.log('Status:', r.status);
    if (r.ok) {
        return r.json();
    } else {
        return r.text().then(text => {
            console.error('Error:', text);
            throw new Error(text);
        });
    }
})
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

## 🔍 Nếu Vẫn Lỗi "No API key found"

### Kiểm Tra 1: Config Có Được Load Không?

Mở Browser Console và chạy:

```javascript
// Kiểm tra CONFIG
console.log('CONFIG:', typeof CONFIG !== 'undefined' ? CONFIG : window.CONFIG);
console.log('Anon Key:', typeof CONFIG !== 'undefined' ? CONFIG.SUPABASE_ANON_KEY : window.CONFIG?.SUPABASE_ANON_KEY);
```

### Kiểm Tra 2: Headers Có Được Gửi Không?

1. Mở Browser DevTools (F12)
2. Vào tab **Network**
3. Thực hiện một API call
4. Click vào request đến Supabase
5. Xem **Request Headers**
6. Đảm bảo có:
   - `apikey: eyJhbGci...`
   - `authorization: Bearer eyJhbGci...`

### Kiểm Tra 3: Có Phải Lỗi RLS Không?

Nếu lỗi là "row-level security" thay vì "No API key", thì vấn đề là RLS:

1. Vào Supabase Dashboard → SQL Editor
2. Chạy:

```sql
-- Tạm thời disable RLS để test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

3. Test lại

## ✅ Checklist

- [x] Anon key đã được cấu hình trong `js/core/config.js`
- [ ] Config được load đúng (kiểm tra console)
- [ ] Headers được gửi đúng (kiểm tra Network tab)
- [ ] Không phải lỗi RLS (kiểm tra error message)

## 🎯 Next Steps

1. **Test với test-cors.html** - Xem kết quả chi tiết
2. **Kiểm tra Browser Console** - Xem có lỗi gì không
3. **Kiểm tra Network Tab** - Xem headers có được gửi không
4. **Nếu vẫn lỗi** - Có thể là RLS, không phải API key

---

**Anon Key:** ✅ Đã cấu hình đúng
**Config File:** `js/core/config.js`
**Status:** Sẵn sàng test

