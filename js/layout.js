// js/layout.js

function renderBottomNav(activePage) {
    // Danh sách các menu
    const menus = [
        { id: 'home', label: 'Home', icon: 'home', link: 'index.html' },
        { id: 'workout', label: 'Tập', icon: 'dumbbell', link: 'workout.html' },
        { id: 'nutrition', label: 'Ăn', icon: 'utensils', link: 'nutrition.html' }, // Trang sắp làm
        { id: 'schedule', label: 'Lịch', icon: 'calendar', link: '#' },
        { id: 'profile', label: 'Thoát', icon: 'log-out', action: 'logout()' } // Nút thoát đặc biệt
    ];

    let html = `
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div class="max-w-md mx-auto flex justify-around items-center h-16">`;

    menus.forEach(item => {
        // Kiểm tra xem trang hiện tại có trùng với menu này không để tô màu xanh
        const isActive = activePage === item.id;
        const colorClass = isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600";
        const clickAttr = item.action ? `onclick="${item.action}"` : `href="${item.link}"`;
        
        // Dùng thẻ <a> hoặc <button> tùy vào có action hay không
        const tag = item.action ? 'button' : 'a';

        html += `
            <${tag} ${clickAttr} class="flex flex-col items-center justify-center w-full h-full ${colorClass} transition-colors">
                <i data-lucide="${item.icon}" class="w-6 h-6"></i>
                <span class="text-[10px] font-medium mt-1">${item.label}</span>
            </${tag}>
        `;
    });

    html += `</div></div>`;

    // Chèn vào cuối body
    document.body.insertAdjacentHTML('beforeend', html);
    
    // Kích hoạt lại icon Lucide (vì HTML mới được thêm vào sau)
    if(window.lucide) lucide.createIcons();
}
