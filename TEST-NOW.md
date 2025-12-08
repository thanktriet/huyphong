# 🚀 Test Ngay Bây Giờ!

## ✅ Đã Sẵn Sàng

- [x] Supabase đã kết nối
- [x] Schema đã chạy
- [x] Sample data đã có
- [x] RLS đã fix
- [x] Login.html đã update

## 🧪 Cách Test

### Option 1: Test Login Trực Tiếp (Khuyến nghị)

1. **Mở `login.html`** trong browser
2. **Login với:**
   ```
   Email: student1@test.com
   Password: 123456
   ```
3. **Kết quả:**
   - ✅ Thành công → Redirect đến dashboard
   - ❌ Thất bại → Xem console (F12) để debug

### Option 2: Quick Test Page

1. **Mở `quick-test-run.html`**
2. Page sẽ tự động test:
   - Connection
   - Query Users
   - Query Exercises
   - Query Foods
   - Login

### Option 3: Test Từng Bước

1. **Test Connection:** `test-supabase.html`
2. **Test Login:** `test-simple-login.html`
3. **Verify RLS:** `verify-rls-fixed.html`

## 📋 Test Accounts

| Email | Password | Expected Result |
|-------|----------|----------------|
| `student1@test.com` | `123456` | ✅ Login → Dashboard với 10 buổi |
| `admin@huyphong.com` | `123456` | ✅ Login → Dashboard với nút Admin |
| `pt@huyphong.com` | `123456` | ✅ Login → Dashboard với nút Admin |

## 🎯 Test Checklist

Sau khi login thành công:

- [ ] Dashboard hiển thị đúng
- [ ] Workout page có giáo án
- [ ] Nutrition page có món ăn
- [ ] Schedule page có lịch
- [ ] Profile page có history

## 🐛 Nếu Có Lỗi

### "API not initialized"
→ Refresh trang, kiểm tra console

### "Failed to fetch"
→ Kiểm tra Supabase connection

### "Login failed"
→ Kiểm tra email/password đúng chưa

---

**Bắt đầu test ngay!** 🚀

