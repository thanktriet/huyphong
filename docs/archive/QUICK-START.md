# ⚡ Quick Start Guide

## 🚨 QUAN TRỌNG: Không mở trực tiếp file HTML!

**❌ SAI:**
```
file:///Users/mac2019/huyphong/login.html
```

**✅ ĐÚNG:**
```
http://localhost:8000/login.html
```

## 🚀 Cách chạy nhanh nhất

### Bước 1: Mở Terminal
```bash
cd /Users/mac2019/huyphong
```

### Bước 2: Chạy server
```bash
./start-server.sh
```

Hoặc nếu không có quyền:
```bash
python3 -m http.server 8000
```

### Bước 3: Mở browser
Truy cập: **http://localhost:8000/login.html**

## 📋 Test Credentials

**Admin:**
- Email: `admin@huyphong.com`
- Password: `123456`

**Student:**
- Email: `student1@test.com`
- Password: `123456`

## ✅ Checklist

- [ ] Đã chạy local server
- [ ] Đang dùng `http://localhost:8000` (KHÔNG phải `file://`)
- [ ] Đã chạy schema.sql trong Supabase
- [ ] Đã chạy sample-data.sql trong Supabase
- [ ] Browser console không có lỗi CORS

## 🐛 Nếu vẫn lỗi

1. **CORS Error**: Đảm bảo đang dùng `localhost`, không phải `file://`
2. **404 Error**: Kiểm tra file path đúng chưa
3. **Connection Error**: Kiểm tra Supabase URL và Anon Key trong `js/core/config.js`

