// =======================================================
// ADMIN CALENDAR MODULE
// =======================================================

const AdminCalendar = {
    schedule: [],
    students: [],
    studentsMap: {},

    async init() {
        await this.loadData();
        this.render();
    },

    async loadData() {
        try {
            const [scheduleResult, studentsResult] = await Promise.all([
                CalendarService.getSchedule(true),
                AdminService.getStudents(true)
            ]);

            if (scheduleResult.success) {
                this.schedule = scheduleResult.data || [];
            }

            if (studentsResult.success) {
                this.students = studentsResult.data || [];
                this.studentsMap = {};
                this.students.forEach(s => {
                    this.studentsMap[s.id] = s;
                });
            }
        } catch (error) {
            Toast.error('Lỗi tải dữ liệu: ' + error.message);
        }
    },

    render() {
        const container = document.getElementById('agenda-container');
        
        if (!this.schedule || this.schedule.length === 0) {
            container.innerHTML = `
                <div class="p-10 text-center text-slate-400 flex flex-col items-center">
                    <i data-lucide="calendar-off" class="w-12 h-12 mb-2 opacity-20"></i>
                    Chưa có lịch hẹn nào.
                </div>
            `;
            lucide.createIcons();
            return;
        }

        const sorted = this.schedule
            .filter(e => e.status !== 'Cancelled')
            .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

        const groups = {};
        sorted.forEach(e => {
            if (!groups[e.date]) groups[e.date] = [];
            groups[e.date].push(e);
        });

        const formatTime = (t) => t.length > 10 ? t.substring(11, 16) : t;

        container.innerHTML = Object.keys(groups).map(date => {
            const d = new Date(date);
            const displayDate = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
            const isToday = new Date().toISOString().slice(0, 10) === date;
            
            let html = `
                <div class="agenda-date ${isToday ? 'text-blue-600 bg-blue-50 border-blue-200' : ''}">
                    <span>${displayDate}</span>
                    ${isToday ? '<span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Hôm nay</span>' : ''}
                </div>
            `;
            
            groups[date].forEach(e => {
                const student = this.studentsMap[e.userId];
                const stName = student ? student.name : 'Unknown';
                const sessionLeft = student ? student.sessionLeft : 0;

                let statusBadge = `<span class="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold">Sắp tới</span>`;
                if (e.status === 'Completed') {
                    statusBadge = `<span class="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded line-through">Đã xong</span>`;
                }

                html += `
                    <div class="agenda-item group hover:bg-slate-50">
                        <div class="flex items-center gap-4">
                            <span class="time-badge">${formatTime(e.time)}</span>
                            <div>
                                <div class="font-bold text-slate-800 text-sm">${stName}</div>
                                <div class="text-xs text-slate-400">Gói: <b class="${sessionLeft < 5 ? 'text-red-500' : 'text-blue-600'}">${sessionLeft}</b> buổi</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            ${statusBadge}
                            ${e.status === 'Upcoming' ? `
                            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="AdminCalendar.checkIn('${e.id}','${e.userId}')" class="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Check-in">
                                    <i data-lucide="check" class="w-4 h-4"></i>
                                </button>
                                <button onclick="AdminCalendar.openEdit('${e.id}','${e.date}','${e.time}')" class="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200" title="Dời">
                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                </button>
                                <button onclick="AdminCalendar.cancelSession('${e.id}')" class="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Hủy">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>` : ''}
                        </div>
                    </div>
                `;
            });
            return html;
        }).join('');

        lucide.createIcons();
    },

    async checkIn(bookingId, userId) {
        if (!confirm("Check-in?")) return;

        try {
            Loader.show();
            
            const deductResult = await WorkoutService.deductSession(userId);
            if (deductResult.success) {
                await CalendarService.updateSchedule({ bookingId, status: 'Completed' });
                Toast.success(deductResult.message || 'Đã check-in');
                await this.init();
                await AdminDashboard.load();
            } else {
                Toast.error(deductResult.message || 'Lỗi check-in');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async cancelSession(bookingId) {
        if (!confirm("Hủy?")) return;

        try {
            Loader.show();
            const result = await CalendarService.cancelSession(bookingId);
            
            if (result.success) {
                Toast.success("Đã hủy");
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi hủy lịch');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    openEdit(id, date, time) {
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-date').value = date;
        document.getElementById('edit-time').value = time.length > 10 ? time.substring(11, 16) : time;
        this.toggleModal('modal-edit-session');
    },

    async submitEdit() {
        const bookingId = document.getElementById('edit-id').value;
        const date = document.getElementById('edit-date').value;
        const time = document.getElementById('edit-time').value;
        
        if (!bookingId || !date || !time) {
            Toast.error("Thiếu thông tin");
            return;
        }

        try {
            Loader.show();
            
            const result = await CalendarService.updateSchedule({
                bookingId,
                date,
                time
            });
            
            if (result.success) {
                Toast.success("Đã dời lịch");
                this.toggleModal('modal-edit-session');
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi dời lịch');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async bookSession(data) {
        try {
            Loader.show();
            const result = await CalendarService.bookSession(data);
            
            if (result.success) {
                Toast.success("Đã đặt lịch");
                this.toggleModal('modal-book');
                await this.init();
                await AdminDashboard.load();
            } else {
                Toast.error(result.message || 'Lỗi đặt lịch');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    toggleModal(id) {
        const m = document.getElementById(id);
        m.classList.toggle('opacity-0');
        m.classList.toggle('pointer-events-none');
        document.body.classList.toggle('modal-active');
        
        // Fill student dropdown when opening book modal
        if (id === 'modal-book') {
            this.fillStudentDropdown();
        }
    },
    
    fillStudentDropdown() {
        const dropdown = document.getElementById('bk-student');
        if (!dropdown) return;
        
        if (!this.students || this.students.length === 0) {
            dropdown.innerHTML = '<option value="">Chưa có học viên</option>';
            return;
        }
        
        dropdown.innerHTML = '<option value="">-- Chọn Học Viên --</option>' +
            this.students
                .filter(s => s.status === 'Active') // Only show active students
                .map(s => `<option value="${s.id}">${s.name}</option>`)
                .join('');
    }
};

window.AdminCalendar = AdminCalendar;

