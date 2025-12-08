// =======================================================
// ADMIN MEAL PLAN MODULE
// =======================================================

const AdminMealPlan = {
    userId: null,
    currentWeekStart: null,
    foods: [],
    mealPlan: {},
    studentData: null,

    async init(userId = null) {
        if (userId) {
            this.userId = userId;
        }
        
        if (!this.userId) {
            this.renderEmpty();
            this.hideTargets();
            return;
        }
        
        // Get Monday of current week
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        this.currentWeekStart = new Date(today.setDate(diff));
        
        try {
            await this.loadStudentData();
            await this.loadFoods();
            await this.loadMealPlan();
            
            // Only render targets if student data is loaded
            if (this.studentData) {
                this.renderTargets();
            } else {
                console.warn('Student data not loaded, hiding targets section');
                this.hideTargets();
            }
            
            this.render();
        } catch (error) {
            console.error('Error initializing meal plan:', error);
            Toast.error('Lỗi tải meal plan');
            this.renderEmpty();
        }
    },

    async loadStudentData() {
        try {
            const result = await AdminService.getStudents(false);
            if (result.success) {
                this.studentData = result.data.find(s => s.id === this.userId);
            }
        } catch (error) {
            console.error('Error loading student data:', error);
        }
    },

    async onStudentSelect() {
        const select = document.getElementById('mealplan-student-select');
        const userId = select.value;
        
        if (!userId) {
            this.userId = null;
            this.renderEmpty();
            this.hideTargets();
            return;
        }
        
        this.userId = userId;
        await this.init(userId);
    },

    renderEmpty() {
        const container = document.getElementById('mealplan-container');
        if (!container) {
            console.error('mealplan-container element not found');
            return;
        }
        container.innerHTML = '<div class="text-center text-slate-400 py-10">Chọn học viên để tạo meal plan</div>';
    },

    hideTargets() {
        const targetsSection = document.getElementById('mealplan-targets-section');
        if (targetsSection) {
            targetsSection.classList.add('hidden');
        }
    },

    renderTargets() {
        if (!this.studentData) {
            console.warn('No student data to render targets');
            return;
        }

        const targetsSection = document.getElementById('mealplan-targets-section');
        if (!targetsSection) {
            console.warn('mealplan-targets-section element not found');
            return;
        }

        targetsSection.classList.remove('hidden');

        // Safe parse for target values
        const parseTarget = (val, defaultValue = 0) => {
            if (val === null || val === undefined || val === '') return defaultValue;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? defaultValue : parsed;
        };

        // Safe access with fallback
        const targetCal = this.studentData?.targetCalories !== undefined ? this.studentData.targetCalories : 2000;
        const targetPro = this.studentData?.targetProtein !== undefined ? this.studentData.targetProtein : 0;
        const targetCarb = this.studentData?.targetCarb !== undefined ? this.studentData.targetCarb : 0;
        const targetFat = this.studentData?.targetFat !== undefined ? this.studentData.targetFat : 0;

        const calInput = document.getElementById('mealplan-target-calories');
        const proInput = document.getElementById('mealplan-target-protein');
        const carbInput = document.getElementById('mealplan-target-carb');
        const fatInput = document.getElementById('mealplan-target-fat');

        if (calInput) calInput.value = parseTarget(targetCal, 2000);
        if (proInput) proInput.value = parseTarget(targetPro, 0);
        if (carbInput) carbInput.value = parseTarget(targetCarb, 0);
        if (fatInput) fatInput.value = parseTarget(targetFat, 0);
    },

    async saveTargets() {
        if (!this.userId) {
            Toast.error('Chưa chọn học viên');
            return;
        }

        // Safe get input values
        const calInput = document.getElementById('mealplan-target-calories');
        const proInput = document.getElementById('mealplan-target-protein');
        const carbInput = document.getElementById('mealplan-target-carb');
        const fatInput = document.getElementById('mealplan-target-fat');

        if (!calInput || !proInput || !carbInput || !fatInput) {
            Toast.error('Không tìm thấy các trường nhập liệu');
            return;
        }

        const targets = {
            calories: parseFloat(calInput.value) || 2000,
            protein: parseFloat(proInput.value) || 0,
            carb: parseFloat(carbInput.value) || 0,
            fat: parseFloat(fatInput.value) || 0
        };

        try {
            Loader.show();
            const result = await AdminService.setUserTargets(this.userId, targets);
            
            if (result.success) {
                Toast.success("Đã cập nhật mục tiêu");
                // Reload student data
                await this.loadStudentData();
                this.renderTargets();
            } else {
                Toast.error(result.message || 'Lỗi cập nhật');
            }
        } catch (error) {
            console.error('Error saving targets:', error);
            Toast.error('Lỗi: ' + (error.message || 'Không thể lưu mục tiêu'));
        } finally {
            Loader.hide();
        }
    },

    async loadFoods() {
        try {
            const result = await AdminService.getFoods(true);
            if (result.success) {
                this.foods = result.data || [];
            }
        } catch (error) {
            Toast.error('Lỗi tải kho món ăn');
        }
    },

    async loadMealPlan() {
        try {
            const weekStartStr = this.currentWeekStart.toISOString().split('T')[0];
            const result = await AdminService.getMealPlan(this.userId, weekStartStr);
            if (result.success) {
                this.mealPlan = result.data || {};
            }
        } catch (error) {
            Toast.error('Lỗi tải meal plan');
        }
    },

    getWeekStartStr() {
        return this.currentWeekStart.toISOString().split('T')[0];
    },

    getDayName(dayOfWeek) {
        const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
        return days[dayOfWeek];
    },

    getMealTypeName(type) {
        const types = {
            'Sáng': '🌅 Sáng',
            'Trưa': '☀️ Trưa',
            'Tối': '🌙 Tối',
            'Phụ': '🍎 Phụ',
            'Tiệc': '🎉 Tiệc'
        };
        return types[type] || type;
    },

    render() {
        const container = document.getElementById('mealplan-container');
        if (!container) {
            console.error('mealplan-container element not found');
            return;
        }

        const weekStartStr = this.getWeekStartStr();
        const weekStartDate = new Date(this.currentWeekStart);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);

        let html = `
            <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <div class="text-sm text-slate-400">Tuần từ ${weekStartDate.toLocaleDateString('vi-VN')} đến ${weekEndDate.toLocaleDateString('vi-VN')}</div>
                </div>
                <div class="flex gap-2 flex-wrap">
                    <button onclick="AdminMealPlan.prevWeek()" class="bg-slate-100 px-3 py-1 rounded text-sm hover:bg-slate-200">← Tuần trước</button>
                    <button onclick="AdminMealPlan.nextWeek()" class="bg-slate-100 px-3 py-1 rounded text-sm hover:bg-slate-200">Tuần sau →</button>
                    <button onclick="AdminMealPlan.savePlan()" class="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">💾 Lưu Plan</button>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        `;

        // Render 7 days
        for (let day = 0; day < 7; day++) {
            const dayMeals = this.mealPlan[day] || [];
            html += `
                <div class="bg-slate-50 rounded-lg p-3 border border-slate-200 min-h-[200px]">
                    <div class="font-bold text-sm mb-3 text-center text-slate-700 sticky top-0 bg-slate-50 py-1">${this.getDayName(day)}</div>
                    <div class="space-y-2" id="day-${day}-meals">
            `;

            // Render meals for each meal type
            const mealTypes = ['Sáng', 'Trưa', 'Tối', 'Phụ'];
            mealTypes.forEach(mealType => {
                const meals = dayMeals.filter(m => m.mealType === mealType);
                html += `
                    <div class="bg-white rounded p-2 border border-slate-200">
                        <div class="text-xs font-bold text-slate-500 mb-1">${this.getMealTypeName(mealType)}</div>
                        <div class="space-y-1" id="day-${day}-${mealType}">
                `;

                if (meals.length > 0) {
                    meals.forEach(meal => {
                        html += `
                            <div class="text-xs bg-blue-50 p-1 rounded flex justify-between items-center" data-meal-id="${meal.id}">
                                <span class="truncate flex-1">${meal.foodName}</span>
                                <button onclick="AdminMealPlan.removeMeal('${meal.id}')" class="text-red-500 ml-1">×</button>
                            </div>
                        `;
                    });
                }

                html += `
                        </div>
                        <button onclick="AdminMealPlan.addMeal(${day}, '${mealType}')" class="text-xs text-blue-600 mt-1 w-full hover:bg-blue-50 rounded py-1">+ Thêm</button>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
        lucide.createIcons();
    },

    async addMeal(dayOfWeek, mealType) {
        // Store context for modal
        this.addingMealContext = { dayOfWeek, mealType };
        
        // Show food selection modal
        this.showFoodSelectionModal();
    },

    showFoodSelectionModal() {
        if (this.foods.length === 0) {
            Toast.error('Kho món ăn trống');
            return;
        }

        // Create modal HTML
        const modalHTML = `
            <div id="modal-select-food" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div class="p-4 border-b flex justify-between items-center">
                        <h3 class="text-lg font-bold">Chọn Món Ăn</h3>
                        <button onclick="document.getElementById('modal-select-food').remove()" class="text-slate-400 hover:text-slate-600">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <div class="p-4 border-b">
                        <input type="text" id="food-search-input" placeholder="Tìm món ăn..." 
                               class="w-full border p-2 rounded-lg" 
                               onkeyup="AdminMealPlan.filterFoods(this.value)">
                    </div>
                    <div class="flex-1 overflow-y-auto p-4" id="food-list-modal">
                        ${this.renderFoodList()}
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existing = document.getElementById('modal-select-food');
        if (existing) existing.remove();

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        lucide.createIcons();
    },

    renderFoodList(searchTerm = '') {
        let filteredFoods = this.foods;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredFoods = this.foods.filter(f => 
                f.name.toLowerCase().includes(term)
            );
        }

        if (filteredFoods.length === 0) {
            return '<div class="text-center text-slate-400 py-8">Không tìm thấy món ăn</div>';
        }

        return filteredFoods.slice(0, 50).map(food => `
            <div class="p-3 border rounded-lg mb-2 hover:bg-slate-50 cursor-pointer" 
                 onclick="AdminMealPlan.selectFood(${JSON.stringify(food).replace(/"/g, '&quot;')})">
                <div class="flex justify-between items-center">
                    <div class="flex-1">
                        <div class="font-bold text-slate-700">${food.name}</div>
                        <div class="text-xs text-slate-500 mt-1">
                            <span class="text-orange-600 font-bold">${food.cal || food.calories || 0} kcal</span>
                            <span class="mx-2">|</span>
                            <span>P: ${food.pro || food.protein || 0}g</span>
                            <span class="mx-1">C: ${food.carb || 0}g</span>
                            <span class="mx-1">F: ${food.fat || 0}g</span>
                        </div>
                    </div>
                    <div class="text-blue-600">
                        <i data-lucide="plus-circle" class="w-5 h-5"></i>
                    </div>
                </div>
            </div>
        `).join('');
    },

    filterFoods(searchTerm) {
        const container = document.getElementById('food-list-modal');
        if (container) {
            container.innerHTML = this.renderFoodList(searchTerm);
            lucide.createIcons();
        }
    },

    selectFood(food) {
        // Close modal
        const modal = document.getElementById('modal-select-food');
        if (modal) modal.remove();

        // Show amount input modal
        this.showAmountModal(food);
    },

    showAmountModal(food) {
        const context = this.addingMealContext;
        if (!context) return;

        const modalHTML = `
            <div id="modal-food-amount" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                    <h3 class="text-lg font-bold mb-4">${food.name}</h3>
                    <div class="mb-4 p-3 bg-slate-50 rounded-lg">
                        <div class="text-xs text-slate-500 mb-1">Thông tin dinh dưỡng (100g)</div>
                        <div class="text-sm">
                            <span class="font-bold text-orange-600">${food.cal || food.calories || 0} kcal</span>
                            <span class="mx-2">|</span>
                            <span>P: ${food.pro || food.protein || 0}g</span>
                            <span class="mx-1">C: ${food.carb || 0}g</span>
                            <span class="mx-1">F: ${food.fat || 0}g</span>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-xs font-bold text-slate-600 mb-2">Số lượng (g)</label>
                        <div class="flex items-center gap-3">
                            <button onclick="AdminMealPlan.adjAmount(-50)" class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xl hover:bg-slate-200">-</button>
                            <input id="food-amount-input" type="number" value="100" min="1" 
                                   class="flex-1 h-12 border-2 border-blue-500 rounded-xl text-center font-bold text-blue-600 text-xl outline-none">
                            <button onclick="AdminMealPlan.adjAmount(50)" class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xl hover:bg-slate-200">+</button>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="document.getElementById('modal-food-amount').remove()" 
                                class="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">
                            Hủy
                        </button>
                        <button onclick="AdminMealPlan.confirmAddFood(${JSON.stringify(food).replace(/"/g, '&quot;')})" 
                                class="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700">
                            Thêm
                        </button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('modal-food-amount');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    adjAmount(change) {
        const input = document.getElementById('food-amount-input');
        if (input) {
            let val = parseInt(input.value) || 100;
            val = Math.max(1, val + change);
            input.value = val;
        }
    },

    confirmAddFood(food) {
        const context = this.addingMealContext;
        if (!context) return;

        const amountInput = document.getElementById('food-amount-input');
        const amount = parseFloat(amountInput?.value) || 100;
        const ratio = amount / 100;

        // Calculate nutrition based on amount
        const baseCal = parseFloat(food.cal || food.calories || 0);
        const basePro = parseFloat(food.pro || food.protein || 0);
        const baseCarb = parseFloat(food.carb || 0);
        const baseFat = parseFloat(food.fat || 0);

        const meal = {
            dayOfWeek: context.dayOfWeek,
            mealType: context.mealType,
            foodId: food.id,
            foodName: food.name,
            amount: amount,
            calories: baseCal * ratio,
            protein: basePro * ratio,
            carb: baseCarb * ratio,
            fat: baseFat * ratio
        };

        if (!this.mealPlan[context.dayOfWeek]) {
            this.mealPlan[context.dayOfWeek] = [];
        }
        this.mealPlan[context.dayOfWeek].push(meal);

        // Close modal
        const modal = document.getElementById('modal-food-amount');
        if (modal) modal.remove();

        // Clear context
        this.addingMealContext = null;

        // Re-render
        this.render();
        Toast.success('Đã thêm món ăn');
    },

    async removeMeal(mealId) {
        for (let day in this.mealPlan) {
            this.mealPlan[day] = this.mealPlan[day].filter(m => m.id !== mealId);
        }
        this.render();
    },

    async prevWeek() {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
        await this.loadMealPlan();
        this.render();
    },

    async nextWeek() {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
        await this.loadMealPlan();
        this.render();
    },

    async savePlan() {
        try {
            Loader.show();
            
            // Flatten meal plan to array
            const meals = [];
            for (let day in this.mealPlan) {
                this.mealPlan[day].forEach(meal => {
                    meals.push({
                        dayOfWeek: parseInt(day),
                        mealType: meal.mealType,
                        foodId: meal.foodId,
                        foodName: meal.foodName,
                        amount: meal.amount || 100,
                        calories: meal.calories || 0,
                        protein: meal.protein || 0,
                        carb: meal.carb || 0,
                        fat: meal.fat || 0
                    });
                });
            }

            const weekStartStr = this.getWeekStartStr();
            const user = AuthService.getCurrentUser();
            const result = await AdminService.createMealPlan(
                this.userId,
                weekStartStr,
                meals,
                user?.id || null
            );

            if (result.success) {
                Toast.success('Đã lưu meal plan');
            } else {
                Toast.error(result.message || 'Lỗi lưu meal plan');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    }
};

window.AdminMealPlan = AdminMealPlan;

