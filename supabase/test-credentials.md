# 🔐 Test Credentials

Sau khi chạy `sample-data.sql`, bạn có thể dùng các tài khoản sau để test:

## 👨‍💼 Admin & PT

| Email | Password | Role | Mô tả |
|-------|----------|------|-------|
| `admin@huyphong.com` | `123456` | Admin | Quản trị viên - Full access |
| `pt@huyphong.com` | `123456` | PT | Huấn luyện viên - Quản lý học viên |

## 👨‍🎓 Students

| Email | Password | Role | Gói Tập | Trạng Thái |
|-------|----------|------|---------|------------|
| `student1@test.com` | `123456` | Student | 10 buổi | Active |
| `student2@test.com` | `123456` | Student | 5 buổi | Active |
| `student3@test.com` | `123456` | Student | Gói tháng (30 ngày) | Active |
| `student4@test.com` | `123456` | Student | 0 buổi | Inactive |

## 📊 Sample Data Overview

### Exercises (10 bài)
- Ngực: Bench Press
- Chân: Squat, Leg Press
- Lưng: Deadlift, Pull Up
- Vai: Shoulder Press
- Tay: Bicep Curl, Tricep Extension
- Bụng: Plank
- Cardio: Running

### Foods (15 món)
- Cơm, Phở, Bún bò, Cơm tấm
- Thịt heo, Thịt gà, Cá hồi
- Trứng, Sữa, Yogurt
- Chuối, Táo, Rau xanh

### Workout Plans
- 2 Templates: "Tăng Cơ Cơ Bản", "Giảm Mỡ"
- 2 Plans cho học viên: Student 1 và Student 2

### Calendar
- 4 lịch sắp tới (Upcoming)
- 2 lịch đã hoàn thành (Completed)

### Workout Logs
- Student 1: 6 sets từ 2 ngày trước
- Student 2: 4 sets từ 1 ngày trước

### Meal Logs (Hôm nay)
- Student 1: 8 món (Sáng, Trưa, Tối, Phụ) - ~1,870 kcal
- Student 2: 6 món (Sáng, Trưa, Tối, Phụ) - ~1,647 kcal

### Body Tracking
- Student 1: 4 records (30 ngày qua: 70.5kg → 69.0kg, 85cm → 82cm)
- Student 2: 4 records (30 ngày qua: 65.0kg → 63.5kg, 75cm → 72cm)

## 🧪 Test Scenarios

### 1. Test Login
- Login với `student1@test.com` / `123456`
- Kiểm tra dashboard hiển thị 10 buổi còn lại

### 2. Test Admin Dashboard
- Login với `admin@huyphong.com` / `123456`
- Kiểm tra stats: 4 students, 3 active, X sessions today

### 3. Test Workout
- Login với `student1@test.com`
- Vào Workout page
- Kiểm tra có giáo án "Giáo Án Tăng Cơ" với các ngày Thứ 2, 4, 6

### 4. Test Nutrition
- Login với `student1@test.com`
- Vào Nutrition page
- Kiểm tra có 8 món ăn hôm nay, tổng ~1,870 kcal

### 5. Test Calendar
- Login với `student1@test.com`
- Vào Schedule page
- Kiểm tra có 2 lịch sắp tới

### 6. Test Profile
- Login với `student1@test.com`
- Vào Profile page
- Kiểm tra workout history, nutrition history, body tracking

## ⚠️ Lưu Ý

1. **Passwords**: Tất cả là `123456` (plain text, sẽ hash sau khi migrate sang Supabase Auth)
2. **Dates**: Dùng `CURRENT_DATE` nên sẽ tự động lấy ngày hiện tại
3. **Calories**: Đã tính sẵn, có thể không chính xác 100%
4. **Images**: Links example, cần thay bằng link thật

## 🔄 Reset Data

Nếu muốn reset về sample data:
1. Xóa tất cả data trong các tables
2. Chạy lại `sample-data.sql`

Hoặc dùng SQL:
```sql
TRUNCATE TABLE body_tracking, meal_logs, workout_logs, calendar, workout_plans, food_library, exercise_library, users CASCADE;
```
Sau đó chạy lại `sample-data.sql`

