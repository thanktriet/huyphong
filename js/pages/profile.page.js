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
            
            if (result.success && result.data && Object.keys(result.data).length > 0) {
                // Format dates - handle both YYYY-MM-DD and DD/MM/YYYY formats
                const formatDate = (dateStr) => {
                    if (dateStr.includes('/')) {
                        return dateStr; // Already in DD/MM/YYYY format
                    }
                    // Convert YYYY-MM-DD to DD/MM/YYYY
                    const [year, month, day] = dateStr.split('-');
                    return `${day}/${month}/${year}`;
                };
                
                const sortDates = (a, b) => {
                    // Handle both formats
                    const dateA = a.includes('/') 
                        ? new Date(a.split('/').reverse().join('-'))
                        : new Date(a);
                    const dateB = b.includes('/')
                        ? new Date(b.split('/').reverse().join('-'))
                        : new Date(b);
                    return dateB - dateA;
                };
                
                const dates = Object.keys(result.data).sort(sortDates);
                
                container.innerHTML = dates.map(date => {
                    const day = result.data[date];
                    const formattedDate = formatDate(date);
                    return `
                        <div class="bg-white rounded-xl border border-slate-200 p-4 mb-3">
                            <div class="flex justify-between items-center mb-3">
                                <h3 class="font-bold text-slate-700 flex items-center gap-2">
                                    <i data-lucide="calendar-check" class="w-4 h-4 text-green-500"></i>
                                    ${formattedDate}
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
            console.error('Error loading nutrition history:', error);
            container.innerHTML = '<div class="text-center text-red-400 py-10"><p>Lỗi tải dữ liệu: ' + (error.message || 'Unknown error') + '</p></div>';
            Toast.error('Lỗi: ' + (error.message || 'Không thể tải dữ liệu'));
        }
        
        lucide.createIcons();
    },

    async loadBodyHistory() {
        const container = document.getElementById('body-history');
        container.innerHTML = '<div class="text-center py-10 text-slate-400"><i data-lucide="loader-2" class="animate-spin w-8 h-8 mx-auto mb-2"></i> Đang tải...</div>';
        lucide.createIcons();

        try {
            const result = await API.getBodyHistory(this.user.id, false); // Don't use cache to get fresh data
            
            if (result.success && result.data && result.data.length > 0) {
                // Sort by date descending
                const sortedData = result.data.sort((a, b) => {
                    // Handle both date formats
                    const dateA = a.date.includes('-') 
                        ? new Date(a.date)
                        : new Date(a.date.split('/').reverse().join('-'));
                    const dateB = b.date.includes('-')
                        ? new Date(b.date)
                        : new Date(b.date.split('/').reverse().join('-'));
                    return dateB - dateA;
                });
                
                container.innerHTML = sortedData.map(item => {
                    // Format date if needed
                    let dateStr = item.date;
                    if (dateStr.includes('-')) {
                        const [year, month, day] = dateStr.split('-');
                        dateStr = `${day}/${month}/${year}`;
                    }
                    
                    return `
                        <div class="bg-white rounded-xl border border-slate-200 p-4 mb-3">
                            <div class="flex justify-between items-center mb-3">
                                <h3 class="font-bold text-slate-700 flex items-center gap-2">
                                    <i data-lucide="calendar-check" class="w-4 h-4 text-blue-500"></i>
                                    ${dateStr}
                                </h3>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <div class="text-xs text-blue-600 font-bold mb-1">Cân nặng</div>
                                    <div class="text-lg font-black text-blue-700">${item.weight ? parseFloat(item.weight).toFixed(1) : '---'} kg</div>
                                </div>
                                <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                    <div class="text-xs text-purple-600 font-bold mb-1">Vòng eo</div>
                                    <div class="text-lg font-black text-purple-700">${item.waist ? parseFloat(item.waist).toFixed(1) : '---'} cm</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = '<div class="text-center text-slate-400 py-10"><p>Chưa có dữ liệu theo dõi cơ thể.</p><p class="text-xs mt-2">Nhấn "Thêm Mới" để bắt đầu theo dõi</p></div>';
            }
        } catch (error) {
            console.error('Error loading body history:', error);
            container.innerHTML = '<div class="text-center text-red-400 py-10"><p>Lỗi tải dữ liệu: ' + (error.message || 'Unknown error') + '</p></div>';
            Toast.error('Lỗi: ' + (error.message || 'Không thể tải dữ liệu'));
        }
        
        lucide.createIcons();
    },

    openAddBodyStats() {
        document.getElementById('modal-body-stats').classList.remove('hidden');
        document.getElementById('body-weight').value = '';
        document.getElementById('body-waist').value = '';
        document.getElementById('body-weight').focus();
        lucide.createIcons();
    },

    closeAddBodyStats() {
        document.getElementById('modal-body-stats').classList.add('hidden');
        document.getElementById('form-body-stats').reset();
    },

    async saveBodyStats() {
        const weight = document.getElementById('body-weight').value;
        const waist = document.getElementById('body-waist').value;
        const btn = document.getElementById('btnSaveBodyStats');
        
        if (!weight || !waist || parseFloat(weight) <= 0 || parseFloat(waist) <= 0) {
            Toast.error('Vui lòng nhập đầy đủ thông tin và giá trị phải lớn hơn 0');
            return;
        }
        
        btn.disabled = true;
        btn.innerText = 'Đang lưu...';
        
        try {
            // Check if offline - queue for sync
            if (!navigator.onLine && typeof PWASync !== 'undefined') {
                console.log('[ProfilePage] Offline - queueing body stats');
                
                await PWASync.queueAction({
                    type: 'log_body_stats',
                    url: `${CONFIG.SUPABASE_URL}/rest/v1/body_tracking`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': CONFIG.SUPABASE_ANON_KEY,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        user_id: this.user.id,
                        date: new Date().toISOString().split('T')[0],
                        weight: weight,
                        waist: waist
                    })
                });
                
                Toast.info("Đã lưu vào hàng đợi. Sẽ đồng bộ khi online.");
                this.closeAddBodyStats();
                await this.loadBodyHistory();
            } else {
                const result = await API.logBodyStats(this.user.id, weight, waist);
                
                if (result.success) {
                    Toast.success('Đã lưu thể trạng thành công!');
                    this.closeAddBodyStats();
                    // Reload history
                    await this.loadBodyHistory();
                } else {
                    Toast.error(result.message || 'Lỗi lưu dữ liệu');
                }
            }
        } catch (error) {
            console.error('Error saving body stats:', error);
            
            // If error and offline, try to queue
            if (!navigator.onLine && typeof PWASync !== 'undefined') {
                try {
                    await PWASync.queueAction({
                        type: 'log_body_stats',
                        url: `${CONFIG.SUPABASE_URL}/rest/v1/body_tracking`,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': CONFIG.SUPABASE_ANON_KEY
                        },
                        body: JSON.stringify({
                            user_id: this.user.id,
                            date: new Date().toISOString().split('T')[0],
                            weight: weight,
                            waist: waist
                        })
                    });
                    Toast.info("Đã lưu vào hàng đợi. Sẽ đồng bộ khi online.");
                    this.closeAddBodyStats();
                } catch (queueError) {
                    Toast.error('Lỗi: ' + (error.message || 'Không thể lưu dữ liệu'));
                }
            } else {
                Toast.error('Lỗi: ' + (error.message || 'Không thể lưu dữ liệu'));
            }
        } finally {
            btn.disabled = false;
            btn.innerText = 'Lưu';
        }
    }
};

window.ProfilePage = ProfilePage;

