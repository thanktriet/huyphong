// =======================================================
// SCHEDULE PAGE LOGIC
// =======================================================

const SchedulePage = {
    user: null,
    schedule: [],
    currentTab: 'upcoming',

    async init() {
        this.user = AuthService.getCurrentUser();
        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }

        await this.loadSchedule();
    },

    async loadSchedule() {
        try {
            Loader.showIn('schedule-list', 'Đang tải lịch trình...');
            
            const result = await CalendarService.getSchedule(true);
            
            if (result.success) {
                this.schedule = result.data || [];
                this.renderSchedule();
            } else {
                Toast.error('Lỗi tải lịch trình');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hideIn('schedule-list');
        }
    },

    renderSchedule() {
        const container = document.getElementById('schedule-list');
        const nextContainer = document.getElementById('next-session-container');
        
        // Filter by current user
        const user = AuthService.getCurrentUser();
        const userSchedule = this.schedule.filter(item => item.userId === user.id);
        
        if (userSchedule.length === 0) {
            container.innerHTML = `
                <div class="text-center py-10 text-slate-400">
                    <i data-lucide="calendar-x" class="w-12 h-12 mx-auto mb-3 opacity-20"></i>
                    <p>Chưa có lịch hẹn nào.</p>
                </div>
            `;
            nextContainer.innerHTML = `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center py-8">
                    <i data-lucide="calendar-off" class="w-12 h-12 mx-auto mb-3 text-slate-300"></i>
                    <p class="text-slate-400 text-sm">Chưa có buổi tập sắp tới</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Filter by tab
        const now = new Date();
        let filtered = [];
        
        if (this.currentTab === 'upcoming') {
            filtered = userSchedule.filter(e => {
                const t = new Date(e.date + 'T' + e.time);
                return e.status === 'Upcoming' && t >= now;
            });
        } else {
            filtered = userSchedule.filter(e => {
                const t = new Date(e.date + 'T' + e.time);
                return e.status !== 'Upcoming' || t < now;
            }).reverse();
        }

        // Group by date
        const grouped = {};
        const today = new Date().toISOString().slice(0, 10);
        let nextSession = null;

        filtered.forEach(item => {
            const date = item.date;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(item);

            // Find next upcoming session
            if (!nextSession && item.status === 'Upcoming' && date >= today) {
                nextSession = item;
            }
        });

        // Render next session
        if (nextSession) {
            const dateObj = new Date(nextSession.date);
            const dateStr = dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
            
            nextContainer.innerHTML = `
                <div class="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 relative overflow-hidden">
                    <i data-lucide="calendar-clock" class="absolute right-[-10px] top-[-10px] w-24 h-24 text-white opacity-10 rotate-12"></i>
                    <div class="relative z-10">
                        <p class="text-blue-100 text-sm font-medium mb-1">Buổi tập tiếp theo</p>
                        <h2 class="text-2xl font-bold mb-2">${dateStr}</h2>
                        <div class="flex items-center gap-2 text-blue-100 text-sm">
                            <i data-lucide="clock" class="w-4 h-4"></i>
                            <span>${nextSession.time}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            nextContainer.innerHTML = `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center py-8">
                    <i data-lucide="calendar-off" class="w-12 h-12 mx-auto mb-3 text-slate-300"></i>
                    <p class="text-slate-400 text-sm">Chưa có buổi tập sắp tới</p>
                </div>
            `;
        }

        // Render schedule list
        const dates = Object.keys(grouped).sort();
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="text-center text-slate-400 py-10 text-sm opacity-60">Danh sách trống.</div>';
            lucide.createIcons();
            return;
        }
        
        container.innerHTML = dates.map(date => {
            const dateObj = new Date(date);
            const dateStr = dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
            const items = grouped[date];

            return `
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                    <div class="bg-slate-50 px-4 py-3 border-b border-slate-100">
                        <h3 class="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <i data-lucide="calendar" class="w-4 h-4 text-blue-500"></i>
                            ${dateStr}
                        </h3>
                    </div>
                    <div class="divide-y divide-slate-50">
                        ${items.map(item => {
                            const statusColors = {
                                'Upcoming': 'bg-blue-50 text-blue-700 border-blue-200',
                                'Completed': 'bg-green-50 text-green-700 border-green-200',
                                'Cancelled': 'bg-red-50 text-red-700 border-red-200'
                            };
                            const statusText = {
                                'Upcoming': 'Sắp tới',
                                'Completed': 'Hoàn thành',
                                'Cancelled': 'Đã hủy'
                            };
                            const color = statusColors[item.status] || 'bg-slate-50 text-slate-700 border-slate-200';
                            const text = statusText[item.status] || item.status;

                            return `
                                <div class="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                    <div class="flex items-center gap-3">
                                        <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                            <i data-lucide="clock" class="w-6 h-6 text-blue-600"></i>
                                        </div>
                                        <div>
                                            <div class="font-bold text-slate-800">${item.time}</div>
                                            <div class="text-xs text-slate-500">Buổi tập</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="px-3 py-1 rounded-lg text-xs font-bold border ${color}">${text}</span>
                                        ${item.status === 'Upcoming' ? `
                                            <button onclick="SchedulePage.cancelSession('${item.id}')" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hủy">
                                                <i data-lucide="x" class="w-5 h-5"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    },

    async cancelSession(bookingId) {
        if (!confirm('Bạn có chắc muốn hủy buổi tập này?')) return;

        try {
            Loader.show();
            const result = await CalendarService.cancelSession(bookingId);
            
            if (result.success) {
                Toast.success('Đã hủy buổi tập');
                await this.loadSchedule();
            } else {
                Toast.error(result.message || 'Lỗi hủy buổi tập');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    }
};

window.SchedulePage = SchedulePage;

