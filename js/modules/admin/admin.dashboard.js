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
        console.log('AdminDashboard.init() called');
        const container = document.getElementById('dashboard-content');
        
        // Show loading immediately
        if (container) {
            container.innerHTML = '<div class="text-center py-10 text-slate-400"><i data-lucide="loader-2" class="animate-spin w-8 h-8 mx-auto mb-2"></i><p>Đang khởi tạo...</p></div>';
            lucide.createIcons();
        }
        
        try {
            // Load students first
            await this.loadStudents();
            console.log('Students loaded:', this.students?.length || 0);
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load dashboard data
            await this.loadDashboardData();
        } catch (error) {
            console.error('Error in AdminDashboard.init():', error);
            console.error('Error stack:', error.stack);
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-10">
                        <div class="text-red-400 mb-4">
                            <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-2"></i>
                            <p class="font-bold">Lỗi khởi tạo dashboard</p>
                            <p class="text-sm mt-2">${error.message || 'Unknown error'}</p>
                        </div>
                        <button onclick="if(typeof AdminDashboard !== 'undefined') AdminDashboard.init()" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                            Thử lại
                        </button>
                    </div>
                `;
                lucide.createIcons();
            }
            Toast.error('Lỗi khởi tạo dashboard: ' + (error.message || 'Unknown error'));
        }
    },

    async loadStudents() {
        try {
            console.log('Loading students...');
            const result = await AdminService.getStudents(true);
            console.log('Students result:', result);
            if (result.success && result.data) {
                this.students = result.data;
                console.log('Students loaded:', this.students.length);
                this.renderStudentSelect();
            } else {
                console.warn('Failed to load students:', result.message);
                this.students = [];
            }
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = [];
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
        if (!container) {
            console.error('Dashboard container not found');
            return;
        }

        // Show loading immediately
        container.innerHTML = '<div class="text-center py-10 text-slate-400"><i data-lucide="loader-2" class="animate-spin w-8 h-8 mx-auto mb-2"></i><p>Đang tải dữ liệu...</p></div>';
        lucide.createIcons();

        // Add timeout fallback - always show result after 10 seconds
        let timeoutTriggered = false;
        const timeoutId = setTimeout(() => {
            timeoutTriggered = true;
            console.warn('Dashboard loading timeout - showing fallback');
            if (container && container.innerHTML.includes('animate-spin')) {
                container.innerHTML = `
                    <div class="text-center py-10">
                        <div class="text-orange-400 mb-4">
                            <i data-lucide="clock" class="w-12 h-12 mx-auto mb-2"></i>
                            <p class="font-bold">Tải dữ liệu mất quá nhiều thời gian</p>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 space-y-2">
                            <p>💡 <strong>Gợi ý:</strong></p>
                            <p>• Chọn học viên cụ thể ở trên để xem chi tiết</p>
                            <p>• Hoặc làm mới trang (F5)</p>
                            <p>• Kiểm tra kết nối internet</p>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            }
        }, 10000); // Reduced to 10 seconds

        try {
            console.log('Loading dashboard data, selectedStudentId:', this.selectedStudentId);
            console.log('Students available:', this.students?.length || 0);
            
            if (this.selectedStudentId) {
                // Load data for specific student
                console.log('Loading student stats for:', this.selectedStudentId);
                await this.loadStudentStats(this.selectedStudentId);
            } else {
                // Load overview for all students - simplified version
                console.log('Loading overview, students count:', this.students?.length || 0);
                
                // If no students, show immediately
                if (!this.students || this.students.length === 0) {
                    clearTimeout(timeoutId);
                    container.innerHTML = '<div class="text-center text-slate-400 py-10"><p>Chưa có học viên nào</p><p class="text-xs mt-2">Vui lòng thêm học viên trong tab "Học Viên"</p></div>';
                    lucide.createIcons();
                    return;
                }
                
                await this.loadOverview();
            }
            
            if (!timeoutTriggered) {
                clearTimeout(timeoutId);
            }
            console.log('Dashboard data loaded successfully');
        } catch (error) {
            if (!timeoutTriggered) {
                clearTimeout(timeoutId);
            }
            console.error('Error loading dashboard data:', error);
            console.error('Error stack:', error.stack);
            
            // Always show error message
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-10">
                        <div class="text-red-400 mb-4">
                            <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-2"></i>
                            <p class="font-bold">Lỗi tải dữ liệu</p>
                            <p class="text-sm mt-2">${error.message || 'Unknown error'}</p>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
                            <p>Vui lòng thử:</p>
                            <p>• Chọn học viên cụ thể</p>
                            <p>• Làm mới trang</p>
                            <p>• Kiểm tra console (F12) để xem chi tiết lỗi</p>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            }
            Toast.error('Lỗi: ' + (error.message || 'Không thể tải dữ liệu'));
        }
    },

    async loadStudentStats(studentId) {
        const container = document.getElementById('dashboard-content');
        if (!container) {
            console.error('Container not found in loadStudentStats');
            throw new Error('Container not found');
        }
        
        try {
            console.log('Fetching stats for student:', studentId);
            
            const [workoutResult, nutritionResult, bodyResult] = await Promise.allSettled([
                API.getWorkoutHistory(studentId, false).catch(err => {
                    console.warn('Workout history error:', err);
                    return { success: false, data: null };
                }),
                API.getNutritionHistory(studentId, false).catch(err => {
                    console.warn('Nutrition history error:', err);
                    return { success: false, data: null };
                }),
                API.getBodyHistory(studentId, false).catch(err => {
                    console.warn('Body history error:', err);
                    return { success: false, data: null };
                })
            ]);

            const workout = workoutResult.status === 'fulfilled' ? workoutResult.value : { success: false, data: null };
            const nutrition = nutritionResult.status === 'fulfilled' ? nutritionResult.value : { success: false, data: null };
            const body = bodyResult.status === 'fulfilled' ? bodyResult.value : { success: false, data: null };

            console.log('Stats loaded:', { workout: workout.success, nutrition: nutrition.success, body: body.success });

            const student = this.students.find(s => s.id === studentId);
            const studentName = student ? student.name : 'Học viên';

            let html = `
                <div class="mb-4 pb-4 border-b border-slate-200">
                    <h3 class="text-lg font-bold text-slate-800">${studentName}</h3>
                </div>
            `;

            // Workout Stats
            html += this.renderWorkoutStats(workout);
            
            // Nutrition Stats
            html += this.renderNutritionStats(nutrition);
            
            // Body Stats
            html += this.renderBodyStats(body);

            container.innerHTML = html;
            lucide.createIcons();
            console.log('Student stats rendered successfully');
        } catch (error) {
            console.error('Error in loadStudentStats:', error);
            throw error;
        }
    },

    async loadOverview() {
        const container = document.getElementById('dashboard-content');
        if (!container) {
            console.error('Container not found in loadOverview');
            throw new Error('Container not found');
        }
        
        try {
            console.log('Loading overview, students:', this.students?.length || 0);
            
            // Get stats for all students - limit to active students only for performance
            const stats = {
                totalWorkouts: 0,
                totalMeals: 0,
                totalBodyRecords: 0,
                activeStudents: 0
            };

            if (!this.students || this.students.length === 0) {
                console.warn('No students available');
                container.innerHTML = '<div class="text-center text-slate-400 py-10"><p>Chưa có học viên nào</p><p class="text-xs mt-2">Vui lòng thêm học viên trong tab "Học Viên"</p></div>';
                lucide.createIcons();
                return;
            }

            // Count active students first
            this.students.forEach(student => {
                if (student.status === 'Active') {
                    stats.activeStudents++;
                }
            });

            // Limit to first 10 active students to avoid timeout (reduced from 20)
            const activeStudents = this.students.filter(s => s.status === 'Active').slice(0, 10);
            
            console.log('Active students to process:', activeStudents.length);
            
            // Show progress
            if (activeStudents.length > 0) {
                container.innerHTML = `<div class="text-center py-10 text-slate-400"><i data-lucide="loader-2" class="animate-spin w-8 h-8 mx-auto mb-2"></i><p>Đang tải thống kê cho ${activeStudents.length} học viên...</p></div>`;
                lucide.createIcons();
            } else {
                // No active students
                container.innerHTML = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            Chưa có học viên active. Chọn học viên ở trên để xem chi tiết.
                        </p>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            // Load stats in parallel with Promise.allSettled to handle errors gracefully
            // Add timeout to each promise
            const promises = activeStudents.map(async (student, index) => {
                try {
                    console.log(`Loading stats for student ${index + 1}/${activeStudents.length}: ${student.name}`);
                    
                    // Create timeout wrapper
                    const withTimeout = (promise, timeoutMs = 8000) => {
                        return Promise.race([
                            promise,
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Timeout')), timeoutMs)
                            )
                        ]);
                    };
                    
                    const [workoutResult, nutritionResult, bodyResult] = await Promise.all([
                        withTimeout(
                            API.getWorkoutHistory(student.id, true).catch(() => ({ success: false, data: null })),
                            8000
                        ).catch(() => {
                            console.warn(`Timeout loading workout for student ${student.id}`);
                            return { success: false, data: null };
                        }),
                        withTimeout(
                            API.getNutritionHistory(student.id, true).catch(() => ({ success: false, data: null })),
                            8000
                        ).catch(() => {
                            console.warn(`Timeout loading nutrition for student ${student.id}`);
                            return { success: false, data: null };
                        }),
                        withTimeout(
                            API.getBodyHistory(student.id, true).catch(() => ({ success: false, data: null })),
                            8000
                        ).catch(() => {
                            console.warn(`Timeout loading body stats for student ${student.id}`);
                            return { success: false, data: null };
                        })
                    ]);

                    return {
                        workout: workoutResult || { success: false },
                        nutrition: nutritionResult || { success: false },
                        body: bodyResult || { success: false }
                    };
                } catch (err) {
                    console.warn(`Error loading stats for student ${student.id}:`, err);
                    return { workout: { success: false }, nutrition: { success: false }, body: { success: false } };
                }
            });

            console.log('Waiting for all promises to settle...');
            
            // Add overall timeout for all promises - reduced to 6 seconds
            const overallTimeout = new Promise((resolve) => {
                setTimeout(() => {
                    console.warn('Overall timeout reached, processing partial results');
                    resolve('timeout');
                }, 6000); // 6 seconds total
            });
            
            console.log('Starting Promise.allSettled with timeout...');
            const resultsPromise = Promise.allSettled(promises);
            const raceResult = await Promise.race([resultsPromise, overallTimeout]);
            
            let results;
            if (raceResult === 'timeout') {
                console.warn('Timeout - getting partial results');
                // Cancel remaining promises and get what we have
                results = await Promise.allSettled(
                    promises.map(p => 
                        Promise.race([
                            p, 
                            new Promise(resolve => setTimeout(() => resolve({ status: 'rejected', reason: 'Timeout' }), 100))
                        ])
                    )
                );
            } else {
                results = raceResult;
            }
            
            console.log('All promises settled, processing results...', results.length);

            // Process results
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const data = result.value;
                    if (data.workout.success && data.workout.data) {
                        stats.totalWorkouts += Object.keys(data.workout.data).length;
                    }
                    if (data.nutrition.success && data.nutrition.data) {
                        stats.totalMeals += Object.keys(data.nutrition.data).length;
                    }
                    if (data.body.success && data.body.data) {
                        stats.totalBodyRecords += data.body.data.length;
                    }
                }
            });

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
                    ${stats.activeStudents > 20 ? '<p class="text-xs text-slate-400 text-center mt-2">* Chỉ hiển thị thống kê cho 20 học viên đầu tiên</p>' : ''}
                </div>
            `;
            lucide.createIcons();
        } catch (error) {
            console.error('Error in loadOverview:', error);
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
