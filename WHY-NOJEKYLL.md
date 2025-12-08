# 📝 Tại sao cần file .nojekyll?

## ✅ File .nojekyll là gì?

File `.nojekyll` là một file đặc biệt cho GitHub Pages. Khi file này tồn tại trong root directory, GitHub Pages sẽ **bỏ qua Jekyll processing**.

## 🔍 Tại sao cần thiết?

### 1. **Bỏ qua Jekyll Processing**
- GitHub Pages mặc định sử dụng Jekyll để build site
- Jekyll có thể gây lỗi với một số file/folder
- `.nojekyll` báo cho GitHub Pages biết: "Không dùng Jekyll, serve files trực tiếp"

### 2. **Tránh lỗi với files bắt đầu bằng `_`**
- Jekyll bỏ qua các file/folder bắt đầu bằng `_`
- Nếu có file `_config.js` hoặc folder `_includes`, Jekyll sẽ không serve chúng
- `.nojekyll` đảm bảo tất cả files được serve đúng

### 3. **Đảm bảo JavaScript files được load đúng**
- Jekyll có thể modify hoặc minify JavaScript files
- `.nojekyll` đảm bảo files được serve nguyên bản

## ✅ Đã tạo file

File `.nojekyll` đã được tạo và commit vào repository.

## 📋 Checklist

- [x] File `.nojekyll` đã tồn tại
- [x] File đã được commit
- [x] File đã được push lên GitHub

## 🚀 Sau khi có .nojekyll

1. GitHub Pages sẽ serve files trực tiếp
2. Không có Jekyll processing
3. Tất cả files sẽ được serve đúng
4. JavaScript files sẽ load đúng

## 📝 Note

File `.nojekyll` là một file rỗng (empty file). Chỉ cần tồn tại là đủ, không cần nội dung.

