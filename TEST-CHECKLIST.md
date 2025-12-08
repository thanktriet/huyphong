# ✅ Test Checklist - Supabase Migration

## 🎯 Trước Khi Test

- [x] Đã chạy `schema.sql` trong Supabase
- [x] Đã chạy `sample-data.sql` để có test data
- [x] Đã fix RLS recursion error
- [x] Đã update `login.html` để dùng Supabase

## 🔐 Test 1: Login

### Test Accounts:
- **Admin:** `admin@huyphong.com` / `123456`
- **PT:** `pt@huyphong.com` / `123456`
- **Student:** `student1@test.com` / `123456`

### Steps:
1. Mở `login.html`
2. Login với một trong các accounts trên
3. ✅ Nếu redirect đến `index.html` → Success!

### Expected:
- Login thành công
- Redirect đến dashboard
- User info được lưu trong localStorage

---

## 🏠 Test 2: Dashboard (index.html)

### Steps:
1. Sau khi login, vào dashboard
2. Kiểm tra:
   - [ ] Hiển thị tên user
   - [ ] Hiển thị số buổi còn lại (hoặc gói tháng)
   - [ ] Có nút "Khu Vực Quản Trị" (nếu là Admin/PT)

### Expected:
- Dashboard load được
- Thông tin user hiển thị đúng
- Các nút navigation hoạt động

---

## 💪 Test 3: Workout (workout.html)

### Steps:
1. Vào trang Workout
2. Kiểm tra:
   - [ ] Hiển thị giáo án tập (nếu có)
   - [ ] Có các tabs theo ngày (Thứ 2, 4, 6...)
   - [ ] Có thể nhập weight và reps
   - [ ] Có thể check set đã hoàn thành
   - [ ] Có thể lưu buổi tập

### Expected:
- Student 1: Có giáo án "Giáo Án Tăng Cơ"
- Student 2: Có giáo án "Giáo Án Giảm Mỡ"
- Có thể log workout và lưu

---

## 🍽️ Test 4: Nutrition (nutrition.html)

### Steps:
1. Vào trang Nutrition
2. Kiểm tra:
   - [ ] Hiển thị calories và macros hôm nay
   - [ ] Có thể search món ăn
   - [ ] Có thể thêm món vào bữa
   - [ ] Có thể nhập manual calories
   - [ ] Hiển thị nhật ký ăn uống hôm nay

### Expected:
- Student 1: Có 8 món ăn hôm nay (~1,870 kcal)
- Student 2: Có 6 món ăn hôm nay (~1,647 kcal)
- Có thể thêm món mới

---

## 📅 Test 5: Schedule (schedule.html)

### Steps:
1. Vào trang Schedule
2. Kiểm tra:
   - [ ] Hiển thị lịch sắp tới
   - [ ] Hiển thị lịch sử
   - [ ] Có thể cancel session (nếu là student)

### Expected:
- Student 1: Có 2 lịch sắp tới
- Hiển thị đúng ngày giờ

---

## 👤 Test 6: Profile (profile.html)

### Steps:
1. Vào trang Profile
2. Kiểm tra:
   - [ ] Hiển thị thông tin user
   - [ ] Hiển thị workout history
   - [ ] Hiển thị nutrition history
   - [ ] Hiển thị body tracking

### Expected:
- Có lịch sử tập luyện
- Có lịch sử ăn uống
- Có body tracking data

---

## 👨‍💼 Test 7: Admin (admin.html)

### Steps:
1. Login với Admin hoặc PT account
2. Vào Admin page
3. Kiểm tra:
   - [ ] Dashboard stats hiển thị
   - [ ] Danh sách học viên
   - [ ] Kho bài tập
   - [ ] Kho món ăn
   - [ ] Lịch trình
   - [ ] Có thể tạo giáo án

### Expected:
- Stats: 4 students, 3 active
- Có thể CRUD exercises, foods
- Có thể tạo và giao giáo án

---

## 🐛 Nếu Gặp Lỗi

### "API not initialized"
- Refresh trang
- Kiểm tra browser console
- Đảm bảo Supabase scripts load được

### "Failed to fetch"
- Kiểm tra CORS trong Supabase Settings
- Kiểm tra network tab

### "No data"
- Kiểm tra đã chạy sample-data.sql chưa
- Kiểm tra Table Editor có data không

### "RLS Policy Error"
- Đã fix chưa? Chạy `fix-rls-simple.sql`

---

## ✅ Success Criteria

Tất cả tests pass nếu:
- ✅ Login thành công
- ✅ Dashboard hiển thị đúng
- ✅ Workout có thể log và lưu
- ✅ Nutrition có thể thêm món
- ✅ Schedule hiển thị lịch
- ✅ Profile hiển thị history
- ✅ Admin có thể quản lý

---

**Sau khi test xong, báo kết quả!** 🚀

