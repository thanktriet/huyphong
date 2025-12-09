// =======================================================
// WORKOUT PAGE LOGIC
// =======================================================

const WorkoutPage = {
    user: null,
    plans: {},
    progress: {},
    setCounts: {},
    currentTab: "",
    timerInterval: null,
    timeLeft: 60,

    async init() {
        this.user = AuthService.getCurrentUser();
        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }

        // Load progress from cache
        const storageKey = `pt_progress_v4_pro_${this.user.id}`;
        this.progress = Utils.storage.get(storageKey, {});
        this.setCounts = {};

        // Load plan
        await this.loadPlan();
        this.updateProgressUI();
    },

    async loadPlan() {
        try {
            Loader.showIn('todo-list', 'Đang tải giáo án...');
            
            const result = await WorkoutService.getPlan(this.user.id);
            
            console.log('Workout plan result:', result);
            
            if (result && result.success && result.data && Object.keys(result.data).length > 0) {
                this.plans = result.data;
                this.renderTabs();
            } else {
                document.getElementById('todo-list').innerHTML = `
                    <div class="text-center text-slate-400 mt-10 flex flex-col items-center">
                        <i data-lucide="calendar-off" class="w-12 h-12 mb-2 opacity-20"></i>
                        <p>Hôm nay nghỉ ngơi nhé!</p>
                        <p class="text-xs text-slate-300 mt-2">${result?.message || 'Chưa có giáo án'}</p>
                    </div>
                `;
                lucide.createIcons();
            }
        } catch (error) {
            console.error('Error loading workout plan:', error);
            Toast.error('Lỗi tải dữ liệu: ' + error.message);
            document.getElementById('todo-list').innerHTML = `
                <div class="text-center text-red-400 mt-10 flex flex-col items-center">
                    <i data-lucide="alert-circle" class="w-12 h-12 mb-2"></i>
                    <p>Lỗi: ${error.message}</p>
                </div>
            `;
            lucide.createIcons();
        } finally {
            Loader.hideIn('todo-list');
        }
    },

    renderTabs() {
        const days = Object.keys(this.plans);
        const container = document.getElementById('tabs');
        
        let html = days.map((day, i) => 
            `<button onclick="WorkoutPage.switchTab('${day}', this)" 
                class="px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border transition-all active:scale-95 ${
                    i === 0 ? 'tab-active' : 'bg-white text-slate-600 border-slate-200 shadow-sm'
                }">${day}</button>`
        ).join('');
        
        html += `<button onclick="WorkoutPage.showHistory(this)" 
            class="px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border bg-white text-slate-500 border-slate-200 shadow-sm flex items-center gap-1 active:scale-95">
            <i data-lucide="history" class="w-4 h-4"></i> Lịch sử
        </button>`;
        
        container.innerHTML = html;
        lucide.createIcons();
        
        if (days.length > 0) {
            this.switchTab(days[0], container.children[0]);
        }
    },

    switchTab(day, btn) {
        // Smooth tab transition
        this.currentTab = day;
        document.getElementById('history-view').classList.add('hidden');
        document.getElementById('workout-view').classList.remove('hidden');
        document.getElementById('floating-action').classList.remove('translate-y-[150%]');
        
        document.querySelectorAll('#tabs button').forEach(b => {
            b.className = 'px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border bg-white text-slate-600 border-slate-200 shadow-sm transition-all active:scale-95 min-w-[90px]';
        });
        
        if (btn) {
            btn.className = 'px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border tab-active transition-all active:scale-95 min-w-[90px]';
        }

        this.renderExercises(day);
    },

    renderExercises(day) {
        const list = document.getElementById('todo-list');
        const exercises = this.plans[day] || [];
        
        list.innerHTML = exercises.map((ex, i) => {
            const exKey = `${day}_${ex.exercise}`;
            let maxSavedSet = 0;
            
            Object.keys(this.progress).forEach(k => {
                if (k.startsWith(exKey + '_set')) {
                    const num = parseInt(k.split('_set')[1]);
                    if (num > maxSavedSet) maxSavedSet = num;
                }
            });
            
            if (!this.setCounts[exKey]) {
                this.setCounts[exKey] = Math.max(ex.sets, maxSavedSet);
            }
            
            let setsHtml = '';
            for (let s = 1; s <= this.setCounts[exKey]; s++) {
                const key = `${exKey}_set${s}`;
                const saved = this.progress[key] || {};
                const isChecked = saved.checked ? 'checked' : '';
                const rowClass = saved.checked ? 'set-done' : 'bg-white';
                const wVal = saved.weight || '';
                const rVal = saved.reps || ex.reps;

                setsHtml += `
                    <div class="set-row flex items-center gap-2 p-3 rounded-xl border border-slate-200 ${rowClass} mb-2.5 shadow-sm" id="row-${key}">
                        <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mr-1 flex-shrink-0">${s}</div>
                        <div class="flex-1 flex items-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden h-12">
                            <button onclick="WorkoutPage.adjustVal('w-${key}', -2.5)" class="w-10 h-full bg-white text-slate-500 hover:bg-slate-100 border-r active:bg-slate-200 active:scale-95 transition-all font-bold text-lg">-</button>
                            <input type="number" id="w-${key}" value="${wVal}" oninput="WorkoutPage.saveTemp('${key}')" class="w-full bg-transparent text-center font-bold text-slate-800 text-base outline-none" placeholder="kg" min="0" step="0.5">
                            <button onclick="WorkoutPage.adjustVal('w-${key}', 2.5)" class="w-10 h-full bg-white text-slate-500 hover:bg-slate-100 border-l active:bg-slate-200 active:scale-95 transition-all font-bold text-lg">+</button>
                        </div>
                        <div class="w-28 flex items-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden h-12 flex-shrink-0">
                            <button onclick="WorkoutPage.adjustVal('r-${key}', -1)" class="w-9 h-full bg-white text-slate-500 hover:bg-slate-100 border-r active:bg-slate-200 active:scale-95 transition-all font-bold">-</button>
                            <input type="number" id="r-${key}" value="${rVal}" oninput="WorkoutPage.saveTemp('${key}')" class="w-full bg-transparent text-center font-bold text-slate-800 text-base outline-none" placeholder="reps" min="0">
                            <button onclick="WorkoutPage.adjustVal('r-${key}', 1)" class="w-9 h-full bg-white text-slate-500 hover:bg-slate-100 border-l active:bg-slate-200 active:scale-95 transition-all font-bold">+</button>
                        </div>
                        <label class="relative cursor-pointer ml-1 flex-shrink-0">
                            <input type="checkbox" ${isChecked} onchange="WorkoutPage.toggleSet('${key}', '${ex.exercise}', ${s})" class="sr-only peer">
                            <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 peer-checked:bg-blue-600 peer-checked:text-white transition-all shadow-sm peer-checked:shadow-blue-200 hover:bg-slate-200 active:scale-95">
                                <i data-lucide="check" class="w-6 h-6"></i>
                            </div>
                        </label>
                    </div>`;
            }

            const imageBtn = ex.image ? 
                `<button onclick="WorkoutPage.viewImage('${ex.image}')" class="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors">
                    <i data-lucide="image" class="w-5 h-5"></i>
                </button>` : '';

            return `
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="p-4 bg-white border-b border-slate-100 flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-slate-800 text-lg leading-tight">${ex.exercise}</h3>
                            ${ex.note ? `<p class="text-xs text-slate-500 mt-1 bg-slate-50 px-2 py-1 rounded-lg inline-block border border-slate-100">💡 ${ex.note}</p>` : ''}
                        </div>
                        <div class="flex gap-2">
                            ${imageBtn}
                            <button onclick="WorkoutPage.addSet('${day}', '${ex.exercise}')" class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors active:scale-95">
                                <i data-lucide="plus" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-3 bg-slate-50/50 space-y-2">
                        ${setsHtml}
                        ${this.setCounts[exKey] > 1 ? `<div class="text-right"><button onclick="WorkoutPage.removeLastSet('${day}', '${ex.exercise}')" class="text-[10px] text-red-400 hover:text-red-600 font-bold px-2 py-1">Xóa Set Cuối</button></div>` : ''}
                    </div>
                </div>`;
        }).join('');
        
        lucide.createIcons();
        this.updateProgressUI();
    },

    adjustVal(id, delta) {
        const input = document.getElementById(id);
        let val = parseFloat(input.value) || 0;
        val += delta;
        if (val < 0) val = 0;
        input.value = val;
        input.dispatchEvent(new Event('input'));
    },

    saveTemp(key) {
        const w = document.getElementById(`w-${key}`).value;
        const r = document.getElementById(`r-${key}`).value;
        if (!this.progress[key]) this.progress[key] = {};
        this.progress[key].weight = w;
        this.progress[key].reps = r;
        
        const storageKey = `pt_progress_v4_pro_${this.user.id}`;
        Utils.storage.set(storageKey, this.progress);
    },

    toggleSet(key, exName, setNum) {
        const w = document.getElementById(`w-${key}`).value;
        const r = document.getElementById(`r-${key}`).value;
        const row = document.getElementById(`row-${key}`);

        if (!w || !r || w == 0 || r == 0) {
            Toast.error('Hãy nhập số Kg và Reps thực tế!');
            const checkbox = row.querySelector('input[type="checkbox"]');
            checkbox.checked = false;
            return;
        }

        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            row.classList.add('set-done');
            this.progress[key] = { weight: w, reps: r, checked: true, exercise: exName, setNum };
            this.startTimer();
        } else {
            row.classList.remove('set-done');
            if (this.progress[key]) this.progress[key].checked = false;
        }
        
        const storageKey = `pt_progress_v4_pro_${this.user.id}`;
        Utils.storage.set(storageKey, this.progress);
        this.updateProgressUI();
    },

    addSet(day, exName) {
        this.setCounts[`${day}_${exName}`]++;
        this.renderExercises(day);
    },

    removeLastSet(day, exName) {
        const exKey = `${day}_${exName}`;
        const count = this.setCounts[exKey];
        if (count <= 1) return;
        
        if (confirm("Xóa set cuối cùng?")) {
            const key = `${exKey}_set${count}`;
            delete this.progress[key];
            this.setCounts[exKey]--;
            
            const storageKey = `pt_progress_v4_pro_${this.user.id}`;
            Utils.storage.set(storageKey, this.progress);
            this.renderExercises(day);
        }
    },

    updateProgressUI() {
        const doneSets = Object.values(this.progress).filter(i => i.checked).length;
        const totalSets = document.querySelectorAll('.set-row').length || 1;
        
        document.getElementById('selectedCount').innerText = doneSets;
        document.getElementById('btnFinish').disabled = doneSets === 0;
        
        const percent = Math.min((doneSets / totalSets) * 100, 100);
        const progressBar = document.getElementById('total-progress');
        progressBar.style.width = `${percent}%`;
        
        if (percent === 100) {
            progressBar.classList.replace('bg-blue-600', 'bg-green-500');
        }
    },

    startTimer() {
        const modal = document.getElementById('rest-timer-modal');
        modal.classList.remove('hidden');
        this.timeLeft = 60;
        this.updateTimerDisplay();
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) this.stopTimer();
        }, 1000);
    },

    updateTimerDisplay() {
        document.getElementById('timer-count').innerText = this.timeLeft;
    },

    addTime(sec) {
        this.timeLeft += sec;
        this.updateTimerDisplay();
    },

    stopTimer() {
        clearInterval(this.timerInterval);
        document.getElementById('rest-timer-modal').classList.add('hidden');
    },

    viewImage(url) {
        const modal = document.getElementById('modal-image');
        const img = document.getElementById('img-preview');
        img.src = url;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeImageModal() {
        document.getElementById('modal-image').classList.add('hidden');
        document.getElementById('modal-image').classList.remove('flex');
    },

    resetProgress() {
        if (confirm("Xóa hết dữ liệu đang nhập?")) {
            const storageKey = `pt_progress_v4_pro_${this.user.id}`;
            Utils.storage.remove(storageKey);
            this.progress = {};
            this.setCounts = {};
            this.renderExercises(this.currentTab);
            this.updateProgressUI();
        }
    },

    async finishWorkout() {
        const logs = Object.values(this.progress)
            .filter(item => item.checked)
            .map(item => ({
                exercise: item.exercise,
                weight: item.weight,
                reps: item.reps
            }));
        
        if (logs.length === 0) {
            Toast.error('Chưa tập bài nào!');
            return;
        }
        
        if (!confirm(`Hoàn thành và lưu ${logs.length} sets tập?`)) return;

        const btn = document.getElementById('btnFinish');
        btn.innerHTML = '<i data-lucide="loader-2" class="animate-spin w-5 h-5"></i> Đang lưu...';
        btn.disabled = true;
        
        try {
            await WorkoutService.logWorkout(this.user.id, logs);
            await WorkoutService.deductSession(this.user.id);
            
            const storageKey = `pt_progress_v4_pro_${this.user.id}`;
            Utils.storage.remove(storageKey);
            this.progress = {};
            this.setCounts = {};
            
            Toast.success('Đã lưu buổi tập!');
            
            // Refresh user data
            const userResult = await API.login(this.user.email || '', '');
            if (userResult.success) {
                Utils.storage.set(CONFIG.STORAGE_KEYS.USER, userResult.user);
            }
            
            document.querySelector("button[onclick*='showHistory']").click();
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            btn.innerHTML = '<span>Lưu Buổi Tập</span> <i data-lucide="check" class="w-5 h-5"></i>';
            btn.disabled = false;
            this.updateProgressUI();
        }
    },

    async showHistory(btn) {
        // Ensure user is loaded
        if (!this.user) {
            this.user = AuthService.getCurrentUser();
            if (!this.user) {
                Toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = 'login.html';
                return;
            }
        }

        this.currentTab = "HISTORY";
        
        document.querySelectorAll('#tabs button').forEach(b => {
            b.className = 'px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border bg-white text-slate-600 border-slate-200 active:scale-95 min-w-[90px]';
        });
        
        btn.className = 'px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-1.5 transform scale-105 transition-transform min-w-[110px]';
        
        document.getElementById('workout-view').classList.add('hidden');
        const floatingAction = document.getElementById('floating-action');
        if (floatingAction) {
            floatingAction.classList.add('translate-y-[150%]');
        }
        
        const histView = document.getElementById('history-view');
        histView.classList.remove('hidden');
        histView.innerHTML = '<div class="text-center py-10 text-slate-400"><i data-lucide="loader-2" class="animate-spin w-8 h-8 mx-auto mb-2"></i> Đang tải lịch sử...</div>';
        lucide.createIcons();

        try {
            console.log('Loading workout history for user:', this.user.id);
            const result = await WorkoutService.getHistory(this.user.id);
            console.log('Workout history result:', result);
            
            if (result && result.success && result.data && typeof result.data === 'object') {
                const dataKeys = Object.keys(result.data);
                console.log('History data keys:', dataKeys);
                
                if (dataKeys.length > 0) {
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
                    
                    const dates = dataKeys.sort(sortDates);
                    
                    histView.innerHTML = dates.map(date => {
                        const formattedDate = formatDate(date);
                        const logs = result.data[date] || [];
                        return `
                            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                                <div class="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                    <span class="font-bold text-slate-700 text-sm flex items-center gap-2">
                                        <i data-lucide="calendar-check" class="w-4 h-4 text-green-500"></i> ${formattedDate}
                                    </span>
                                    <span class="text-[10px] text-slate-500 bg-white border px-2 py-1 rounded-lg font-bold">
                                        ${logs.length} sets
                                    </span>
                                </div>
                                <div class="divide-y divide-slate-50">
                                    ${logs.map(l => `
                                        <div class="p-3 flex justify-between items-center text-sm hover:bg-slate-50">
                                            <span class="font-medium text-slate-700 line-clamp-1">${l.exercise || 'N/A'}</span>
                                            <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-bold text-xs border border-blue-100 whitespace-nowrap">
                                                ${l.weight || 0}kg x ${l.reps || 0}
                                            </span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    histView.innerHTML = '<div class="text-center text-slate-400 mt-10"><p>Chưa có lịch sử tập luyện.</p></div>';
                }
            } else {
                console.warn('No history data or invalid format:', result);
                histView.innerHTML = '<div class="text-center text-slate-400 mt-10"><p>Chưa có lịch sử tập luyện.</p></div>';
            }
        } catch (error) {
            console.error('Error loading workout history:', error);
            histView.innerHTML = '<div class="text-center text-red-400 mt-10"><p>Lỗi tải lịch sử: ' + (error.message || 'Unknown error') + '</p></div>';
            Toast.error('Lỗi: ' + (error.message || 'Không thể tải lịch sử'));
        }
        
        lucide.createIcons();
    }
};

window.WorkoutPage = WorkoutPage;

