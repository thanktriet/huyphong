# 🔧 Cấu Hình CORS trên Supabase (Phiên Bản Mới)

## ⚠️ Vấn Đề

Bạn không tìm thấy "Additional Allowed Origins" trong Supabase Dashboard? Điều này có thể do:

1. **Supabase đã thay đổi giao diện** - Field này có thể đã được di chuyển hoặc đổi tên
2. **CORS được xử lý tự động** - Supabase có thể đã tự động cho phép tất cả origins khi dùng anon key
3. **Cần cấu hình ở nơi khác** - Có thể cần cấu hình qua API hoặc SQL

## ✅ Giải Pháp

### Cách 1: Kiểm Tra Settings > API (Tìm Các Tên Khác)

1. Vào **Supabase Dashboard**: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Settings** → **API**
4. Tìm các field sau (có thể có tên khác):
   - "Allowed Origins"
   - "CORS Origins"
   - "Allowed Domains"
   - "Site URL" (đôi khi cũng ảnh hưởng đến CORS)
   - "Additional Allowed Origins"
   - "CORS Configuration"

### Cách 2: Kiểm Tra Site URL

1. Vào **Settings** → **API**
2. Tìm phần **"Site URL"** hoặc **"Site URL Configuration"**
3. Thêm domain của bạn vào đây (nếu có)
4. Click **Save**

### Cách 3: Supabase Tự Động Cho Phép (Không Cần Cấu Hình)

**Tin tốt:** Supabase có thể đã tự động cho phép tất cả origins khi bạn dùng **anon key** từ client-side. 

Nếu bạn vẫn gặp lỗi CORS, có thể do:

1. **RLS Policies** - Row Level Security chặn requests
2. **Network/Firewall** - Browser hoặc network chặn
3. **Supabase Client Configuration** - Cần cấu hình đúng trong code

### Cách 4: Kiểm Tra RLS Policies

Nếu CORS vẫn không hoạt động, có thể do RLS policies:

1. Vào **Supabase Dashboard** → **SQL Editor**
2. Chạy query này để kiểm tra RLS:

```sql
-- Kiểm tra RLS có bật không
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';
```

3. Nếu RLS đang chặn, tạm thời disable hoặc tạo policy:

```sql
-- Tạm thời disable RLS (CHỈ DÙNG ĐỂ TEST)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Hoặc tạo policy cho phép tất cả (CHỈ DÙNG ĐỂ TEST)
DROP POLICY IF EXISTS "Allow all" ON users;
CREATE POLICY "Allow all" ON users FOR ALL USING (true);
```

⚠️ **Cảnh báo:** Chỉ dùng để test. Trong production, cần tạo policies phù hợp.

### Cách 5: Cấu Hình Trong Code (Supabase Client)

Đảm bảo Supabase client được cấu hình đúng:

```javascript
const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        },
        // CORS sẽ được xử lý tự động
    }
);
```

## 🔍 Debug CORS

### Bước 1: Kiểm Tra Lỗi Cụ Thể

Mở Browser Console (F12) và xem lỗi chi tiết:

```javascript
// Test CORS
fetch('https://opjagtkygfgiokuaveje.supabase.co/rest/v1/users?select=count', {
    method: 'GET',
    headers: {
        'apikey': 'YOUR_ANON_KEY',
        'Authorization': 'Bearer YOUR_ANON_KEY'
    }
})
.then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', [...r.headers.entries()]);
    return r.json();
})
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

### Bước 2: Kiểm Tra Response Headers

Trong Network tab (F12 → Network):
1. Tìm request đến Supabase
2. Click vào request
3. Xem **Response Headers**
4. Tìm `Access-Control-Allow-Origin`

- Nếu thấy `Access-Control-Allow-Origin: *` → CORS OK
- Nếu không thấy → CORS chưa được cấu hình

### Bước 3: Kiểm Tra Preflight Request

Nếu thấy request **OPTIONS** bị fail:
- CORS preflight chưa được cho phép
- Cần cấu hình CORS trong Supabase

## 🎯 Các Vị Trí Có Thể Tìm CORS Settings

### Trong Supabase Dashboard:

1. **Settings → API**
   - "Site URL"
   - "Allowed Origins"
   - "CORS"
   - "Additional Allowed Origins"

2. **Settings → Auth**
   - "Site URL"
   - "Redirect URLs"

3. **Project Settings → General**
   - "Site URL"

## 📝 Nếu Vẫn Không Tìm Thấy

### Option 1: Liên Hệ Supabase Support

1. Discord: https://discord.supabase.com
2. GitHub: https://github.com/supabase/supabase/discussions
3. Email: support@supabase.com

### Option 2: Kiểm Tra Documentation

1. https://supabase.com/docs/guides/api
2. https://supabase.com/docs/reference/api

### Option 3: Sử Dụng Supabase CLI

Nếu bạn có Supabase CLI:

```bash
supabase projects list
supabase projects api-settings
```

## ✅ Checklist

- [ ] Đã kiểm tra Settings → API
- [ ] Đã kiểm tra Settings → Auth
- [ ] Đã kiểm tra Project Settings
- [ ] Đã test với Browser Console
- [ ] Đã kiểm tra Network tab
- [ ] Đã kiểm tra RLS policies
- [ ] Đã thử với Supabase client đúng cách

## 🔄 Supabase Có Thể Đã Thay Đổi

Nếu bạn đang dùng Supabase mới, có thể:

1. **CORS được tự động cho phép** - Không cần cấu hình
2. **CORS được cấu hình qua API** - Cần dùng Management API
3. **CORS được cấu hình qua CLI** - Cần dùng Supabase CLI

## 🆘 Vẫn Không Hoạt Động?

Nếu sau khi thử tất cả các cách trên vẫn không được:

1. **Kiểm tra lại lỗi:** Có thể không phải lỗi CORS mà là lỗi khác (RLS, authentication, etc.)
2. **Test với Postman/curl:** Xem API có hoạt động không
3. **Kiểm tra Supabase Status:** https://status.supabase.com
4. **Xem logs:** Supabase Dashboard → Logs → API Logs

---

**Cập nhật:** $(date)
**Supabase Version:** Latest (2024-2025)
**Note:** Supabase có thể đã thay đổi cách cấu hình CORS

