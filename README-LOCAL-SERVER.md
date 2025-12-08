# 🚀 Hướng dẫn chạy Local Server

## ❌ Vấn đề với file:// protocol

Khi mở trực tiếp file HTML bằng `file:///Users/mac2019/huyphong/login.html`, bạn sẽ gặp lỗi:

1. **CORS Error**: Supabase không cho phép requests từ `file://` protocol
2. **Module Loading Error**: ES6 modules không hoạt động với `file://`
3. **Security Restrictions**: Browser chặn các API calls từ local files

## ✅ Giải pháp: Chạy Local Server

### Cách 1: Sử dụng script có sẵn (Khuyên dùng)

**macOS/Linux:**
```bash
./start-server.sh
```

**Windows:**
```cmd
start-server.bat
```

Sau đó mở browser và truy cập:
```
http://localhost:8000/login.html
```

### Cách 2: Sử dụng Python (Manual)

**Python 3:**
```bash
python3 -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

Sau đó mở:
```
http://localhost:8000/login.html
```

### Cách 3: Sử dụng Node.js (nếu có)

```bash
npx http-server -p 8000
```

### Cách 4: Sử dụng VS Code Live Server

1. Cài đặt extension "Live Server" trong VS Code
2. Click chuột phải vào `login.html`
3. Chọn "Open with Live Server"

## 📝 Lưu ý

- **Port**: Server sẽ chạy trên port 8000 (có thể thay đổi)
- **URL**: Luôn dùng `http://localhost:8000` thay vì `file://`
- **HTTPS**: Nếu cần HTTPS, có thể dùng `npx serve -s . -l 8000` hoặc cấu hình SSL

## 🔧 Troubleshooting

### Port đã được sử dụng?
```bash
# Tìm process đang dùng port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Không có Python?
- macOS: `brew install python3`
- Windows: Download từ python.org
- Linux: `sudo apt-get install python3`

## ✅ Sau khi chạy server

1. Mở browser
2. Truy cập: `http://localhost:8000/login.html`
3. Login sẽ hoạt động bình thường!

