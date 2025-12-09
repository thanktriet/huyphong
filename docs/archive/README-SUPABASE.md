# 🚀 PT Manager - Supabase Migration

## Tổng Quan

Ứng dụng đã được migrate từ **Google Apps Script + Google Sheets** sang **Supabase (PostgreSQL)** để có:
- ⚡ Performance tốt hơn
- 🔒 Bảo mật tốt hơn (RLS)
- 📊 Database thực sự (không phải spreadsheet)
- 🔄 Realtime capabilities
- 📈 Dễ scale hơn

## Cấu Trúc Files

```
huyphong/
├── supabase/
│   ├── schema.sql              # Database schema
│   ├── config.js                # Supabase config
│   ├── api.js                   # API functions
│   ├── api-wrapper.js           # Wrapper tương thích
│   ├── migrate-data.js          # Migration script
│   └── migration-guide.md       # Hướng dẫn chi tiết
├── config-supabase.js           # Config mới (thay config.js)
└── README-SUPABASE.md           # File này
```

## Quick Start

### 1. Setup Supabase

1. Tạo project tại [supabase.com](https://supabase.com)
2. Lấy **URL** và **Anon Key** từ Settings → API

### 2. Chạy Schema

1. Vào Supabase Dashboard → SQL Editor
2. Copy nội dung `supabase/schema.sql`
3. Chạy query

### 3. Cấu Hình Frontend

1. Mở `config-supabase.js`
2. Thay `YOUR_SUPABASE_URL` và `YOUR_SUPABASE_ANON_KEY`
3. Đổi tên file:
   ```bash
   mv config.js config-old.js
   mv config-supabase.js config.js
   ```

### 4. Cập Nhật HTML

Thêm vào `<head>` của các HTML files:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="config.js"></script>
```

### 5. Migrate Data

**Option A: Manual** (Khuyến nghị)
- Export từ Google Sheets
- Import vào Supabase Table Editor

**Option B: Script**
- Mở Google Apps Script
- Copy `supabase/migrate-data.js`
- Chạy từng function hoặc `runAllMigrations()`

## API Changes

### Tương Thích 100%

Code frontend **KHÔNG CẦN THAY ĐỔI**! 

Function `callAPI(action, data)` vẫn hoạt động như cũ:

```javascript
// Vẫn dùng như cũ
const result = await callAPI('login', { email, password });
const students = await callAPI('get_all_students');
```

### Supported Actions

✅ Tất cả actions từ code.gs đã được implement:
- `login`, `register`
- `admin_get_dashboard`, `get_all_students`, etc.
- `get_all_exercises`, `admin_add_exercise`, etc.
- `get_all_foods`, `admin_add_food`, etc.
- `get_all_plans`, `save_workout_plan`, etc.
- `get_schedule`, `book_session`, etc.
- `log_workout`, `get_workout_history`
- `log_meal`, `get_daily_macros`, `get_nutrition_history`
- `log_body_stats`, `get_body_history`

## Database Schema

### Tables

1. **users** - Người dùng (PT, Student, Admin)
2. **exercise_library** - Kho bài tập
3. **food_library** - Kho món ăn
4. **workout_plans** - Giáo án tập
5. **calendar** - Lịch hẹn
6. **workout_logs** - Lịch sử tập
7. **meal_logs** - Lịch sử ăn uống
8. **body_tracking** - Theo dõi cơ thể

### Row Level Security (RLS)

- ✅ PT/Admin: Xem tất cả
- ✅ Student: Chỉ xem dữ liệu của mình
- ✅ Public: Exercise/Food library (read-only)

## Authentication

### Hiện Tại: Password trong users table
- Dễ migrate
- Code đã hỗ trợ

### Tương Lai: Supabase Auth (Khuyến nghị)
- Bảo mật tốt hơn
- Email verification
- Password reset
- OAuth (Google, Facebook, etc.)

## Performance Improvements

| Metric | Google Apps Script | Supabase |
|--------|-------------------|----------|
| API Response | ~500-2000ms | ~50-200ms |
| Concurrent Users | Limited | High |
| Database Queries | Slow | Fast (indexed) |
| Realtime | ❌ | ✅ |

## Troubleshooting

### Lỗi "API not initialized"
- Kiểm tra Supabase client đã load chưa
- Kiểm tra config.js có đúng URL/Key không

### Lỗi RLS Policy
- User phải login trước
- Kiểm tra role trong users table
- Tạm disable RLS để test: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### Lỗi Connection
- Kiểm tra CORS trong Supabase Settings
- Kiểm tra network tab trong browser console

## Rollback

Nếu cần quay lại Google Apps Script:

1. Đổi lại config:
   ```bash
   mv config.js config-supabase.js
   mv config-old.js config.js
   ```

2. Google Apps Script vẫn hoạt động bình thường

## Next Steps

Sau khi migration thành công, có thể:

1. ✅ Thêm Realtime subscriptions
2. ✅ Thêm Storage cho ảnh/video
3. ✅ Thêm Edge Functions
4. ✅ Tích hợp AI/ML
5. ✅ Analytics & Reports

## Support

Nếu gặp vấn đề:
1. Check `migration-guide.md` để xem chi tiết
2. Check Supabase logs trong Dashboard
3. Check browser console để xem errors

---

**Chúc bạn migration thành công! 🎉**

