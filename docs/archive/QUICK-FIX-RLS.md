# 🔧 Quick Fix: RLS Infinite Recursion

## ❌ Lỗi
```
infinite recursion detected in policy for relation "users"
```

## 🔍 Nguyên Nhân
Policy `"PT can manage users"` đang query lại table `users` trong khi check policy:
```sql
EXISTS (SELECT 1 FROM users WHERE ...)  -- ❌ Query lại users → recursion
```

## ✅ Cách Sửa

### Option 1: Chạy Fix Script (Khuyến nghị)

1. Vào Supabase Dashboard → SQL Editor
2. Copy và chạy file `supabase/fix-rls-recursion.sql`
3. ✅ Done!

### Option 2: Disable RLS Tạm Thời

Nếu muốn test nhanh, có thể tạm disable RLS:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_tracking DISABLE ROW LEVEL SECURITY;
```

⚠️ **Lưu ý:** Chỉ dùng để test, không dùng trong production!

### Option 3: Update Schema

File `schema.sql` đã được sửa. Nếu chưa chạy schema, chạy lại:
- Schema mới không có recursion issue
- Policies đơn giản hơn (cho phép tất cả tạm thời)

## 🧪 Test Sau Khi Fix

1. Chạy lại `test-supabase.html`
2. Hoặc test trong browser console:
   ```javascript
   const { data, error } = await supabase.from('users').select('*').limit(1);
   console.log(data, error);
   ```

## 📝 Notes

- **Tạm thời:** Policies cho phép tất cả để dễ test
- **Sau này:** Sẽ update policies khi có Supabase Auth
- **Security:** Trong production cần setup RLS đúng cách

