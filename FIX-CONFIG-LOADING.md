# 🔧 Fix CONFIG Loading Issue

## ❌ Vấn Đề

CONFIG không được load trên GitHub Pages:
```
"CONFIG": "❌ Undefined",
"windowCONFIG": "❌ Undefined"
```

## 🔍 Nguyên Nhân

1. **Script loading order**: `config.js` có thể chưa load xong khi `api.js` chạy
2. **GitHub Pages caching**: GitHub Pages có thể cache files cũ
3. **Module scope**: CONFIG có thể không được export đúng cách

## ✅ Giải Pháp Đã Áp Dụng

### 1. Sửa `js/core/config.js`
- Thêm multiple export methods
- Thêm debug logging
- Đảm bảo `window.CONFIG` luôn được set

### 2. Sửa `js/core/api.js`
- Thêm fallback để lấy CONFIG từ `window.CONFIG`
- Kiểm tra CONFIG trước khi sử dụng
- Throw error rõ ràng nếu CONFIG không có

### 3. Sửa `test-login-debug.html`
- Thêm check CONFIG multiple times
- Hiển thị thông tin debug chi tiết hơn

## 🧪 Test Sau Khi Fix

1. **Hard refresh browser**: `Ctrl+F5` hoặc `Cmd+Shift+R`
2. **Clear cache**: 
   - Chrome: Settings > Privacy > Clear browsing data
   - Hoặc mở Incognito mode
3. **Test lại**: Mở `test-login-debug.html`

## 📝 Nếu Vẫn Lỗi

### Option 1: Kiểm tra Script Loading
Mở Browser Console và chạy:
```javascript
// Check if config.js is loaded
console.log('Scripts:', Array.from(document.querySelectorAll('script[src*="config"]')).map(s => s.src));

// Check CONFIG
console.log('CONFIG:', typeof CONFIG !== 'undefined' ? CONFIG : window.CONFIG);
```

### Option 2: Load Config Manually
Nếu vẫn không được, thêm vào `test-login-debug.html`:
```html
<script>
    // Force load config
    if (typeof CONFIG === 'undefined' && typeof window.CONFIG === 'undefined') {
        fetch('js/core/config.js')
            .then(r => r.text())
            .then(code => {
                eval(code);
                console.log('CONFIG loaded manually');
            });
    }
</script>
```

### Option 3: Inline CONFIG (Last Resort)
Nếu vẫn không được, có thể inline CONFIG vào HTML (không khuyến khích vì security).

## ✅ Expected Result

Sau khi fix, `test-login-debug.html` sẽ hiển thị:
```json
{
  "CONFIG": "✅ Defined",
  "windowCONFIG": "✅ Defined",
  "SUPABASE_URL": "https://opjagtkygfgiokuaveje.supabase.co",
  "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🚀 Next Steps

1. Hard refresh browser
2. Test lại `test-login-debug.html`
3. Nếu vẫn lỗi, check Network tab xem `config.js` có load không
4. Kiểm tra Console có errors không

