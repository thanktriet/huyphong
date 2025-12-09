// =======================================================
// ADMIN DASHBOARD MODULE
// =======================================================

const AdminDashboard = {
    students: [],
    selectedStudentId: null,

    async load() {
        try {
            const result = await AdminService.getDashboardStats(true);
            
            if (result.success && result.data) {
                document.getElementById('stat-total').innerText = result.data.totalStudent || 0;
                document.getElementById('stat-active').innerText = result.data.activeStudent || 0;
                document.getElementById('stat-today').innerText = result.data.todaySessions || 0;
            }
        } catch (error) {
            console.error('Dashboard load error:', error);
        }
    },

    async init() {
        await this.loadStudents();
        this.setupEventListeners();
        await this.loadDashboardData();
    },

    async loadStudents() {
        try {
            const result = await AdminService.getStudents(true);
            if (result.success && result.data) {
                this.students = result.data;
                this.renderStudentSelect();
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    },

    renderStudentSelect() {
        const select = document.getElementById('dashboard-student-select');
        if (!select) return;

        select.innerHTML = '<option value="">-- Tất cả học viên --</option>';
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            select.appendChild(option);
        });
    },

    setupEventListeners() {
        const select = document.getElementById('dashboard-student-select');
        if (select) {
            select.addEventListener('change', (e) => {
                this.selectedStudentId = e.target.value || null;
                this.loadDashboardData();
            });
        }
    },

    async loadDashboardData() {
        const container = document.getElementById('dashboard-content');
        if (!container) return;

        container.innerHTML = '<div class="text-center py-10 text-slate-400"><i data-lucide="loader-2" class="animate-spin w-8 h-8 mx-auto mb-2"></i><p>Đang tải dữ liệu...</p></div>';
        lucide.createIcons();

        try {
            if (this.selectedStudentId) {
                // Load data for specific student
                await this.loadStudentStats(this.selectedStudentId);
            } else {
                // Load overview for all students
                await this.loadOverview();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            container.innerHTML = '<div class="text-center text-red-400 py-10"><p>Lỗi tải dữ liệu: ' + (error.message || 'Unknown error') + '</p></div>';
            Toast.error('Lỗi: ' + (error.message || 'Không thể tải dữ liệu'));
        }
    },

    async loadStudentStats(studentId) {
        const container = document.getElementById('dashboard-content');
        
        try {
            const [workoutResult, nutritionResult, bodyResult] = await Promise.all([
                API.getWorkoutHistory(studentId),
                API.getNutritionHistory(studentId),
                API.getBodyHistory(studentId)
            ]);

            const student = this.students.find(s => s.id === studentId);
            const studentName = student ? student.name : 'Học viên';

            let html = `
                <div class="mb-4 pb-4 border-b border-slate-200">
                    <h3 class="text-lg font-bold text-slate-800">${studentName}</h3>
                </div>
            `;

            // Workout Stats
            html += this.renderWorkoutStats(workoutResult);
            
            // Nutrition Stats
            html += this.renderNutritionStats(nutritionResult);
            
            // Body Stats
            html += this.renderBodyStats(bodyResult);

            container.innerHTML = html;
            lucide.createIcons();
        } catch (error) {
            throw error;
        }
    },

    async loadOverview() {
        const container = document.getElementById('dashboard-content');
        
        try {
            // Get stats for all students
            const stats = {
                totalWorkouts: 0,
                totalMeals: 0,
                totalBodyRecords: 0,
                activeStudents: 0
            };

            for (const student of this.students) {
                if (student.status === 'Active') {
                    stats.activeStudents++;
                }

                try {
                    const [workoutResult, nutritionResult, bodyResult] = await Promise.all([
                        API.getWorkoutHistory(student.id, true),
                        API.getNutritionHistory(student.id, true),
                        API.getBodyHistory(student.id, true)
                    ]);

                    if (workoutResult.success && workoutResult.data) {
                        stats.totalWorkouts += Object.keys(workoutResult.data).length;
                    }
                    if (nutritionResult.success && nutritionResult.data) {
                        stats.totalMeals += Object.keys(nutritionResult.data).length;
                    }
                    if (bodyResult.success && bodyResult.data) {
                        stats.totalBodyRecords += bodyResult.data.length;
                    }
                } catch (err) {
                    console.warn(`Error loading stats for student ${student.id}:`, err);
                }
            }

            container.innerHTML = `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="bg-blue-100 p-2 rounded-lg">
                                <i data-lucide="dumbbell" class="w-5 h-5 text-blue-600"></i>
                            </div>
                            <div>
                                <div class="text-xs text-blue-600 font-bold uppercase">Tổng Buổi Tập</div>
                                <div class="text-2xl font-black text-blue-700">${stats.totalWorkouts}</div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="bg-green-100 p-2 rounded-lg">
                                <i data-lucide="utensils" class="w-5 h-5 text-green-600"></i>
                            </div>
                            <div>
                                <div class="text-xs text-green-600 font-bold uppercase">Tổng Ngày Ăn</div>
                                <div class="text-2xl font-black text-green-700">${stats.totalMeals}</div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="bg-purple-100 p-2 rounded-lg">
                                <i data-lucide="activity" class="w-5 h-5 text-purple-600"></i>
                            </div>
                            <div>
                                <div class="text-xs text-purple-600 font-bold uppercase">Ghi Nhận Thể Trạng</div>
                                <div class="text-2xl font-black text-purple-700">${stats.totalBodyRecords}</div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="bg-orange-100 p-2 rounded-lg">
                                <i data-lucide="users" class="w-5 h-5 text-orange-600"></i>
                            </div>
                            <div>
                                <div class="text-xs text-orange-600 font-bold uppercase">Học Viên Active</div>
                                <div class="text-2xl font-black text-orange-700">${stats.activeStudents}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p class="text-sm text-slate-600 text-center">
                        <i data-lucide="info" class="w-4 h-4 inline mr-1"></i>
                        Chọn học viên ở trên để xem chi tiết
                    </p>
                </div>
            `;
            lucide.createIcons();
        } catch (error) {
            throw error;
        }
    },

    renderWorkoutStats(result) {
        if (!result.success || !result.data || Object.keys(result.data).length === 0) {
            return `
                <div class="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                    <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <i data-lucide="dumbbell" class="w-4 h-4 text-blue-600"></i> Tập Luyện
                    </h4>
                    <p class="text-sm text-slate-400">Chưa có dữ liệu tập luyện</p>
                </div>
            `;
        }

        const dates = Object.keys(result.data);
        const totalSets = dates.reduce((sum, date) => sum + (result.data[date]?.length || 0), 0);
        const recentDates = dates.slice(0, 5);

        return `
            <div class="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <i data-lucide="dumbbell" class="w-4 h-4 text-blue-600"></i> Tập Luyện
                </h4>
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <div class="text-xs text-blue-600 font-bold mb-1">Tổng Ngày Tập</div>
                        <div class="text-xl font-black text-blue-700">${dates.length}</div>
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <div class="text-xs text-blue-600 font-bold mb-1">Tổng Sets</div>
                        <div class="text-xl font-black text-blue-700">${totalSets}</div>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="text-xs font-bold text-slate-400 uppercase mb-2">Lịch sử gần đây</div>
                    ${recentDates.map(date => {
                        const sets = result.data[date] || [];
                        return `
                            <div class="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                                <span class="font-medium text-slate-700">${date}</span>
                                <span class="text-xs text-slate-500 bg-white px-2 py-1 rounded font-bold">${sets.length} sets</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    renderNutritionStats(result) {
        if (!result.success || !result.data || Object.keys(result.data).length === 0) {
            return `
                <div class="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                    <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <i data-lucide="utensils" class="w-4 h-4 text-green-600"></i> Dinh Dưỡng
                    </h4>
                    <p class="text-sm text-slate-400">Chưa có dữ liệu dinh dưỡng</p>
                </div>
            `;
        }

        const dates = Object.keys(result.data);
        const totals = dates.reduce((acc, date) => {
            const day = result.data[date];
            acc.cal += day.cal || 0;
            acc.pro += day.pro || 0;
            acc.carb += day.carb || 0;
            acc.fat += day.fat || 0;
            acc.count += day.count || 0;
            return acc;
        }, { cal: 0, pro: 0, carb: 0, fat: 0, count: 0 });

        const avgCal = dates.length > 0 ? Math.round(totals.cal / dates.length) : 0;
        const recentDates = dates.slice(0, 5);

        return `
            <div class="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <i data-lucide="utensils" class="w-4 h-4 text-green-600"></i> Dinh Dưỡng
                </h4>
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <div class="bg-green-50 p-3 rounded-lg">
                        <div class="text-xs text-green-600 font-bold mb-1">Tổng Ngày Ăn</div>
                        <div class="text-xl font-black text-green-700">${dates.length}</div>
                    </div>
                    <div class="bg-green-50 p-3 rounded-lg">
                        <div class="text-xs text-green-600 font-bold mb-1">TB Calories/ngày</div>
                        <div class="text-xl font-black text-green-700">${avgCal}</div>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-3">
                    <div class="bg-red-50 p-2 rounded-lg text-center">
                        <div class="text-[10px] text-red-600 font-bold">Protein</div>
                        <div class="text-sm font-black text-red-700">${Math.round(totals.pro)}g</div>
                    </div>
                    <div class="bg-yellow-50 p-2 rounded-lg text-center">
                        <div class="text-[10px] text-yellow-600 font-bold">Carb</div>
                        <div class="text-sm font-black text-yellow-700">${Math.round(totals.carb)}g</div>
                    </div>
                    <div class="bg-orange-50 p-2 rounded-lg text-center">
                        <div class="text-[10px] text-orange-600 font-bold">Fat</div>
                        <div class="text-sm font-black text-orange-700">${Math.round(totals.fat)}g</div>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="text-xs font-bold text-slate-400 uppercase mb-2">Lịch sử gần đây</div>
                    ${recentDates.map(date => {
                        const day = result.data[date];
                        return `
                            <div class="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                                <span class="font-medium text-slate-700">${date}</span>
                                <span class="text-xs text-slate-500 bg-white px-2 py-1 rounded font-bold">${Math.round(day.cal || 0)} kcal</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    renderBodyStats(result) {
        if (!result.success || !result.data || result.data.length === 0) {
            return `
                <div class="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                    <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <i data-lucide="activity" class="w-4 h-4 text-purple-600"></i> Thể Trạng
                    </h4>
                    <p class="text-sm text-slate-400">Chưa có dữ liệu thể trạng</p>
                </div>
            `;
        }

        const sorted = result.data.sort((a, b) => {
            const dateA = a.date.includes('-') ? new Date(a.date) : new Date(a.date.split('/').reverse().join('-'));
            const dateB = b.date.includes('-') ? new Date(b.date) : new Date(b.date.split('/').reverse().join('-'));
            return dateB - dateA;
        });

        const latest = sorted[0];
        const oldest = sorted[sorted.length - 1];
        const weightChange = latest.weight && oldest.weight ? (parseFloat(latest.weight) - parseFloat(oldest.weight)).toFixed(1) : null;
        const waistChange = latest.waist && oldest.waist ? (parseFloat(latest.waist) - parseFloat(oldest.waist)).toFixed(1) : null;

        return `
            <div class="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <i data-lucide="activity" class="w-4 h-4 text-purple-600"></i> Thể Trạng
                </h4>
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <div class="bg-purple-50 p-3 rounded-lg">
                        <div class="text-xs text-purple-600 font-bold mb-1">Tổng Ghi Nhận</div>
                        <div class="text-xl font-black text-purple-700">${result.data.length}</div>
                    </div>
                    <div class="bg-purple-50 p-3 rounded-lg">
                        <div class="text-xs text-purple-600 font-bold mb-1">Cân Nặng Hiện Tại</div>
                        <div class="text-xl font-black text-purple-700">${latest.weight ? parseFloat(latest.weight).toFixed(1) : '---'} kg</div>
                    </div>
                </div>
                ${weightChange !== null ? `
                    <div class="mb-3 p-2 bg-slate-50 rounded-lg">
                        <div class="text-xs text-slate-600 font-bold mb-1">Thay đổi cân nặng</div>
                        <div class="text-sm font-black ${parseFloat(weightChange) >= 0 ? 'text-red-600' : 'text-green-600'}">
                            ${parseFloat(weightChange) >= 0 ? '+' : ''}${weightChange} kg
                        </div>
                    </div>
                ` : ''}
                <div class="space-y-2">
                    <div class="text-xs font-bold text-slate-400 uppercase mb-2">Lịch sử gần đây</div>
                    ${sorted.slice(0, 5).map(item => {
                        let dateStr = item.date;
                        if (dateStr.includes('-')) {
                            const [year, month, day] = dateStr.split('-');
                            dateStr = `${day}/${month}/${year}`;
                        }
                        return `
                            <div class="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                                <span class="font-medium text-slate-700">${dateStr}</span>
                                <div class="flex gap-2">
                                    <span class="text-xs text-blue-600 bg-white px-2 py-1 rounded font-bold">${item.weight ? parseFloat(item.weight).toFixed(1) : '---'}kg</span>
                                    <span class="text-xs text-purple-600 bg-white px-2 py-1 rounded font-bold">${item.waist ? parseFloat(item.waist).toFixed(1) : '---'}cm</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
};

window.AdminDashboard = AdminDashboard;
