# 🔧 Fix 406 Error

## Vấn đề
Lỗi 406 (Not Acceptable) xảy ra khi Supabase client chưa được khởi tạo đúng cách.

## Nguyên nhân
1. Supabase library chưa load xong khi tạo client
2. Script `supabase/api.js` được load trước khi client sẵn sàng
3. Thứ tự khởi tạo không đúng

## Giải pháp đã áp dụng

### 1. Cải thiện thứ tự khởi tạo trong `api.js`
- Đợi Supabase library load xong
- Đợi 100ms để đảm bảo library sẵn sàng
- Kiểm tra client đã được tạo chưa
- Load `supabase/api.js` sau khi client sẵn sàng

### 2. Sử dụng `getSupabase()` function
- `supabase/api.js` sử dụng `getSupabase()` thay vì truy cập trực tiếp
- Đảm bảo client đã được khởi tạo trước khi sử dụng

### 3. Error handling
- Thêm try-catch trong `API.init()`
- Log lỗi chi tiết để debug
- Throw error rõ ràng nếu khởi tạo thất bại

## Cách test

1. Mở browser console (F12)
2. Kiểm tra:
   - `window.supabase` có tồn tại không
   - `window.supabaseClient` có tồn tại không
   - `window.supabaseAPI` có tồn tại không

3. Nếu vẫn lỗi, kiểm tra:
   - Network tab xem request nào bị 406
   - CORS settings trong Supabase Dashboard
   - Supabase URL và Anon Key có đúng không

## Lưu ý
- Đảm bảo Supabase project đã enable CORS cho domain của bạn
- Kiểm tra RLS policies không chặn requests
- Đảm bảo Supabase URL và Anon Key đúng

