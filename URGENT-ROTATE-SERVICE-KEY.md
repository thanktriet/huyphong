# 🚨 URGENT: Rotate Service Role Key Ngay!

## ⚠️ CẢNH BÁO BẢO MẬT

**Service Role Key của bạn đã được commit vào Git và có thể đã bị lộ!**

### Files Có Service Role Key (Đã Commit):

1. ✅ `fix-supabase-rls.js` - Có service key
2. ✅ `supabase/migrate-data.js` - Có service key

**Nếu repository là PUBLIC, key đã bị lộ hoàn toàn!**

## 🔥 HÀNH ĐỘNG NGAY LẬP TỨC

### Bước 1: Rotate Service Role Key (QUAN TRỌNG NHẤT)

1. Vào **Supabase Dashboard**: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Settings** → **API**
4. Tìm **"service_role"** key
5. Click **"Rotate"** hoặc **"Reset"**
6. Key cũ sẽ **KHÔNG hoạt động** nữa
7. Copy key mới (nếu cần)

### Bước 2: Xóa Key Khỏi Code

Sau khi rotate key, cập nhật các file:

1. **`fix-supabase-rls.js`** - Xóa hoặc comment service key
2. **`supabase/migrate-data.js`** - Xóa hoặc comment service key

**Hoặc:** Dùng environment variable:

```javascript
// Thay vì hardcode
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
```

### Bước 3: Thêm Vào .gitignore

Đã thêm vào `.gitignore`:
- `fix-supabase-rls.js`
- `supabase/migrate-data.js`
- `*.env`

### Bước 4: Xóa Key Khỏi Git History (Nếu Cần)

Nếu muốn xóa hoàn toàn key khỏi git history:

```bash
# ⚠️ CẨN THẬN: Lệnh này sẽ rewrite git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch fix-supabase-rls.js supabase/migrate-data.js" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (chỉ làm nếu repository là private hoặc bạn chắc chắn)
# git push origin --force --all
```

**⚠️ Lưu ý:** Chỉ làm nếu repository là private. Nếu là public, key đã bị lộ và cần rotate ngay.

## ✅ Checklist

- [ ] **Đã rotate Service Role Key trong Supabase Dashboard** (QUAN TRỌNG NHẤT!)
- [ ] Đã xóa key khỏi code hoặc dùng environment variable
- [ ] Đã thêm files vào .gitignore
- [ ] Đã kiểm tra repository là public hay private
- [ ] Đã kiểm tra logs trong Supabase xem có hoạt động đáng ngờ không

## 🔍 Kiểm Tra Key Đã Bị Lộ Chưa?

### Nếu Repository Là Public:

1. Vào GitHub repository
2. Search key: `QTxv7SnfJaSm05UlHK-o9yQ-p9YTA7l9542Ye0lzMmM`
3. Nếu tìm thấy → Key đã bị lộ hoàn toàn
4. **Rotate key ngay lập tức!**

### Nếu Repository Là Private:

- Key vẫn an toàn hơn nhưng vẫn nên rotate
- Đảm bảo chỉ những người tin cậy mới có access

## 🎯 Sau Khi Rotate Key

1. **Key cũ sẽ không hoạt động** - Tất cả code dùng key cũ sẽ fail
2. **Cập nhật code** - Dùng key mới hoặc environment variable
3. **Test lại** - Đảm bảo mọi thứ hoạt động

## 📝 Best Practices

### ✅ ĐÚNG:

```javascript
// Dùng environment variable
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
```

### ❌ SAI:

```javascript
// KHÔNG hardcode trong code
const SUPABASE_SERVICE_KEY = 'eyJhbGci...';
```

## 🆘 Nếu Đã Bị Lộ

1. **Rotate key ngay** - Trong vòng 5 phút
2. **Kiểm tra logs** - Xem có hoạt động đáng ngờ không
3. **Backup database** - Nếu cần
4. **Review access** - Xem ai đã truy cập
5. **Thông báo team** - Nếu có

---

**⏰ THỜI GIAN:** Rotate key trong vòng **5 phút** nếu repository là public!

**🔒 BẢO MẬT:** Service Role Key = Quyền Admin. Bảo vệ nó!

