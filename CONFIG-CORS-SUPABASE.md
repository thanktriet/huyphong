# 🔧 Hướng Dẫn Cấu Hình CORS trên Supabase

## 📋 Tổng Quan

CORS (Cross-Origin Resource Sharing) là cơ chế bảo mật cho phép trình duyệt cho phép các request từ domain khác. Khi sử dụng Supabase từ frontend, **BẮT BUỘC** phải cấu hình CORS để cho phép domain của bạn truy cập API.

## 🎯 Các Domain Cần Cấu Hình

Dựa trên cấu hình hiện tại, bạn cần thêm các domain sau:

### 1. **Local Development**
```
http://localhost:8001
http://localhost:3000
http://127.0.0.1:8001
```

### 2. **GitHub Pages (Production)**
```
https://thanktriet.github.io
```

### 3. **Custom Domain (Nếu có)**
```
https://yourdomain.com
```

## 📝 Hướng Dẫn Từng Bước

### Bước 1: Truy Cập Supabase Dashboard

1. Mở trình duyệt và truy cập: **https://supabase.com/dashboard**
2. Đăng nhập vào tài khoản của bạn
3. Chọn project: **opjagtkygfgiokuaveje** (hoặc project của bạn)

### Bước 2: Vào Settings > API

1. Click vào **Settings** (biểu tượng bánh răng) ở sidebar bên trái
2. Chọn **API** từ menu Settings
3. Scroll xuống phần **"CORS"** hoặc **"Additional Allowed Origins"**

### Bước 3: Thêm Domains

Trong phần **"Additional Allowed Origins"** hoặc **"CORS"**, thêm từng domain (mỗi domain một dòng):

```
http://localhost:8001
http://localhost:3000
http://127.0.0.1:8001
https://thanktriet.github.io
```

**Lưu ý quan trọng:**
- ✅ Không thêm trailing slash (`/`) ở cuối
- ✅ Không thêm path (`/huyphong`)
- ✅ Chỉ thêm protocol + domain (ví dụ: `https://thanktriet.github.io`)
- ✅ Phân biệt `http://` và `https://` (cần thêm cả 2 nếu dùng cả 2)

### Bước 4: Lưu Cấu Hình

1. Click nút **Save** hoặc **Update**
2. Đợi vài giây để Supabase cập nhật cấu hình
3. Có thể thấy thông báo "Settings updated successfully"

## ✅ Kiểm Tra CORS Đã Hoạt Động

### Cách 1: Dùng Browser Console

1. Mở website của bạn (ví dụ: `http://localhost:8001/login.html`)
2. Mở Browser Console (F12)
3. Chạy lệnh sau:

```javascript
// Test CORS
fetch('https://opjagtkygfgiokuaveje.supabase.co/rest/v1/users?select=count', {
    method: 'GET',
    headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM'
    }
})
.then(r => r.json())
.then(data => console.log('✅ CORS OK:', data))
.catch(err => console.error('❌ CORS Error:', err));
```

### Cách 2: Dùng Test Page

1. Mở file `test-cors.html` (sẽ được tạo)
2. Click nút "Test CORS"
3. Xem kết quả

### Cách 3: Kiểm Tra Network Tab

1. Mở Browser DevTools (F12)
2. Vào tab **Network**
3. Thử login hoặc thực hiện một API call
4. Click vào request đến Supabase
5. Kiểm tra **Response Headers**:
   - ✅ Nếu thấy `Access-Control-Allow-Origin: *` hoặc domain của bạn → CORS OK
   - ❌ Nếu không có hoặc có lỗi CORS → Cần cấu hình lại

## 🐛 Xử Lý Lỗi CORS

### Lỗi 1: "Access to fetch blocked by CORS policy"

**Nguyên nhân:** Domain chưa được thêm vào CORS settings

**Giải pháp:**
1. Kiểm tra lại domain đã thêm đúng chưa
2. Đảm bảo không có trailing slash
3. Đảm bảo protocol đúng (`http://` vs `https://`)
4. Đợi vài phút sau khi save (có thể có delay)

### Lỗi 2: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Nguyên nhân:** Supabase chưa cập nhật cấu hình

**Giải pháp:**
1. Refresh lại Supabase Dashboard
2. Kiểm tra lại domain đã được lưu chưa
3. Thử xóa và thêm lại domain
4. Clear browser cache và thử lại

### Lỗi 3: CORS hoạt động ở local nhưng không hoạt động ở GitHub Pages

**Nguyên nhân:** Chưa thêm domain GitHub Pages

**Giải pháp:**
1. Thêm `https://thanktriet.github.io` vào CORS settings
2. Đảm bảo không có path (`/huyphong`)
3. Đảm bảo dùng `https://` (không phải `http://`)

## 📸 Screenshot Hướng Dẫn

### Vị Trí CORS Settings trong Supabase Dashboard:

```
Supabase Dashboard
  └── Settings (⚙️)
      └── API
          └── Scroll xuống
              └── "Additional Allowed Origins" hoặc "CORS"
                  └── [Text area để thêm domains]
```

## 🔒 Bảo Mật

**Lưu ý quan trọng:**
- ⚠️ Chỉ thêm các domain mà bạn tin tưởng
- ⚠️ Không thêm `*` (wildcard) trừ khi thực sự cần thiết
- ⚠️ Thường xuyên kiểm tra và xóa các domain không còn sử dụng
- ⚠️ CORS chỉ ảnh hưởng đến browser, không ảnh hưởng đến server-side requests

## 📝 Checklist

Sau khi cấu hình CORS, kiểm tra:

- [ ] Đã thêm tất cả domains cần thiết
- [ ] Đã click Save/Update
- [ ] Đã test từ localhost
- [ ] Đã test từ GitHub Pages (nếu có)
- [ ] Không còn lỗi CORS trong console
- [ ] API calls hoạt động bình thường

## 🆘 Vẫn Có Vấn Đề?

Nếu vẫn gặp lỗi CORS sau khi cấu hình:

1. **Kiểm tra lại domain:**
   - Mở Browser Console
   - Xem lỗi CORS hiển thị domain nào
   - Đảm bảo domain đó đã được thêm vào CORS

2. **Kiểm tra Supabase Project:**
   - Đảm bảo đang ở đúng project
   - Kiểm tra SUPABASE_URL trong config.js có đúng không

3. **Clear Cache:**
   - Clear browser cache
   - Hard refresh (Ctrl+F5 hoặc Cmd+Shift+R)
   - Thử Incognito mode

4. **Liên Hệ Support:**
   - Supabase Discord: https://discord.supabase.com
   - Supabase GitHub: https://github.com/supabase/supabase

## ✅ Hoàn Thành

Sau khi cấu hình CORS thành công, bạn sẽ có thể:
- ✅ Gọi API từ localhost
- ✅ Gọi API từ GitHub Pages
- ✅ Không còn lỗi CORS trong console
- ✅ Ứng dụng hoạt động bình thường

---

**Cập nhật lần cuối:** $(date)
**Supabase Project:** opjagtkygfgiokuaveje
**Supabase URL:** https://opjagtkygfgiokuaveje.supabase.co

