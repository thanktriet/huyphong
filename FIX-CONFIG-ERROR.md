# 🔧 Fix CONFIG is not defined Error

## ❌ Lỗi

```
ReferenceError: CONFIG is not defined
    at Object.getCurrentUser (auth.service.js:8:34)
```

## 🔍 Nguyên nhân

1. **Script loading order**: `auth.service.js` chạy trước khi `config.js` load xong
2. **Synchronous loading**: Scripts được load đồng bộ nhưng có thể chưa execute xong
3. **GitHub Pages**: Có thể có delay khi load scripts từ GitHub Pages

## ✅ Giải pháp đã áp dụng

### 1. Sửa `auth.service.js`

Thay vì truy cập trực tiếp `CONFIG`, sử dụng fallback:

```javascript
getCurrentUser() {
    // Use window.CONFIG if CONFIG is not defined
    const config = typeof CONFIG !== 'undefined' ? CONFIG : (window.CONFIG || {});
    if (!config.STORAGE_KEYS) {
        console.error('CONFIG is not properly initialized.');
        return null;
    }
    return Utils.storage.get(config.STORAGE_KEYS.USER);
}
```

### 2. Sửa `index.html`

Thêm check và đợi CONFIG sẵn sàng:

```javascript
(async function init() {
    try {
        // Wait for CONFIG to be available
        if (typeof CONFIG === 'undefined') {
            await new Promise(resolve => {
                const checkConfig = setInterval(() => {
                    if (typeof CONFIG !== 'undefined') {
                        clearInterval(checkConfig);
                        resolve();
                    }
                }, 50);
            });
        }
        
        // Initialize API
        await API.init();
        
        // Rest of code...
    } catch (error) {
        console.error('Init error:', error);
    }
})();
```

### 3. Xóa `supabase/api.js` khỏi HTML files

`supabase/api.js` sẽ được load bởi `API.init()`, không cần load trực tiếp.

### 4. Đảm bảo `config.js` export đúng

```javascript
// Export immediately
window.CONFIG = CONFIG;

// Ensure CONFIG is available globally
if (typeof window.CONFIG === 'undefined') {
    window.CONFIG = CONFIG;
}
```

## 📝 Files đã sửa

- ✅ `js/services/auth.service.js` - Thêm fallback cho CONFIG
- ✅ `js/core/config.js` - Đảm bảo export đúng
- ✅ `index.html` - Thêm check và đợi CONFIG
- ✅ Tất cả HTML files - Xóa `supabase/api.js` (sẽ được load bởi API.init())

## ✅ Test

1. Refresh browser (Ctrl+F5 hoặc Cmd+Shift+R)
2. Kiểm tra console không còn lỗi CONFIG
3. Login sẽ hoạt động bình thường

## 🔄 Đã push lên GitHub

Code đã được commit và push. GitHub Pages sẽ tự động deploy lại.

