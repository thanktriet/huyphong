# Lưu Ý Về Row Level Security (RLS)

## Hiện Tại

RLS policies đã được setup nhưng **tạm thời cho phép tất cả** để dễ test và migrate.

## Sau Khi Migration Thành Công

Cần update RLS policies để bảo mật đúng cách:

### Option 1: Dùng Supabase Auth (Khuyến nghị)

1. Migrate users sang Supabase Auth
2. Update policies để dùng `auth.uid()`
3. Frontend sẽ dùng `supabase.auth.signInWithPassword()`

### Option 2: Custom JWT

1. Tạo custom JWT với user_id
2. Set trong request headers
3. Policies sẽ check `current_setting('request.jwt.claims')`

### Option 3: Service Role Key (Chỉ cho Admin/PT)

1. Dùng Service Role Key cho admin functions
2. RLS vẫn hoạt động cho Student
3. Cần setup API routes riêng

## Example: Update Policy Sau Khi Có Auth

```sql
-- Drop old policy
DROP POLICY IF EXISTS "Users can view own plans" ON workout_plans;

-- Create new policy với auth.uid()
CREATE POLICY "Users can view own plans" ON workout_plans FOR SELECT USING (
    user_id = auth.uid()::text OR 
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::text 
        AND role IN ('PT', 'Admin')
    )
);
```

## Tạm Thời: Disable RLS (Chỉ để test)

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans DISABLE ROW LEVEL SECURITY;
-- ... các bảng khác
```

## Bật Lại RLS

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
-- ... các bảng khác
```

