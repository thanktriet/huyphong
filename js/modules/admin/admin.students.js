// =======================================================
// ADMIN STUDENTS MODULE
// =======================================================

const AdminStudents = {
    students: [],

    async init() {
        await this.load();
        this.render();
    },

    async load() {
        try {
            const result = await AdminService.getStudents(true);
            if (result.success) {
                this.students = result.data || [];
            }
        } catch (error) {
            Toast.error('Lỗi tải danh sách học viên');
        }
    },

    render() {
        const container = document.getElementById('student-list');
        if (!this.students || this.students.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="p-10 text-center text-slate-400">Chưa có học viên nào.</td></tr>';
            return;
        }

        container.innerHTML = this.students.map(st => `
            <tr class="hover:bg-slate-50 border-b">
                <td class="p-4">
                    <a href="profile-student.html?id=${st.id}" class="font-bold text-blue-600 hover:underline text-lg">${st.name}</a>
                    <br><span class="text-xs text-slate-400">${st.email}</span>
                    <br><span class="text-[10px] ${st.isExpired ? 'text-red-500' : 'text-green-600'} font-bold">
                        ${st.isExpired ? 'Hết hạn' : 'Hạn: ' + st.expiryDate}
                    </span>
                </td>
                <td class="p-4 text-center">
                    <div class="font-black text-lg text-blue-600">${st.sessionLeft || 0}</div>
                    <div class="text-[10px] text-slate-400 uppercase">Buổi</div>
                </td>
                <td class="p-4 text-right space-y-2">
                    <div class="flex gap-1 justify-end">
                        <button onclick="AdminStudents.topUp('${st.id}','${st.name}')" class="bg-blue-50 text-blue-600 px-2 py-1 rounded border text-xs font-bold hover:bg-blue-100">Nạp Buổi</button>
                        <button onclick="AdminStudents.openExtendModal('${st.id}')" class="bg-green-50 text-green-600 px-2 py-1 rounded border text-xs font-bold hover:bg-green-100">Gia Hạn</button>
                    </div>
                    <div class="flex gap-1 justify-end">
                        <button onclick="AdminStudents.openSetTargets('${st.id}','${st.name}')" class="bg-purple-50 text-purple-600 px-2 py-1 rounded border text-xs font-bold hover:bg-purple-100" title="Mục tiêu Calories">🎯</button>
                        <button onclick="AdminStudents.openMealPlan('${st.id}','${st.name}')" class="bg-orange-50 text-orange-600 px-2 py-1 rounded border text-xs font-bold hover:bg-orange-100" title="Meal Plan">🍽️</button>
                    </div>
                    <div class="flex gap-1 justify-end">
                        <button onclick="AdminStudents.openEdit('${st.id}')" class="bg-slate-50 text-slate-600 px-2 py-1 rounded text-xs border" title="Sửa">
                            <i data-lucide="edit-2" class="w-3 h-3"></i>
                        </button>
                        <button onclick="AdminStudents.toggleStatus('${st.id}','${st.status}')" class="bg-yellow-50 text-yellow-600 px-2 py-1 rounded text-xs border" title="Khóa/Mở">
                            ${st.status === 'Active' ? '🔒' : '🔓'}
                        </button>
                        <button onclick="AdminStudents.deleteStudent('${st.id}','${st.name}')" class="bg-red-50 text-red-600 px-2 py-1 rounded text-xs border" title="Xóa">
                            <i data-lucide="trash-2" class="w-3 h-3"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
    },

    async topUp(id, name) {
        const amount = prompt(`Nạp thêm buổi cho ${name}?`, "10");
        if (!amount) return;

        try {
            Loader.show();
            const result = await API.adminUpdateStudent({ 
                studentId: id, 
                addSession: parseInt(amount) 
            });
            
            if (result.success) {
                Toast.success("Đã nạp");
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi nạp buổi');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    openExtendModal(id) {
        document.getElementById('ext-id').value = id;
        AdminCalendar.toggleModal('modal-extend');
    },

    async submitExtend() {
        const id = document.getElementById('ext-id').value;
        const date = document.getElementById('ext-date').value;
        
        if (!date) {
            Toast.error("Chọn ngày");
            return;
        }

        try {
            Loader.show();
            const result = await API.adminUpdateStudent({ 
                studentId: id, 
                setExpiryDate: date 
            });
            
            if (result.success) {
                Toast.success("Đã gia hạn");
                AdminCalendar.toggleModal('modal-extend');
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi gia hạn');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async deleteStudent(id, name) {
        if (!confirm(`XÓA VĨNH VIỄN ${name}?`)) return;

        try {
            Loader.show();
            const result = await API.adminDeleteStudent(id);
            
            if (result.success) {
                Toast.success("Đã xóa");
                await this.init();
                await AdminDashboard.load();
            } else {
                Toast.error(result.message || 'Lỗi xóa');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    openEdit(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        document.getElementById('edt-st-id').value = id;
        document.getElementById('edt-st-name').value = student.name;
        document.getElementById('edt-st-email').value = student.email;
        document.getElementById('edt-st-phone').value = student.phone || '';
        AdminCalendar.toggleModal('modal-edit-student');
    },

    async submitEdit() {
        try {
            Loader.show();
            const result = await API.adminEditStudentInfo({
                id: document.getElementById('edt-st-id').value,
                name: document.getElementById('edt-st-name').value,
                email: document.getElementById('edt-st-email').value,
                phone: document.getElementById('edt-st-phone').value
            });
            
            if (result.success) {
                Toast.success("Đã cập nhật");
                AdminCalendar.toggleModal('modal-edit-student');
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi cập nhật');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async toggleStatus(id, currentStatus) {
        if (!confirm("Đổi trạng thái?")) return;

        try {
            Loader.show();
            const result = await API.adminUpdateStudent({ 
                studentId: id, 
                status: currentStatus === 'Active' ? 'Inactive' : 'Active' 
            });
            
            if (result.success) {
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi đổi trạng thái');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async register(data) {
        try {
            Loader.show();
            const result = await API.call('register', data); // Use call for register
            
            if (result.success) {
                Toast.success("Đã thêm học viên");
                AdminCalendar.toggleModal('modal-add-student');
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi thêm học viên');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    fillDropdowns() {
        if (!this.students) return;
        
        const optsNormal = '<option value="">-- Chọn Học Viên --</option><option value="TEMPLATE" class="font-bold text-blue-600">★ LƯU LÀM MẪU</option>' + 
            this.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        
        const planStudent = document.getElementById('plan-student');
        const bkStudent = document.getElementById('bk-student');
        const assignStudents = document.getElementById('assign-students');
        
        if (planStudent) planStudent.innerHTML = optsNormal;
        if (bkStudent) bkStudent.innerHTML = '<option value="">-- Chọn --</option>' + 
            this.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        if (assignStudents) assignStudents.innerHTML = 
            this.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    },

    openSetTargets(id, name) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        document.getElementById('target-st-id').value = id;
        document.getElementById('target-st-name').textContent = name;
        document.getElementById('target-calories').value = student.targetCalories || 2000;
        document.getElementById('target-protein').value = student.targetProtein || 0;
        document.getElementById('target-carb').value = student.targetCarb || 0;
        document.getElementById('target-fat').value = student.targetFat || 0;
        AdminCalendar.toggleModal('modal-set-targets');
    },

    async submitSetTargets() {
        const id = document.getElementById('target-st-id').value;
        const targets = {
            calories: parseFloat(document.getElementById('target-calories').value) || 2000,
            protein: parseFloat(document.getElementById('target-protein').value) || 0,
            carb: parseFloat(document.getElementById('target-carb').value) || 0,
            fat: parseFloat(document.getElementById('target-fat').value) || 0
        };

        try {
            Loader.show();
            const result = await AdminService.setUserTargets(id, targets);
            
            if (result.success) {
                Toast.success("Đã cập nhật mục tiêu");
                AdminCalendar.toggleModal('modal-set-targets');
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi cập nhật');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    openMealPlan(id, name) {
        document.getElementById('meal-plan-st-id').value = id;
        document.getElementById('meal-plan-st-name').textContent = name;
        AdminCalendar.toggleModal('modal-meal-plan');
        AdminMealPlan.init(id);
    }
};

window.AdminStudents = AdminStudents;

