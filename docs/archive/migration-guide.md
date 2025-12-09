# Migration Guide: Google Apps Script → Supabase

## Bước 1: Tạo Supabase Project

1. Truy cập [supabase.com](https://supabase.com)
2. Đăng ký/Đăng nhập
3. Tạo project mới
4. Lưu lại:
   - Project URL
   - Anon Key (Settings → API)

## Bước 2: Chạy SQL Schema

1. Vào Supabase Dashboard → SQL Editor
2. Copy toàn bộ nội dung file `schema.sql`
3. Chạy query để tạo tables và policies

## Bước 3: Cấu hình Frontend

1. Mở file `config-supabase.js`
2. Thay thế:
   ```javascript
   SUPABASE_URL: 'YOUR_SUPABASE_URL',
   SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
   ```
   bằng thông tin thực tế từ Supabase

3. Đổi tên `config.js` → `config-old.js` (backup)
4. Đổi tên `config-supabase.js` → `config.js`

## Bước 4: Cập nhật HTML Files

Thêm vào `<head>` của tất cả HTML files (trừ login.html):

```html
<script src="config.js"></script>
```

Hoặc thay thế:
```html
<script src="config.js"></script>
```
bằng:
```html
<script src="config-supabase.js"></script>
```

## Bước 5: Migrate Dữ Liệu

### Option 1: Manual Migration (Khuyến nghị cho lần đầu)

1. Export data từ Google Sheets
2. Vào Supabase Dashboard → Table Editor
3. Import từng bảng

### Option 2: Script Migration

Chạy script `migrate-data.js` (sẽ tạo sau) để tự động migrate.

## Bước 6: Test

1. Test login/register
2. Test các chức năng chính:
   - Admin dashboard
   - Exercise/Food management
   - Workout plans
   - Calendar
   - Workout/Nutrition logs

## Bước 7: Authentication Setup

Supabase có Auth riêng. Có 2 cách:

### Cách 1: Dùng Supabase Auth (Khuyến nghị)
- Bảo mật tốt hơn
- Có email verification, password reset
- Cần migrate users sang Supabase Auth

### Cách 2: Giữ password trong users table (Tạm thời)
- Dễ migrate hơn
- Ít bảo mật hơn
- Code hiện tại đã hỗ trợ

## Lưu Ý

1. **RLS Policies**: Đã được setup trong schema.sql
2. **Indexes**: Đã được tạo để tối ưu performance
3. **Data Types**: 
   - Dates: DATE type (không phải TIMESTAMP)
   - Numbers: NUMERIC(10,2) cho calories, weight, etc.
4. **Foreign Keys**: Đã setup CASCADE delete

## Troubleshooting

### Lỗi RLS Policy
- Kiểm tra user đã login chưa
- Kiểm tra role trong users table
- Tạm thời disable RLS để test: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### Lỗi Connection
- Kiểm tra SUPABASE_URL và SUPABASE_ANON_KEY
- Kiểm tra CORS settings trong Supabase
- Kiểm tra network tab trong browser console

### Lỗi Data Type
- Đảm bảo dates format: YYYY-MM-DD
- Numbers phải là số, không phải string

## Rollback Plan

Nếu cần rollback:
1. Đổi lại `config.js` → `config-supabase.js`
2. Restore `config-old.js` → `config.js`
3. Google Apps Script vẫn hoạt động bình thường

