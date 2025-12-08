# 🔑 Supabase API Key Limitations

## Anon Key vs Service Role Key

### Anon Key (Public Key)
**Quyền hạn:**
- ✅ Query data (SELECT)
- ✅ Insert/Update/Delete data (theo RLS policies)
- ✅ Gọi RPC functions (nếu có)
- ❌ **KHÔNG thể** chạy SQL tùy ý (DDL)
- ❌ **KHÔNG thể** sửa RLS policies
- ❌ **KHÔNG thể** tạo/xóa tables

### Service Role Key (Secret Key)
**Quyền hạn:**
- ✅ Tất cả quyền của Anon Key
- ✅ Bypass RLS policies
- ✅ Có thể chạy SQL (qua Management API)
- ⚠️ **NGUY HIỂM:** Không nên expose trong frontend

## ❌ Tại Sao Không Thể Tự Động Fix?

Với **Anon Key**, tôi **KHÔNG THỂ**:
1. Chạy `DROP POLICY` hoặc `CREATE POLICY`
2. Truy cập system tables (`pg_policies`)
3. Thực thi DDL statements

## ✅ Giải Pháp

### Option 1: SQL Editor (Khuyến nghị)
- Vào Supabase Dashboard
- SQL Editor
- Chạy SQL trực tiếp

### Option 2: Service Role Key (Không khuyến nghị)
- Có thể dùng để chạy SQL qua API
- ⚠️ **RẤT NGUY HIỂM** nếu expose trong frontend
- Chỉ dùng trong backend/server

### Option 3: Supabase CLI
- Cài đặt Supabase CLI
- Login và chạy SQL từ terminal
- An toàn hơn

## 🧪 Test API Access

Mở file `test-api-access.html` để test xem Anon Key có thể làm gì.

## 📝 Kết Luận

**Anon Key chỉ dùng để:**
- Query data
- Insert/Update data (theo RLS)
- Gọi functions

**Để sửa RLS policies, cần:**
- SQL Editor (dễ nhất)
- Service Role Key + Management API (phức tạp)
- Supabase CLI (cần setup)

