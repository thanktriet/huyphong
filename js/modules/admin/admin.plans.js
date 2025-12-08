// =======================================================
// ADMIN PLANS MODULE
// =======================================================

const AdminPlans = {
    plans: [],
    templates: [],
    students: [],

    async init() {
        await Promise.all([this.loadPlans(), this.loadTemplates(), this.loadStudents()]);
        this.render();
    },

    async loadPlans() {
        try {
            const result = await AdminService.getPlans(true);
            if (result.success) {
                this.plans = result.data || [];
            }
        } catch (error) {
            Toast.error('Lỗi tải danh sách giáo án');
        }
    },

    async loadTemplates() {
        try {
            const result = await AdminService.getTemplates(true);
            if (result.success) {
                this.templates = result.data || [];
            }
        } catch (error) {
            Toast.error('Lỗi tải danh sách mẫu');
        }
    },

    async loadStudents() {
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
        this.renderPlans();
        this.renderTemplates();
        this.fillDropdowns();
    },

    renderPlans() {
        const container = document.getElementById('plan-list');
        const filtered = this.plans.filter(p => p.userId !== 'TEMPLATE');
        
        if (filtered.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="p-10 text-center text-slate-400">Chưa có giáo án nào.</td></tr>';
            return;
        }

        const studentsMap = {};
        this.students.forEach(s => { studentsMap[s.id] = s.name; });

        container.innerHTML = filtered.map(p => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3 font-bold text-blue-600">${p.name}</td>
                <td class="p-3 text-xs text-slate-600">${studentsMap[p.userId] || p.userId}</td>
                <td class="p-3 text-right space-x-2">
                    <button onclick="AdminPlans.edit('${p.id}')" class="text-blue-500 hover:text-blue-700">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="AdminPlans.delete('${p.id}')" class="text-red-400 hover:text-red-600">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
    },

    renderTemplates() {
        const templateSelect = document.getElementById('assign-template');
        const templateList = document.getElementById('template-list-display');

        if (templateSelect) {
            templateSelect.innerHTML = '<option value="">-- Chọn Mẫu --</option>' + 
                this.templates.map(t => `<option value="${t.id}">${t.name} (${t.count} bài)</option>`).join('');
        }

        if (templateList) {
            if (this.templates.length === 0) {
                templateList.innerHTML = '<p class="text-xs text-center text-slate-400">Chưa có mẫu nào.</p>';
            } else {
                templateList.innerHTML = this.templates.map(t => `
                    <div class="flex justify-between p-2 bg-slate-50 border rounded mb-2 group hover:border-blue-200">
                        <span class="text-sm font-bold cursor-pointer hover:text-blue-600" onclick="AdminPlans.edit('${t.id}')">
                            ${t.name} (${t.count} bài)
                        </span>
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="AdminPlans.edit('${t.id}')" class="p-1 bg-white border rounded hover:text-blue-600">
                                <i data-lucide="edit-2" class="w-3 h-3"></i>
                            </button>
                            <button onclick="AdminPlans.delete('${t.id}')" class="p-1 bg-white border rounded hover:text-red-600">
                                <i data-lucide="trash-2" class="w-3 h-3"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

        lucide.createIcons();
    },

    fillDropdowns() {
        if (!this.students) return;
        
        const optsNormal = '<option value="">-- Chọn Học Viên --</option><option value="TEMPLATE" class="font-bold text-blue-600">★ LƯU LÀM MẪU</option>' + 
            this.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        
        const planStudent = document.getElementById('plan-student');
        if (planStudent) planStudent.innerHTML = optsNormal;
    },

    async edit(planId) {
        try {
            Loader.show();
            const result = await API.getPlanDetails(planId);
            
            if (result.success) {
                const p = result.data;
                document.getElementById('plan-id-edit').value = planId;
                document.getElementById('plan-name').value = p.name;
                document.getElementById('plan-student').value = p.userId;
                document.getElementById('plan-form-title').innerText = "Sửa: " + p.name;
                document.getElementById('btn-save-plan').innerText = "Cập Nhật";
                
                const tbody = document.getElementById('plan-rows');
                tbody.innerHTML = '';
                
                p.details.forEach(d => {
                    tbody.insertAdjacentHTML('beforeend', `
                        <tr>
                            <td class="p-2">
                                <select class="w-full border p-1 rounded text-sm bg-slate-50">
                                    ${['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','CN'].map(day => 
                                        `<option ${d.day === day ? 'selected' : ''}>${day}</option>`
                                    ).join('')}
                                </select>
                            </td>
                            <td class="p-2">
                                <input list="dl-exercises" value="${d.exercise}" class="w-full border p-1 rounded text-sm font-bold">
                            </td>
                            <td class="p-2">
                                <input type="number" value="${d.sets}" class="w-full border p-1 rounded text-sm text-center">
                            </td>
                            <td class="p-2">
                                <input type="number" value="${d.reps}" class="w-full border p-1 rounded text-center">
                            </td>
                            <td class="p-2">
                                <input type="text" value="${d.note || ''}" class="w-full border p-1 rounded text-sm">
                            </td>
                            <td class="p-2">
                                <button onclick="this.closest('tr').remove()">
                                    <i data-lucide="trash-2" class="text-red-400 w-4"></i>
                                </button>
                            </td>
                        </tr>
                    `);
                });
                
                lucide.createIcons();
                
                // Switch to builder tab
                const builderBtn = document.querySelectorAll('.tab-btn')[1];
                if (builderBtn) builderBtn.click();
                
                document.getElementById('plan-editor').scrollIntoView({ behavior: 'smooth' });
            } else {
                Toast.error(result.message || 'Lỗi tải giáo án');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    resetForm() {
        document.getElementById('plan-id-edit').value = "";
        document.getElementById('plan-name').value = "";
        document.getElementById('plan-rows').innerHTML = "";
        document.getElementById('plan-form-title').innerText = "Tạo Giáo Án Mới";
        document.getElementById('btn-save-plan').innerText = "Lưu & Gửi";
        this.addRow();
    },

    addRow() {
        document.getElementById('plan-rows').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="p-2">
                    <select class="w-full border p-1 rounded text-sm bg-slate-50">
                        <option>Thứ 2</option><option>Thứ 3</option><option>Thứ 4</option>
                        <option>Thứ 5</option><option>Thứ 6</option><option>Thứ 7</option>
                    </select>
                </td>
                <td class="p-2">
                    <input list="dl-exercises" class="w-full border p-1 rounded text-sm font-bold" placeholder="Tên bài...">
                </td>
                <td class="p-2">
                    <input type="number" value="3" class="w-full border p-1 rounded text-center">
                </td>
                <td class="p-2">
                    <input type="number" value="10" class="w-full border p-1 rounded text-center">
                </td>
                <td class="p-2">
                    <input class="w-full border p-1 rounded">
                </td>
                <td class="p-2">
                    <button onclick="this.closest('tr').remove()">
                        <i data-lucide="trash-2" class="text-red-400 w-4"></i>
                    </button>
                </td>
            </tr>
        `);
        lucide.createIcons();
    },

    async save() {
        const id = document.getElementById('plan-id-edit').value;
        const name = document.getElementById('plan-name').value;
        const uId = document.getElementById('plan-student').value;
        
        if (!name || !uId) {
            Toast.error("Thiếu thông tin!");
            return;
        }
        
        const details = Array.from(document.querySelectorAll('#plan-rows tr')).map(r => {
            const inp = r.querySelectorAll('input, select');
            return {
                day: inp[0].value,
                exercise: inp[1].value,
                sets: inp[2].value,
                reps: inp[3].value,
                note: inp[4] ? inp[4].value : '',
                video: ''
            };
        }).filter(d => d.exercise.trim() !== "");

        try {
            Loader.show();
            const result = await AdminService.savePlan({ 
                planId: id || undefined, 
                planName: name, 
                targetUser: uId, 
                details 
            });
            
            if (result.success) {
                Toast.success("Đã lưu");
                await this.init();
                this.resetForm();
            } else {
                Toast.error(result.message || 'Lỗi lưu giáo án');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async assignTemplate() {
        const tId = document.getElementById('assign-template').value;
        const sSelect = document.getElementById('assign-students');
        const sIds = Array.from(sSelect.selectedOptions).map(o => o.value);
        const newName = document.getElementById('assign-new-name').value;
        
        if (!tId || sIds.length === 0) {
            Toast.error("Chọn đủ thông tin");
            return;
        }

        try {
            Loader.show();
            const result = await AdminService.assignTemplate({ 
                templateId: tId, 
                studentIds: sIds, 
                newName 
            });
            
            if (result.success) {
                Toast.success(result.message || "Đã giao giáo án");
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi giao giáo án');
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
        } finally {
            Loader.hide();
        }
    },

    async delete(planId) {
        if (!confirm("Xóa?")) return;

        try {
            // Optimistic UI
            this.plans = this.plans.filter(x => x.id !== planId);
            this.templates = this.templates.filter(x => x.id !== planId);
            this.render();

            Loader.show();
            const result = await API.call('adminDeletePlan', { id: planId });
            
            if (result.success) {
                Toast.success("Đã xóa");
                await this.init();
            } else {
                Toast.error(result.message || 'Lỗi xóa');
                await this.init(); // Reload on error
            }
        } catch (error) {
            Toast.error('Lỗi: ' + error.message);
            await this.init(); // Reload on error
        } finally {
            Loader.hide();
        }
    }
};

window.AdminPlans = AdminPlans;

