# 💪 PT Manager - Personal Trainer Management System

Ứng dụng quản lý PT chuyên nghiệp với Supabase backend.

## 🔒 Security Notice

**⚠️ IMPORTANT**: Service Role Key đã bị commit vào git history. Vui lòng rotate key trong Supabase Dashboard ngay!

Xem [SECURITY-CHECK.md](./SECURITY-CHECK.md) để biết thêm chi tiết.

## 🚀 Quick Start

### Local Development

```bash
# Chạy local server
./start-server-simple.sh

# Hoặc
python3 -m http.server 8001
```

Truy cập: `http://localhost:8001/login.html`

### Deploy lên GitHub Pages

```bash
# Chạy script deploy
./deploy.sh
```

Sau đó:
1. Vào GitHub repository → Settings → Pages
2. Enable GitHub Pages (branch: main, folder: /)
3. **Cấu hình CORS trong Supabase Dashboard** - Xem hướng dẫn chi tiết: [CONFIG-CORS-SUPABASE.md](./CONFIG-CORS-SUPABASE.md)

## 📋 Features

- ✅ User Authentication
- ✅ Workout Plan Management
- ✅ Nutrition Tracking
- ✅ Calendar/Schedule
- ✅ Admin Dashboard
- ✅ Student Management

## 🛠️ Tech Stack

- **Frontend**: HTML, JavaScript (Vanilla), Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: GitHub Pages

## 📝 Setup Supabase

1. Tạo Supabase project
2. Chạy `supabase/schema.sql`
3. Chạy `supabase/sample-data.sql`
4. Cấu hình CORS cho domain của bạn

## 🔑 Test Credentials

**Admin:**
- Email: `admin@huyphong.com`
- Password: `123456`

**Student:**
- Email: `student1@test.com`
- Password: `123456`

## 📚 Documentation

- `DEPLOY-QUICK.md` - Hướng dẫn deploy nhanh
- `README-LOCAL-SERVER.md` - Hướng dẫn chạy local
- `START-HERE.md` - Bắt đầu từ đây

## ⚠️ Lưu ý

- **KHÔNG** mở trực tiếp file HTML bằng `file://`
- Phải chạy qua local server hoặc GitHub Pages
- Cấu hình CORS trong Supabase cho domain của bạn

## 📄 License

MIT

