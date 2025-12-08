# 🔧 Fix CONFIG Loading trên GitHub Pages

## ❌ Vấn Đề

CONFIG không được load trên GitHub Pages:
```
"hasCONFIG": false,
"hasWindowCONFIG": false,
"SUPABASE_URL": "MISSING"
```

## 🔍 Nguyên Nhân

1. **`const` trong strict mode**: `const CONFIG` không được hoist và có thể không accessible globally
2. **Script execution order**: GitHub Pages có thể có delay khi load scripts
3. **Scope issues**: CONFIG có thể bị scope trong module

## ✅ Giải Pháp Đã Áp Dụng

### 1. Đổi `const` thành `var`
```javascript
// Trước:
const CONFIG = { ... };

// Sau:
var CONFIG = { ... };
```

**Lý do:** `var` được hoist và accessible globally, `const` có block scope

### 2. Export Explicit
```javascript
// Đảm bảo export
window.CONFIG = CONFIG;
```

### 3. Debug Logging
```javascript
console.log('[CONFIG] Loaded successfully:', {
    hasCONFIG: typeof CONFIG !== 'undefined',
    hasWindowCONFIG: typeof window.CONFIG !== 'undefined',
    SUPABASE_URL: CONFIG.SUPABASE_URL ? 'Set' : 'Missing'
});
```

### 4. Test Page Fallback
Test page sẽ tự động load config nếu không có:
```javascript
if (typeof CONFIG === 'undefined') {
    const response = await fetch('js/core/config.js');
    const code = await response.text();
    eval(code);
}
```

## 🧪 Test Sau Khi Fix

1. **Hard refresh browser**: `Ctrl+F5` hoặc `Cmd+Shift+R`
2. **Clear cache**: Settings > Clear browsing data
3. **Test lại**: Mở `test-supabase-connection.html`

## ✅ Expected Result

Sau khi fix:
```json
{
  "hasCONFIG": true,
  "hasWindowCONFIG": true,
  "SUPABASE_URL": "https://opjagtkygfgiokuaveje.supabase.co",
  "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 📝 Note

- `var` được dùng thay vì `const` để đảm bảo global scope
- Đây là trade-off: `var` có hoisting nhưng có thể gây issues nếu dùng strict mode
- Nếu vẫn không được, có thể cần inline CONFIG vào HTML (không khuyến khích)

## 🚀 Đã Push

Code đã được commit và push. GitHub Pages sẽ deploy lại sau 1-2 phút.

