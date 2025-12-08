# 🚀 GitHub Pages Setup - Đã Push Code!

## ✅ Code đã được push lên GitHub

Repository: `https://github.com/thanktriet/huyphong`

## 📝 Bước tiếp theo: Enable GitHub Pages

### 1. Vào GitHub Repository

Truy cập: https://github.com/thanktriet/huyphong

### 2. Enable GitHub Pages

1. Click **Settings** (ở trên cùng)
2. Scroll xuống phần **Pages** (bên trái)
3. Trong phần **Source**:
   - Chọn **"Deploy from a branch"**
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **Save**

### 3. Đợi Deploy

Sau 1-2 phút, website sẽ có tại:
```
https://thanktriet.github.io/huyphong/login.html
```

## ⚠️ QUAN TRỌNG: Cấu hình CORS trong Supabase

GitHub Pages dùng HTTPS, nên **BẮT BUỘC** phải cấu hình CORS:

1. Vào Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. **Settings** → **API**
4. Scroll xuống phần **"CORS"**
5. Thêm domain:
   ```
   https://thanktriet.github.io
   ```
6. Click **Save**

## ✅ Test Website

Sau khi enable GitHub Pages và cấu hình CORS:

1. Truy cập: `https://thanktriet.github.io/huyphong/login.html`
2. Test login:
   - Email: `admin@huyphong.com`
   - Password: `123456`

## 🔧 Troubleshooting

### Lỗi CORS?
- Kiểm tra đã thêm domain vào CORS trong Supabase chưa
- Đảm bảo domain đúng: `https://thanktriet.github.io` (không có `/huyphong`)

### 404 Error?
- Đợi thêm 1-2 phút để GitHub Pages deploy
- Kiểm tra URL đúng: `https://thanktriet.github.io/huyphong/login.html`

### Login không hoạt động?
- Kiểm tra browser console (F12) xem có lỗi gì
- Kiểm tra CORS settings trong Supabase
- Đảm bảo đã chạy `schema.sql` và `sample-data.sql` trong Supabase

## 📝 Lưu ý

- Repository phải là **Public** (hoặc bạn có GitHub Pro)
- GitHub Pages tự động có HTTPS
- Mỗi lần push code mới, GitHub Pages sẽ tự động deploy lại

## 🎉 Xong!

Sau khi hoàn thành các bước trên, website sẽ hoạt động trên GitHub Pages!

