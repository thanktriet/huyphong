# 🧪 Hướng Dẫn Test Supabase Connection

## Cách 1: Dùng Test Page (Khuyến nghị)

1. **Mở file test:**
   ```bash
   open test-supabase.html
   ```
   Hoặc mở file `test-supabase.html` trong browser

2. **Xem kết quả:**
   - Page sẽ tự động chạy tất cả tests
   - Mỗi section sẽ hiển thị ✅ (success) hoặc ❌ (error)
   - Click "Run All Tests" để chạy lại

3. **Kiểm tra các phần:**
   - ✅ Configuration: Supabase URL và Key
   - ✅ Database Connection: Kết nối database
   - ✅ Tables Check: Kiểm tra 8 tables
   - ✅ Sample Data: Kiểm tra data đã import chưa
   - ✅ API Functions: Test API functions
   - ✅ Login Test: Test login với sample account

## Cách 2: Test Manual trong Browser Console

1. **Mở browser console** (F12)

2. **Test connection:**
   ```javascript
   // Load Supabase
   const script = document.createElement('script');
   script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
   document.head.appendChild(script);
   
   script.onload = async () => {
       const supabase = window.supabase.createClient(
           'https://opjagtkygfgiokuaveje.supabase.co',
           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM'
       );
       
       // Test query
       const { data, error } = await supabase.from('users').select('*').limit(1);
       console.log('Result:', data, error);
   };
   ```

## Cách 3: Test trong Supabase Dashboard

1. **Vào Supabase Dashboard:**
   - https://supabase.com/dashboard/project/opjagtkygfgiokuaveje

2. **Kiểm tra SQL Editor:**
   - Vào SQL Editor
   - Chạy query: `SELECT COUNT(*) FROM users;`
   - Nếu có kết quả → Database OK

3. **Kiểm tra Table Editor:**
   - Vào Table Editor
   - Xem các tables: users, exercise_library, food_library, etc.
   - Nếu có data → Sample data đã import

## Cách 4: Test với Login Page

1. **Mở login.html:**
   ```bash
   open login.html
   ```

2. **Test login:**
   - Email: `student1@test.com`
   - Password: `123456`
   - Nếu login thành công → Supabase connection OK

## Troubleshooting

### ❌ "Failed to fetch"
- **Nguyên nhân:** CORS hoặc network error
- **Fix:** Kiểm tra Supabase Settings → API → CORS settings

### ❌ "relation does not exist"
- **Nguyên nhân:** Schema chưa chạy
- **Fix:** Chạy `supabase/schema.sql` trong SQL Editor

### ❌ "No data"
- **Nguyên nhân:** Sample data chưa import
- **Fix:** Chạy `supabase/sample-data.sql` trong SQL Editor

### ❌ "Invalid API key"
- **Nguyên nhân:** Key sai hoặc expired
- **Fix:** Kiểm tra lại Anon Key trong Supabase Settings

### ❌ "RLS Policy Error"
- **Nguyên nhân:** Row Level Security chặn query
- **Fix:** Tạm disable RLS hoặc update policies

## Expected Results

Sau khi test thành công, bạn sẽ thấy:

✅ **Configuration:** URL và Key đúng
✅ **Connection:** Kết nối database thành công
✅ **Tables:** 8 tables đều OK
✅ **Sample Data:** 
   - Users: 7 users
   - Exercises: 10 exercises
   - Foods: 15 foods
✅ **API Functions:** getAllExercises, getAllFoods hoạt động
✅ **Login:** Login với student1@test.com thành công

## Next Steps

Sau khi test thành công:
1. ✅ Commit code lên Git
2. ✅ Update HTML files để load Supabase
3. ✅ Deploy và test production

