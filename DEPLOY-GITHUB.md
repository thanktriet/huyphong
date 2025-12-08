# 🚀 Deploy lên GitHub Pages

## Bước 1: Khởi tạo Git Repository (nếu chưa có)

```bash
cd /Users/mac2019/huyphong

# Khởi tạo git repo
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit: PT Manager with Supabase"
```

## Bước 2: Tạo Repository trên GitHub

1. Vào https://github.com/new
2. Tạo repository mới (ví dụ: `pt-manager`)
3. **KHÔNG** tích "Initialize with README"
4. Copy URL repository (ví dụ: `https://github.com/username/pt-manager.git`)

## Bước 3: Push lên GitHub

```bash
# Thêm remote
git remote add origin https://github.com/username/pt-manager.git

# Push code
git branch -M main
git push -u origin main
```

## Bước 4: Enable GitHub Pages

1. Vào repository trên GitHub
2. Settings → Pages
3. Source: chọn **"Deploy from a branch"**
4. Branch: chọn **"main"** và folder **"/ (root)"**
5. Click **Save**

## Bước 5: Truy cập Website

Sau vài phút, website sẽ có tại:
```
https://username.github.io/pt-manager/login.html
```

## ⚠️ QUAN TRỌNG: Cấu hình CORS trong Supabase

GitHub Pages dùng HTTPS, nên cần cấu hình CORS trong Supabase:

1. Vào Supabase Dashboard → Settings → API
2. Trong phần "CORS", thêm domain:
   ```
   https://username.github.io
   ```
3. Click **Save**

## 🔧 Nếu cần Custom Domain

1. Settings → Pages → Custom domain
2. Thêm domain của bạn
3. Cấu hình DNS theo hướng dẫn
4. Thêm domain vào CORS trong Supabase

## 📝 Lưu ý

- **Public Repository**: Code sẽ public, không nên commit secrets
- **Supabase Keys**: Anon Key có thể public, nhưng Service Role Key thì KHÔNG
- **HTTPS**: GitHub Pages tự động có HTTPS
- **CORS**: Phải cấu hình CORS trong Supabase cho domain GitHub Pages

## ✅ Checklist

- [ ] Đã khởi tạo git repo
- [ ] Đã commit code
- [ ] Đã push lên GitHub
- [ ] Đã enable GitHub Pages
- [ ] Đã cấu hình CORS trong Supabase
- [ ] Đã test login trên GitHub Pages

