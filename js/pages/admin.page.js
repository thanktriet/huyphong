// =======================================================
// ADMIN PAGE CONTROLLER
// =======================================================

const AdminPage = {
    currentTab: 'calendar',
    user: null,

    async init() {
        this.user = AuthService.getCurrentUser();
        
        if (!this.user || !AuthService.isAdmin()) {
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('ptName').innerText = this.user.name;

        // Load all modules
        await Promise.all([
            AdminDashboard.load(),
            AdminCalendar.init(),
            AdminStudents.init(),
            AdminExercises.init(),
            AdminFoods.init(),
            AdminPlans.init()
        ]);

        // Setup event listeners
        this.setupEventListeners();
        
        // Setup table scroll detection for mobile
        this.setupTableScrollDetection();
    },
    
    setupTableScrollDetection() {
        // Detect horizontal scroll on admin tables
        const tableWrappers = document.querySelectorAll('.admin-table-wrapper');
        tableWrappers.forEach(wrapper => {
            const checkScroll = () => {
                const canScroll = wrapper.scrollWidth > wrapper.clientWidth;
                if (canScroll) {
                    wrapper.classList.add('scrollable');
                } else {
                    wrapper.classList.remove('scrollable');
                }
            };
            
            // Check on load and resize
            checkScroll();
            window.addEventListener('resize', checkScroll);
            
            // Check after content loads
            setTimeout(checkScroll, 500);
        });
    },

    setupEventListeners() {
        // Book session form
        const formBook = document.getElementById('form-book');
        if (formBook) {
            formBook.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AdminCalendar.bookSession({
                    userId: document.getElementById('bk-student').value,
                    date: document.getElementById('bk-date').value,
                    time: document.getElementById('bk-time').value
                });
            });
        }

        // Register student form
        const formReg = document.getElementById('form-register');
        if (formReg) {
            formReg.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AdminStudents.register({
                    name: document.getElementById('reg-name').value,
                    email: document.getElementById('reg-email').value,
                    phone: document.getElementById('reg-phone').value
                });
            });
        }

        // Edit session form
        const formEditSession = document.getElementById('form-edit-session');
        if (formEditSession) {
            formEditSession.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AdminCalendar.submitEdit();
            });
        }

        // Extend student form
        const formExtend = document.getElementById('form-extend');
        if (formExtend) {
            formExtend.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AdminStudents.submitExtend();
            });
        }

        // Edit student form
        const formEditStudent = document.getElementById('form-edit-student');
        if (formEditStudent) {
            formEditStudent.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AdminStudents.submitEdit();
            });
        }

        // Exercise form
        const formEx = document.getElementById('form-exercise');
        if (formEx) {
            formEx.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AdminExercises.save();
            });
        }

        // Food form
        const formFd = document.getElementById('form-food');
        if (formFd) {
            formFd.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AdminFoods.save();
            });
        }

        // Plan form
        const formPlan = document.getElementById('form-plan');
        if (formPlan) {
            formPlan.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AdminPlans.save();
            });
        }

        // Meal Plan student select
    },

    async switchTab(name, btn) {
        this.currentTab = name;
        console.log('[AdminPage] Switching to tab:', name);
        
        // Smooth transition: fade out current, then fade in new
        const currentSection = document.querySelector('.view-section:not(.hidden)');
        if (currentSection) {
            currentSection.style.opacity = '0';
            setTimeout(() => {
                document.querySelectorAll('.view-section').forEach(e => e.classList.add('hidden'));
                const target = document.getElementById(`view-${name}`);
                if (target) {
                    target.classList.remove('hidden');
                    // Trigger reflow for animation
                    target.offsetHeight;
                    target.style.opacity = '1';
                    console.log('[AdminPage] Tab view shown:', name);
                } else {
                    console.error('[AdminPage] Tab view not found:', `view-${name}`);
                }
            }, 150);
        } else {
            document.querySelectorAll('.view-section').forEach(e => e.classList.add('hidden'));
            const target = document.getElementById(`view-${name}`);
            if (target) {
                target.classList.remove('hidden');
                console.log('[AdminPage] Tab view shown (no transition):', name);
            } else {
                console.error('[AdminPage] Tab view not found:', `view-${name}`);
            }
        }
        
        // Smooth tab button transition
        document.querySelectorAll('.tab-btn').forEach(e => {
            e.classList.remove('active', 'bg-blue-600', 'text-white');
            e.classList.add('text-slate-500');
        });
        if (btn) {
            btn.classList.add('active', 'bg-blue-600', 'text-white');
            btn.classList.remove('text-slate-500');
        }

        // Load data for tab if needed
        if (name === 'dashboard') {
            await AdminDashboard.init();
        } else if (name === 'calendar') {
            await AdminCalendar.init();
        } else if (name === 'students') {
            console.log('[AdminPage] Initializing students tab...');
            // Ensure tab is visible before initializing
            const target = document.getElementById(`view-${name}`);
            if (target) {
                target.classList.remove('hidden');
            }
            await AdminStudents.init();
            // Re-render after a short delay to ensure DOM is ready
            setTimeout(() => {
                AdminStudents.render();
            }, 200);
        } else if (name === 'exercise') {
            await AdminExercises.init();
        } else if (name === 'food') {
            await AdminFoods.init();
        } else if (name === 'builder') {
            // Re-init to ensure students are loaded
            await AdminPlans.init();
        }
    },

    async refresh() {
        Loader.show();
        try {
            await Promise.all([
                AdminDashboard.load(),
                AdminCalendar.init(),
                AdminStudents.init(),
                AdminExercises.init(),
                AdminFoods.init(),
                AdminPlans.init()
            ]);
            Toast.success("Đã làm mới dữ liệu");
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    }
};

window.AdminPage = AdminPage;

