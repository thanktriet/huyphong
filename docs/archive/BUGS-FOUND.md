# 🐛 Bugs & Issues Found

## ❌ Critical Bugs

### 1. **Login Function - Supabase Auth Conflict**
**File:** `supabase/api.js` (dòng 12-59)
**Vấn đề:** Function đang dùng `supabase.auth.signInWithPassword()` nhưng:
- Code gốc chỉ check password trong `users` table
- Users chưa được migrate sang Supabase Auth
- Sẽ fail khi login với users từ sample data

**Fix:** Cần sửa để check password trực tiếp trong users table (như code gốc)

```javascript
// HIỆN TẠI (SAI):
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
});

// CẦN SỬA THÀNH:
const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)  // Check password trực tiếp
    .single();
```

### 2. **Variable Name Mismatch - nutrition.html**
**File:** `nutrition.html` (dòng 331)
**Vấn đề:** Dùng `USER.id` nhưng biến là `user` (chữ thường)

```javascript
// HIỆN TẠI (SAI):
userId: USER.id,  // USER không tồn tại

// CẦN SỬA THÀNH:
userId: user.id,  // user đã được định nghĩa ở dòng 159
```

## ⚠️ Potential Issues

### 3. **Column Name Mismatch - meal_logs**
**File:** `supabase/api.js` (dòng 856-858, 884-886, 918-920)
**Vấn đề:** Code dùng `carb` nhưng schema có thể là `carb` hoặc `carbohydrate`

**Kiểm tra schema:**
- Schema dùng: `carb NUMERIC(10,2)`
- Code dùng: `meal.carb`
- ✅ **OK** - Không có vấn đề

### 4. **Date Format - getDailyMacros**
**File:** `supabase/api.js` (dòng 868-897)
**Vấn đề:** So sánh date có thể không chính xác nếu timezone khác

**Hiện tại:**
```javascript
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
.eq('date', today)
```

**Có thể cần:**
- Đảm bảo date trong DB là DATE type (không có time)
- Hoặc dùng date range query

### 5. **Register Function - Supabase Auth**
**File:** `supabase/api.js` (dòng 61-97)
**Vấn đề:** Tương tự login, đang tạo user trong Supabase Auth nhưng:
- Users chưa migrate
- Password không được hash
- Có thể conflict

**Fix:** Tạm thời bỏ qua Supabase Auth, chỉ insert vào users table

### 6. **getTemplates - Logic Check**
**File:** `supabase/api.js` (dòng 470-490)
**Vấn đề:** Query templates bằng `user_id = 'TEMPLATE'` nhưng:
- Cần đảm bảo user 'TEMPLATE' tồn tại
- ✅ **OK** - Đã có trong sample-data.sql

### 7. **saveWorkoutPlan - Image Field**
**File:** `supabase/api.js` (dòng 500-510)
**Vấn đề:** Code dùng `d.video || d.image` nhưng:
- Schema có field `image`
- Code gốc có thể dùng `video`
- ✅ **OK** - Đã handle cả 2

## ✅ Fixed Issues

### 8. **Sample Data - Foreign Key**
**File:** `supabase/sample-data.sql`
**Status:** ✅ **FIXED** - Đã thêm user 'TEMPLATE'

### 9. **Sample Data - Duplicate Keys**
**File:** `supabase/sample-data.sql`
**Status:** ✅ **FIXED** - Đã thêm ON CONFLICT DO NOTHING

## 📝 Recommendations

1. **Tạm thời disable Supabase Auth** cho login/register
2. **Sửa nutrition.html** variable name
3. **Test tất cả functions** với sample data
4. **Thêm error handling** tốt hơn
5. **Log errors** để debug dễ hơn

## 🔧 Priority Fix Order

1. **HIGH:** Fix login function (không dùng Supabase Auth)
2. **HIGH:** Fix nutrition.html USER.id → user.id
3. **MEDIUM:** Fix register function
4. **LOW:** Improve error messages
5. **LOW:** Add logging

