# 🧹 Kế Hoạch Dọn Dẹp Repository

## 🔒 Vấn Đề Bảo Mật

### ⚠️ CRITICAL: Service Role Key đã bị commit
- `fix-supabase-rls.js` - Có SERVICE ROLE KEY (dòng 11)
- `supabase/migrate-data.js` - Có SERVICE ROLE KEY (dòng 14)

**Hành động cần thiết:**
1. ✅ Đã thêm vào .gitignore (nhưng đã commit trước đó)
2. ⚠️ Cần xóa service key khỏi code
3. ⚠️ Cần rotate service key trong Supabase Dashboard
4. ⚠️ Nếu repo là public, key đã bị lộ - rotate ngay!

## 📁 Files Cần Xóa (Test/Temporary)

### Test Files (không cần trong production):
- `test-*.html` (nhiều file)
- `test-*.js`
- `quick-test-run.html`
- `fix-supabase-auto.html`
- `verify-rls-fixed.html`
- `test-cors.html`
- `test-supabase-connection.html`
- `test-login-debug.html`
- `test-simple-login.html`
- `test-api-access.html`
- `test-supabase.html`
- `test-connection.js`

### Documentation Files (có thể giữ hoặc move vào docs/):
- `FIX-*.md` (nhiều file)
- `TEST-*.md` (nhiều file)
- `DEBUG-*.md`
- `URGENT-*.md`
- `SECURITY-*.md`
- `HOW-TO-TEST-*.md`
- `READY-TO-TEST.md`
- `START-HERE.md`
- `SETUP-NOW.md`
- `QUICK-START.md`
- `UPDATE-COMPLETE.md`
- `MIGRATION-COMPLETE.md`
- `ADMIN-UPDATE-COMPLETE.md`
- `COMPLETE-SYSTEM-CHECK.md`
- `DEPLOY-*.md`
- `GITHUB-PAGES-SETUP.md`
- `README-*.md` (giữ README.md chính)

### Supabase Test Files:
- `supabase/example-usage.html`
- `supabase/quick-test.md`
- `supabase/test-credentials.md`
- `supabase/BUGS-FOUND.md`
- `supabase/FIXES-APPLIED.md`
- `supabase/RLS-NOTE.md`
- `supabase/QUICK-FIX-RLS.md`
- `supabase/migration-guide.md`

### Scripts không cần:
- `fix-supabase-rls.js` (có service key - nguy hiểm)
- `supabase/migrate-data.js` (có service key - nguy hiểm)
- `config-supabase.js` (nếu không dùng)
- `auth.js` (nếu không dùng)
- `layout.js` (nếu không dùng)

## ✅ Files Cần Giữ

### Core Application:
- Tất cả `.html` files chính (index, login, admin, workout, nutrition, profile, schedule)
- `js/` folder (tất cả)
- `css/` folder
- `icons/` folder
- `supabase/api.js` và `supabase/api-wrapper.js`
- `manifest.json`
- `sw.js`
- `favicon.ico`

### Essential Documentation:
- `README.md` (chính)
- `SECURITY-SERVICE-KEY.md` (quan trọng - cảnh báo bảo mật)

## 🎯 Hành Động Đề Xuất

1. **Bảo mật (URGENT):**
   - Xóa service key khỏi `fix-supabase-rls.js` và `supabase/migrate-data.js`
   - Rotate service key trong Supabase Dashboard
   - Đảm bảo .gitignore đã ignore các file này

2. **Dọn dẹp:**
   - Tạo folder `docs/archive/` cho các file documentation cũ
   - Xóa hoặc move các test files
   - Giữ lại chỉ những file cần thiết cho production

3. **Cải thiện .gitignore:**
   - Thêm patterns cho test files
   - Thêm patterns cho temporary files

