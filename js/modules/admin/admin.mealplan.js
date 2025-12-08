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
            this.renderTargets();
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
        if (!container) return;
        container.innerHTML = '<div class="text-center text-slate-400 py-10">Chọn học viên để tạo meal plan</div>';
    },

    hideTargets() {
        const targetsSection = document.getElementById('mealplan-targets-section');
        if (targetsSection) {
            targetsSection.classList.add('hidden');
        }
    },

    renderTargets() {
        if (!this.studentData) return;

        const targetsSection = document.getElementById('mealplan-targets-section');
        if (!targetsSection) return;

        targetsSection.classList.remove('hidden');

        // Safe parse for target values
        const parseTarget = (val, defaultValue = 0) => {
            if (val === null || val === undefined || val === '') return defaultValue;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? defaultValue : parsed;
        };

        document.getElementById('mealplan-target-calories').value = parseTarget(this.studentData.targetCalories, 2000);
        document.getElementById('mealplan-target-protein').value = parseTarget(this.studentData.targetProtein, 0);
        document.getElementById('mealplan-target-carb').value = parseTarget(this.studentData.targetCarb, 0);
        document.getElementById('mealplan-target-fat').value = parseTarget(this.studentData.targetFat, 0);
    },

    async saveTargets() {
        if (!this.userId) {
            Toast.error('Chưa chọn học viên');
            return;
        }

        const targets = {
            calories: parseFloat(document.getElementById('mealplan-target-calories').value) || 2000,
            protein: parseFloat(document.getElementById('mealplan-target-protein').value) || 0,
            carb: parseFloat(document.getElementById('mealplan-target-carb').value) || 0,
            fat: parseFloat(document.getElementById('mealplan-target-fat').value) || 0
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
            Toast.error('Lỗi: ' + error.message);
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
        const container = document.getElementById('meal-plan-container');
        if (!container) return;

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
        // Simple prompt for now - can be enhanced with modal
        const foodName = prompt('Tên món ăn:');
        if (!foodName) return;

        // Try to find food in library
        const food = this.foods.find(f => f.name.toLowerCase().includes(foodName.toLowerCase()));
        
        const meal = {
            dayOfWeek: dayOfWeek,
            mealType: mealType,
            foodId: food?.id || null,
            foodName: foodName,
            amount: 100,
            calories: food ? parseFloat(food.calories) : 0,
            protein: food ? parseFloat(food.protein) : 0,
            carb: food ? parseFloat(food.carb) : 0,
            fat: food ? parseFloat(food.fat) : 0
        };

        if (!this.mealPlan[dayOfWeek]) {
            this.mealPlan[dayOfWeek] = [];
        }
        this.mealPlan[dayOfWeek].push(meal);
        this.render();
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
            const user = AuthService.getUser();
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

