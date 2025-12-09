// =======================================================
// NUTRITION PAGE LOGIC
// =======================================================

const NutritionPage = {
    user: null,
    data: { cal: 0, pro: 0, carb: 0, fat: 0, list: [] },
    foodDB: [],
    selectedFood: null,
    selectedMeal: 'Phụ',
    selectedManualMeal: 'Phụ',

    async init() {
        this.user = AuthService.getCurrentUser();
        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }

        const cacheKey = `pt_nutri_v4_${this.user.id}`;
        this.data = Utils.storage.get(cacheKey, { cal: 0, pro: 0, carb: 0, fat: 0, list: [] });
        
        // Fix old data
        if (this.data.pro === undefined) this.data.pro = 0;
        if (this.data.carb === undefined) this.data.carb = 0;
        if (this.data.fat === undefined) this.data.fat = 0;

        this.renderStats();
        await Promise.all([this.loadFoodDB(), this.loadStats()]);
    },

    async loadFoodDB() {
        try {
            const result = await NutritionService.getFoods(true);
            if (result.success) {
                this.foodDB = result.data;
                this.renderFoodList(this.foodDB);
            }
        } catch (error) {
            Toast.error('Lỗi tải kho món ăn');
        }
    },

    async loadStats() {
        try {
            const result = await NutritionService.getDailyMacros(this.user.id);
            if (result.success && result.data) {
                this.data = result.data;
                
                // Ensure all required properties exist
                this.data.pro = this.data.pro || 0;
                this.data.carb = this.data.carb || 0;
                this.data.fat = this.data.fat || 0;
                this.data.cal = this.data.cal || 0;
                this.data.list = this.data.list || [];
                
                // Ensure target calories exists
                if (!this.data.targets || typeof this.data.targets !== 'object') {
                    this.data.targets = { calories: 2000 };
                } else {
                    // Ensure target calories exists
                    this.data.targets.calories = (this.data.targets.calories !== undefined && this.data.targets.calories !== null) 
                        ? this.data.targets.calories : 2000;
                }
                
                if (!this.data.progress || typeof this.data.progress !== 'object') {
                    this.data.progress = { calories: 0 };
                }
                
                const cacheKey = `pt_nutri_v4_${this.user.id}`;
                Utils.storage.set(cacheKey, this.data);
                this.renderStats();
            } else {
                console.warn('Failed to load stats:', result?.message);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            Toast.error('Lỗi tải thống kê: ' + error.message);
        }
    },

    renderStats() {
        const cleanNum = (n) => (isNaN(n) || n > 10000) ? 0 : Math.round(n);
        
        // Get targets and progress from data - with safe defaults
        const targets = (this.data && this.data.targets && typeof this.data.targets === 'object') 
            ? this.data.targets 
            : { calories: 2000, protein: 0, carb: 0, fat: 0 };
        const progress = (this.data && this.data.progress && typeof this.data.progress === 'object') 
            ? this.data.progress 
            : { calories: 0, protein: 0, carb: 0, fat: 0 };
        
        // Ensure targets has all required properties
        const safeTargets = {
            calories: (targets.calories !== undefined && targets.calories !== null) ? targets.calories : 2000,
            protein: (targets.protein !== undefined && targets.protein !== null) ? targets.protein : 0,
            carb: (targets.carb !== undefined && targets.carb !== null) ? targets.carb : 0,
            fat: (targets.fat !== undefined && targets.fat !== null) ? targets.fat : 0
        };
        
        // Update values
        document.getElementById('val-cal').innerText = cleanNum(this.data.cal);
        document.getElementById('val-pro').innerText = cleanNum(this.data.pro);
        document.getElementById('val-carb').innerText = cleanNum(this.data.carb);
        document.getElementById('val-fat').innerText = cleanNum(this.data.fat);
        
        // Update targets
        document.getElementById('target-cal').innerText = cleanNum(safeTargets.calories);
        document.getElementById('target-pro').innerText = cleanNum(safeTargets.protein);
        document.getElementById('target-carb').innerText = cleanNum(safeTargets.carb);
        document.getElementById('target-fat').innerText = cleanNum(safeTargets.fat);
        
        // Update progress bars
        const calProgress = safeTargets.calories > 0 ? Math.min((cleanNum(this.data.cal) / safeTargets.calories) * 100, 100) : 0;
        const proProgress = safeTargets.protein > 0 ? Math.min((cleanNum(this.data.pro) / safeTargets.protein) * 100, 100) : 0;
        const carbProgress = safeTargets.carb > 0 ? Math.min((cleanNum(this.data.carb) / safeTargets.carb) * 100, 100) : 0;
        const fatProgress = safeTargets.fat > 0 ? Math.min((cleanNum(this.data.fat) / safeTargets.fat) * 100, 100) : 0;
        
        document.getElementById('bar-cal').style.width = calProgress + '%';
        document.getElementById('bar-pro').style.width = proProgress + '%';
        document.getElementById('bar-carb').style.width = carbProgress + '%';
        document.getElementById('bar-fat').style.width = fatProgress + '%';
        
        document.getElementById('progress-cal').innerText = Math.round(calProgress) + '%';
        document.getElementById('log-count').innerText = `${this.data.list.length} món`;
        
        // Group by meal
        const groups = { 'Sáng': [], 'Trưa': [], 'Tối': [], 'Phụ': [], 'Tiệc': [] };
        (this.data.list || []).forEach(item => {
            let type = item.type || 'Phụ';
            if (type.includes('Sáng')) type = 'Sáng';
            else if (type.includes('Trưa')) type = 'Trưa';
            else if (type.includes('Tối')) type = 'Tối';
            else if (type.includes('Tiệc')) type = 'Tiệc';
            else type = 'Phụ';
            if (!groups[type]) groups[type] = [];
            groups[type].push(item);
        });

        const container = document.getElementById('daily-log');
        container.innerHTML = '';
        const order = ['Sáng', 'Trưa', 'Tối', 'Phụ', 'Tiệc'];
        let hasItem = false;

        order.forEach(meal => {
            if (groups[meal].length > 0) {
                hasItem = true;
                let total = groups[meal].reduce((s, i) => s + Number(i.cal), 0);
                let itemsHtml = groups[meal].map(item => `
                    <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center mb-2">
                        <div class="flex items-center gap-3">
                            <div class="w-1 h-8 bg-slate-200 rounded-full"></div>
                            <div>
                                <div class="font-bold text-slate-700 text-sm">${item.name}</div>
                            </div>
                        </div>
                        <div class="font-bold text-slate-600 text-sm">${Math.round(item.cal)}</div>
                    </div>
                `).join('');
                container.innerHTML += `
                    <div class="mb-4">
                        <div class="meal-header flex justify-between items-center mb-2 px-1">
                            <h3 class="font-bold text-slate-500 text-xs uppercase tracking-wider">${meal}</h3>
                            <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">${Math.round(total)} kcal</span>
                        </div>
                        ${itemsHtml}
                    </div>
                `;
            }
        });
        
        if (!hasItem) {
            container.innerHTML = `
                <div class="text-center py-10 opacity-50">
                    <i data-lucide="coffee" class="w-12 h-12 mx-auto mb-3 text-slate-300"></i>
                    <p class="text-sm text-slate-400 font-medium">Chưa có dữ liệu ăn uống.</p>
                </div>
            `;
        }
        
        lucide.createIcons();
    },

    renderFoodList(list) {
        const container = document.getElementById('food-list');
        if (list.length === 0) {
            container.innerHTML = '<div class="text-center text-slate-400 py-8 text-xs">Không tìm thấy món nào.</div>';
            return;
        }
        
        const displayList = list.slice(0, 50);
        container.innerHTML = displayList.map(f => `
            <div class="food-item p-3 bg-white border border-slate-100 rounded-2xl flex justify-between items-center cursor-pointer hover:border-green-500 hover:shadow-sm mb-2" 
                 onclick="NutritionPage.openModal(${JSON.stringify(f).replace(/"/g, '&quot;')})">
                <div>
                    <div class="font-bold text-slate-700 text-sm">${f.name}</div>
                    <div class="text-xs text-slate-500 mt-0.5 flex gap-2 font-medium">
                        <span class="text-orange-500 font-bold">${f.cal} kcal</span>
                        <span class="text-slate-300">|</span>
                        <span>P:${f.pro} C:${f.carb} F:${f.fat}</span>
                    </div>
                </div>
                <div class="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    },

    filterFoods() {
        const keyword = document.getElementById('food-search').value.toLowerCase();
        const filtered = this.foodDB.filter(f => f.name.toLowerCase().includes(keyword));
        this.renderFoodList(filtered);
    },

    openModal(f) {
        this.selectedFood = f;
        document.getElementById('modal-food-name').innerText = f.name;
        document.getElementById('modal-food-cal').innerText = f.cal;
        document.getElementById('input-amount').value = 100;
        this.selectMeal(null, 'Phụ');
        document.getElementById('modal-amount').classList.remove('hidden');
        document.getElementById('modal-amount').classList.add('flex');
    },

    closeModal() {
        document.getElementById('modal-amount').classList.add('hidden');
        document.getElementById('modal-amount').classList.remove('flex');
    },

    adjAmount(v) {
        const input = document.getElementById('input-amount');
        let val = parseInt(input.value) || 0;
        if (val + v > 0) input.value = val + v;
    },

    selectMeal(btn, meal) {
        this.selectedMeal = meal;
        document.querySelectorAll('.meal-btn').forEach(b => {
            b.className = "meal-btn bg-slate-50 border-2 border-transparent p-2 rounded-xl text-xs font-bold text-slate-500";
        });
        const target = btn || Array.from(document.querySelectorAll('.meal-btn')).find(b => b.innerText === meal);
        if (target) {
            target.className = "meal-btn bg-green-50 border-2 border-green-500 p-2 rounded-xl text-xs font-bold text-green-700 shadow-sm";
        }
    },

    selectManMeal(btn, meal) {
        this.selectedManualMeal = meal;
        document.querySelectorAll('.meal-btn-man').forEach(b => {
            b.className = "meal-btn-man bg-slate-50 border p-2 rounded-lg text-xs font-bold text-slate-500";
        });
        btn.className = "meal-btn-man bg-green-50 border border-green-500 p-2 rounded-lg text-xs font-bold text-green-700 shadow-sm";
    },

    parseNum(val) {
        if (!val) return 0;
        let num = parseFloat(String(val).replace(/,/g, '.'));
        return isNaN(num) ? 0 : num;
    },

    async confirmAddFood() {
        const amtInput = document.getElementById('input-amount').value;
        const amt = this.parseNum(amtInput);
        
        if (amt <= 0) {
            Toast.error('Số lượng không hợp lệ');
            return;
        }
        
        const ratio = amt / 100;
        const baseCal = this.parseNum(this.selectedFood.cal);
        const basePro = this.parseNum(this.selectedFood.pro);
        const baseCarb = this.parseNum(this.selectedFood.carb);
        const baseFat = this.parseNum(this.selectedFood.fat);
        
        const addCal = baseCal * ratio;
        const addPro = basePro * ratio;
        const addCarb = baseCarb * ratio;
        const addFat = baseFat * ratio;

        // Update UI immediately
        this.data.cal = this.parseNum(this.data.cal) + addCal;
        this.data.pro = this.parseNum(this.data.pro) + addPro;
        this.data.carb = this.parseNum(this.data.carb) + addCarb;
        this.data.fat = this.parseNum(this.data.fat) + addFat;
        
        this.data.list.push({
            name: this.selectedFood.name,
            cal: addCal,
            type: this.selectedMeal
        });
        
        const cacheKey = `pt_nutri_v4_${this.user.id}`;
        Utils.storage.set(cacheKey, this.data);
        this.renderStats();
        this.closeModal();
        Toast.success('Đã thêm món!');
        
        // Save to server
        try {
            await NutritionService.logMeal({
                userId: this.user.id,
                name: this.selectedFood.name,
                amount: amt,
                baseCal: baseCal,
                basePro: basePro,
                baseCarb: baseCarb,
                baseFat: baseFat,
                type: this.selectedMeal
            });
            
            // Reload stats
            await this.loadStats();
        } catch (error) {
            Toast.error('Lỗi lưu món ăn');
        }
    },

    async addManualFood() {
        const name = document.getElementById('man-name').value;
        const cal = document.getElementById('man-cal').value;
        
        if (!name || !cal) {
            Toast.error('Thiếu thông tin');
            return;
        }
        
        this.data.cal += Number(cal);
        this.data.list.push({
            name,
            cal: Number(cal),
            type: this.selectedManualMeal
        });
        
        const cacheKey = `pt_nutri_v4_${this.user.id}`;
        Utils.storage.set(cacheKey, this.data);
        this.renderStats();
        Toast.success('Đã lưu!');
        
        try {
            await NutritionService.logMeal({
                userId: this.user.id,
                name,
                cal: Number(cal),
                isManual: true,
                type: this.selectedManualMeal
            });
            
            document.getElementById('man-name').value = '';
            document.getElementById('man-cal').value = '';
            this.switchInputMode('search');
            await this.loadStats();
        } catch (error) {
            Toast.error('Lỗi lưu món ăn');
        }
    },

    switchInputMode(m) {
        document.getElementById('mode-search').className = m == 'search' ? 'space-y-4' : 'hidden';
        document.getElementById('mode-manual').className = m == 'manual' ? 'bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4' : 'hidden';
        document.getElementById('tab-search').className = `px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${m == 'search' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`;
        document.getElementById('tab-manual').className = `px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${m == 'manual' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`;
    },

    hardRefresh() {
        const cacheKey = `pt_nutri_v4_${this.user.id}`;
        Utils.storage.remove(cacheKey);
        window.location.reload();
    },

    async showMealPlan() {
        // Get Monday of current week
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(today.setDate(diff));
        const weekStartStr = weekStart.toISOString().split('T')[0];

        try {
            Loader.show();
            const result = await NutritionService.getMealPlan(this.user.id, weekStartStr);
            
            if (result.success && result.data) {
                this.renderMealPlanModal(result.data, weekStartStr);
            } else {
                Toast.info('Chưa có meal plan cho tuần này');
            }
        } catch (error) {
            Toast.error('Lỗi tải meal plan');
        } finally {
            Loader.hide();
        }
    },

    renderMealPlanModal(planData, weekStartStr) {
        const weekStart = new Date(weekStartStr);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
        const mealTypes = ['Sáng', 'Trưa', 'Tối', 'Phụ'];
        
        let html = `
            <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold">Meal Plan - ${weekStart.toLocaleDateString('vi-VN')} đến ${weekEnd.toLocaleDateString('vi-VN')}</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400"><i data-lucide="x"></i></button>
                    </div>
                    <div class="space-y-4">
        `;

        for (let day = 0; day < 7; day++) {
            const dayMeals = planData[day] || [];
            if (dayMeals.length === 0) continue;

            html += `
                <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div class="font-bold text-sm mb-2 text-slate-700">${days[day]}</div>
                    <div class="space-y-2">
            `;

            mealTypes.forEach(mealType => {
                const meals = dayMeals.filter(m => m.mealType === mealType);
                if (meals.length > 0) {
                    html += `
                        <div class="bg-white rounded p-2 border border-slate-200">
                            <div class="text-xs font-bold text-slate-500 mb-1">${mealType}</div>
                            <div class="space-y-1">
                    `;
                    meals.forEach(meal => {
                        html += `
                            <div class="text-xs bg-blue-50 p-2 rounded flex justify-between items-center">
                                <span>${meal.foodName}</span>
                                <span class="text-green-600 font-bold">${Math.round(meal.calories)} kcal</span>
                            </div>
                        `;
                    });
                    html += `</div></div>`;
                }
            });

            html += `</div></div>`;
        }

        html += `</div></div></div>`;
        
        document.body.insertAdjacentHTML('beforeend', html);
        lucide.createIcons();
    }
};

window.NutritionPage = NutritionPage;

