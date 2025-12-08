# 🚨 FIX CORS NGAY - Hướng Dẫn Nhanh

## ❌ Lỗi Bạn Đang Gặp

```
Test 1: CORS Preflight (OPTIONS)
❌ Preflight request thất bại. Không có CORS headers.
```

**Nguyên nhân:** Domain của bạn chưa được thêm vào Supabase CORS settings.

## ✅ Giải Pháp (5 Phút)

### Bước 1: Xác Định Domain Của Bạn

Mở trang `test-cors.html` và xem phần **"Current Origin"** - đó chính là domain bạn cần thêm.

Ví dụ:
- `http://localhost:8001` (nếu test local)
- `https://thanktriet.github.io` (nếu test trên GitHub Pages)

### Bước 2: Vào Supabase Dashboard

1. Truy cập: **https://supabase.com/dashboard**
2. Đăng nhập
3. Chọn project của bạn (project ID: `opjagtkygfgiokuaveje`)

### Bước 3: Cấu Hình CORS

1. Click **Settings** (⚙️) ở sidebar bên trái
2. Click **API** trong menu Settings
3. **Tìm một trong các field sau** (Supabase có thể đã đổi tên):
   - **"Additional Allowed Origins"** (nếu có)
   - **"Allowed Origins"** (nếu có)
   - **"CORS"** hoặc **"CORS Configuration"** (nếu có)
   - **"Site URL"** (cũng có thể ảnh hưởng đến CORS)
4. Trong text box (nếu tìm thấy), thêm domain của bạn (mỗi domain một dòng):

```
http://localhost:8001
http://localhost:3000
https://thanktriet.github.io
```

**⚠️ QUAN TRỌNG:**
- ✅ Chỉ thêm domain, KHÔNG thêm path
- ✅ Không có dấu `/` ở cuối
- ✅ Phân biệt `http://` và `https://`
- ✅ Mỗi domain một dòng riêng

**Ví dụ ĐÚNG:**
```
https://thanktriet.github.io
```

**Ví dụ SAI:**
```
https://thanktriet.github.io/        ❌ (có dấu /)
https://thanktriet.github.io/huyphong  ❌ (có path)
thanktriet.github.io                  ❌ (thiếu protocol)
```

### Bước 4: Lưu (Nếu Tìm Thấy Field)

1. Click nút **Save** hoặc **Update**
2. Đợi thông báo "Settings updated successfully"
3. Đợi 10-30 giây để Supabase cập nhật

### ⚠️ Nếu Không Tìm Thấy "Additional Allowed Origins"

**Tin tốt:** Supabase có thể đã tự động cho phép tất cả origins khi dùng anon key!

Nếu vẫn gặp lỗi CORS, có thể do:
1. **RLS Policies** - Xem phần "Kiểm Tra RLS" bên dưới
2. **Network/Firewall** - Browser chặn
3. **Cần cấu hình khác** - Xem file `FIX-CORS-SUPABASE-NEW.md` để biết thêm

### Bước 5: Test Lại

1. Quay lại trang `test-cors.html`
2. Click **"Test CORS"** lại
3. Nếu thấy ✅ → CORS đã hoạt động!

## 🔍 Kiểm Tra Domain Đã Thêm Chưa

Sau khi thêm domain, bạn có thể kiểm tra:

1. Vào lại Supabase Dashboard → Settings → API
2. Xem phần "Additional Allowed Origins"
3. Đảm bảo domain của bạn có trong danh sách

## 🐛 Vẫn Không Hoạt Động?

### Kiểm Tra 1: Domain Đúng Chưa?

1. Mở Browser Console (F12)
2. Xem lỗi CORS hiển thị domain nào
3. Đảm bảo domain đó đã được thêm vào Supabase

### Kiểm Tra 2: Đã Save Chưa?

- Đảm bảo đã click **Save** trong Supabase Dashboard
- Đợi ít nhất 30 giây sau khi save

### Kiểm Tra 3: Clear Cache

1. Hard refresh browser: `Ctrl+F5` (Windows) hoặc `Cmd+Shift+R` (Mac)
2. Hoặc mở Incognito/Private mode
3. Test lại

### Kiểm Tra 4: Supabase Project Đúng Chưa?

- Đảm bảo đang ở đúng project
- Kiểm tra SUPABASE_URL trong `js/core/config.js` có khớp với project không

## 📸 Vị Trí CORS Settings

Trong Supabase Dashboard:

```
Dashboard
  └── Settings (⚙️) [Sidebar bên trái]
      └── API [Menu Settings]
          └── Scroll xuống
              └── "Additional Allowed Origins" [Text box]
                  └── [Thêm domain ở đây]
                      └── Save [Nút ở dưới]
```

## ✅ Checklist

Sau khi làm theo hướng dẫn:

- [ ] Đã xác định domain cần thêm
- [ ] Đã vào Supabase Dashboard
- [ ] Đã vào Settings → API
- [ ] Đã thêm domain vào "Additional Allowed Origins"
- [ ] Đã click Save
- [ ] Đã đợi 30 giây
- [ ] Đã test lại và thấy ✅

## 🆘 Vẫn Không Được?

Nếu vẫn gặp lỗi sau khi làm tất cả các bước trên:

1. **Kiểm tra lại domain:**
   - Mở `test-cors.html`
   - Copy domain từ "Current Origin"
   - Đảm bảo domain đó có trong Supabase CORS settings

2. **Thử thêm wildcard (tạm thời để test):**
   ```
   *
   ```
   ⚠️ **Lưu ý:** Chỉ dùng để test, sau đó xóa và thêm domain cụ thể

3. **Liên hệ Supabase Support:**
   - Discord: https://discord.supabase.com
   - GitHub: https://github.com/supabase/supabase

## 📝 Ghi Chú

- CORS settings có thể mất vài phút để cập nhật
- Mỗi lần thay đổi domain, cần đợi 30-60 giây
- Nếu dùng cả local và production, cần thêm cả 2 domains

---

**Cập nhật:** $(date)
**Project:** opjagtkygfgiokuaveje
**Supabase URL:** https://opjagtkygfgiokuaveje.supabase.co

