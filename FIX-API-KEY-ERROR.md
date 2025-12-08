# 🔑 Fix: "No API key found in request"

## ❌ Lỗi

```
{"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}
```

## 🔍 Nguyên Nhân

Khi gọi Supabase API trực tiếp qua `fetch()`, bạn **BẮT BUỘC** phải thêm header `apikey` với giá trị là **anon key** của Supabase.

## ✅ Giải Pháp

### Cách 1: Sử Dụng Supabase Client (Khuyến Nghị)

Thay vì gọi API trực tiếp, sử dụng Supabase client - nó tự động thêm headers:

```javascript
// ✅ ĐÚNG - Dùng Supabase client
const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const { data, error } = await supabase
    .from('users')
    .select('*');
```

### Cách 2: Thêm Header `apikey` Khi Dùng Fetch

Nếu phải dùng `fetch()` trực tiếp, thêm header `apikey`:

```javascript
// ✅ ĐÚNG - Có header apikey
const response = await fetch('https://opjagtkygfgiokuaveje.supabase.co/rest/v1/users', {
    method: 'GET',
    headers: {
        'apikey': 'YOUR_ANON_KEY_HERE',  // ⚠️ BẮT BUỘC
        'Authorization': 'Bearer YOUR_ANON_KEY_HERE',  // ⚠️ BẮT BUỘC
        'Content-Type': 'application/json'
    }
});
```

### Cách 3: Thêm `apikey` Vào URL (Không Khuyến Nghị)

```javascript
// ⚠️ Có thể dùng nhưng không an toàn
const response = await fetch(
    'https://opjagtkygfgiokuaveje.supabase.co/rest/v1/users?apikey=YOUR_ANON_KEY',
    {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer YOUR_ANON_KEY'
        }
    }
);
```

## 🔧 Sửa Trong Code

### Kiểm Tra File `test-cors.html`

Đảm bảo function `testAPIRequest` có header `apikey`:

```javascript
async function testAPIRequest(url, anonKey) {
    const response = await fetch(`${url}/rest/v1/users?select=count`, {
        method: 'GET',
        headers: {
            'apikey': anonKey,  // ✅ Phải có
            'Authorization': `Bearer ${anonKey}`,  // ✅ Phải có
            'Content-Type': 'application/json'
        }
    });
    // ...
}
```

### Kiểm Tra Supabase Client Initialization

Đảm bảo Supabase client được khởi tạo đúng:

```javascript
// Trong js/core/api.js hoặc js/core/config.js
window.supabaseClient = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY  // ✅ Phải có anon key
);
```

## 📋 Checklist

- [ ] Đã thêm header `apikey` vào fetch requests
- [ ] Đã thêm header `Authorization: Bearer <anon_key>`
- [ ] Supabase client được khởi tạo với anon key
- [ ] Anon key đúng (kiểm tra trong `js/core/config.js`)
- [ ] Không có typo trong header name (`apikey` không phải `api-key`)

## 🔍 Debug

### Kiểm Tra Headers Được Gửi

Mở Browser DevTools (F12) → Network tab:
1. Tìm request đến Supabase
2. Click vào request
3. Xem **Request Headers**
4. Đảm bảo có:
   - `apikey: eyJhbGci...`
   - `authorization: Bearer eyJhbGci...`

### Test Với Console

```javascript
// Test với anon key
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM';

fetch('https://opjagtkygfgiokuaveje.supabase.co/rest/v1/users?select=count', {
    method: 'GET',
    headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
    }
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

## ⚠️ Lưu Ý

1. **Anon Key có thể public** - OK để đặt trong frontend code
2. **Service Role Key KHÔNG được public** - Chỉ dùng ở server-side
3. **Luôn dùng Supabase client** - Tự động xử lý headers
4. **Kiểm tra anon key đúng** - Copy từ Supabase Dashboard

## 🎯 Anon Key Ở Đâu?

1. Vào **Supabase Dashboard**: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Settings** → **API**
4. Copy **"anon public"** key
5. Paste vào `js/core/config.js`:

```javascript
const CONFIG = {
    SUPABASE_URL: 'https://opjagtkygfgiokuaveje.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGci...',  // ← Paste key ở đây
    // ...
};
```

## ✅ Sau Khi Sửa

1. Refresh browser (Ctrl+F5 hoặc Cmd+Shift+R)
2. Test lại API call
3. Kiểm tra Network tab xem headers đã có `apikey` chưa
4. Nếu vẫn lỗi, kiểm tra anon key có đúng không

---

**Cập nhật:** $(date)
**Supabase Project:** opjagtkygfgiokuaveje

