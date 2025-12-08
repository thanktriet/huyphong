# ⚡ Quick Deploy Guide

## 🚀 Deploy nhanh trong 3 bước

### 1. Khởi tạo và Push

```bash
cd /Users/mac2019/huyphong

# Nếu chưa có git
git init
git add .
git commit -m "Deploy PT Manager to GitHub Pages"

# Thêm remote (thay YOUR_USERNAME và REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages

1. Vào repository trên GitHub
2. **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / **/ (root)**
5. **Save**

### 3. Cấu hình CORS trong Supabase

1. Vào Supabase Dashboard
2. **Settings** → **API**
3. Trong "CORS", thêm:
   ```
   https://YOUR_USERNAME.github.io
   ```
4. **Save**

## ✅ Xong!

Sau 1-2 phút, truy cập:
```
https://YOUR_USERNAME.github.io/REPO_NAME/login.html
```

## 🔑 Test Login

- Email: `admin@huyphong.com`
- Password: `123456`

## 📝 Lưu ý

- Repository phải là **Public** (hoặc GitHub Pro)
- Đợi 1-2 phút để GitHub Pages deploy
- Nếu lỗi CORS, kiểm tra lại CORS settings trong Supabase

