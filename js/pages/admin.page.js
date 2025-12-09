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
        
        document.querySelectorAll('.view-section').forEach(e => e.classList.add('hidden'));
        const target = document.getElementById(`view-${name}`);
        if (target) target.classList.remove('hidden');
        
        document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('active'));
        if (btn) btn.classList.add('active');

        // Load data for tab if needed
        if (name === 'calendar') {
            AdminCalendar.init();
        } else if (name === 'students') {
            AdminStudents.init();
        } else if (name === 'exercise') {
            AdminExercises.init();
        } else if (name === 'food') {
            AdminFoods.init();
        } else if (name === 'builder') {
            AdminPlans.init();
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

