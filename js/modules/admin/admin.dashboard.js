// =======================================================
// ADMIN DASHBOARD MODULE
// =======================================================

const AdminDashboard = {
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
    }
};

window.AdminDashboard = AdminDashboard;

