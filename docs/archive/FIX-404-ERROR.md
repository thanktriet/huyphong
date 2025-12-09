# 🔧 Fix 404 Error - Troubleshooting Guide

## ❌ Lỗi 404

```
Failed to load resource: the server responded with a status of 404 ()
```

## 🔍 Nguyên nhân có thể

### 1. GitHub Pages chưa được enable
- Vào Settings > Pages trong GitHub repository
- Chọn Source: `main` branch
- Chọn folder: `/ (root)`
- Save và đợi 1-2 phút để deploy

### 2. Files chưa được commit/push
- Kiểm tra: `git status`
- Commit và push tất cả files: `git add -A && git commit -m "Update" && git push`

### 3. Script paths không đúng
- Kiểm tra tất cả `<script src="...">` trong HTML files
- Đảm bảo paths đúng với cấu trúc thư mục

### 4. File bị thiếu
- Kiểm tra tất cả files được reference có tồn tại không

## ✅ Checklist Kiểm Tra

### Files Structure
```bash
# Kiểm tra tất cả files tồn tại
ls -la js/core/
ls -la js/services/
ls -la js/ui/
ls -la js/pages/
ls -la supabase/
```

### Script Paths trong workout.html
- ✅ `js/core/config.js`
- ✅ `js/core/utils.js`
- ✅ `js/core/api.js`
- ✅ `js/services/auth.service.js`
- ✅ `js/services/workout.service.js`
- ✅ `js/ui/toast.js`
- ✅ `js/ui/loader.js`
- ✅ `js/pages/workout.page.js`
- ✅ `supabase/api.js` (được load bởi API.init())

### GitHub Pages Setup
1. Vào: https://github.com/thanktriet/huyphong/settings/pages
2. Source: `Deploy from a branch`
3. Branch: `main` / `/ (root)`
4. Save
5. Đợi 1-2 phút
6. Truy cập: https://thanktriet.github.io/huyphong/workout.html

## 🔧 Quick Fix Commands

```bash
# 1. Kiểm tra files
cd /Users/mac2019/huyphong
find js -name "*.js" -type f | sort

# 2. Kiểm tra git status
git status

# 3. Commit và push nếu cần
git add -A
git commit -m "Fix 404 errors"
git push origin main

# 4. Verify trên GitHub
# Vào: https://github.com/thanktriet/huyphong
# Kiểm tra tất cả files đã được push
```

## 📝 Common Issues

### Issue 1: File không tồn tại trên GitHub
**Fix:** Commit và push file đó

### Issue 2: Path không đúng
**Fix:** Kiểm tra và sửa path trong HTML

### Issue 3: GitHub Pages chưa deploy
**Fix:** Enable GitHub Pages và đợi deploy

### Issue 4: Cache browser
**Fix:** Hard refresh (Ctrl+F5 hoặc Cmd+Shift+R)

## 🧪 Test

1. Mở: https://thanktriet.github.io/huyphong/workout.html
2. Mở Browser Console (F12)
3. Kiểm tra Network tab
4. Xem file nào bị 404
5. Fix file đó

## 📞 Next Steps

Nếu vẫn lỗi, cung cấp:
1. File nào bị 404 (từ Browser Console)
2. URL đang truy cập
3. Screenshot của Network tab

