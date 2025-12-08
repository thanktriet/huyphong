# ⚡ Quick Test Guide

## Bước 1: Chạy Schema (Nếu chưa chạy)

1. Vào Supabase Dashboard → SQL Editor
2. Chạy `schema.sql`
3. Đợi vài giây

## Bước 2: Chạy Sample Data

1. Vào SQL Editor
2. Copy toàn bộ `sample-data.sql`
3. Paste và Run
4. ✅ Done!

## Bước 3: Test Login

Mở `login.html` và thử:

**Admin:**
- Email: `admin@huyphong.com`
- Password: `123456`

**Student:**
- Email: `student1@test.com`
- Password: `123456`

## Bước 4: Test Các Chức Năng

### ✅ Dashboard (index.html)
- Login với student → Xem số buổi còn lại
- Login với admin → Xem nút Admin

### ✅ Admin (admin.html)
- Login với admin hoặc PT
- Xem dashboard stats
- Xem danh sách học viên
- Xem kho bài tập, món ăn
- Xem lịch trình

### ✅ Workout (workout.html)
- Login với student1
- Xem giáo án "Giáo Án Tăng Cơ"
- Có các ngày: Thứ 2, Thứ 4, Thứ 6

### ✅ Nutrition (nutrition.html)
- Login với student1
- Xem 8 món ăn hôm nay
- Tổng ~1,870 kcal

### ✅ Schedule (schedule.html)
- Login với student1
- Xem 2 lịch sắp tới

### ✅ Profile (profile.html)
- Login với student1
- Xem workout history
- Xem nutrition history
- Xem body tracking (4 records)

## 🐛 Nếu Gặp Lỗi

### "API not initialized"
- Kiểm tra browser console (F12)
- Đảm bảo Supabase CDN load được
- Đảm bảo config.js đã load

### "Failed to fetch"
- Kiểm tra CORS trong Supabase Settings
- Kiểm tra URL đúng chưa

### "No data"
- Kiểm tra đã chạy sample-data.sql chưa
- Kiểm tra Table Editor có data không

### RLS Policy Error
- Tạm disable RLS:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_tracking DISABLE ROW LEVEL SECURITY;
```

## ✅ Checklist

- [ ] Đã chạy schema.sql
- [ ] Đã chạy sample-data.sql
- [ ] Đã test login thành công
- [ ] Đã test các chức năng chính
- [ ] Data hiển thị đúng

---

**Xem `test-credentials.md` để biết tất cả test accounts!**

