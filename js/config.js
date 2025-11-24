// js/config.js
const CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbyDv_79EPDM3BzzbYOXevQrocyh60o-qzU63U3N5p7gIuSD2tWhEVKnO1lR7qAJ6qsS/exec", // Thay link của bạn vào đây
    APP_NAME: "PT Manager"
};

// Hàm gọi API dùng chung (cho gọn code các trang khác)
async function callAPI(action, data = {}) {
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify({ action, data })
        });
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        alert("Lỗi kết nối Server!");
        return { success: false };
    }
}
