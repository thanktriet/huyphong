# 🚨 QUAN TRỌNG: Đọc file này trước!

## ❌ KHÔNG MỞ TRỰC TIẾP FILE HTML!

**SAI:**
```
file:///Users/mac2019/huyphong/login.html  ❌
```

**ĐÚNG:**
```
http://localhost:8001/login.html  ✅
```

## ⚡ Cách chạy nhanh nhất

### Bước 1: Mở Terminal
```bash
cd /Users/mac2019/huyphong
```

### Bước 2: Chạy server
```bash
./start-server-simple.sh
```

Hoặc:
```bash
python3 -m http.server 8001
```

### Bước 3: Mở browser
Truy cập: **http://localhost:8001/login.html**

## 🔑 Test Login

**Admin:**
- Email: `admin@huyphong.com`
- Password: `123456`

**Student:**
- Email: `student1@test.com`
- Password: `123456`

## ❓ Tại sao không dùng file://?

1. **CORS Error**: Supabase chặn requests từ `file://` protocol
2. **Security**: Browser không cho phép API calls từ local files
3. **Modules**: ES6 modules không hoạt động với `file://`

## ✅ Sau khi chạy server

- ✅ CORS sẽ hoạt động
- ✅ API calls sẽ thành công
- ✅ Login sẽ hoạt động bình thường

## 🐛 Nếu port bị chiếm

Nếu port 8001 cũng bị chiếm, dùng port khác:
```bash
python3 -m http.server 3000
```

Rồi mở: `http://localhost:3000/login.html`

