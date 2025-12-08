// =======================================================
// PROFILE PAGE LOGIC
// =======================================================

const ProfilePage = {
    user: null,
    currentTab: 'workout',

    async init() {
        this.user = AuthService.getCurrentUser();
        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }

        this.renderUserInfo();
        this.switchTab('workout');
    },

    renderUserInfo() {
        const nameEl = document.getElementById('user-name') || document.getElementById('pName');
        const emailEl = document.getElementById('user-email') || document.getElementById('pEmail');
        const roleEl = document.getElementById('user-role');
        const avatar = document.getElementById('user-avatar') || document.getElementById('avt');
        const sessionEl = document.getElementById('pSession');
        const expiryEl = document.getElementById('pExpiry');
        
        if (nameEl) nameEl.innerText = this.user.name;
        if (emailEl) emailEl.innerText = this.user.email || '---';
        if (roleEl) roleEl.innerText = this.user.role === 'PT' ? 'Personal Trainer' : 'Học viên';
        if (avatar) avatar.innerText = this.user.name.charAt(0).toUpperCase();
        if (sessionEl) sessionEl.innerText = `${this.user.sessionLeft || 0} Buổi`;
        if (expiryEl) expiryEl.innerText = `Hạn: ${this.user.expiryDate || '--'}`;
    },

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600', 'text-white');
            btn.classList.add('bg-slate-100', 'text-slate-600');
        });
        
        const activeBtn = document.querySelector(`[onclick="ProfilePage.switchTab('${tab}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-blue-600', 'text-white');
            activeBtn.classList.remove('bg-slate-100', 'text-slate-600');
        }

        // Show/hide content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        const activeContent = document.getElementById(`tab-${tab}`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }

        // Load data for tab
        if (tab === 'workout') {
            this.loadWorkoutHistory();
        } else if (tab === 'nutrition') {
            this.loadNutritionHistory();
        } else if (tab === 'body') {
            this.loadBodyHistory();
        }
    },

    async loadWorkoutHistory() {
        const container = document.getElementById('workout-history');
        container.innerHTML = '<div class="text-center py-10 text-slate-400"><i data-lucide="loader-2" class="animate-spin w-8 h-8 mx-auto mb-2"></i> Đang tải...</div>';
        lucide.createIcons();

        try {
            const result = await WorkoutService.getHistory(this.user.id, true);
            
            if (result.success && Object.keys(result.data).length > 0) {
                const dates = Object.keys(result.data).sort((a, b) => 
                    new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-'))
                );
                
                container.innerHTML = dates.map(date => `
                    <div class="bg-white rounded-xl border border-slate-200 p-4 mb-3">
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="font-bold text-slate-700 flex items-center gap-2">
                                <i data-lucide="calendar-check" class="w-4 h-4 text-green-500"></i>
                                ${date}
                            </h3>
                            <span class="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg font-bold">
                                ${result.data[date].length} sets
                            </span>
                        </div>
                        <div class="space-y-2">
                            ${result.data[date].map(log => `
                                <div class="flex justify-between items-center text-sm bg-slate-50 p-2 rounded-lg">
                                    <span class="font-medium text-slate-700">${log.exercise}</span>
                                    <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-bold text-xs border border-blue-100">
                                        ${log.weight}kg x ${log.reps}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="text-center text-slate-400 py-10"><p>Chưa có lịch sử tập luyện.</p></div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="text-center text-red-400 py-10"><p>Lỗi tải dữ liệu.</p></div>';
            Toast.error('Lỗi: ' + error.message);
        }
        
        lucide.createIcons();
    },

    async loadNutritionHistory() {
        const container = document.getElementById('nutrition-history');
        container.innerHTML = '<div class="text-center py-10 text-slate-400"><i data-lucide="loader-2" class="animate-spin w-8 h-8 mx-auto mb-2"></i> Đang tải...</div>';
        lucide.createIcons();

        try {
            const result = await NutritionService.getHistory(this.user.id, true);
            
            if (result.success && Object.keys(result.data).length > 0) {
                const dates = Object.keys(result.data).sort((a, b) => 
                    new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-'))
                );
                
                container.innerHTML = dates.map(date => {
                    const day = result.data[date];
                    return `
                        <div class="bg-white rounded-xl border border-slate-200 p-4 mb-3">
                            <div class="flex justify-between items-center mb-3">
                                <h3 class="font-bold text-slate-700 flex items-center gap-2">
                                    <i data-lucide="calendar-check" class="w-4 h-4 text-green-500"></i>
                                    ${date}
                                </h3>
                                <span class="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg font-bold">
                                    ${day.count || 0} món
                                </span>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                    <div class="text-xs text-orange-600 font-bold mb-1">Calories</div>
                                    <div class="text-lg font-black text-orange-700">${Math.round(day.cal || 0)}</div>
                                </div>
                                <div class="bg-red-50 p-3 rounded-lg border border-red-100">
                                    <div class="text-xs text-red-600 font-bold mb-1">Protein</div>
                                    <div class="text-lg font-black text-red-700">${Math.round(day.pro || 0)}g</div>
                                </div>
                                <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                                    <div class="text-xs text-green-600 font-bold mb-1">Carb</div>
                                    <div class="text-lg font-black text-green-700">${Math.round(day.carb || 0)}g</div>
                                </div>
                                <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                    <div class="text-xs text-yellow-600 font-bold mb-1">Fat</div>
                                    <div class="text-lg font-black text-yellow-700">${Math.round(day.fat || 0)}g</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = '<div class="text-center text-slate-400 py-10"><p>Chưa có lịch sử dinh dưỡng.</p></div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="text-center text-red-400 py-10"><p>Lỗi tải dữ liệu.</p></div>';
            Toast.error('Lỗi: ' + error.message);
        }
        
        lucide.createIcons();
    },

    async loadBodyHistory() {
        const container = document.getElementById('body-history');
        container.innerHTML = '<div class="text-center py-10 text-slate-400"><i data-lucide="loader-2" class="animate-spin w-8 h-8 mx-auto mb-2"></i> Đang tải...</div>';
        lucide.createIcons();

        try {
            const result = await API.call('getBodyHistory', { userId: this.user.id });
            
            if (result.success && result.data && result.data.length > 0) {
                container.innerHTML = result.data.map(item => `
                    <div class="bg-white rounded-xl border border-slate-200 p-4 mb-3">
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="font-bold text-slate-700 flex items-center gap-2">
                                <i data-lucide="calendar-check" class="w-4 h-4 text-blue-500"></i>
                                ${item.date}
                            </h3>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <div class="text-xs text-blue-600 font-bold mb-1">Cân nặng</div>
                                <div class="text-lg font-black text-blue-700">${item.weight || '---'} kg</div>
                            </div>
                            <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <div class="text-xs text-purple-600 font-bold mb-1">Vòng eo</div>
                                <div class="text-lg font-black text-purple-700">${item.waist || '---'} cm</div>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="text-center text-slate-400 py-10"><p>Chưa có dữ liệu theo dõi cơ thể.</p></div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="text-center text-red-400 py-10"><p>Lỗi tải dữ liệu.</p></div>';
            Toast.error('Lỗi: ' + error.message);
        }
        
        lucide.createIcons();
    }
};

window.ProfilePage = ProfilePage;

