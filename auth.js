// js/auth.js
function checkLogin() {
    const userJson = localStorage.getItem('pt_user');
    if (!userJson) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userJson);
}

function logout() {
    if(confirm('Bạn muốn đăng xuất?')) {
        localStorage.removeItem('pt_user');
        window.location.href = 'login.html';
    }
}

// Tự động chạy kiểm tra khi file này được nhúng (trừ trang login)
if (!window.location.pathname.includes('login.html')) {
    window.USER = checkLogin(); // Lưu biến USER toàn cục để trang nào cũng dùng được
}
