# 🔒 BẢO MẬT: Service Role Key (Secret Key)

## ⚠️ CẢNH BÁO QUAN TRỌNG

**Service Role Key (Secret Key) là key cực kỳ nguy hiểm!**

- ✅ **Anon Key** - Có thể public, dùng trong frontend
- ❌ **Service Role Key** - **KHÔNG BAO GIỜ** được public, chỉ dùng server-side

## 🔑 Service Role Key Của Bạn

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTE1Nzc3OCwiZXhwIjoyMDgwNzMzNzc4fQ.QTxv7SnfJaSm05UlHK-o9yQ-p9YTA7l9542Ye0lzMmM
```

## 🚨 Tại Sao Nguy Hiểm?

Service Role Key có **quyền admin hoàn toàn**:
- ✅ Bypass tất cả RLS policies
- ✅ Đọc/ghi/xóa mọi dữ liệu
- ✅ Thay đổi schema
- ✅ Xóa database
- ✅ Truy cập tất cả tables

**Nếu key này bị lộ, ai đó có thể:**
- Xóa toàn bộ database
- Lấy cắp tất cả dữ liệu
- Thay đổi cấu trúc database
- Gây thiệt hại không thể khắc phục

## ✅ Cách Sử Dụng Đúng

### ✅ ĐÚNG: Dùng Trong Server-Side

```javascript
// ✅ ĐÚNG - Server-side (Node.js, Edge Functions, etc.)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Từ environment variable
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

### ❌ SAI: Dùng Trong Frontend

```javascript
// ❌ SAI - KHÔNG BAO GIỜ làm thế này!
const SUPABASE_SERVICE_KEY = 'eyJhbGci...'; // Trong frontend code
// Nếu commit lên GitHub, key sẽ bị lộ!
```

## 📋 Files Có Service Role Key

Các file sau có Service Role Key (cần xử lý):

1. **`supabase/migrate-data.js`** - Migration script (OK nếu chỉ chạy local)
2. **`fix-supabase-rls.js`** - Fix RLS script (OK nếu chỉ chạy local)

## 🔧 Xử Lý An Toàn

### Option 1: Thêm Vào .gitignore (Khuyến Nghị)

1. Tạo file `.env` hoặc `.env.local`:

```bash
# .env (KHÔNG commit file này!)
SUPABASE_SERVICE_KEY=eyJhbGci...
```

2. Thêm vào `.gitignore`:

```
.env
.env.local
*.env
```

3. Sử dụng trong code:

```javascript
// Đọc từ environment variable
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
```

### Option 2: Xóa Khỏi Git History (Nếu Đã Commit)

Nếu đã commit key vào git:

```bash
# 1. Xóa key khỏi file
# 2. Commit lại
git add -A
git commit -m "Remove service role key from code"

# 3. Rotate key trong Supabase Dashboard
# (Tạo key mới, key cũ sẽ không hoạt động)
```

### Option 3: Rotate Key (Nếu Đã Bị Lộ)

1. Vào **Supabase Dashboard** → **Settings** → **API**
2. Click **"Rotate"** bên cạnh Service Role Key
3. Key cũ sẽ không hoạt động nữa
4. Cập nhật key mới vào code (dùng environment variable)

## 📝 Checklist Bảo Mật

- [ ] Service Role Key KHÔNG có trong frontend code
- [ ] Service Role Key KHÔNG được commit lên GitHub
- [ ] Service Role Key chỉ dùng trong server-side code
- [ ] Service Role Key được lưu trong environment variables
- [ ] `.env` files đã được thêm vào `.gitignore`
- [ ] Nếu đã commit key, đã rotate key mới

## 🎯 Khi Nào Dùng Service Role Key?

### ✅ Dùng Khi:

1. **Migration scripts** - Chạy local, không deploy
2. **Admin functions** - Server-side only
3. **Backend API** - Node.js, Python, etc.
4. **Edge Functions** - Supabase Edge Functions

### ❌ KHÔNG Dùng Khi:

1. **Frontend code** - HTML, JavaScript trong browser
2. **Client-side** - Bất kỳ code nào chạy trong browser
3. **Public repositories** - GitHub public repos

## 🔍 Kiểm Tra Key Đã Bị Lộ Chưa?

1. **GitHub Search**: Tìm key trên GitHub
2. **Git History**: Kiểm tra git log
3. **Public Files**: Kiểm tra files đã public

## 🆘 Nếu Key Đã Bị Lộ

1. **Rotate key ngay lập tức** trong Supabase Dashboard
2. **Kiểm tra logs** xem có hoạt động đáng ngờ không
3. **Backup database** nếu cần
4. **Review access logs** trong Supabase Dashboard

## 📚 Tham Khảo

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Managing API Keys](https://supabase.com/docs/guides/platform/api-keys)

---

**⚠️ QUAN TRỌNG:** Service Role Key = Quyền Admin. Bảo vệ nó như bảo vệ mật khẩu admin!

