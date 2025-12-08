# 🚀 Setup Supabase - Hướng Dẫn Nhanh

## ✅ Bước 1: Chạy Schema SQL

1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** (menu bên trái)
4. Click **New Query**
5. Copy toàn bộ nội dung file `supabase/schema.sql`
6. Paste vào editor
7. Click **Run** (hoặc Ctrl+Enter)
8. Đợi vài giây để tạo tables

✅ **Kiểm tra**: Vào **Table Editor** xem có 8 tables chưa:
- users
- exercise_library
- food_library
- workout_plans
- calendar
- workout_logs
- meal_logs
- body_tracking

## ✅ Bước 2: Cập Nhật Config

**Đã cập nhật tự động!** File `config-supabase.js` đã có thông tin Supabase của bạn.

Bây giờ cần:
1. Backup file cũ:
   ```bash
   mv config.js config-old.js
   ```
2. Đổi tên file mới:
   ```bash
   mv config-supabase.js config.js
   ```

## ✅ Bước 3: Cập Nhật HTML Files

Thêm vào `<head>` của **TẤT CẢ** HTML files (trừ login.html):

```html
<!-- Thêm trước các script khác -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="config.js"></script>
```

**Files cần cập nhật:**
- `index.html`
- `admin.html`
- `workout.html`
- `nutrition.html`
- `schedule.html`
- `profile.html`
- `profile-student.html`

## ✅ Bước 4: Migrate Data

### Option A: Manual (Khuyến nghị cho lần đầu)

1. Export từ Google Sheets (File → Download → CSV)
2. Vào Supabase Dashboard → **Table Editor**
3. Chọn từng table → Click **Insert** → **Import data from CSV**

### Option B: Script (Tự động)

1. Mở Google Apps Script project
2. Tạo file mới: `migrate-data.js`
3. Copy nội dung từ `supabase/migrate-data.js`
4. Chạy từng function:
   - `migrateUsers()`
   - `migrateExercises()`
   - `migrateFoods()`
   - `migrateWorkoutPlans()`
   - `migrateCalendar()`
   - `migrateWorkoutLogs()`
   - `migrateMealLogs()`
   - `migrateBodyTracking()`
5. Hoặc chạy tất cả: `runAllMigrations()`

## ✅ Bước 5: Test

1. Mở `login.html` trong browser
2. Thử login với tài khoản có sẵn
3. Kiểm tra các chức năng:
   - ✅ Dashboard
   - ✅ Exercise/Food library
   - ✅ Workout plans
   - ✅ Calendar
   - ✅ Log workout/meal

## 🔧 Troubleshooting

### Lỗi "API not initialized"
- Mở browser console (F12)
- Kiểm tra có lỗi load script không
- Đảm bảo Supabase CDN load được

### Lỗi "Failed to fetch"
- Kiểm tra CORS trong Supabase Settings → API
- Đảm bảo URL đúng: `https://opjagtkygfgiokuaveje.supabase.co`

### Lỗi RLS Policy
- Tạm thời disable RLS để test:
  ```sql
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE workout_plans DISABLE ROW LEVEL SECURITY;
  -- ... các bảng khác
  ```

### Data không hiển thị
- Kiểm tra data đã migrate chưa
- Kiểm tra Table Editor xem có data không
- Kiểm tra browser console có lỗi không

## 📝 Checklist

- [ ] Đã chạy schema.sql trong Supabase
- [ ] Đã đổi tên config-supabase.js → config.js
- [ ] Đã backup config.js cũ
- [ ] Đã thêm Supabase script vào HTML files
- [ ] Đã migrate data (manual hoặc script)
- [ ] Đã test login
- [ ] Đã test các chức năng chính

## 🎉 Hoàn Thành!

Sau khi hoàn thành tất cả bước, ứng dụng sẽ chạy trên Supabase!

**Lưu ý**: 
- Google Apps Script vẫn hoạt động (backup)
- Có thể rollback bằng cách đổi lại config.js
- RLS policies tạm thời permissive, sẽ update sau

---

**Cần hỗ trợ?** Check `supabase/migration-guide.md` để xem chi tiết hơn.

